import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PokemonSpeciesListResponseSchema, type PokemonIncludeName } from '@aglaea/contract';

describe('@aglaea/contract npm dependency', () => {
  it('is declared as a normal npm dependency (not workspace/file/link)', () => {
    const pkgPath = resolve(process.cwd(), 'package.json');
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf8')) as {
      dependencies?: Record<string, string>;
    };
    const spec = pkg.dependencies?.['@aglaea/contract'];
    expect(spec).toBeTruthy();
    expect(spec).not.toMatch(/^(workspace|file|link):/);
  });

  it('exposes a usable package import boundary', () => {
    expect(PokemonSpeciesListResponseSchema).toBeTruthy();
    const includes: PokemonIncludeName[] = ['forms', 'types', 'abilities'];
    expect(includes).toContain('forms');
  });
});
