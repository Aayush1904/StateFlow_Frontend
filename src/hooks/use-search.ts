import { useQuery } from '@tanstack/react-query';
import { searchQueryFn, type SearchPayloadType } from '@/lib/api';
import { useDebounce } from '@/hooks/use-debounce';

interface UseSearchParams {
  workspaceId: string;
  query: string;
  types?: ('page' | 'task' | 'project')[];
  projectId?: string;
  enabled?: boolean;
}

export const useSearch = ({
  workspaceId,
  query,
  types,
  projectId,
  enabled = true,
}: UseSearchParams) => {
  const debouncedQuery = useDebounce(query, 300); // Debounce search by 300ms
  
  const searchPayload: SearchPayloadType = {
    query: debouncedQuery,
    types,
    projectId,
    limit: 50,
    offset: 0,
  };

  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['search', workspaceId, debouncedQuery, types, projectId],
    queryFn: () => {
      console.log('Search query:', { workspaceId, query: debouncedQuery, types, searchPayload });
      return searchQueryFn({ workspaceId, data: searchPayload });
    },
    enabled: enabled && !!workspaceId && debouncedQuery.trim().length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  return {
    results: data?.results || [],
    pagination: data?.pagination,
    isLoading,
    error,
    refetch,
  };
};

