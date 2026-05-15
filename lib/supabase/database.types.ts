export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string | null
          email: string | null
          avatar_url: string | null
          telegram_connected: boolean
          telegram_username: string | null
          theme: string
          reminder_time: string | null
          reminders_enabled: boolean
          updated_at: string
        }
        Insert: {
          id: string
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          telegram_connected?: boolean
          telegram_username?: string | null
          theme?: string
          reminder_time?: string | null
          reminders_enabled?: boolean
        }
        Update: {
          name?: string | null
          email?: string | null
          avatar_url?: string | null
          telegram_connected?: boolean
          telegram_username?: string | null
          theme?: string
          reminder_time?: string | null
          reminders_enabled?: boolean
        }
      }
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          icon: string
        }
        Update: {
          name?: string
          color?: string
          icon?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          icon: string
          color: string
          category: string
          frequency: Json
          created_at: string
          is_archived: boolean
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          icon: string
          color: string
          category: string
          frequency: Json
          is_archived?: boolean
        }
        Update: {
          name?: string
          icon?: string
          color?: string
          category?: string
          frequency?: Json
          is_archived?: boolean
        }
      }
      habit_logs: {
        Row: {
          habit_id: string
          user_id: string
          log_date: string
          completed: boolean
        }
        Insert: {
          habit_id: string
          user_id: string
          log_date: string
          completed?: boolean
        }
        Update: {
          completed?: boolean
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          type: string
          target_value: string
          current_value: string
          unit: string | null
          deadline: string
          category: string
          linked_habit_ids: string[]
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          type: string
          target_value: number | string
          current_value?: number | string
          unit?: string | null
          deadline: string
          category: string
          linked_habit_ids?: string[]
        }
        Update: {
          name?: string
          description?: string | null
          type?: string
          target_value?: number | string
          current_value?: number | string
          unit?: string | null
          deadline?: string
          category?: string
          linked_habit_ids?: string[]
        }
      }
      goal_progress: {
        Row: {
          id: string
          user_id: string
          goal_id: string
          progress_date: string
          value: string
          note: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_id: string
          progress_date: string
          value: number | string
          note?: string | null
        }
        Update: {
          value?: number | string
          note?: string | null
        }
      }
      food_items: {
        Row: {
          id: string
          name: string
          calories: string
          protein: string
          fat: string
          carbs: string
          category: string
        }
        Insert: {
          id?: string
          name: string
          calories: number | string
          protein: number | string
          fat: number | string
          carbs: number | string
          category: string
        }
        Update: {
          name?: string
          calories?: number | string
          protein?: number | string
          fat?: number | string
          carbs?: number | string
          category?: string
        }
      }
      meal_entries: {
        Row: {
          id: string
          user_id: string
          food_id: string
          entry_date: string
          meal_type: string
          amount: string
          calories: string
          protein: string
          fat: string
          carbs: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          food_id: string
          entry_date: string
          meal_type: string
          amount: number | string
          calories: number | string
          protein: number | string
          fat: number | string
          carbs: number | string
        }
        Update: {
          meal_type?: string
          amount?: number | string
          calories?: number | string
          protein?: number | string
          fat?: number | string
          carbs?: number | string
        }
      }
      nutrition_goals: {
        Row: {
          user_id: string
          calories: string
          protein: string
          fat: string
          carbs: string
        }
        Insert: {
          user_id: string
          calories: number | string
          protein: number | string
          fat: number | string
          carbs: number | string
        }
        Update: {
          calories?: number | string
          protein?: number | string
          fat?: number | string
          carbs?: number | string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
