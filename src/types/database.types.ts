
export type UserRole = 'admin' | 'user' | 'manager';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  user_id: string;
  created_at: string;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  password: string;
  admin_id: string;
  created_at: string;
}

export interface Restaurant {
  id: string;
  rest_id: string;
  name: string;
  location: string;
  rating: number;
  admin_id: string | null;
  created_at: string;
}

export interface Meal {
  id: string;
  meal_id: string;
  name: string;
  price: number;
  nutrient_info: string | null;
  restaurant_id: string;
  created_at: string;
}

export interface Review {
  id: string;
  review_id: string;
  comment: string | null;
  rating: number;
  user_id: string;
  meal_id: string;
  created_at: string;
}

export interface DietPreference {
  id: string;
  user_id: string;
  preferences: string;
  created_at: string;
}

export interface Chatbot {
  id: string;
  user_id: string;
  meal_suggestion: string | null;
  nutritional_values: string | null;
  meal_planning: string | null;
  created_at: string;
}
