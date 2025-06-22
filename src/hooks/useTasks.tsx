
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
      // Transform database fields to match Task interface
      const transformedTasks = data?.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        startTime: task.start_time,
        endTime: task.end_time,
        date: task.date,
        priority: task.priority as 'low' | 'medium' | 'high',
        color: task.color,
        completed: task.completed
      })) || [];
      setTasks(transformedTasks);
    }
    setLoading(false);
  };

  const addTask = async (taskData: Omit<Task, 'id' | 'completed'>) => {
    if (!user) return;

    // Transform Task interface fields to database fields
    const dbTaskData = {
      title: taskData.title,
      description: taskData.description,
      start_time: taskData.startTime,
      end_time: taskData.endTime,
      date: taskData.date,
      priority: taskData.priority,
      color: taskData.color,
      user_id: user.id,
      completed: false
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([dbTaskData])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    } else {
      // Transform back to Task interface
      const newTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        startTime: data.start_time,
        endTime: data.end_time,
        date: data.date,
        priority: data.priority as 'low' | 'medium' | 'high',
        color: data.color,
        completed: data.completed
      };
      setTasks(prev => [...prev, newTask]);
      return newTask;
    }
  };

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return;

    // Transform updates to database field names
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.date !== undefined) dbUpdates.date = updates.date;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;

    const { data, error } = await supabase
      .from('tasks')
      .update(dbUpdates)
      .eq('id', taskId)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating task:', error);
      throw error;
    } else {
      // Transform back to Task interface
      const updatedTask: Task = {
        id: data.id,
        title: data.title,
        description: data.description || '',
        startTime: data.start_time,
        endTime: data.end_time,
        date: data.date,
        priority: data.priority as 'low' | 'medium' | 'high',
        color: data.color,
        completed: data.completed
      };
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
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
