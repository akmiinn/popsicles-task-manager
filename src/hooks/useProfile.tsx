
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { UserProfile } from '../types';
import { useAuth } from './useAuth';

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchProfile();
    } else {
      setProfile(null);
      setLoading(false);
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      // Create default profile if it doesn't exist
      await createDefaultProfile();
    } else {
      setProfile(data);
    }
    setLoading(false);
  };

  const createDefaultProfile = async () => {
    if (!user) return;

    const defaultProfile = {
      id: user.id,
      email: user.email,
      full_name: user.user_metadata?.full_name || user.email,
      bio: 'Welcome to Hybridus!',
      language: 'English',
      date_format: 'MM/dd/yyyy',
      week_start: 'sunday',
      notifications: true,
    };

    const { data, error } = await supabase
      .from('profiles')
      .insert([defaultProfile])
      .select()
      .single();

    if (error) {
      console.error('Error creating profile:', error);
    } else {
      setProfile(data);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    } else {
      setProfile(data);
      return data;
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};
