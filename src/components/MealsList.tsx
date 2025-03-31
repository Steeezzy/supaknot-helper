
import React from 'react';
import { Meal } from '@/types/database.types';
import { Button } from '@/components/ui/button';
import { Trash2, Edit, Store } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface MealsListProps {
  meals: Meal[];
  onDeleteMeal: (mealId: string) => Promise<void>;
  onEditMeal?: (meal: Meal) => void;
}

const MealsList = ({ meals, onDeleteMeal, onEditMeal }: MealsListProps) => {
  if (!meals || meals.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <p className="text-gray-500">No meals added yet. Add your first meal to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {meals.map(meal => (
        <Card key={meal.id} className="overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
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
                className="h-8 w-8"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-2">
            <p className="text-gray-600 text-sm line-clamp-3">{meal.nutrient_info || 'No nutritional information'}</p>
            <p className="text-xs text-gray-400 mt-2">
              Added {formatDistanceToNow(new Date(meal.created_at), { addSuffix: true })}
            </p>
          </CardContent>
          <CardFooter className="p-4 pt-0 flex justify-between items-center">
            <Badge variant="success" className="px-2 py-1">
              Available
            </Badge>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onEditMeal && onEditMeal(meal)}
              className="ml-auto"
            >
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
