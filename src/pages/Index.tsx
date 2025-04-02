
import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant } from '@/types/database.types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import OrderStatus from '@/components/OrderStatus';

const Index = () => {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  const { data: restaurants, isLoading } = useQuery({
    queryKey: ['restaurants'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('restaurants')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) {
          throw error;
        }
        
        return data as Restaurant[];
      } catch (error: any) {
        console.error('Error fetching restaurants:', error);
        toast({
          title: "Error loading restaurants",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    },
  });

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">FoodOrderApp</h1>
          <div className="flex space-x-4">
            {user ? (
              <>
                <Button variant="outline" asChild>
                  <Link to={isAdmin ? "/admin" : "/user"}>Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/auth">Register</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {user && (
          <section className="mb-8">
            <OrderStatus className="w-full" />
          </section>
        )}
        
        <section className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Popular Restaurants</h2>
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(skeleton => (
                <Card key={skeleton} className="h-[300px] animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-t-lg"></div>
                  <CardHeader>
                    <div className="h-5 w-3/4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
                  </CardHeader>
                  <CardFooter>
                    <div className="h-9 w-full bg-gray-200 rounded"></div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : restaurants && restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(restaurant => (
                <Card key={restaurant.id} className="overflow-hidden">
                  <div className="h-40 bg-gray-200 relative">
                    {/* Restaurant image placeholder */}
                  </div>
                  <CardHeader>
                    <CardTitle>{restaurant.name}</CardTitle>
                    <CardDescription>{restaurant.location}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-5 h-5 ${i < Math.round(restaurant.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                            fill="currentColor" 
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">{restaurant.rating.toFixed(1)}</span>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button className="w-full">View Menu</Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <h3 className="text-lg font-medium">No restaurants found</h3>
              <p className="text-gray-500">Check back later for new additions.</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Index;
