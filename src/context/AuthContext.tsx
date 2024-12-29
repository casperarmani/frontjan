import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  email: string;
  id: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signup: (email: string, _password: string) => Promise<{ success: boolean; message?: string }>;
  login: (email: string, _password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

  const handleLogout = async () => {
    setUser(null);
    await logout();
    window.location.href = '/login?message=Your session has expired. Please log in again.';
  };



const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/auth_status', {
        credentials: 'include'
      });
      const data = await response.json();
      
      if (response.ok && data.authenticated) {
        await checkAuthStatus();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  };

    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/auth_status', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (response.ok && data.authenticated && data.user) {
        setUser(data.user);
        // Check auth status every 3 minutes
        setTimeout(checkAuthStatus, 180000);
        
        // Set up refresh before expiry
        if (data.sessionExpiresIn) {
          const refreshTimeout = Math.max((data.sessionExpiresIn - 60) * 1000, 0);
          setTimeout(async () => {
            await refreshToken();
          }, refreshTimeout);
        }
      } else if (response.status === 401 || data.code === 'PGRST301') {
        // Try to refresh token first
        const refreshResult = await refreshToken();
        if (!refreshResult) {
          await handleLogout();
        }
      } else {
        setUser(null);
      }

      // If session is approaching expiry, refresh it
      if (data.sessionExpiresIn && data.sessionExpiresIn < 300) {
        const refreshResult = await refreshToken();
        if (!refreshResult) {
          throw new Error('Session refresh failed');
        }
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
      setUser(null);
      if (error instanceof TypeError) {
        setTimeout(checkAuthStatus, 5000);
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, _password: string) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', _password);

      const response = await fetch('/api/login', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        await checkAuthStatus(); // Refresh user data after successful login
        return { success: true };
      }
      
      // If token expired, Supabase will automatically handle refresh and retry
      if (data.code === 'PGRST301') {
        // Try one more time since Supabase should have refreshed the token
        const retryResponse = await fetch('/api/login', {
          method: 'POST',
          credentials: 'include',
          body: formData
        });
        
        const retryData = await retryResponse.json();
        if (retryData.success) {
          await checkAuthStatus();
          return { success: true };
        }
      }
      
      return { 
        success: false, 
        message: data.message || 'Login failed'
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Login failed. Please try again.'
      };
    }
  };

  const signup = async (email: string, _password: string) => {
    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('password', _password);

      const response = await fetch('/api/signup', {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        return { success: true };
      }
      
      return { 
        success: false, 
        message: data.message || 'Signup failed'
      };
    } catch (error) {
      return { 
        success: false, 
        message: 'Signup failed. Please try again.'
      };
    }
  };

  const logout = async () => {
    try {
      await fetch('/logout', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Cache-Control': 'no-cache',
        }
      });
      setUser(null);
      // Clear any stored tokens
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
