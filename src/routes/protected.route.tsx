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

  const { data: authData, isLoading, isRefetching, error, isError } = useAuth();
  const user = authData?.user;
  const hasToken = !!localStorage.getItem('token');

  // If no token, redirect to login immediately
  if (!hasToken) {
    return <Navigate to="/" replace />;
  }

  // Handle 401/unauthorized errors - clear token and redirect
  if (isError && error) {
    const errorStatus = (error as any)?.response?.status;
    const errorCode = (error as any)?.errorCode;
    
    // If 401 or unauthorized, clear token and redirect
    if (errorStatus === 401 || errorCode === 'UNAUTHORIZED' || (error as any)?.message?.includes('401')) {
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      return <Navigate to="/" replace />;
    }
  }

  // If user exists, render protected routes immediately
  if (user) {
    return <Outlet />;
  }

  // Show loading only if we're actively loading/refetching (with timeout protection)
  if ((isLoading || isRefetching) && hasToken && !isError) {
    return <DashboardSkeleton />;
  }

  // If query completed but no user (and not loading), token might be invalid
  if (hasToken && !isLoading && !isRefetching && !user) {
    // Give a brief moment for query to complete, then redirect
    return <Navigate to="/" replace />;
  }

  // Fallback: show skeleton briefly
  return <DashboardSkeleton />;
};

export default ProtectedRoute;
