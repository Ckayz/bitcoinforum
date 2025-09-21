import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl);
  console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Present' : 'Missing');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          email: string;
          bio: string;
          avatar_url: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          email: string;
          bio?: string;
          avatar_url?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          email?: string;
          bio?: string;
          avatar_url?: string;
          created_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      threads: {
        Row: {
          id: string;
          category_id: string;
          user_id: string;
          title: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          category_id: string;
          user_id: string;
          title: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          category_id?: string;
          user_id?: string;
          title?: string;
          created_at?: string;
        };
      };
      posts: {
        Row: {
          id: string;
          thread_id: string;
          user_id: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          thread_id: string;
          user_id: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          thread_id?: string;
          user_id?: string;
          content?: string;
          created_at?: string;
        };
      };
      likes: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
        };
      };
    };
  };
};