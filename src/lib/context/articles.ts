import type { Article } from '$lib/types/article';
import { createEntityContext, type EntityPanelContext } from './entity';

const ctx = createEntityContext<Article>('article');

export const setArticleDataContext = ctx.setDataContext;
export const getArticleDataContext = ctx.getDataContext;
export const setArticlePanelContext = ctx.setPanelContext;
export const getArticlePanelContext = ctx.getPanelContext;

export type ArticlePanelContext = EntityPanelContext<Article>;
