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
      circle_members: {
        Row: {
          accepted_charter: boolean | null
          circle_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          accepted_charter?: boolean | null
          circle_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          accepted_charter?: boolean | null
          circle_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "sisters_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_message_likes: {
        Row: {
          created_at: string
          id: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_message_likes_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "circle_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      circle_messages: {
        Row: {
          circle_id: string
          content: string
          created_at: string
          id: string
          is_voice: boolean | null
          section: string
          user_id: string
          voice_url: string | null
        }
        Insert: {
          circle_id: string
          content: string
          created_at?: string
          id?: string
          is_voice?: boolean | null
          section: string
          user_id: string
          voice_url?: string | null
        }
        Update: {
          circle_id?: string
          content?: string
          created_at?: string
          id?: string
          is_voice?: boolean | null
          section?: string
          user_id?: string
          voice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "circle_messages_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "sisters_circles"
            referencedColumns: ["id"]
          },
        ]
      }
      mood_entries: {
        Row: {
          created_at: string
          entry_date: string
          gratitude: string | null
          id: string
          mood_label: string
          mood_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          entry_date?: string
          gratitude?: string | null
          id?: string
          mood_label: string
          mood_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          entry_date?: string
          gratitude?: string | null
          id?: string
          mood_label?: string
          mood_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          created_at: string
          daily_reminder_enabled: boolean
          id: string
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_reminder_enabled?: boolean
          id?: string
          reminder_time?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_reminder_enabled?: boolean
          id?: string
          reminder_time?: string
          updated_at?: string
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
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          onboarding_completed?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_goals: {
        Row: {
          created_at: string
          end_date: string | null
          goal_type: string
          id: string
          is_active: boolean | null
          start_date: string
          target_value: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          goal_type: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_value: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          goal_type?: string
          id?: string
          is_active?: boolean | null
          start_date?: string
          target_value?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_progress: {
        Row: {
          ayah_number: number | null
          created_at: string
          date: string
          goal_id: string | null
          id: string
          juz_completed: number | null
          notes: string | null
          pages_read: number
          surah_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ayah_number?: number | null
          created_at?: string
          date?: string
          goal_id?: string | null
          id?: string
          juz_completed?: number | null
          notes?: string | null
          pages_read?: number
          surah_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ayah_number?: number | null
          created_at?: string
          date?: string
          goal_id?: string | null
          id?: string
          juz_completed?: number | null
          notes?: string | null
          pages_read?: number
          surah_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quran_progress_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "quran_goals"
            referencedColumns: ["id"]
          },
        ]
      }
      ramadan_daily_tasks: {
        Row: {
          created_at: string
          custom_good_deeds: string[] | null
          fasting: boolean
          id: string
          prayer_asr: boolean
          prayer_dhuhr: boolean
          prayer_fajr: boolean
          prayer_isha: boolean
          prayer_maghrib: boolean
          prayer_tahajjud: boolean
          prayer_tarawih: boolean
          reading_dhikr: boolean
          reading_hadith: boolean
          reading_quran: boolean
          sadaqa: boolean
          sunnah_duha: boolean
          sunnah_rawatib: boolean
          sunnah_witr: boolean
          task_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_good_deeds?: string[] | null
          fasting?: boolean
          id?: string
          prayer_asr?: boolean
          prayer_dhuhr?: boolean
          prayer_fajr?: boolean
          prayer_isha?: boolean
          prayer_maghrib?: boolean
          prayer_tahajjud?: boolean
          prayer_tarawih?: boolean
          reading_dhikr?: boolean
          reading_hadith?: boolean
          reading_quran?: boolean
          sadaqa?: boolean
          sunnah_duha?: boolean
          sunnah_rawatib?: boolean
          sunnah_witr?: boolean
          task_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          custom_good_deeds?: string[] | null
          fasting?: boolean
          id?: string
          prayer_asr?: boolean
          prayer_dhuhr?: boolean
          prayer_fajr?: boolean
          prayer_isha?: boolean
          prayer_maghrib?: boolean
          prayer_tahajjud?: boolean
          prayer_tarawih?: boolean
          reading_dhikr?: boolean
          reading_hadith?: boolean
          reading_quran?: boolean
          sadaqa?: boolean
          sunnah_duha?: boolean
          sunnah_rawatib?: boolean
          sunnah_witr?: boolean
          task_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ramadan_dhikr_entries: {
        Row: {
          count: number
          created_at: string
          dhikr_name: string
          entry_date: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          dhikr_name: string
          entry_date?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          dhikr_name?: string
          entry_date?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ramadan_reading_goals: {
        Row: {
          created_at: string
          daily_pages: number
          first_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_pages?: number
          first_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_pages?: number
          first_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ramadan_reviews: {
        Row: {
          created_at: string
          gratitude: string | null
          id: string
          intention: string | null
          review_date: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          gratitude?: string | null
          id?: string
          intention?: string | null
          review_date?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          gratitude?: string | null
          id?: string
          intention?: string | null
          review_date?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ramadan_weekly_reports: {
        Row: {
          created_at: string
          goal_met: boolean | null
          id: string
          user_id: string
          week_start: string
        }
        Insert: {
          created_at?: string
          goal_met?: boolean | null
          id?: string
          user_id: string
          week_start: string
        }
        Update: {
          created_at?: string
          goal_met?: boolean | null
          id?: string
          user_id?: string
          week_start?: string
        }
        Relationships: []
      }
      reading_reminders: {
        Row: {
          created_at: string
          days_of_week: number[]
          id: string
          is_enabled: boolean
          message: string
          reminder_time: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_enabled?: boolean
          message?: string
          reminder_time: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days_of_week?: number[]
          id?: string
          is_enabled?: boolean
          message?: string
          reminder_time?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sisters_circles: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
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
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
