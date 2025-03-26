
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/database.types';
import { supabase } from '@/integrations/supabase/client';

interface LocationState {
  role?: UserRole;
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  restaurantName: z.string().min(1).optional(),
  state: z.string().min(1).optional(),
  district: z.string().min(1).optional(),
  city: z.string().min(1).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const locationState = location.state as LocationState || {};
  const [role] = useState<UserRole>(locationState.role || 'user');
  const [isLogin, setIsLogin] = useState(true);
  const { signIn, signUp, user } = useAuth();
  const { toast } = useToast();

  // Redirect if already logged in
  React.useEffect(() => {
    if (user) {
      navigate(role === 'admin' ? '/admin' : '/user');
    }
  }, [user, navigate, role]);

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const signupForm = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      restaurantName: '',
      state: '',
      district: '',
      city: '',
    },
  });

  const onLoginSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      await signIn(values.email, values.password);
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const onSignupSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      await signUp(values.email, values.password, role);
      
      if (role === 'admin') {
        // If the user signed up as an admin, create a restaurant entry
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData?.user) {
          // First, generate a random ID for the admin_login entry
          const adminId = Math.floor(Math.random() * 1000000) + 1; // Generate a random ID between 1 and 1000000
          
          // Create the admin_login entry with the generated ID
          const { error: adminLoginError } = await supabase
            .from('admin_login')
            .insert({
              id: adminId, // Provide a value for the id field
              email: values.email,
              resto_name: values.restaurantName || '',
              state: values.state || '',
              district: values.district || '',
              city_town: values.city || '',
            });
            
          if (adminLoginError) {
            toast({
              title: "Error creating admin account",
              description: adminLoginError.message,
              variant: "destructive",
            });
            console.error("Admin login error:", adminLoginError);
            return;
          }
          
          // Create the restaurant entry
          const { error: restaurantError } = await supabase
            .from('restaurants')
            .insert({
              user_id: userData.user.id,
              restaurant_name: values.restaurantName || '',
              state: values.state || '',
              district: values.district || '',
              city: values.city || '',
            });
            
          if (restaurantError) {
            toast({
              title: "Error creating restaurant",
              description: restaurantError.message,
              variant: "destructive",
            });
            console.error("Restaurant error:", restaurantError);
          }
        }
      }
      
      // After signup, switch to login view
      setIsLogin(true);
      toast({
        title: "Account created",
        description: "Please check your email for a confirmation link before logging in.",
      });
    } catch (error) {
      console.error('Signup error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6">
          {isLogin ? 'Sign In' : 'Create Account'}
          {role === 'admin' && ' as Admin'}
        </h1>
        
        {isLogin ? (
          <Form {...loginForm}>
            <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
              <FormField
                control={loginForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Enter your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button type="submit" className="w-full" disabled={loginForm.formState.isSubmitting}>
                {loginForm.formState.isSubmitting ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </Form>
        ) : (
          <Form {...signupForm}>
            <form onSubmit={signupForm.handleSubmit(onSignupSubmit)} className="space-y-4">
              <FormField
                control={signupForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={signupForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Create a password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={signupForm.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="Confirm your password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {role === 'admin' && (
                <>
                  <FormField
                    control={signupForm.control}
                    name="restaurantName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Restaurant Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter restaurant name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>State</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter state" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter district" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={signupForm.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City/Town</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter city or town" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
              
              <Button type="submit" className="w-full" disabled={signupForm.formState.isSubmitting}>
                {signupForm.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </Form>
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
