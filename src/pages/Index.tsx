
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import AddMealForm from '@/components/AddMealForm';
import { supabase } from '@/integrations/supabase/client';
import { Meal } from '@/types/database.types';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddMealOpen, setIsAddMealOpen] = useState(false);

  const handleNavigateToAuth = () => {
    navigate('/auth');
  };

  const handleAddMeal = async (mealData: Partial<Meal>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to add meals",
        variant: "destructive"
      });
      navigate('/auth');
      return;
    }

    try {
      // Fetch user's restaurant info first
      const { data: restaurantData, error: restaurantError } = await supabase
        .from('restaurants')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (restaurantError) {
        throw new Error("You need to create a restaurant profile first");
      }

      if (!restaurantData) {
        toast({
          title: "Restaurant not found",
          description: "Please set up your restaurant profile first",
          variant: "destructive"
        });
        return;
      }

      // Add meal with the restaurant id
      const { data, error } = await supabase
        .from('meals')
        .insert({
          ...mealData,
          restaurant_id: restaurantData.id
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      toast({
        title: "Meal added",
        description: "Your meal has been added successfully"
      });

      setIsAddMealOpen(false);
    } catch (error: any) {
      toast({
        title: "Failed to add meal",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Header 
        onAddClick={user ? () => setIsAddMealOpen(true) : undefined} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-xl font-semibold">Meal Listings</h2>
        </div>

        <div className="mt-4">
          {!user ? (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-4">Sign in to manage your restaurant</h3>
              <Button onClick={handleNavigateToAuth}>
                Sign In / Sign Up
              </Button>
            </div>
          ) : (
            <div className="bg-white shadow rounded-lg p-6 text-center">
              <h3 className="text-lg font-medium mb-4">Start by adding your first meal</h3>
              <Button onClick={() => setIsAddMealOpen(true)} className="bg-green-500 hover:bg-green-600">
                Add Meal
              </Button>
            </div>
          )}
        </div>
      </main>

      {/* Add Meal Sheet */}
      <Sheet open={isAddMealOpen} onOpenChange={setIsAddMealOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-auto">
          <SheetHeader className="bg-green-500 text-white p-4 mb-4 -mx-5 -mt-5">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsAddMealOpen(false)}
                className="mr-2 text-white hover:bg-green-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
              </Button>
              <SheetTitle className="text-white">Add Meal</SheetTitle>
            </div>
          </SheetHeader>
          <AddMealForm onAddMeal={handleAddMeal} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Index;
