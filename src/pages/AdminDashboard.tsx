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
  const { user, adminData, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !adminData) {
      navigate('/auth');
      return;
    }
    
    fetchRestaurantData();
  }, [user, adminData, navigate]);

  const fetchRestaurantData = async () => {
    try {
      setLoading(true);
      
      // Fetch restaurant data
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('*')
        .eq('admin_id', adminData?.id)
        .maybeSingle();
        
      if (restaurantError && restaurantError.code !== 'PGRST116') {
        throw restaurantError;
      }
      
      // Cast to Restaurant type
      if (restaurantData) {
        setRestaurant(restaurantData as Restaurant);
        
        // Fetch meals data
        const { data: mealsData, error: mealsError } = await supabase
          .from('meals')
          .select('*')
          .eq('restaurant_id', restaurantData.id);
          
        if (mealsError) {
          throw mealsError;
        }
        
        setMeals(mealsData as Meal[]);
      } else {
        // No restaurant found for this admin
        setRestaurant(null);
        setMeals([]);
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
    if (!restaurant) {
      toast({
        title: "Error",
        description: "You need to create a restaurant first",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Generate a unique meal_id
      const meal_id = `meal-${Math.random().toString(36).substring(2, 10)}`;
      
      const { data, error } = await supabase
        .from('meals')
        .insert({
          name: newMeal.name!,
          price: newMeal.price!,
          restaurant_id: restaurant.id,
          meal_id,
          nutrient_info: newMeal.nutrient_info || null
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

  const handleCreateRestaurant = async (restaurantData: Partial<Restaurant>) => {
    try {
      // Generate a unique rest_id
      const rest_id = `rest-${Math.random().toString(36).substring(2, 10)}`;
      
      const { data, error } = await supabase
        .from('restaurants')
        .insert({
          name: restaurantData.name!,
          location: restaurantData.location!,
          rating: 0,
          admin_id: adminData?.id,
          rest_id
        })
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      setRestaurant(data as Restaurant);
      toast({
        title: "Restaurant created",
        description: "Your restaurant has been created successfully.",
      });
    } catch (error: any) {
      console.error('Error creating restaurant:', error);
      toast({
        title: "Failed to create restaurant",
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

  // If admin doesn't have a restaurant yet, show restaurant creation form
  if (!restaurant) {
    return (
      <div className="min-h-screen bg-gray-100">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Create Your Restaurant</h2>
            <p className="mb-4 text-gray-600">You need to create a restaurant before you can add meals.</p>
            
            <RestaurantSettings 
              restaurant={null} 
              onUpdate={(newRestaurant) => handleCreateRestaurant(newRestaurant)}
            />
          </div>
        </main>
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
