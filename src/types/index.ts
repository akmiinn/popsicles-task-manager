
export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  color: string;
  completed: boolean;
}

export type CalendarViewType = 'daily' | 'weekly' | 'monthly';

// Updated to match the database Profile interface
export interface UserProfile {
  id: string;
  email: string | null;
  full_name: string | null;
  bio: string | null;
  language: string | null;
  date_format: string | null;
  week_start: string | null;
  notifications: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}
