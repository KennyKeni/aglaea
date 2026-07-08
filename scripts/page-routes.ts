import { chromium, type Browser, type ConsoleMessage, type Page, type Response } from 'playwright';
import {
  PAGE_RENDER_FORBIDDEN_BODY_FRAGMENTS,
  PAGE_RENDER_MATRIX,
  resolveBaseUrl,
  type PageRenderExpectation,
} from '../src/lib/smoke/page-render-matrix';

const DEFAULT_MIN_BODY_TEXT_LENGTH = 200;

const BENIGN_CONSOLE_PATTERNS = [
  /Download the DevTools/,
  /React DevTools/,
  / prerendering /,
  /service worker/i,
];

interface RouteFailure {
  route: string;
  reason: string;
  detail?: string;
}

function isBenignConsole(message: ConsoleMessage): boolean {
  const text = message.text();
  return BENIGN_CONSOLE_PATTERNS.some((pattern) => pattern.test(text));
}

async function loadRoute(
  page: Page,
  base: string,
  expectation: PageRenderExpectation,
): Promise<RouteFailure | null> {
  const url = `${base}${expectation.route}`;
  const pageErrors: string[] = [];
  const consoleErrors: string[] = [];
  const badResponses: string[] = [];

  const consoleListener = (message: ConsoleMessage) => {
    if (message.type() === 'error' && !isBenignConsole(message)) {
      consoleErrors.push(message.text());
    }
  };
  const pageErrorListener = (error: Error) => {
    pageErrors.push(error.message);
  };
  const responseListener = (response: Response) => {
    const status = response.status();
    if (status !== 0 && (status < 200 || status >= 400)) {
      badResponses.push(`${status} ${response.url()}`);
    }
  };

  page.on('console', consoleListener);
  page.on('pageerror', pageErrorListener);
  page.on('response', responseListener);

  let response;
  try {
    response = await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  } catch (error) {
    return {
      route: expectation.route,
      reason: 'navigation failed',
      detail: error instanceof Error ? error.message : String(error),
    };
  } finally {
    page.off('console', consoleListener);
    page.off('pageerror', pageErrorListener);
    page.off('response', responseListener);
  }

  if (!response) {
    return { route: expectation.route, reason: 'no response' };
  }

  const status = response.status();
  if (status < 200 || status >= 300) {
    return {
      route: expectation.route,
      reason: `non-2xx status ${status}`,
      detail: response.url(),
    };
  }

  const bodyText = (await page.evaluate(() => document.body?.innerText ?? '')).trim();
  const minBodyTextLength = expectation.minBodyTextLength ?? DEFAULT_MIN_BODY_TEXT_LENGTH;
  if (bodyText.length < minBodyTextLength) {
    return {
      route: expectation.route,
      reason: `near-empty body (${bodyText.length} chars)`,
      detail: bodyText.slice(0, 120),
    };
  }

  if (expectation.linkSelector) {
    const linkCount = await page.locator(expectation.linkSelector).count();
    if (linkCount === 0) {
      return {
        route: expectation.route,
        reason: `missing expected link selector: ${expectation.linkSelector}`,
        detail: bodyText.slice(0, 200),
      };
    }
  }

  if (expectation.selectorsMustExist) {
    for (const selector of expectation.selectorsMustExist) {
      const count = await page.locator(selector).count();
      if (count === 0) {
        return {
          route: expectation.route,
          reason: `missing expected selector: ${selector}`,
          detail: bodyText.slice(0, 200),
        };
      }
    }
  }

  const missing = expectation.bodyMustContain.filter(
    (fragment) => !bodyText.toLowerCase().includes(fragment.toLowerCase()),
  );
  if (missing.length > 0) {
    return {
      route: expectation.route,
      reason: `missing expected content: ${missing.join(', ')}`,
      detail: bodyText.slice(0, 200),
    };
  }

  const forbiddenFragments = [
    ...PAGE_RENDER_FORBIDDEN_BODY_FRAGMENTS,
    ...(expectation.bodyMustNotContain ?? []),
  ];
  const forbidden = forbiddenFragments.filter((fragment) =>
    bodyText.toLowerCase().includes(fragment.toLowerCase()),
  );
  if (forbidden.length > 0) {
    return {
      route: expectation.route,
      reason: `forbidden content present: ${forbidden.join(', ')}`,
    };
  }

  const isSvelteKitErrorPage = await page.evaluate(() => {
    const heading = document.querySelector('h1');
    if (!heading) return false;
    const text = heading.textContent ?? '';
    return /^(4\d{2}|5\d{2})$/.test(text.trim());
  });
  if (isSvelteKitErrorPage) {
    return { route: expectation.route, reason: 'rendered SvelteKit error page' };
  }

  if (pageErrors.length > 0) {
    return {
      route: expectation.route,
      reason: 'page errors',
      detail: pageErrors.join('; '),
    };
  }

  if (consoleErrors.length > 0) {
    return {
      route: expectation.route,
      reason: 'console errors',
      detail: consoleErrors.join('; '),
    };
  }

  if (badResponses.length > 0) {
    return {
      route: expectation.route,
      reason: 'non-2xx responses',
      detail: badResponses.join('; '),
    };
  }

  return null;
}

async function run(): Promise<number> {
  const base = resolveBaseUrl(process.env.AGLAEA_BASE_URL);
  console.log(`Page render smoke against ${base}`);
  console.log(`Matrix: ${PAGE_RENDER_MATRIX.length} routes`);

  const browser: Browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const failures: RouteFailure[] = [];
  let passed = 0;

  try {
    for (const expectation of PAGE_RENDER_MATRIX) {
      process.stdout.write(`  ${expectation.route} ... `);
      const failure = await loadRoute(page, base, expectation);
      if (failure) {
        failures.push(failure);
        console.log('FAIL');
        console.log(`    reason: ${failure.reason}`);
        if (failure.detail) console.log(`    detail: ${failure.detail}`);
      } else {
        passed += 1;
        console.log('ok');
      }
    }
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }

  console.log('');
  console.log(`Passed: ${passed}/${PAGE_RENDER_MATRIX.length}`);
  if (failures.length > 0) {
    console.log(`Failed: ${failures.length}`);
    for (const failure of failures) {
      console.log(`  - ${failure.route}: ${failure.reason}`);
    }
    return 1;
  }
  console.log('All page render routes passed.');
  return 0;
}

run()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error(error);
    process.exit(2);
  });
