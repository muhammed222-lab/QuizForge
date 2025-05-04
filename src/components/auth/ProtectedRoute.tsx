import { ReactNode, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Log authentication state for debugging
  useEffect(() => {
    console.log('Protected route - Auth state:', {
      isAuthenticated,
      isLoading,
      path: location.pathname,
      user: user ? `${user.name} (${user.email})` : 'none'
    });
  }, [isAuthenticated, isLoading, location.pathname, user]);

  // Redirect to login if not authenticated and not loading
  useEffect(() => {
    // Only redirect if we're sure the user is not authenticated (not during loading)
    if (!isLoading && !isAuthenticated) {
      console.log('Not authenticated, redirecting to login');
      // Use a small delay to avoid potential race conditions
      const redirectTimer = setTimeout(() => {
        navigate(`/auth/login?returnUrl=${encodeURIComponent(location.pathname)}`, { replace: true });
      }, 100);

      return () => clearTimeout(redirectTimer);
    }
  }, [isAuthenticated, isLoading, location.pathname, navigate]);

  // If still loading, show loading screen
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="text-black">Loading authentication state...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, show redirecting screen
  if (!isAuthenticated) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
          <p className="text-black">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // If authenticated and we have a user, render children
  if (isAuthenticated && user) {
    console.log('User authenticated, rendering protected content');
    return <>{children}</>;
  }

  // This should rarely happen - authenticated but no user data
  console.error('Authenticated but no user data available');
  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-green-200 border-t-green-600" />
        <p className="text-black">Loading user data...</p>
      </div>
    </div>
  );
};
