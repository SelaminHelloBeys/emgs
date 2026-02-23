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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      announcements: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          title: string
          type: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          title: string
          type?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      badges: {
        Row: {
          category: string
          created_at: string | null
          description: string
          icon: string
          id: string
          name: string
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          category?: string
          created_at?: string | null
          description: string
          icon?: string
          id?: string
          name: string
          requirement_type: string
          requirement_value?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          icon?: string
          id?: string
          name?: string
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      homework_assignments: {
        Row: {
          attachments: string[] | null
          class_section: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string
          grade: string
          id: string
          subject: string
          title: string
          updated_at: string
        }
        Insert: {
          attachments?: string[] | null
          class_section?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date: string
          grade: string
          id?: string
          subject: string
          title: string
          updated_at?: string
        }
        Update: {
          attachments?: string[] | null
          class_section?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string
          grade?: string
          id?: string
          subject?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      homework_submissions: {
        Row: {
          feedback: string | null
          grade: number | null
          homework_id: string
          id: string
          status: string
          submission_url: string | null
          submitted_at: string
          user_id: string
        }
        Insert: {
          feedback?: string | null
          grade?: number | null
          homework_id: string
          id?: string
          status?: string
          submission_url?: string | null
          submitted_at?: string
          user_id: string
        }
        Update: {
          feedback?: string | null
          grade?: number | null
          homework_id?: string
          id?: string
          status?: string
          submission_url?: string | null
          submitted_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "homework_submissions_homework_id_fkey"
            columns: ["homework_id"]
            isOneToOne: false
            referencedRelation: "homework_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          content_type: string
          created_at: string
          created_by: string
          description: string | null
          duration: string | null
          file_url: string | null
          id: string
          subject: string
          thumbnail_url: string | null
          title: string
          topic: string | null
        }
        Insert: {
          content_type?: string
          created_at?: string
          created_by: string
          description?: string | null
          duration?: string | null
          file_url?: string | null
          id?: string
          subject: string
          thumbnail_url?: string | null
          title: string
          topic?: string | null
        }
        Update: {
          content_type?: string
          created_at?: string
          created_by?: string
          description?: string | null
          duration?: string | null
          file_url?: string | null
          id?: string
          subject?: string
          thumbnail_url?: string | null
          title?: string
          topic?: string | null
        }
        Relationships: []
      }
      page_maintenance: {
        Row: {
          id: string
          is_active: boolean
          message: string | null
          page_name: string
          page_route: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          is_active?: boolean
          message?: string | null
          page_name: string
          page_route: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          is_active?: boolean
          message?: string | null
          page_name?: string
          page_route?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          description: string | null
          id: string
          setting_key: string
          setting_value: boolean
          text_value: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          description?: string | null
          id?: string
          setting_key: string
          setting_value?: boolean
          text_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          description?: string | null
          id?: string
          setting_key?: string
          setting_value?: boolean
          text_value?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          class: string | null
          created_at: string
          grade: string | null
          id: string
          name: string
          school_id: string | null
          school_name: string | null
          subjects: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          class?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          name: string
          school_id?: string | null
          school_name?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          class?: string | null
          created_at?: string
          grade?: string | null
          id?: string
          name?: string
          school_id?: string | null
          school_name?: string | null
          subjects?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      student_exam_participation: {
        Row: {
          blank_count: number | null
          class_rank: number | null
          correct_count: number | null
          created_at: string
          exam_id: string
          general_rank: number | null
          id: string
          net_score: number | null
          participated: boolean
          updated_at: string
          user_id: string
          wrong_count: number | null
        }
        Insert: {
          blank_count?: number | null
          class_rank?: number | null
          correct_count?: number | null
          created_at?: string
          exam_id: string
          general_rank?: number | null
          id?: string
          net_score?: number | null
          participated?: boolean
          updated_at?: string
          user_id: string
          wrong_count?: number | null
        }
        Update: {
          blank_count?: number | null
          class_rank?: number | null
          correct_count?: number | null
          created_at?: string
          exam_id?: string
          general_rank?: number | null
          id?: string
          net_score?: number | null
          participated?: boolean
          updated_at?: string
          user_id?: string
          wrong_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "student_exam_participation_exam_id_fkey"
            columns: ["exam_id"]
            isOneToOne: false
            referencedRelation: "trial_exams"
            referencedColumns: ["id"]
          },
        ]
      }
      trial_exams: {
        Row: {
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          exam_date: string
          grade: string
          id: string
          pdf_url: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          exam_date: string
          grade: string
          id?: string
          pdf_url: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          exam_date?: string
          grade?: string
          id?: string
          pdf_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string | null
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
      user_stats: {
        Row: {
          created_at: string
          exams_completed: number
          homework_submitted: number
          id: string
          lessons_watched: number
          total_watch_time: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exams_completed?: number
          homework_submitted?: number
          id?: string
          lessons_watched?: number
          total_watch_time?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          exams_completed?: number
          homework_submitted?: number
          id?: string
          lessons_watched?: number
          total_watch_time?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_watch_progress: {
        Row: {
          completed: boolean
          id: string
          last_watched_at: string
          lesson_id: string
          progress: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          id?: string
          last_watched_at?: string
          lesson_id: string
          progress?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          id?: string
          last_watched_at?: string
          lesson_id?: string
          progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_watch_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_create_announcements: { Args: { _user_id: string }; Returns: boolean }
      can_create_content: { Args: { _user_id: string }; Returns: boolean }
      get_exam_answers_after_completion: {
        Args: { p_exam_id: string }
        Returns: {
          correct_option: string
          question_id: string
        }[]
      }
      get_exam_questions_for_student: {
        Args: { p_exam_id: string }
        Returns: {
          exam_id: string
          id: string
          option_a: string
          option_b: string
          option_c: string
          option_d: string
          question_order: number
          question_text: string
        }[]
      }
      has_completed_exam: { Args: { p_exam_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_exam_creator: { Args: { p_exam_id: string }; Returns: boolean }
    }
    Enums: {
      app_role:
        | "yonetici"
        | "admin"
        | "mudur"
        | "mudur_yardimcisi"
        | "rehber"
        | "ogretmen"
        | "ogrenci"
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
      app_role: [
        "yonetici",
        "admin",
        "mudur",
        "mudur_yardimcisi",
        "rehber",
        "ogretmen",
        "ogrenci",
      ],
    },
  },
} as const
