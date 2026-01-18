import { goto } from '$app/navigation';
import { page } from '$app/state';

export interface FilterOption {
  id: number;
  slug: string;
  name: string;
}

export function getSelectedSlugs(paramName: string): string[] {
  const param = page.url.searchParams.get(paramName);
  return param ? param.split(',').filter(Boolean) : [];
}

export function getSelectedOptions(paramName: string, options: FilterOption[]): FilterOption[] {
  const slugs = getSelectedSlugs(paramName);
  return options.filter((opt) => slugs.includes(opt.slug));
}

export function isOptionSelected(paramName: string, slug: string): boolean {
  return getSelectedSlugs(paramName).includes(slug);
}

export function updateFilterParam(basePath: string, paramName: string, slugs: string[]) {
  const params = new URLSearchParams(page.url.searchParams);
  if (slugs.length > 0) {
    params.set(paramName, slugs.join(','));
  } else {
    params.delete(paramName);
  }
  params.delete('page');
  const queryString = params.toString();
  goto(queryString ? `${basePath}?${queryString}` : basePath, { keepFocus: true });
}

export function toggleFilterOption(basePath: string, paramName: string, slug: string) {
  const current = getSelectedSlugs(paramName);
  const isSelected = current.includes(slug);
  const updated = isSelected ? current.filter((s) => s !== slug) : [...current, slug];
  updateFilterParam(basePath, paramName, updated);
}

export function removeFilterOption(basePath: string, paramName: string, slug: string) {
  const current = getSelectedSlugs(paramName).filter((s) => s !== slug);
  updateFilterParam(basePath, paramName, current);
}

export function clearAllFilters(basePath: string, paramNames: string[]) {
  const params = new URLSearchParams(page.url.searchParams);
  paramNames.forEach((name) => params.delete(name));
  params.delete('page');
  const queryString = params.toString();
  goto(queryString ? `${basePath}?${queryString}` : basePath, { keepFocus: true });
}

export function hasActiveFilters(paramNames: string[]): boolean {
  return paramNames.some((name) => getSelectedSlugs(name).length > 0);
}

export function getTotalActiveCount(paramNames: string[]): number {
  return paramNames.reduce((sum, name) => sum + getSelectedSlugs(name).length, 0);
}

export interface StatRange {
  min: number;
  max: number;
}

export function getStatRange(paramName: string, defaultMin: number, defaultMax: number): [number, number] {
  const minParam = page.url.searchParams.get(`${paramName}Min`);
  const maxParam = page.url.searchParams.get(`${paramName}Max`);

  const min = minParam ? parseInt(minParam, 10) : defaultMin;
  const max = maxParam ? parseInt(maxParam, 10) : defaultMax;

  return [
    isNaN(min) ? defaultMin : Math.max(defaultMin, min),
    isNaN(max) ? defaultMax : Math.min(defaultMax, max),
  ];
}

export function setStatRange(
  basePath: string,
  paramName: string,
  min: number,
  max: number,
  defaultMin: number,
  defaultMax: number
) {
  const params = new URLSearchParams(page.url.searchParams);

  if (min === defaultMin) {
    params.delete(`${paramName}Min`);
  } else {
    params.set(`${paramName}Min`, String(min));
  }

  if (max === defaultMax) {
    params.delete(`${paramName}Max`);
  } else {
    params.set(`${paramName}Max`, String(max));
  }

  params.delete('page');
  const queryString = params.toString();
  goto(queryString ? `${basePath}?${queryString}` : basePath, { keepFocus: true });
}

export function hasActiveStatFilter(paramName: string): boolean {
  return page.url.searchParams.has(`${paramName}Min`) || page.url.searchParams.has(`${paramName}Max`);
}

export function getActiveStatFilterCount(paramNames: string[]): number {
  return paramNames.filter((name) => hasActiveStatFilter(name)).length;
}

export function clearStatFilter(basePath: string, paramName: string) {
  const params = new URLSearchParams(page.url.searchParams);
  params.delete(`${paramName}Min`);
  params.delete(`${paramName}Max`);
  params.delete('page');
  const queryString = params.toString();
  goto(queryString ? `${basePath}?${queryString}` : basePath, { keepFocus: true });
}
