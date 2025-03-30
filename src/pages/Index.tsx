import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client'; 
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const { toast } = useToast();
  const { user, isAdmin } = useAuth();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setMeals(data || []);
      } catch (error) {
        console.error('Error fetching meals:', error);
        toast({
          title: "Failed to load meals",
          description: "Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMeals();
  }, [toast]);
  
  const addSampleMeals = async () => {
    try {
      // Ensure we have a restaurant ID for the logged-in admin
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user?.id)
        .single();
        
      if (restaurantError) {
        throw new Error('Could not find your restaurant. Please set up your restaurant first.');
      }
      
      const sampleMeals = [
        {
          name: 'Vegan Breakfast Bowl',
          description: 'Delicious vegan breakfast bowl with avocado and quinoa',
          price: 12.99,
          restaurant_id: restaurantData.id,
          is_available: true
        },
        {
          name: 'Greek Yogurt Parfait',
          description: 'Greek yogurt with fresh berries and honey',
          price: 8.99,
          restaurant_id: restaurantData.id,
          is_available: true
        }
      ];
      
      const { error } = await supabase
        .from('meals')
        .insert(sampleMeals);
        
      if (error) {
        throw error;
      }
      
      toast({
        title: "Sample meals added",
        description: "Check your meals dashboard to see them.",
      });
    } catch (error) {
      console.error('Error adding sample meals:', error);
      toast({
        title: "Failed to add sample meals",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="container mx-auto py-10 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Welcome to MealBuddy</h1>
          <p className="mt-3 text-xl text-gray-600">
            Find delicious meals from restaurants near you.
          </p>
          
          <div className="mt-8 space-y-4">
            {!user ? (
              <div className="space-y-4">
                <p className="text-lg">Get started by signing in or creating an account.</p>
                <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center">
                  <Link to="/auth">
                    <Button size="lg">Sign In</Button>
                  </Link>
                  <Link to="/auth" state={{ role: 'admin' }}>
                    <Button variant="outline" size="lg">Register as Restaurant</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-lg">Welcome back, {user.email}</p>
                <div className="flex justify-center space-x-4">
                  <Link to={isAdmin ? "/admin" : "/user"}>
                    <Button size="lg">Go to Dashboard</Button>
                  </Link>
                  {isAdmin && (
                    <Button 
                      variant="outline" 
                      size="lg"
                      onClick={addSampleMeals}
                    >
                      Add Sample Meals
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Show some featured meals */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Featured Meals
          </h2>
          
          {loading ? (
            <p className="text-center">Loading meals...</p>
          ) : meals.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Meal cards would go here */}
              {meals.slice(0, 3).map((meal) => (
                <div key={meal.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  {meal.image_url ? (
                    <img 
                      src={meal.image_url} 
                      alt={meal.name} 
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">No Image</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-medium">{meal.name}</h3>
                    <p className="text-gray-600 mt-1">{meal.description}</p>
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-green-600 font-bold">${meal.price.toFixed(2)}</span>
                      {meal.is_available ? (
                        <span className="text-green-500 text-sm">Available</span>
                      ) : (
                        <span className="text-red-500 text-sm">Unavailable</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center">No meals available yet. Check back later!</p>
          )}
        </div>
      </main>
    </div>
  );
};

export default Index;
