type ScrollSpyOptions = {
  selector: string;
  root?: Element | null;
  rootMargin?: string;
  threshold?: number | number[];
  onActiveChange?: (id: string | null) => void;
};

export function createScrollSpy(options: ScrollSpyOptions) {
  let observer: IntersectionObserver | null = null;
  let visibleIds = new Set<string>();
  let currentActiveId: string | null = null;
  let scrollContainer: Element | null = null;
  let allElements: Element[] = [];

  function handleScroll() {
    if (!scrollContainer) return;

    const { scrollTop, scrollHeight, clientHeight } = scrollContainer;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 50;

    if (isNearBottom && allElements.length > 0) {
      const lastEl = allElements[allElements.length - 1];
      if (lastEl?.id && currentActiveId !== lastEl.id) {
        currentActiveId = lastEl.id;
        options.onActiveChange?.(lastEl.id);
      }
    }
  }

  function start() {
    stop();

    const {
      selector,
      root = null,
      rootMargin = '0px 0px -70% 0px',
      threshold = 0,
      onActiveChange,
    } = options;

    scrollContainer = root;
    const container = root ?? document;
    allElements = Array.from(container.querySelectorAll(selector));

    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.id;
          if (!id) continue;

          if (entry.isIntersecting) {
            visibleIds.add(id);
          } else {
            visibleIds.delete(id);
          }
        }

        let newActiveId: string | null = null;
        if (visibleIds.size > 0) {
          for (const el of allElements) {
            if (el.id && visibleIds.has(el.id)) {
              newActiveId = el.id;
              break;
            }
          }
        }

        if (newActiveId !== currentActiveId) {
          currentActiveId = newActiveId;
          onActiveChange?.(newActiveId);
        }
      },
      { root, rootMargin, threshold },
    );

    for (const el of allElements) {
      if (el.id) observer.observe(el);
    }

    scrollContainer?.addEventListener('scroll', handleScroll, { passive: true });
  }

  function stop() {
    observer?.disconnect();
    observer = null;
    visibleIds.clear();
    currentActiveId = null;
    scrollContainer?.removeEventListener('scroll', handleScroll);
    scrollContainer = null;
    allElements = [];
  }

  return { start, stop };
}
