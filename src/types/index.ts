
export interface Task {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
  color: string;
}

export type CalendarViewType = 'daily' | 'weekly' | 'monthly';

export interface UserProfile {
  name: string;
  email: string;
  avatar: string;
  bio: string;
  timezone: string;
  theme: 'light' | 'dark';
  notifications: boolean;
}

export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}
