
import React from 'react';
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
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Restaurant } from '@/types/database.types';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const restaurantSchema = z.object({
  name: z.string().min(1, { message: "Restaurant name is required" }),
  location: z.string().min(1, { message: "Location is required" }),
});

type RestaurantFormValues = z.infer<typeof restaurantSchema>;

interface RestaurantSettingsProps {
  restaurant: Restaurant;
  onUpdate: (updatedRestaurant: Restaurant) => void;
}

const RestaurantSettings = ({ restaurant, onUpdate }: RestaurantSettingsProps) => {
  const { toast } = useToast();
  
  const form = useForm<RestaurantFormValues>({
    resolver: zodResolver(restaurantSchema),
    defaultValues: {
      name: restaurant.name,
      location: restaurant.location,
    },
  });

  const onSubmit = async (values: RestaurantFormValues) => {
    try {
      const { data, error } = await supabase
        .from('restaurants')
        .update({
          name: values.name,
          location: values.location,
          updated_at: new Date().toISOString(),
        })
        .eq('id', restaurant.id)
        .select()
        .single();
        
      if (error) {
        throw error;
      }
      
      onUpdate(data as Restaurant);
    } catch (error: any) {
      console.error('Error updating restaurant:', error);
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
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
              <FormLabel>Restaurant Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? 'Updating...' : 'Update Restaurant Info'}
        </Button>
      </form>
    </Form>
  );
};

export default RestaurantSettings;
