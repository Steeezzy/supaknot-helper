
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Meal } from '@/types/database.types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import MealsList from '@/components/MealsList';

const UserDashboard = () => {
  const { user, userData, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !userData) {
      navigate('/auth');
      return;
    }
    
    fetchData();
  }, [user, userData, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurants data
      const { data: restaurantsData, error: restaurantsError } = await supabase
        .from('restaurants')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (restaurantsError) {
        throw restaurantsError;
      }
      
      setRestaurants(restaurantsData as Restaurant[]);
      
      // Fetch meals data - use maybeSingle() instead of single() to avoid PGRST116 error
      // or don't use single() at all if you expect multiple rows
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (mealsError) {
        throw mealsError;
      }
      
      setMeals(mealsData || []); // Ensure we always set an array, even if data is null
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
      // Set empty arrays to prevent undefined errors
      setRestaurants([]);
      setMeals([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);
      
      if (error) throw error;
      
      // Update local state after successful deletion
      setMeals(prevMeals => prevMeals.filter(meal => meal.id !== mealId));
      
      toast({
        title: "Meal deleted",
        description: "The meal has been successfully deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting meal:', error);
      toast({
        title: "Error deleting meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-6">Popular Restaurants</h2>
          {restaurants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {restaurants.map(restaurant => (
                <Card key={restaurant.id}>
                  <CardHeader>
                    <CardTitle>{restaurant.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-500">{restaurant.location}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i} 
                            className={`w-4 h-4 ${i < Math.floor(restaurant.rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
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
              <p className="text-gray-500">No restaurants available at the moment.</p>
            </div>
          )}
        </section>
        
        <section>
          <h2 className="text-xl font-semibold mb-6">Meals</h2>
          <MealsList 
            meals={meals} 
            onDeleteMeal={handleDeleteMeal} 
          />
        </section>
      </main>
    </div>
  );
};

export default UserDashboard;
