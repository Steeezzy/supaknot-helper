
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface OrderStatusProps {
  className?: string;
}

const OrderStatus = ({ className }: OrderStatusProps) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ['user-dashboard-view'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('user_dashboard_view')
          .select('*')
          .limit(10);

        if (error) {
          throw error;
        }

        return data;
      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error loading dashboard data",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }
    },
    enabled: !!user,
  });

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-gray-100 animate-pulse rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const popularRestaurants = dashboardData?.filter(item => item.category === 'popular_restaurants') || [];
  const popularMeals = dashboardData?.filter(item => item.category === 'popular_meals') || [];
  const recentReviews = dashboardData?.filter(item => item.category === 'recent_reviews') || [];

  if (!popularRestaurants.length && !popularMeals.length && !recentReviews.length) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Latest Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500 py-4">No recent activity found.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Latest Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {popularRestaurants.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Popular Restaurants</h3>
              <ul className="space-y-2">
                {popularRestaurants.slice(0, 3).map(item => (
                  <li key={item.item_id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-gray-500">{item.item_location}</p>
                    </div>
                    <Badge variant="secondary">{item.item_rating?.toFixed(1)} ★</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {popularMeals.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Popular Meals</h3>
              <ul className="space-y-2">
                {popularMeals.slice(0, 3).map(item => (
                  <li key={item.item_id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{item.item_name}</p>
                      <p className="text-sm text-gray-500">{item.item_location}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary">{item.item_rating?.toFixed(1)} ★</Badge>
                      <p className="text-sm font-medium text-green-600">${(item.item_price / 100).toFixed(2)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {recentReviews.length > 0 && (
            <div>
              <h3 className="font-medium mb-2">Recent Reviews</h3>
              <ul className="space-y-2">
                {recentReviews.slice(0, 3).map(item => (
                  <li key={item.item_id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                    <p className="font-medium">{item.item_name}</p>
                    <Badge variant="secondary">{item.item_rating?.toFixed(1)} ★</Badge>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatus;
