import { getContext, setContext } from 'svelte';
import type { GridDataState } from '$lib/state/grid-data.svelte';
import type { PanelModeState } from '$lib/state/panel-mode.svelte';
import type { PanelAnimationState } from '$lib/state/panel-animation.svelte';
import type { Article } from '$lib/types/article';

const ARTICLE_DATA_KEY = Symbol('article-data');
const PANEL_KEY = Symbol('article-panel');

export function setArticleDataContext(state: GridDataState<Article>) {
	setContext(ARTICLE_DATA_KEY, state);
}

export function getArticleDataContext(): GridDataState<Article> {
	return getContext(ARTICLE_DATA_KEY);
}

export interface ArticlePanelContext {
	mode: PanelModeState<Article>;
	animation: PanelAnimationState;
}

export function setArticlePanelContext(state: ArticlePanelContext) {
	setContext(PANEL_KEY, state);
}

export function getArticlePanelContext(): ArticlePanelContext {
	return getContext(PANEL_KEY);
}
