
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { user, userProfile, isLoading } = useAuth();

  // If user is already logged in, redirect to appropriate dashboard
  React.useEffect(() => {
    if (user && userProfile) {
      if (userProfile.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/user');
      }
    }
  }, [user, userProfile, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  // If not logged in, show the role selection
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">Welcome to Meal Service</h1>
        <p className="text-gray-600 text-center mb-8">Select your role to continue</p>
        
        <div className="flex flex-col space-y-4">
          <Button 
            className="w-full py-6 text-lg" 
            variant="default"
            onClick={() => navigate('/auth', { state: { role: 'user' } })}
          >
            Continue as User
          </Button>
          
          <Button 
            className="w-full py-6 text-lg" 
            variant="outline"
            onClick={() => navigate('/auth', { state: { role: 'admin' } })}
          >
            Continue as Restaurant Admin
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Index;
