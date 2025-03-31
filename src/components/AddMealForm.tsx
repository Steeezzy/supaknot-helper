
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Meal } from '@/types/database.types';
import { Loader2, Plus } from 'lucide-react';

const mealSchema = z.object({
  name: z.string().min(1, { message: "Meal name is required" }),
  nutritionInfo: z.string().optional(),
  price: z.string().min(1, { message: "Price is required" })
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a valid positive number",
    }),
});

type MealFormValues = z.infer<typeof mealSchema>;

interface AddMealFormProps {
  onAddMeal: (meal: Partial<Meal>) => Promise<void>;
}

const AddMealForm = ({ onAddMeal }: AddMealFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: '',
      nutritionInfo: '',
      price: '',
    },
  });

  const onSubmit = async (values: MealFormValues) => {
    try {
      setIsSubmitting(true);
      
      await onAddMeal({
        name: values.name,
        nutrient_info: values.nutritionInfo || null,
        price: parseFloat(values.price),
      });
      
      // Reset form after successful submission
      form.reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="px-4 py-6 bg-white rounded-lg shadow">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter meal name" {...field} className="border-gray-300" />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00" 
                    {...field} 
                    className="border-gray-300"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="nutritionInfo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nutritional Information</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter nutritional information" 
                    className="resize-none border-gray-300" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <Button 
            type="submit" 
            className="w-full bg-green-500 hover:bg-green-600" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : 'Add Meal'}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddMealForm;
