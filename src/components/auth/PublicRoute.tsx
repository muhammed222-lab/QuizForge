import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface PublicRouteProps {
  children: ReactNode;
  restricted?: boolean;
}

export const PublicRoute = ({ children, restricted = false }: PublicRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Get the return URL from query parameters
  const searchParams = new URLSearchParams(location.search);
  const returnUrl = searchParams.get('returnUrl') || '/app/dashboard';

  // Redirect to dashboard if authenticated and route is restricted
  useEffect(() => {
    if (!isLoading && isAuthenticated && restricted) {
      navigate(returnUrl, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, restricted, returnUrl]);

  // If still loading, show loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="text-black">Loading...</p>
        </div>
      </div>
    );
  }

  // If authenticated and route is restricted, show loading while redirecting
  if (isAuthenticated && restricted) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="text-black">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  // Otherwise, render children
  return <>{children}</>;
};
