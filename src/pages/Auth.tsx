
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/database.types';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';

interface LocationState {
  role?: UserRole;
}

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState || {};
  const [role] = useState<'admin' | 'user'>(locationState.role as 'admin' | 'user' || 'user');
  const [isLogin, setIsLogin] = useState(true);
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(role === 'admin' ? '/admin' : '/user');
    }
  }, [user, navigate, role]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isLogin ? 'Sign In' : 'Create Account'}
          {role === 'admin' && ' as Admin'}
        </h1>
        
        {isLogin ? (
          <LoginForm />
        ) : (
          <SignupForm 
            role={role} 
            onSuccess={() => setIsLogin(true)} 
          />
        )}
        
        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={() => setIsLogin(!isLogin)}
            className="text-blue-600"
          >
            {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
          </Button>
        </div>
        
        <div className="mt-4 text-center">
          <Button 
            variant="link" 
            onClick={() => navigate('/')}
            className="text-gray-500"
          >
            Back to Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
