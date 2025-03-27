
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
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Meal } from '@/types/database.types';
import { Loader2 } from 'lucide-react';

const mealSchema = z.object({
  name: z.string().min(1, { message: "Meal name is required" }),
  description: z.string().optional(),
  price: z.string().min(1, { message: "Price is required" })
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a valid positive number",
    }),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
  is_available: z.boolean().default(true),
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
      description: '',
      price: '',
      image_url: '',
      is_available: true,
    },
  });

  const onSubmit = async (values: MealFormValues) => {
    try {
      setIsSubmitting(true);
      await onAddMeal({
        name: values.name,
        description: values.description || null,
        price: parseFloat(values.price),
        image_url: values.image_url || null,
        is_available: values.is_available,
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter meal name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter meal description" 
                  className="resize-none" 
                  {...field} 
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Describe the meal, ingredients, and any special features
              </FormDescription>
              <FormMessage />
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
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="image_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input placeholder="Enter image URL" {...field} value={field.value || ''} />
              </FormControl>
              <FormDescription>
                URL to an image of the meal (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="is_available"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Available</FormLabel>
                <FormDescription>
                  Toggle whether this meal is currently available
                </FormDescription>
                <FormMessage />
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
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
  );
};

export default AddMealForm;
