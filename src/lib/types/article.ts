import type { NamedRef } from './base';

export interface ArticleCategory extends NamedRef {
  description: string | null;
}

export interface CoverImage {
  imageId: string;
  url: string;
  mimeType: string | null;
}

export interface ArticleImage {
  imageId: string;
  url: string;
  mimeType: string | null;
  sortOrder: number;
}

export interface ArticleAuthor {
  id: string;
  name: string;
  image: string | null;
}

export interface TiptapDoc {
  type: 'doc';
  content?: Record<string, unknown>[];
}

export interface Article {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  content: TiptapDoc | null;
  contentHtml: string | null;
  renderError?: boolean;
  ownerId: string | null;
  author: ArticleAuthor | null;
  createdAt: string;
  updatedAt: string;
  categories: ArticleCategory[];
  coverImage: CoverImage | null;
  images: ArticleImage[];
}
