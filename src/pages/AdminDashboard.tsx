
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Restaurant, Meal } from '@/types/database.types';
import { Plus, Trash2, Edit } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import AddMealForm from '@/components/AddMealForm';
import RestaurantSettings from '@/components/RestaurantSettings';
import MealsList from '@/components/MealsList';

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
      
      // Fetch restaurant data - simplified type handling to fix infinite type instantiation
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('user_id', user?.id)
        .single();
        
      if (restaurantError) {
        throw restaurantError;
      }
      
      // Cast to Restaurant type instead of direct assignment
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
            {restaurant?.name || 'Restaurant Admin'} Dashboard
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

        <MealsList meals={meals} onDeleteMeal={handleDeleteMeal} />
      </main>
    </div>
  );
};

export default AdminDashboard;
