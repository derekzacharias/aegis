import { Injectable } from '@nestjs/common';
import {
  docsCollection,
  DocCategory,
  DocCollection,
  DocIndexEntry,
  DocSection,
  DocsResponse
} from '@compliance/shared';

@Injectable()
export class DocsService {
  private readonly collection: DocCollection = docsCollection;

  getDocs(): DocsResponse {
    const index = this.buildIndex(this.collection.categories);
    return {
      ...this.collection,
      index
    };
  }

  private buildIndex(categories: DocCategory[]): DocIndexEntry[] {
    return categories.flatMap((category) =>
      category.sections.map((section: DocSection): DocsIndexEntry => ({
        id: section.id,
        slug: section.slug,
        title: section.title,
        summary: section.summary,
        order: section.order,
        icon: section.icon,
        tags: section.tags,
        categoryId: category.id,
        categoryTitle: category.title
      }))
    );
  }
}
