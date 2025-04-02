export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin: {
        Row: {
          admin_id: string
          created_at: string | null
          email: string
          id: string
          name: string
        }
        Insert: {
          admin_id: string
          created_at?: string | null
          email: string
          id: string
          name: string
        }
        Update: {
          admin_id?: string
          created_at?: string | null
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      admin_login: {
        Row: {
          city: string
          created_at: string | null
          district: string
          email: string
          id: string
          location: string | null
          password: string
          restaurant_name: string
          state: string
        }
        Insert: {
          city: string
          created_at?: string | null
          district: string
          email: string
          id?: string
          location?: string | null
          password: string
          restaurant_name: string
          state: string
        }
        Update: {
          city?: string
          created_at?: string | null
          district?: string
          email?: string
          id?: string
          location?: string | null
          password?: string
          restaurant_name?: string
          state?: string
        }
        Relationships: []
      }
      chatbot: {
        Row: {
          created_at: string
          id: string
          meal_planning: string | null
          meal_suggestion: string | null
          nutritional_values: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          meal_planning?: string | null
          meal_suggestion?: string | null
          nutritional_values?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          meal_planning?: string | null
          meal_suggestion?: string | null
          nutritional_values?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      diet_preferences: {
        Row: {
          created_at: string
          id: string
          preferences: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          preferences: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          preferences?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "diet_preferences_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      meals: {
        Row: {
          created_at: string
          id: string
          meal_id: string
          name: string
          nutrient_info: string | null
          price: number
          restaurant_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          meal_id: string
          name: string
          nutrient_info?: string | null
          price: number
          restaurant_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          meal_id?: string
          name?: string
          nutrient_info?: string | null
          price?: number
          restaurant_id?: string | null
        }
        Relationships: []
      }
      restaurants: {
        Row: {
          admin_id: string | null
          created_at: string | null
          id: string
          location: string
          name: string
          rating: number | null
          rest_id: string
          user_id: string | null
        }
        Insert: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          location: string
          name: string
          rating?: number | null
          rest_id: string
          user_id?: string | null
        }
        Update: {
          admin_id?: string | null
          created_at?: string | null
          id?: string
          location?: string
          name?: string
          rating?: number | null
          rest_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          meal_id: string | null
          rating: number | null
          review_id: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          meal_id?: string | null
          rating?: number | null
          review_id: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          meal_id?: string | null
          rating?: number | null
          review_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_meal_id_fkey"
            columns: ["meal_id"]
            isOneToOne: false
            referencedRelation: "meals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          id: string
          name: string
          role: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          role: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          role?: string
          user_id?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          password: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          password?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          password?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      policies: {
        Row: {
          definition: string | null
          operation: string | null
          policy_name: unknown | null
          roles: unknown[] | null
          table_name: unknown | null
          table_schema: unknown | null
          with_check: string | null
        }
        Relationships: []
      }
      user_dashboard_view: {
        Row: {
          category: string | null
          item_id: string | null
          item_location: string | null
          item_name: string | null
          item_price: number | null
          item_rating: number | null
          item_user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_filtered_meals: {
        Args: {
          max_price: number
          cuisine_type: string
          location: string
        }
        Returns: {
          id: string
          meal_id: string
          name: string
          price: number
          nutrient_info: string
          restaurant_id: string
          restaurant_name: string
          restaurant_location: string
          created_at: string
        }[]
      }
      get_restaurant_meals: {
        Args: {
          rest_id: string
        }
        Returns: {
          created_at: string
          id: string
          meal_id: string
          name: string
          nutrient_info: string | null
          price: number
          restaurant_id: string | null
        }[]
      }
      is_admin: {
        Args: {
          email: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
