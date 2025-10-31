import { getCurrentUserQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  // Check if token exists before making the query
  const hasToken = !!localStorage.getItem('token');
  
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    enabled: hasToken, // Only run query if token exists
    staleTime: 5 * 60 * 1000, // 5 minutes - cache the data to prevent unnecessary refetches
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    retry: (failureCount, error: any) => {
      // Don't retry on 401/unauthorized errors
      const status = error?.response?.status;
      if (status === 401) {
        return false;
      }
      // Retry once for other errors
      return failureCount < 1;
    },
    retryOnMount: true, // Retry when component mounts if query is stale
    refetchOnWindowFocus: false, // Don't refetch on window focus to prevent interruptions
    refetchOnReconnect: true, // Refetch when network reconnects
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
  return query;
};

export default useAuth;
