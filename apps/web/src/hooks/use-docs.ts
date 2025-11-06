import { useQuery } from '@tanstack/react-query';
import type { DocCategory, DocSection, DocsResponse } from '@compliance/shared';
import apiClient from '../services/api-client';
import localDocs from '../pages/docs/docs.json';

const DOCS_QUERY_KEY = ['docs', 'collection'];

const coerceToCollection = (payload: DocsResponse | any): DocsResponse => {
  if (Array.isArray(payload?.sections) && !payload?.categories) {
    const sections: Array<Partial<DocSection> & { category?: string; contentMarkdown?: string }> =
      payload.sections;

    const grouped = new Map<string, DocCategory>();

    sections.forEach((section, index) => {
      const categoryTitle = section.category ?? 'General';
      const categoryId =
        section.category?.toLowerCase().replace(/[^a-z0-9]+/g, '-') ?? `category-${index}`;

      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, {
          id: categoryId,
          title: categoryTitle,
          order: grouped.size + 1,
          sections: []
        });
      }

      const collection = grouped.get(categoryId)!;
      const rawContent = section.content ?? section.contentMarkdown ?? '';

      collection.sections.push({
        id: section.id ?? `${categoryId}-section-${collection.sections.length + 1}`,
        slug: section.slug ?? `${categoryId}/${section.id ?? collection.sections.length + 1}`,
        title: section.title ?? 'Untitled',
        summary: section.summary,
        order: section.order ?? collection.sections.length + 1,
        icon: section.icon,
        tags: section.tags,
        content: rawContent
      });
    });

    const categories = Array.from(grouped.values()).map((category) => ({
      ...category,
      sections: category.sections.sort((a, b) => a.order - b.order)
    }));

    const index = categories.flatMap((category) =>
      category.sections.map((section) => ({
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

    return {
      version: String(payload.version ?? '1.0.0'),
      updatedAt: payload.updatedAt ?? payload.generatedAt ?? new Date().toISOString(),
      categories: categories.sort((a, b) => a.order - b.order),
      index
    };
  }

  return payload as DocsResponse;
};

const normaliseDocs = (raw: DocsResponse | any): DocsResponse => {
  const payload = coerceToCollection(raw);
  return {
    ...payload,
    categories: payload.categories.map((category) => ({
      ...category,
      sections: category.sections.map((section) => {
        const source = section.content ?? (section as { contentMarkdown?: string }).contentMarkdown ?? '';
        return {
          ...section,
          content: (source ?? '').trim()
        };
      })
    })),
    index: payload.index.slice().sort((a, b) => a.order - b.order)
  };
};

export const useDocs = () =>
  useQuery({
    queryKey: DOCS_QUERY_KEY,
    queryFn: async () => {
      try {
        const response = await apiClient.get<DocsResponse>('/docs');
        return normaliseDocs(response.data);
      } catch (error) {
        // Fallback to bundled docs seed if API unavailable
        return normaliseDocs({
          ...(localDocs as DocsResponse),
          index:
            (localDocs as DocsResponse).index ??
            (localDocs as DocsResponse).categories.flatMap((category) =>
              category.sections.map((section) => ({
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
            )
        });
      }
    },
    staleTime: 1000 * 60 * 30 // 30 minutes
  });
