import type { NamedRef } from './base';

export interface ArticleCategory extends NamedRef {}

export interface ArticleImage {
	id: number;
	url: string;
	isCover: boolean;
}

export interface Article {
	id: number;
	slug: string;
	title: string;
	subtitle: string | null;
	description: string | null;
	body: string;
	author: string | null;
	createdAt: string;
	updatedAt: string;
	categories: ArticleCategory[];
	images: ArticleImage[];
}
