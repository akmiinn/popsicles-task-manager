
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
      // Create default profile if none exists
      const defaultProfile: UserProfile = {
        name: data?.full_name || user.email || 'User',
        email: user.email || '',
        avatar: '',
        bio: 'Welcome to Popsicles!',
        timezone: 'America/New_York',
        theme: 'light',
        notifications: true,
        language: 'English',
        dateFormat: '12h',
        weekStart: 'monday'
      };
      setProfile(defaultProfile);
    } else {
      // Transform database data to UserProfile format
      const userProfile: UserProfile = {
        name: data.full_name || user.email || 'User',
        email: data.email || user.email || '',
        avatar: '',
        bio: data.bio || 'Welcome to Popsicles!',
        timezone: 'America/New_York',
        theme: 'light',
        notifications: data.notifications ?? true,
        language: data.language || 'English',
        dateFormat: (data.date_format as '12h' | '24h') || '12h',
        weekStart: (data.week_start as 'sunday' | 'monday') || 'monday'
      };
      setProfile(userProfile);
    }
    setLoading(false);
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user || !profile) return;

    // Transform UserProfile updates to database format
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.full_name = updates.name;
    if (updates.bio !== undefined) dbUpdates.bio = updates.bio;
    if (updates.language !== undefined) dbUpdates.language = updates.language;
    if (updates.dateFormat !== undefined) dbUpdates.date_format = updates.dateFormat;
    if (updates.weekStart !== undefined) dbUpdates.week_start = updates.weekStart;
    if (updates.notifications !== undefined) dbUpdates.notifications = updates.notifications;

    const { error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', user.id);

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    } else {
      setProfile({ ...profile, ...updates });
    }
  };

  return {
    profile,
    loading,
    updateProfile,
    refetch: fetchProfile,
  };
};
