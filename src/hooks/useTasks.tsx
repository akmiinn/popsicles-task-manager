
import { useState, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';
import { Task } from '../types';
import { useAuth } from './useAuth';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTasks();
    } else {
      setTasks([]);
      setLoading(false);
    }
  }, [user]);

  const fetchTasks = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true });

    if (error) {
      console.error('Error fetching tasks:', error);
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .insert([{
        ...taskData,
        user_id: user.id,
        completed: false
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    } else {
      setTasks(prev => [...prev, data]);
      return data;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    } else {
      setTasks(prev => prev.map(task => task.id === taskId ? data : task));
      return data;
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting task:', error);
      throw error;
    } else {
      setTasks(prev => prev.filter(task => task.id !== taskId));
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    await updateTask(taskId, { completed: !task.completed });
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    refetch: fetchTasks,
  };
};
