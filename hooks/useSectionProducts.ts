import { apiGet } from '@/lib/api-client';
import type { NormalizedProduct } from '@/lib/api-types';
import { useInfiniteQuery } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';

type SectionProductsResponse = {
  section: string;
  data: NormalizedProduct[];
  page: number;
  limit: number;
  total: number;
};

type Options = {
  limit?: number;
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
};

/** Paginated products from a single section (e.g. "arduino", "fans"). */
export function useSectionProducts(section: string, options: Options = {}) {
  const { limit = 20, enabled = true, staleTime, gcTime } = options;
  return useInfiniteQuery({
    queryKey: queryKeys.sectionProducts(section, limit),
    initialPageParam: 1,
    queryFn: ({ pageParam, signal }) =>
      apiGet<SectionProductsResponse>(
        `/sections/${encodeURIComponent(section)}`,
        { page: pageParam, limit },
        signal,
      ),
    getNextPageParam: (lastPage) => {
      const loaded = lastPage.page * lastPage.limit;
      return loaded < lastPage.total ? lastPage.page + 1 : undefined;
    },
    enabled: enabled && !!section,
    ...(staleTime !== undefined ? { staleTime } : {}),
    ...(gcTime !== undefined ? { gcTime } : {}),
  });
}