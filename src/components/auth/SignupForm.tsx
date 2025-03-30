
import React from 'react';
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

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6),
  restaurantName: z.string().min(1).optional(),
  location: z.string().min(1).optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type SignupFormProps = {
  role: UserRole;
  onSuccess?: () => void;
};

const SignupForm = ({ role, onSuccess }: SignupFormProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
      restaurantName: '',
      location: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof signupSchema>) => {
    try {
      const { error, data } = await signUp(values.email, values.password, role);
      
      if (error) {
        toast({
          title: "Error creating account",
          description: error.message,
          variant: "destructive",
        });
        console.error("Signup error:", error);
        return;
      }
      
      if (role === 'admin' && data?.user) {
        try {
          // Insert into admin_login table with the email as the identifier
          const { error: adminLoginError } = await supabase
            .from('admin_login')
            .insert({
              email: values.email,
              user_id: data.user.id // Add the user_id from auth
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
              name: values.restaurantName || '',
              location: values.location || '',
              rating: 0, // Default rating
              image_url: null // Default no image
            });
            
          if (restaurantError) {
            toast({
              title: "Error creating restaurant",
              description: restaurantError.message,
              variant: "destructive",
            });
            console.error("Restaurant error:", restaurantError);
          }
        } catch (err) {
          console.error("Error during admin registration:", err);
          toast({
            title: "Registration error",
            description: "An error occurred during admin registration",
            variant: "destructive",
          });
        }
      }
      
      if (onSuccess) onSuccess();
      
      toast({
        title: "Account created",
        description: "Please check your email for a confirmation link before logging in.",
      });
    } catch (error) {
      console.error('Signup error:', error);
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
                <Input type="password" placeholder="Create a password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
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
              control={form.control}
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
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        
        <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
};

export default SignupForm;
