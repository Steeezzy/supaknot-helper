
export type UserRole = 'admin' | 'user' | 'manager';

export interface Restaurant {
  id: string;
  name: string;
  location: string;
  image_url: string | null;
  rating: number;
  created_at: string;
}

export interface Meal {
  id: string;
  restaurant_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  name: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  user_id: string;
  restaurant_id: string;
  status: string;
  total_amount: number;
  delivery_address: string | null;
  contact_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  meal_id: string;
  quantity: number;
  price: number;
  created_at: string;
}
