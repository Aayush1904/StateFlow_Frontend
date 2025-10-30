import { getCurrentUserQueryFn } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const useAuth = () => {
  const query = useQuery({
    queryKey: ["authUser"],
    queryFn: getCurrentUserQueryFn,
    staleTime: 0,
    retry: false, // Disable retry to prevent repeated 401 errors
    retryOnMount: false, // Don't retry when component mounts
    refetchOnWindowFocus: true, // Allow refetch on window focus for authenticated users
  });
  return query;
};

export default useAuth;
