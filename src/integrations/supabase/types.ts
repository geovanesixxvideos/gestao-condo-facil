export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      bookings: {
        Row: {
          apartment: string | null
          area: string
          condominium_id: string
          created_at: string
          created_by: string
          date: string
          email: string | null
          end_time: string
          id: string
          notes: string | null
          phone: string | null
          resident_name: string
          start_time: string
          status: string
          updated_at: string
        }
        Insert: {
          apartment?: string | null
          area: string
          condominium_id: string
          created_at?: string
          created_by: string
          date: string
          email?: string | null
          end_time: string
          id?: string
          notes?: string | null
          phone?: string | null
          resident_name: string
          start_time: string
          status?: string
          updated_at?: string
        }
        Update: {
          apartment?: string | null
          area?: string
          condominium_id?: string
          created_at?: string
          created_by?: string
          date?: string
          email?: string | null
          end_time?: string
          id?: string
          notes?: string | null
          phone?: string | null
          resident_name?: string
          start_time?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      condominiums: {
        Row: {
          address: string
          created_at: string
          created_by: string
          description: string | null
          email: string | null
          id: string
          manager_name: string | null
          name: string
          phone: string | null
          status: string
          type: string
          units: number
          updated_at: string
        }
        Insert: {
          address: string
          created_at?: string
          created_by: string
          description?: string | null
          email?: string | null
          id?: string
          manager_name?: string | null
          name: string
          phone?: string | null
          status?: string
          type?: string
          units?: number
          updated_at?: string
        }
        Update: {
          address?: string
          created_at?: string
          created_by?: string
          description?: string | null
          email?: string | null
          id?: string
          manager_name?: string | null
          name?: string
          phone?: string | null
          status?: string
          type?: string
          units?: number
          updated_at?: string
        }
        Relationships: []
      }
      incidents: {
        Row: {
          apartment: string | null
          category: string
          condominium_id: string
          created_at: string
          created_by: string
          description: string | null
          id: string
          priority: string
          resident_name: string | null
          resolved_at: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          apartment?: string | null
          category?: string
          condominium_id: string
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          priority?: string
          resident_name?: string | null
          resolved_at?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          apartment?: string | null
          category?: string
          condominium_id?: string
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          priority?: string
          resident_name?: string | null
          resolved_at?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "incidents_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      notices: {
        Row: {
          author: string | null
          category: string
          condominium_id: string
          content: string
          created_at: string
          created_by: string
          id: string
          pinned: boolean
          priority: string
          title: string
          updated_at: string
          views: number
        }
        Insert: {
          author?: string | null
          category?: string
          condominium_id: string
          content: string
          created_at?: string
          created_by: string
          id?: string
          pinned?: boolean
          priority?: string
          title: string
          updated_at?: string
          views?: number
        }
        Update: {
          author?: string | null
          category?: string
          condominium_id?: string
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          pinned?: boolean
          priority?: string
          title?: string
          updated_at?: string
          views?: number
        }
        Relationships: [
          {
            foreignKeyName: "notices_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      residents: {
        Row: {
          apartment: string
          condominium_id: string
          created_at: string
          email: string
          id: string
          join_date: string
          name: string
          phone: string | null
          status: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apartment: string
          condominium_id: string
          created_at?: string
          email: string
          id?: string
          join_date?: string
          name: string
          phone?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apartment?: string
          condominium_id?: string
          created_at?: string
          email?: string
          id?: string
          join_date?: string
          name?: string
          phone?: string | null
          status?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "residents_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          apartment: string | null
          category: string | null
          condominium_id: string
          created_at: string
          created_by: string
          date: string
          description: string
          due_date: string | null
          id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          apartment?: string | null
          category?: string | null
          condominium_id: string
          created_at?: string
          created_by: string
          date?: string
          description: string
          due_date?: string | null
          id?: string
          status?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          apartment?: string | null
          category?: string | null
          condominium_id?: string
          created_at?: string
          created_by?: string
          date?: string
          description?: string
          due_date?: string | null
          id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_condominium_id_fkey"
            columns: ["condominium_id"]
            isOneToOne: false
            referencedRelation: "condominiums"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      user_condominium_ids: { Args: { _user_id: string }; Returns: string[] }
    }
    Enums: {
      app_role: "sindico" | "morador"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["sindico", "morador"],
    },
  },
} as const
