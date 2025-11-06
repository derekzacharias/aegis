export interface DocSection {
  id: string;
  slug: string;
  title: string;
  summary?: string;
  order: number;
  icon?: string;
  tags?: string[];
  content: string;
}

export interface DocCategory {
  id: string;
  title: string;
  description?: string;
  order: number;
  icon?: string;
  sections: DocSection[];
}

export interface DocCollection {
  categories: DocCategory[];
  updatedAt: string;
  version: string;
}

export interface DocIndexEntry {
  id: string;
  slug: string;
  title: string;
  categoryId: string;
  categoryTitle: string;
  summary?: string;
  order: number;
  icon?: string;
  tags?: string[];
}

export interface DocsResponse extends DocCollection {
  index: DocIndexEntry[];
}
