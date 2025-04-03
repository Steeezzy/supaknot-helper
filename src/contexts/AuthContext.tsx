
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { UserRole, User, Admin } from '@/types/database.types';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null;
  userData: User | null;
  adminData: Admin | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: 'admin' | 'user') => Promise<{
    error: Error | null;
    data: { user: SupabaseUser | null } | null;
  }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [adminData, setAdminData] = useState<Admin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchUserData(session.user.email);
        } else {
          setUserData(null);
          setAdminData(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.email);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserData = async (email: string | undefined) => {
    if (!email) return;
    
    try {
      // Check if the user is an admin
      const { data: adminData, error: adminError } = await supabase
        .from('admin')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (adminError && adminError.code !== 'PGRST116') {
        console.error('Error fetching admin data:', adminError);
      }

      if (adminData) {
        setAdminData(adminData as Admin);
        setUserData(null);
        return;
      }

      // If not an admin, check if they're a regular user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Error fetching user data:', userError);
        return;
      }

      setUserData(userData as User);
      setAdminData(null);
    } catch (error) {
      console.error('Error in fetchUserData:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, name: string, role: 'admin' | 'user' = 'user') => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        toast({
          title: "Registration failed",
          description: error.message,
          variant: "destructive",
        });
        return { error, data: null };
      }
      
      if (data.user) {
        if (role === 'admin') {
          // Create admin record including id - FIXED: Added user id to insert
          const admin_id = `admin-${Math.random().toString(36).substring(2, 10)}`;
          const { error: adminError } = await supabase
            .from('admin')
            .insert({
              id: data.user.id,  // Fixed: This was missing
              email,
              name,
              admin_id
            });
            
          if (adminError) {
            console.error('Error creating admin record:', adminError);
            toast({
              title: "Error creating admin account",
              description: adminError.message,
              variant: "destructive",
            });
          }
        } else {
          // Create user record
          const user_id = `user-${Math.random().toString(36).substring(2, 10)}`;
          const { error: userError } = await supabase
            .from('users')
            .insert({
              id: data.user.id,
              email,
              name,
              user_id
            });
            
          if (userError) {
            console.error('Error creating user record:', userError);
            toast({
              title: "Error creating user account",
              description: userError.message,
              variant: "destructive",
            });
          }
        }
      }
      
      // Return the user data so it can be used in the onSubmit handler in SignupForm
      return { error: null, data: { user: data.user } };
    } catch (error: any) {
      console.error('Error signing up:', error);
      return { error, data: null };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        toast({
          title: "Sign out failed",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }
      
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      });
    } catch (error: any) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = !!adminData;

  return (
    <AuthContext.Provider value={{ 
      session, 
      user, 
      userData,
      adminData,
      isAdmin,
      isLoading, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
