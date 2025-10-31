import { Injectable } from '@nestjs/common';
import { frameworks as seededFrameworks } from './seed/frameworks.seed';
import { controls as seededControls } from './seed/controls.seed';
import { ControlDefinition, ControlPriority, FrameworkFamily } from './framework.types';

export type FrameworkSummary = {
  id: string;
  name: string;
  version: string;
  description: string;
  family: FrameworkFamily;
  controlCount: number;
};

export type ControlCatalogFilters = {
  search?: string;
  family?: string;
  priority?: ControlPriority;
  kind?: 'base' | 'enhancement';
  page: number;
  pageSize: number;
};

export type ControlCatalogResponse = {
  frameworkId: string;
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
  items: ControlDefinition[];
  facets: {
    families: Array<{ value: string; count: number }>;
    priorities: Array<{ value: ControlPriority; count: number }>;
    types: Array<{ value: 'base' | 'enhancement'; count: number }>;
  };
};

@Injectable()
export class FrameworkService {
  async list(): Promise<FrameworkSummary[]> {
    return seededFrameworks;
  }

  async get(id: string): Promise<FrameworkSummary | undefined> {
    return seededFrameworks.find((framework) => framework.id === id);
  }

  async listControls(frameworkId: string, filters: ControlCatalogFilters): Promise<ControlCatalogResponse> {
    const requestedFramework = await this.get(frameworkId);

    if (!requestedFramework) {
      return {
        frameworkId,
        items: [],
        total: 0,
        page: filters.page,
        pageSize: filters.pageSize,
        hasNextPage: false,
        facets: {
          families: [],
          priorities: []
        }
      };
    }

    const frameworkControls = seededControls.filter((control) => control.frameworkId === frameworkId);

    const normalizedFamily = filters.family?.trim().toLowerCase();
    const normalizedPriority = filters.priority;
    const normalizedKind = filters.kind;
    const normalizedSearch = filters.search?.trim().toLowerCase();

    const filtered = frameworkControls.filter((control) => {
      if (normalizedFamily && control.family.toLowerCase() !== normalizedFamily) {
        return false;
      }

      if (normalizedPriority && control.priority !== normalizedPriority) {
        return false;
      }

      if (normalizedKind && control.kind !== normalizedKind) {
        return false;
      }

      if (normalizedSearch) {
        const haystack = [
          control.id,
          control.title,
          control.description,
          control.family,
          control.kind,
          control.parentId ?? '',
          ...(control.keywords ?? []),
          ...(control.references ?? [])
        ]
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(normalizedSearch)) {
          return false;
        }
      }

      return true;
    });

    const total = filtered.length;
    const pageSize = Math.max(1, Math.min(filters.pageSize ?? 25, 100));
    const page = Math.max(filters.page ?? 1, 1);
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filtered.slice(start, end);
    const hasNextPage = end < total;

    const families = Array.from(
      frameworkControls.reduce((acc, control) => {
        const key = control.family;
        acc.set(key, (acc.get(key) ?? 0) + 1);
        return acc;
      }, new Map<string, number>())
    ).map(([value, count]) => ({ value, count }));

    const priorities = Array.from(
      frameworkControls.reduce((acc, control) => {
        const key = control.priority;
        acc.set(key, (acc.get(key) ?? 0) + 1);
        return acc;
      }, new Map<ControlPriority, number>())
    )
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([value, count]) => ({ value, count }));

    const types = Array.from(
      frameworkControls.reduce((acc, control) => {
        const key = control.kind;
        acc.set(key, (acc.get(key) ?? 0) + 1);
        return acc;
      }, new Map<'base' | 'enhancement', number>())
    ).map(([value, count]) => ({ value, count }));

    return {
      frameworkId,
      total,
      page,
      pageSize,
      hasNextPage,
      items,
      facets: {
        families,
        priorities,
        types
      }
    };
  }
}
