import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase/client';
import { authApi } from '@/lib/api';
import { userApi } from '@/lib/api/user';

// Define the User type
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
}

// Define the AuthContext type
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean | void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Create a provider component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get session from Supabase
        const { data } = await supabase.auth.getSession();

        if (data.session) {
          try {
            // First try the /api/auth/me endpoint
            try {
              console.log('Trying to get user from /api/auth/me');
              const userData = await authApi.getCurrentUser();

              if (userData && userData.data && userData.data.user) {
                console.log('Successfully got user from /api/auth/me');
                setUser({
                  id: userData.data.user.id,
                  email: userData.data.user.email || '',
                  name: userData.data.user.name || userData.data.user.email,
                  role: userData.data.user.role || 'teacher',
                  avatar: userData.data.user.avatar || null
                });
                setIsAuthenticated(true);
                return;
              }
            } catch (apiError) {
              console.error('Error fetching user from /api/auth/me:', apiError);
            }

            // Then try the /api/user/profile endpoint
            try {
              console.log('Trying to get user from /api/user/profile');
              const userProfile = await userApi.getProfile();

              if (userProfile && userProfile.data) {
                console.log('Successfully got user from /api/user/profile');
                setUser({
                  id: data.session.user.id,
                  email: data.session.user.email || '',
                  name: userProfile.data.name || data.session.user.user_metadata?.full_name || data.session.user.email,
                  role: userProfile.data.role || 'teacher',
                  avatar: userProfile.data.avatar || null
                });
                setIsAuthenticated(true);
                return;
              }
            } catch (profileError) {
              console.error('Error fetching user from /api/user/profile:', profileError);
            }

            // If both API calls fail, fall back to session data
            console.log('Falling back to session data');
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: data.session.user.user_metadata?.full_name || data.session.user.email,
              role: data.session.user.user_metadata?.role || 'teacher'
            });
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Error in authentication flow:', error);
            // Final fallback to session data
            setUser({
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: data.session.user.user_metadata?.full_name || data.session.user.email,
              role: 'teacher'
            });
            setIsAuthenticated(true);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);

        if (event === 'SIGNED_IN' && session) {
          try {
            // First try the /api/auth/me endpoint
            try {
              console.log('Auth change: Trying to get user from /api/auth/me');
              const userData = await authApi.getCurrentUser();

              if (userData && userData.data && userData.data.user) {
                console.log('Auth change: Successfully got user from /api/auth/me');
                setUser({
                  id: userData.data.user.id,
                  email: userData.data.user.email || '',
                  name: userData.data.user.name || userData.data.user.email,
                  role: userData.data.user.role || 'teacher',
                  avatar: userData.data.user.avatar || null
                });
                setIsAuthenticated(true);
                return;
              }
            } catch (apiError) {
              console.error('Auth change: Error fetching user from /api/auth/me:', apiError);
            }

            // Then try the /api/user/profile endpoint
            try {
              console.log('Auth change: Trying to get user from /api/user/profile');
              const userProfile = await userApi.getProfile();

              if (userProfile && userProfile.data) {
                console.log('Auth change: Successfully got user from /api/user/profile');
                setUser({
                  id: session.user.id,
                  email: session.user.email || '',
                  name: userProfile.data.name || session.user.user_metadata?.full_name || session.user.email,
                  role: userProfile.data.role || 'teacher',
                  avatar: userProfile.data.avatar || null
                });
                setIsAuthenticated(true);
                return;
              }
            } catch (profileError) {
              console.error('Auth change: Error fetching user from /api/user/profile:', profileError);
            }

            // If both API calls fail, fall back to session data
            console.log('Auth change: Falling back to session data');
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email,
              role: session.user.user_metadata?.role || 'teacher'
            });
            setIsAuthenticated(true);
          } catch (error) {
            console.error('Auth change: Error in authentication flow:', error);
            // Final fallback to session data
            setUser({
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email,
              role: 'teacher'
            });
            setIsAuthenticated(true);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    );

    return () => {
      // Clean up subscription
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Logging in with email:', email);

      // Use API for login
      const response = await authApi.login(email, password);

      if (response && response.data && response.data.user) {
        console.log('Login successful, setting up session');
        const userData = response.data.user;

        // Set session in Supabase client for future requests
        try {
          await supabase.auth.setSession({
            access_token: response.data.session.access_token,
            refresh_token: response.data.session.refresh_token
          });
          console.log('Session set in Supabase client');
        } catch (sessionError) {
          console.error('Error setting session in Supabase client:', sessionError);
          // Continue with login even if setting session fails
        }

        // Set user data immediately to avoid loading state issues
        const userObj = {
          id: userData.id,
          email: userData.email || '',
          name: userData.name || userData.email,
          role: userData.role || 'teacher',
          avatar: userData.avatar || null
        };

        console.log('Setting user data:', userObj);
        setUser(userObj);

        // Important: Set authenticated state after user data is set
        console.log('Setting authenticated state to true');
        setIsAuthenticated(true);

        // Don't fetch additional profile data during login to avoid delays
        // We'll fetch it later if needed

        console.log('Login complete, returning success');
        return true; // Indicate successful login
      } else {
        console.error('Login response missing user data:', response);
        throw new Error('Invalid login response');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      setIsLoading(false); // Make sure to set loading to false on error
      throw error;
    } finally {
      console.log('Setting loading state to false');
      setIsLoading(false);
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // For OAuth, we still need to use Supabase directly
      // The API will handle the session after the redirect
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`,
        },
      });

      if (error) throw error;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.logout();
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Create the context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    loginWithGoogle,
    logout,
    error,
    clearError
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Create a hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
