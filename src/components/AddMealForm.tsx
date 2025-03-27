
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
  ingredients: z.string().optional(),
  extras: z.string().optional(),
  price: z.string().min(1, { message: "Price is required" })
    .refine(val => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Price must be a valid positive number",
    }),
  image_url: z.string().url({ message: "Please enter a valid URL" }).optional().or(z.literal('')),
});

type MealFormValues = z.infer<typeof mealSchema>;

interface AddMealFormProps {
  onAddMeal: (meal: Partial<Meal>) => Promise<void>;
}

const AddMealForm = ({ onAddMeal }: AddMealFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const form = useForm<MealFormValues>({
    resolver: zodResolver(mealSchema),
    defaultValues: {
      name: '',
      ingredients: '',
      extras: '',
      price: '',
      image_url: '',
    },
  });

  const handleImageUpload = () => {
    // For now, we'll just use a placeholder image URL
    // In a real implementation, you would handle file upload to Supabase storage
    const placeholderUrl = 'https://via.placeholder.com/150';
    form.setValue('image_url', placeholderUrl);
    setImagePreview(placeholderUrl);
  };

  const onSubmit = async (values: MealFormValues) => {
    try {
      setIsSubmitting(true);
      
      // Convert the ingredients and extras fields to a description
      const description = [
        values.ingredients ? `Ingredients: ${values.ingredients}` : '',
        values.extras ? `Extras: ${values.extras}` : ''
      ].filter(Boolean).join('\n\n');
      
      await onAddMeal({
        name: values.name,
        description: description || null,
        price: parseFloat(values.price),
        image_url: values.image_url || null,
        is_available: true,
      });
      
      // Reset form after successful submission
      form.reset();
      setImagePreview(null);
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
          <div className="flex justify-center mb-6">
            <div 
              className="w-32 h-32 bg-gray-100 flex flex-col items-center justify-center rounded cursor-pointer"
              onClick={handleImageUpload}
            >
              {imagePreview ? (
                <img src={imagePreview} alt="Meal preview" className="w-full h-full object-cover rounded" />
              ) : (
                <>
                  <Plus className="h-6 w-6 text-blue-500 mb-1" />
                  <span className="text-sm text-blue-500">Upload Photos</span>
                </>
              )}
            </div>
          </div>
          
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
            name="ingredients"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ingredients</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter meal ingredients" 
                    className="resize-none border-gray-300" 
                    {...field} 
                    value={field.value || ''}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="extras"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Extra</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Enter additional information" 
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
