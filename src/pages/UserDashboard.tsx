import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Meal, Restaurant } from '@/types/database.types';
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState<Restaurant | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (selectedRestaurant) {
      fetchMeals(selectedRestaurant.id);
    }
  }, [selectedRestaurant]);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('restaurants')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      setRestaurants(data as Restaurant[]);
      if (data.length > 0) {
        setSelectedRestaurant(data[0] as Restaurant);
      }
    } catch (error: any) {
      console.error('Error fetching restaurants:', error);
      toast({
        title: "Error loading restaurants",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMeals = async (restaurantId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('restaurant_id', restaurantId)
        .eq('is_available', true);
        
      if (error) {
        throw error;
      }
      
      setMeals(data as Meal[]);
    } catch (error: any) {
      console.error('Error fetching meals:', error);
      toast({
        title: "Error loading meals",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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

  if (loading && restaurants.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading restaurants...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Food Ordering</h1>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Restaurant</h2>
          <div className="flex flex-wrap gap-4">
            {restaurants.map(restaurant => (
              <Button
                key={restaurant.id}
                variant={selectedRestaurant?.id === restaurant.id ? "default" : "outline"}
                onClick={() => setSelectedRestaurant(restaurant)}
              >
                {restaurant.name}
              </Button>
            ))}
          </div>
        </div>

        {selectedRestaurant && (
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-2">{selectedRestaurant.name}</h2>
              <p className="text-gray-600">{selectedRestaurant.location}</p>
            </div>

            <h3 className="text-lg font-semibold mb-4">Available Meals</h3>
            
            {loading ? (
              <div className="text-center py-8">
                <p>Loading meals...</p>
              </div>
            ) : meals.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-6 text-center">
                <p className="text-gray-500">No meals available from this restaurant.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map(meal => (
                  <div key={meal.id} className="bg-white rounded-lg shadow overflow-hidden">
                    {meal.image_url ? (
                      <img 
                        src={meal.image_url} 
                        alt={meal.name} 
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <p className="text-gray-500">No image</p>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{meal.name}</h3>
                      <p className="text-gray-600 mt-2">{meal.description || 'No description'}</p>
                      <div className="mt-4 flex justify-between items-center">
                        <span className="text-green-600 font-medium">${meal.price.toFixed(2)}</span>
                        <Button>Add to Cart</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default UserDashboard;
