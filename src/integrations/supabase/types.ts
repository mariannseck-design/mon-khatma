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
      allowed_emails: {
        Row: {
          created_at: string | null
          email: string
          id: string
          label: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          label?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          label?: string | null
        }
        Relationships: []
      }
      challenge_baqara: {
        Row: {
          checked_days: string[]
          created_at: string
          id: string
          start_date: string
          target_days: number
          updated_at: string
          user_id: string
        }
        Insert: {
          checked_days?: string[]
          created_at?: string
          id?: string
          start_date?: string
          target_days: number
          updated_at?: string
          user_id: string
        }
        Update: {
          checked_days?: string[]
          created_at?: string
          id?: string
          start_date?: string
          target_days?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      challenge_kahf: {
        Row: {
          completed: boolean | null
          created_at: string | null
          id: string
          user_id: string
          week_key: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          user_id: string
          week_key: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string | null
          id?: string
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
      challenge_mulk: {
        Row: {
          created_at: string
          days: boolean[]
          id: string
          updated_at: string
          user_id: string
          week_key: string
        }
        Insert: {
          created_at?: string
          days?: boolean[]
          id?: string
          updated_at?: string
          user_id: string
          week_key: string
        }
        Update: {
          created_at?: string
          days?: boolean[]
          id?: string
          updated_at?: string
          user_id?: string
          week_key?: string
        }
        Relationships: []
      }
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
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      favorite_verses: {
        Row: {
          arabic_text: string | null
          created_at: string
          id: string
          surah_number: number
          translation_text: string | null
          user_id: string
          verse_key: string
          verse_number: number
        }
        Insert: {
          arabic_text?: string | null
          created_at?: string
          id?: string
          surah_number: number
          translation_text?: string | null
          user_id: string
          verse_key: string
          verse_number: number
        }
        Update: {
          arabic_text?: string | null
          created_at?: string
          id?: string
          surah_number?: number
          translation_text?: string | null
          user_id?: string
          verse_key?: string
          verse_number?: number
        }
        Relationships: []
      }
      hifz_goals: {
        Row: {
          active_days: number[]
          created_at: string
          goal_period: string
          goal_unit: string
          goal_value: number
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          active_days?: number[]
          created_at?: string
          goal_period: string
          goal_unit: string
          goal_value: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          active_days?: number[]
          created_at?: string
          goal_period?: string
          goal_unit?: string
          goal_value?: number
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      hifz_memorized_verses: {
        Row: {
          created_at: string
          id: string
          last_reviewed_at: string | null
          liaison_start_date: string | null
          liaison_status: string
          memorized_at: string
          next_review_date: string
          sm2_ease_factor: number
          sm2_interval: number
          sm2_repetitions: number
          surah_number: number
          user_id: string
          verse_end: number
          verse_start: number
        }
        Insert: {
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          liaison_start_date?: string | null
          liaison_status?: string
          memorized_at?: string
          next_review_date?: string
          sm2_ease_factor?: number
          sm2_interval?: number
          sm2_repetitions?: number
          surah_number: number
          user_id: string
          verse_end: number
          verse_start: number
        }
        Update: {
          created_at?: string
          id?: string
          last_reviewed_at?: string | null
          liaison_start_date?: string | null
          liaison_status?: string
          memorized_at?: string
          next_review_date?: string
          sm2_ease_factor?: number
          sm2_interval?: number
          sm2_repetitions?: number
          surah_number?: number
          user_id?: string
          verse_end?: number
          verse_start?: number
        }
        Relationships: []
      }
      hifz_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_step: number
          end_verse: number
          id: string
          repetition_level: number
          start_verse: number
          started_at: string
          step_status: Json | null
          surah_number: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          end_verse: number
          id?: string
          repetition_level?: number
          start_verse: number
          started_at?: string
          step_status?: Json | null
          surah_number: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_step?: number
          end_verse?: number
          id?: string
          repetition_level?: number
          start_verse?: number
          started_at?: string
          step_status?: Json | null
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      hifz_streaks: {
        Row: {
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          total_tours_completed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          total_tours_completed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          total_tours_completed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      khatma_completions: {
        Row: {
          completed_at: string
          display_name: string | null
          id: string
          user_id: string
        }
        Insert: {
          completed_at?: string
          display_name?: string | null
          id?: string
          user_id: string
        }
        Update: {
          completed_at?: string
          display_name?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
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
      mourad_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          current_phase: number
          id: string
          listen_count: number
          maintenance_day: number
          maintenance_start_date: string | null
          phase_status: Json
          reciter_id: string
          repetition_40_count: number
          started_at: string
          surah_number: number
          user_id: string
          verse_end: number
          verse_start: number
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          current_phase?: number
          id?: string
          listen_count?: number
          maintenance_day?: number
          maintenance_start_date?: string | null
          phase_status?: Json
          reciter_id?: string
          repetition_40_count?: number
          started_at?: string
          surah_number: number
          user_id: string
          verse_end: number
          verse_start: number
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          current_phase?: number
          id?: string
          listen_count?: number
          maintenance_day?: number
          maintenance_start_date?: string | null
          phase_status?: Json
          reciter_id?: string
          repetition_40_count?: number
          started_at?: string
          surah_number?: number
          user_id?: string
          verse_end?: number
          verse_start?: number
        }
        Relationships: []
      }
      muraja_sessions: {
        Row: {
          completed_at: string | null
          created_at: string
          difficulty_rating: string | null
          id: string
          session_type: string
          user_id: string
          verses_reviewed: Json | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          difficulty_rating?: string | null
          id?: string
          session_type?: string
          user_id: string
          verses_reviewed?: Json | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          difficulty_rating?: string | null
          id?: string
          session_type?: string
          user_id?: string
          verses_reviewed?: Json | null
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
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_admin_email_stats: { Args: { days_back?: number }; Returns: Json }
      get_defis_collective_stats: { Args: never; Returns: Json }
      get_hifz_collective_stats: { Args: never; Returns: Json }
      get_today_collective_stats: { Args: never; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_allowed_email: { Args: { _email: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
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
