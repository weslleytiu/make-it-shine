import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  /** Require admin role; redirect to dashboard if not admin */
  requireAdmin?: boolean;
}

export function ProtectedRoute({ requireAdmin = false }: ProtectedRouteProps) {
  const { user, profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ returnTo: location.pathname }} replace />;
  }

  if (requireAdmin && profile?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
