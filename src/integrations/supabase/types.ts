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
      admin_login: {
        Row: {
          city: string | null
          created_at: string
          district: string | null
          email: string
          location_id: string | null
          password: string | null
          resto_name: string | null
          state: string | null
          user_id: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          district?: string | null
          email: string
          location_id?: string | null
          password?: string | null
          resto_name?: string | null
          state?: string | null
          user_id?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          district?: string | null
          email?: string
          location_id?: string | null
          password?: string | null
          resto_name?: string | null
          state?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      chatbot_interactions: {
        Row: {
          created_at: string
          id: string
          query: string
          response: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          response: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          response?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chatbot_interactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_login"
            referencedColumns: ["id"]
          },
        ]
      }
      location: {
        Row: {
          city: string | null
          created_at: string | null
          district: string
          id: number
          name: string | null
          state: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          district: string
          id?: never
          name?: string | null
          state: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          district?: string
          id?: never
          name?: string | null
          state?: string
        }
        Relationships: []
      }
      meals: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          name: string
          price: number
          restaurant_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name: string
          price: number
          restaurant_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          name?: string
          price?: number
          restaurant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meals_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          city: string | null
          created_at: string
          id: string
          image_url: string | null
          location: string
          name: string
          rating: number
        }
        Insert: {
          city?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          location: string
          name: string
          rating: number
        }
        Update: {
          city?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          location?: string
          name?: string
          rating?: number
        }
        Relationships: []
      }
      user_login: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string | null
          password: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name?: string | null
          password: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          password?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_preference: {
        Row: {
          allergies: string[] | null
          created_at: string
          cuisine_preference: string | null
          dietary_preference: string | null
          id: string
          preferred_location: string | null
          price_range: unknown | null
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          created_at?: string
          cuisine_preference?: string | null
          dietary_preference?: string | null
          id?: string
          preferred_location?: string | null
          price_range?: unknown | null
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          created_at?: string
          cuisine_preference?: string | null
          dietary_preference?: string | null
          id?: string
          preferred_location?: string | null
          price_range?: unknown | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_preference_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_login"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string
          id: string
          name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
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
