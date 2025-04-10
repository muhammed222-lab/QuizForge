/* eslint-disable @typescript-eslint/no-empty-object-type */
// types/supabase.ts

export type Database = {
  public: {
    Tables: {
      classes: {
        Row: {
          id: string;
          institution_id: string;
          tutor_id: string;
          name: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          institution_id: string;
          tutor_id: string;
          name: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          institution_id?: string;
          tutor_id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {};
    Functions: {};
    Enums: {};
    CompositeTypes: {};
  };
};
