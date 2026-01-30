export interface Ref {
  id: number;
  name: string;
}

export interface NamedRef extends Ref {
  slug: string;
}

export interface FormRef extends NamedRef {
  speciesId: number;
}

export interface Paginated<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}
