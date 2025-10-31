import { useRef, useEffect } from "react";
import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, Outlet, useSearchParams, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const ProtectedRoute = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const tokenExtractedRef = useRef(false);

  // Extract token from URL synchronously BEFORE auth check (for Google OAuth redirects)
  // Read from URL directly to avoid timing issues
  const urlParams = new URLSearchParams(window.location.search);
  const tokenFromUrl = urlParams.get('token');
  
  if (tokenFromUrl && !tokenExtractedRef.current) {
    // Store token immediately (synchronously, before useAuth runs)
    localStorage.setItem('token', tokenFromUrl);
    
    // Extract userId from token and store it
    try {
      const payload = JSON.parse(atob(tokenFromUrl.split('.')[1]));
      if (payload._id) {
        localStorage.setItem('userId', payload._id);
      }
    } catch (error) {
      console.error('Failed to parse token:', error);
    }
    
    tokenExtractedRef.current = true;
  }

  // Clean up URL and invalidate queries after token extraction
  useEffect(() => {
    if (tokenExtractedRef.current) {
      const newParams = new URLSearchParams(searchParams);
      if (newParams.get('token')) {
        newParams.delete('token');
        navigate({ search: newParams.toString() }, { replace: true });
      }
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    }
  }, [searchParams, navigate, queryClient]);

  const { data: authData, isLoading, isRefetching } = useAuth();
  const user = authData?.user;

  // Show loading if query is loading or refetching (after token extraction)
  if (isLoading || (tokenExtractedRef.current && isRefetching)) {
    return <DashboardSkeleton />;
  }
  
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default ProtectedRoute;
