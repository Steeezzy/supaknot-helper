
import React from 'react';
import { Meal } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Trash2, Edit } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface MealsListProps {
  meals: Meal[];
  onDeleteMeal: (mealId: string) => Promise<void>;
}

const MealsList = ({ meals, onDeleteMeal }: MealsListProps) => {
  if (meals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No meals added yet. Add your first meal to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {meals.map(meal => (
        <Card key={meal.id} className="overflow-hidden">
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
          <CardHeader className="p-4 pb-0">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">{meal.name}</h3>
                <p className="text-green-600 font-medium">${meal.price.toFixed(2)}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteMeal(meal.id)}
              >
                <Trash2 className="h-5 w-5 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-gray-600">{meal.description || 'No description'}</p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <span className={`px-2 py-1 rounded text-xs ${
              meal.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {meal.is_available ? 'Available' : 'Unavailable'}
            </span>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default MealsList;
