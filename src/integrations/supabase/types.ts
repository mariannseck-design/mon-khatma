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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      adhkar_tracker: {
        Row: {
          adhkar_type: string
          completed: boolean | null
          completed_at: string | null
          created_at: string
          date: string
          id: string
          user_id: string
        }
        Insert: {
          adhkar_type: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          user_id: string
        }
        Update: {
          adhkar_type?: string
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string
          id: string
          name: string
          points_required: number | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon: string
          id?: string
          name: string
          points_required?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          points_required?: number | null
        }
        Relationships: []
      }
      hifz_progress: {
        Row: {
          ayah_end: number
          ayah_start: number
          created_at: string
          ease_factor: number | null
          id: string
          interval_days: number | null
          last_reviewed: string | null
          next_review: string | null
          review_count: number | null
          status: string
          surah_number: number
          updated_at: string
          user_id: string
        }
        Insert: {
          ayah_end: number
          ayah_start: number
          created_at?: string
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          last_reviewed?: string | null
          next_review?: string | null
          review_count?: number | null
          status?: string
          surah_number: number
          updated_at?: string
          user_id: string
        }
        Update: {
          ayah_end?: number
          ayah_start?: number
          created_at?: string
          ease_factor?: number | null
          id?: string
          interval_days?: number | null
          last_reviewed?: string | null
          next_review?: string | null
          review_count?: number | null
          status?: string
          surah_number?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      prayer_tracker: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          date: string
          id: string
          prayer_type: Database["public"]["Enums"]["prayer_type"]
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          prayer_type: Database["public"]["Enums"]["prayer_type"]
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          date?: string
          id?: string
          prayer_type?: Database["public"]["Enums"]["prayer_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          onboarding_completed: boolean | null
          ramadan_mode: boolean | null
          streak_days: number | null
          theme_color: Database["public"]["Enums"]["theme_color"] | null
          total_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          ramadan_mode?: boolean | null
          streak_days?: number | null
          theme_color?: Database["public"]["Enums"]["theme_color"] | null
          total_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          ramadan_mode?: boolean | null
          streak_days?: number | null
          theme_color?: Database["public"]["Enums"]["theme_color"] | null
          total_points?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ramadan_journal: {
        Row: {
          created_at: string
          date: string
          evening_reflection: string | null
          gratitude_notes: string | null
          id: string
          mood_rating: number | null
          morning_objectives: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date?: string
          evening_reflection?: string | null
          gratitude_notes?: string | null
          id?: string
          mood_rating?: number | null
          morning_objectives?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          evening_reflection?: string | null
          gratitude_notes?: string | null
          id?: string
          mood_rating?: number | null
          morning_objectives?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      prayer_type:
        | "fajr_sunnah"
        | "dhuhr_before"
        | "dhuhr_after"
        | "asr_sunnah"
        | "maghrib_after"
        | "isha_before"
        | "isha_after"
        | "witr"
        | "duha"
        | "tahajjud"
        | "ishraq"
        | "awwabin"
      theme_color: "emerald" | "ocean" | "sunset" | "midnight"
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
      prayer_type: [
        "fajr_sunnah",
        "dhuhr_before",
        "dhuhr_after",
        "asr_sunnah",
        "maghrib_after",
        "isha_before",
        "isha_after",
        "witr",
        "duha",
        "tahajjud",
        "ishraq",
        "awwabin",
      ],
      theme_color: ["emerald", "ocean", "sunset", "midnight"],
    },
  },
} as const
