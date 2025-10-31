import { DashboardSkeleton } from "@/components/skeleton-loaders/dashboard-skeleton";
import useAuth from "@/hooks/api/use-auth";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isAuthRoute } from "./common/routePaths";

const AuthRoute = () => {
  const location = useLocation();
  const { data: authData, isLoading } = useAuth();
  const user = authData?.user;

  const _isAuthRoute = isAuthRoute(location.pathname);
  
  // Check if token exists - if not, definitely show auth page
  const hasToken = !!localStorage.getItem('token');

  if (isLoading && !_isAuthRoute && hasToken) return <DashboardSkeleton />;

  // Only redirect if user exists AND token exists (prevent redirect after logout)
  if (user && hasToken) {
    return <Navigate to={`workspace/${user.currentWorkspace?._id}`} replace />;
  }

  return <Outlet />;
};

export default AuthRoute;
