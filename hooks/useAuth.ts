'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else {
          setUser(session?.user ?? null);
        }
      } catch (error) {
        console.error('Error in getSession:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Create user profile if signup was successful
      if (data.user && !data.user.email_confirmed_at) {
        // For development, we'll create the profile immediately
        // In production, you might want to wait for email confirmation
        await createUserProfile(data.user.id, email, username);
      }

      return data;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Ensure user profile exists
      if (data.user) {
        await ensureUserProfile(data.user);
      }
      
      return data;
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  };

  const createUserProfile = async (userId: string, email: string, username: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .upsert([
          {
            id: userId,
            email: email,
            username: username,
            bio: '',
            avatar_url: '',
          }
        ], { 
          onConflict: 'id',
          ignoreDuplicates: false 
        });

      if (error) {
        console.error('Error creating user profile:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in createUserProfile:', error);
      throw error;
    }
  };

  const ensureUserProfile = async (user: User) => {
    try {
      // Check if user profile exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 is "not found" error, which is expected if profile doesn't exist
        console.error('Error checking user profile:', fetchError);
        return;
      }
      
      if (!existingUser) {
        // Create profile if it doesn't exist
        const username = user.email?.split('@')[0] || 'user';
        await createUserProfile(user.id, user.email!, username);
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
  };
}