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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          allow_waitlist: boolean
          banner_url: string | null
          capacity: number | null
          category: Database["public"]["Enums"]["activity_category"]
          community_id: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          eligibility: string | null
          ends_at: string | null
          id: string
          instructor_bio: string | null
          instructor_name: string | null
          instructor_photo_url: string | null
          is_free: boolean
          kind: Database["public"]["Enums"]["activity_kind"]
          learning_outcomes: string | null
          level: string | null
          mode: Database["public"]["Enums"]["activity_mode"]
          online_url: string | null
          organizer_id: string | null
          organizer_name: string | null
          price: number | null
          published: boolean
          registration_deadline: string | null
          registration_type: Database["public"]["Enums"]["registration_type"]
          requirements: string | null
          rules: string | null
          seats_taken: number
          starts_at: string
          summary: string | null
          team_max_size: number | null
          team_min_size: number | null
          title: string
          updated_at: string
          venue: string | null
        }
        Insert: {
          allow_waitlist?: boolean
          banner_url?: string | null
          capacity?: number | null
          category?: Database["public"]["Enums"]["activity_category"]
          community_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          eligibility?: string | null
          ends_at?: string | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string | null
          instructor_photo_url?: string | null
          is_free?: boolean
          kind?: Database["public"]["Enums"]["activity_kind"]
          learning_outcomes?: string | null
          level?: string | null
          mode?: Database["public"]["Enums"]["activity_mode"]
          online_url?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          price?: number | null
          published?: boolean
          registration_deadline?: string | null
          registration_type?: Database["public"]["Enums"]["registration_type"]
          requirements?: string | null
          rules?: string | null
          seats_taken?: number
          starts_at: string
          summary?: string | null
          team_max_size?: number | null
          team_min_size?: number | null
          title: string
          updated_at?: string
          venue?: string | null
        }
        Update: {
          allow_waitlist?: boolean
          banner_url?: string | null
          capacity?: number | null
          category?: Database["public"]["Enums"]["activity_category"]
          community_id?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          eligibility?: string | null
          ends_at?: string | null
          id?: string
          instructor_bio?: string | null
          instructor_name?: string | null
          instructor_photo_url?: string | null
          is_free?: boolean
          kind?: Database["public"]["Enums"]["activity_kind"]
          learning_outcomes?: string | null
          level?: string | null
          mode?: Database["public"]["Enums"]["activity_mode"]
          online_url?: string | null
          organizer_id?: string | null
          organizer_name?: string | null
          price?: number | null
          published?: boolean
          registration_deadline?: string | null
          registration_type?: Database["public"]["Enums"]["registration_type"]
          requirements?: string | null
          rules?: string | null
          seats_taken?: number
          starts_at?: string
          summary?: string | null
          team_max_size?: number | null
          team_min_size?: number | null
          title?: string
          updated_at?: string
          venue?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_faqs: {
        Row: {
          activity_id: string
          answer: string
          id: string
          position: number
          question: string
        }
        Insert: {
          activity_id: string
          answer: string
          id?: string
          position?: number
          question: string
        }
        Update: {
          activity_id?: string
          answer?: string
          id?: string
          position?: number
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_faqs_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_schedule: {
        Row: {
          activity_id: string
          description: string | null
          ends_at: string | null
          id: string
          position: number
          starts_at: string | null
          title: string
        }
        Insert: {
          activity_id: string
          description?: string | null
          ends_at?: string | null
          id?: string
          position?: number
          starts_at?: string | null
          title: string
        }
        Update: {
          activity_id?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          position?: number
          starts_at?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_schedule_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_speakers: {
        Row: {
          activity_id: string
          bio: string | null
          id: string
          name: string
          photo_url: string | null
          position: number
          title: string | null
        }
        Insert: {
          activity_id: string
          bio?: string | null
          id?: string
          name: string
          photo_url?: string | null
          position?: number
          title?: string | null
        }
        Update: {
          activity_id?: string
          bio?: string | null
          id?: string
          name?: string
          photo_url?: string | null
          position?: number
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_speakers_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          activity_id: string | null
          body: string
          community_id: string | null
          created_at: string
          created_by: string | null
          id: string
          title: string
        }
        Insert: {
          activity_id?: string | null
          body: string
          community_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title: string
        }
        Update: {
          activity_id?: string | null
          body?: string
          community_id?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcements_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          about: string | null
          category: Database["public"]["Enums"]["activity_category"]
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          logo_url: string | null
          name: string
          published: boolean
          rules: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          about?: string | null
          category?: Database["public"]["Enums"]["activity_category"]
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          published?: boolean
          rules?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          about?: string | null
          category?: Database["public"]["Enums"]["activity_category"]
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          published?: boolean
          rules?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          member_role: string
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          member_role?: string
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          member_role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string
          department: string | null
          email: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          phone: string | null
          roll_number: string | null
          section: string | null
          updated_at: string
          year: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          roll_number?: string | null
          section?: string | null
          updated_at?: string
          year?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          roll_number?: string | null
          section?: string | null
          updated_at?: string
          year?: string | null
        }
        Relationships: []
      }
      registration_members: {
        Row: {
          email: string | null
          id: string
          is_leader: boolean
          name: string
          registration_id: string
          roll_number: string | null
        }
        Insert: {
          email?: string | null
          id?: string
          is_leader?: boolean
          name: string
          registration_id: string
          roll_number?: string | null
        }
        Update: {
          email?: string | null
          id?: string
          is_leader?: boolean
          name?: string
          registration_id?: string
          roll_number?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registration_members_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: false
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          activity_id: string
          code: string
          created_at: string
          department: string | null
          email: string | null
          employee_id: string | null
          full_name: string | null
          id: string
          notes: string | null
          phone: string | null
          reg_type: Database["public"]["Enums"]["registration_type"]
          roll_number: string | null
          section: string | null
          status: Database["public"]["Enums"]["registration_status"]
          team_name: string | null
          updated_at: string
          user_id: string
          year: string | null
        }
        Insert: {
          activity_id: string
          code?: string
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          reg_type?: Database["public"]["Enums"]["registration_type"]
          roll_number?: string | null
          section?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_name?: string | null
          updated_at?: string
          user_id: string
          year?: string | null
        }
        Update: {
          activity_id?: string
          code?: string
          created_at?: string
          department?: string | null
          email?: string | null
          employee_id?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          reg_type?: Database["public"]["Enums"]["registration_type"]
          roll_number?: string | null
          section?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          team_name?: string | null
          updated_at?: string
          user_id?: string
          year?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "registrations_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
        ]
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
      activity_seats: { Args: { _activity_id: string }; Returns: number }
      can_manage_activity: {
        Args: { _activity_id: string; _user_id: string }
        Returns: boolean
      }
      can_view_registration: {
        Args: { _registration_id: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      activity_category:
        | "technical"
        | "cultural"
        | "workshop"
        | "hackathon"
        | "competition"
        | "seminar"
        | "club"
        | "sports"
        | "other"
      activity_kind: "event" | "class"
      activity_mode: "offline" | "online" | "hybrid"
      app_role: "student" | "faculty" | "organizer" | "admin"
      registration_status:
        | "pending"
        | "approved"
        | "rejected"
        | "cancelled"
        | "waitlisted"
        | "completed"
      registration_type:
        | "individual"
        | "team"
        | "student"
        | "faculty"
        | "approval"
        | "invite_only"
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
      activity_category: [
        "technical",
        "cultural",
        "workshop",
        "hackathon",
        "competition",
        "seminar",
        "club",
        "sports",
        "other",
      ],
      activity_kind: ["event", "class"],
      activity_mode: ["offline", "online", "hybrid"],
      app_role: ["student", "faculty", "organizer", "admin"],
      registration_status: [
        "pending",
        "approved",
        "rejected",
        "cancelled",
        "waitlisted",
        "completed",
      ],
      registration_type: [
        "individual",
        "team",
        "student",
        "faculty",
        "approval",
        "invite_only",
      ],
    },
  },
} as const
