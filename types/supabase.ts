export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      cvs: {
        Row: {
          id: string
          user_id: string
          title: string
          template_id: string
          cv_data: Record<string, unknown>
          is_favorite: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          template_id?: string
          cv_data: Record<string, unknown>
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          template_id?: string
          cv_data?: Record<string, unknown>
          is_favorite?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          preview_url: string | null
          category: string
          is_premium: boolean
          sort_order: number
        }
        Insert: {
          id: string
          name: string
          description?: string | null
          preview_url?: string | null
          category: string
          is_premium?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          preview_url?: string | null
          category?: string
          is_premium?: boolean
          sort_order?: number
        }
      }
    }
  }
}
