
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Meal } from '@/types/database.types';
import { Plus, Trash2 } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import AddMealForm from '@/components/AddMealForm';
import RestaurantSettings from '@/components/RestaurantSettings';

const AdminDashboard = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    fetchRestaurantData();
  }, [user]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant data
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (restaurantError) {
        throw restaurantError;
      }
      
      setRestaurant(restaurantData as Restaurant);
      
      // Fetch meals data
      if (restaurantData) {
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('restaurant_id', restaurantData.id);
          
        if (mealsError) {
          throw mealsError;
        }
        
        setMeals(mealsData as Meal[]);
      }
    } catch (error: any) {
      console.error('Error fetching data:', error);
      toast({
        title: "Error loading data",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMeal = async (newMeal: Partial<Meal>) => {
    if (!restaurant) return;
    
    try {
      // Ensure required fields are present and have the correct types
      if (!newMeal.name || typeof newMeal.price !== 'number') {
        throw new Error('Meal name and price are required');
      }
      
      const { data, error } = await supabase
        .from('meals')
        .insert({
          name: newMeal.name,
          price: newMeal.price,
          restaurant_id: restaurant.id,
          description: newMeal.description || null,
          image_url: newMeal.image_url || null,
          is_available: newMeal.is_available !== undefined ? newMeal.is_available : true
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setMeals([...meals, data as Meal]);
      toast({
        title: "Meal added",
        description: "The meal has been added successfully.",
      });
    } catch (error: any) {
      console.error('Error adding meal:', error);
      toast({
        title: "Failed to add meal",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteMeal = async (mealId: string) => {
    try {
      const { error } = await supabase
        .from('meals')
        .delete()
        .eq('id', mealId);
        
      if (error) {
        throw error;
      }
      
      setMeals(meals.filter(meal => meal.id !== mealId));
      toast({
        title: "Meal deleted",
        description: "The meal has been removed successfully.",
      });
    } catch (error: any) {
      console.error('Error deleting meal:', error);
      toast({
        title: "Failed to delete meal",
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
          <h1 className="text-2xl font-bold text-gray-900">
            {restaurant?.restaurant_name || 'Restaurant Admin'} Dashboard
          </h1>
          <div className="flex items-center space-x-4">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline">Settings</Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Restaurant Settings</SheetTitle>
                  <SheetDescription>
                    Update your restaurant information
                  </SheetDescription>
                </SheetHeader>
                {restaurant && (
                  <RestaurantSettings 
                    restaurant={restaurant}
                    onUpdate={(updatedRestaurant) => {
                      setRestaurant(updatedRestaurant);
                      toast({
                        title: "Settings updated",
                        description: "Your restaurant information has been updated.",
                      });
                    }}
                  />
                )}
              </SheetContent>
            </Sheet>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Meals</h2>
          <Sheet>
            <SheetTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Meal
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Add New Meal</SheetTitle>
                <SheetDescription>
                  Create a new meal for your restaurant
                </SheetDescription>
              </SheetHeader>
              <AddMealForm onAddMeal={handleAddMeal} />
            </SheetContent>
          </Sheet>
        </div>

        {meals.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-gray-500">No meals added yet. Add your first meal to get started.</p>
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
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{meal.name}</h3>
                      <p className="text-green-600 font-medium">${meal.price.toFixed(2)}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                  <p className="text-gray-600 mt-2">{meal.description || 'No description'}</p>
                  <div className="mt-4 flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      meal.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {meal.is_available ? 'Available' : 'Unavailable'}
                    </span>
                    <Button variant="outline" size="sm">Edit</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
