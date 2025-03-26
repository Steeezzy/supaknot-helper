
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UserRole } from "@/types/database.types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole;
}

const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, userProfile, isLoading } = useAuth();

  if (isLoading) {
    // You could show a loading spinner here
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }

  if (!user) {
    // User is not authenticated, redirect to login
    return <Navigate to="/auth" replace />;
  }

  if (requiredRole && userProfile?.role !== requiredRole) {
    // User doesn't have the required role, redirect to home
    return <Navigate to="/" replace />;
  }

  // User is authenticated and has the required role, render the children
  return <>{children}</>;
};

export default ProtectedRoute;
