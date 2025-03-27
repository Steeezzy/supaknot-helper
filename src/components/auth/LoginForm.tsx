
import React, { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormProps = {
  onSuccess?: () => void;
};

const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      setIsLoading(true);
      
      // First check if this is an admin by looking in admin_login table
      const { data: adminData, error: adminError } = await supabase
        .from('admin_login')
        .select('*')
        .eq('email', values.email)
        .single();
      
      if (adminError && adminError.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
        console.error('Admin check error:', adminError);
        // Continue to normal login flow even if admin check fails
      }
      
      if (adminData) {
        console.log('Admin account found:', adminData);
        // This is an admin account
      } else {
        console.log('No admin account found for:', values.email);
        // Not an admin account, checking if user exists in user_profiles
        const { data: userProfileData, error: userProfileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', values.email)
          .single();
          
        if (userProfileError && userProfileError.code === 'PGRST116') {
          // No user profile found
          toast({
            title: "Account not found",
            description: "No account exists with this email. Please check your credentials or sign up.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }
      }
      
      // Attempt to sign in with Supabase Auth
      await signIn(values.email, values.password);
      
      if (onSuccess) onSuccess();
      
    } catch (error: any) {
      console.error('Login error:', error);
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
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
          control={form.control}
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
        
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
