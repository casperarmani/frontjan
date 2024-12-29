import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardContent, CardTitle } from './ui/card';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        // Get the redirect path from location state, default to '/app'
        const { state } = location;
        const from = state?.from || '/app';
        navigate(from, { replace: true });
      } else if (result.code === 'PGRST301') {
        // Token expired, try login again (will get new token)
        const retryResult = await login(email, password);
        if (retryResult.success) {
          const { state } = location;
          const from = state?.from || '/app';
          navigate(from, { replace: true });
        } else {
          setError(retryResult.message || 'Login failed after token refresh');
        }
      } else {
        setError(result.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const params = new URLSearchParams(window.location.search);
  const message = params.get('message');

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 py-12">
      {message && (
        <div className="mb-4 p-4 text-sm text-blue-800 rounded-lg bg-blue-50">
          {message}
        </div>
      )}
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Sign in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3">
                <div className="text-sm text-destructive">{error}</div>
              </div>
            )}
            <div className="space-y-2">
              <Input
                id="email"
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Input
                id="password"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <p className="text-xs">
              If you don't have an account,{" "}
              <Link to="/signup" className="text-blue-500 underline hover:text-blue-700">
                sign up
              </Link>{" "}
              now to get started!
            </p>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;