
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task } from '../types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface TaskOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: Task | Omit<Task, 'id'>) => void;
  editingTask?: Task | null;
  selectedDate: Date;
}

const TaskOverlay = ({ isOpen, onClose, onSave, editingTask, selectedDate }: TaskOverlayProps) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    date: selectedDate.toISOString().split('T')[0],
    priority: 'medium' as 'low' | 'medium' | 'high',
    color: 'task-pastel-blue',
    completed: false
  });

  // Generate default times
  const getDefaultTimes = () => {
    const now = new Date();
    const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
    const defaultStart = `${nextHour.getHours().toString().padStart(2, '0')}:00`;
    const defaultEnd = `${(nextHour.getHours() + 1).toString().padStart(2, '0')}:00`;
    return { defaultStart, defaultEnd };
  };

  useEffect(() => {
    if (editingTask) {
      // Pre-fill all task data for editing
      setFormData({
        title: editingTask.title || '',
        description: editingTask.description || '',
        startTime: editingTask.startTime || '',
        endTime: editingTask.endTime || '',
        date: editingTask.date || selectedDate.toISOString().split('T')[0],
        priority: editingTask.priority || 'medium',
        color: editingTask.color || 'task-pastel-blue',
        completed: editingTask.completed || false
      });
    } else {
      // Set default values for new task
      const { defaultStart, defaultEnd } = getDefaultTimes();
      setFormData({
        title: '',
        description: '',
        startTime: defaultStart,
        endTime: defaultEnd,
        date: selectedDate.toISOString().split('T')[0],
        priority: 'medium',
        color: 'task-pastel-blue',
        completed: false
      });
    }
  }, [editingTask, selectedDate, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onSave({ ...editingTask, ...formData });
    } else {
      onSave(formData);
    }
  };

  const colorOptions = [
    { value: 'task-pastel-pink', label: 'Pink', preview: 'task-pastel-pink' },
    { value: 'task-pastel-blue', label: 'Blue', preview: 'task-pastel-blue' },
    { value: 'task-pastel-green', label: 'Green', preview: 'task-pastel-green' },
    { value: 'task-pastel-yellow', label: 'Yellow', preview: 'task-pastel-yellow' },
    { value: 'task-pastel-purple', label: 'Purple', preview: 'task-pastel-purple' },
    { value: 'task-pastel-orange', label: 'Orange', preview: 'task-pastel-orange' },
    { value: 'task-pastel-indigo', label: 'Indigo', preview: 'task-pastel-indigo' },
    { value: 'task-pastel-teal', label: 'Teal', preview: 'task-pastel-teal' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-3d rounded-2xl p-8 w-[480px] max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-scale-in transform-gpu">
        <div className="flex items-center justify-between mb-8 animate-slide-in-right">
          <h3 className="text-2xl font-light text-gray-900">
            {editingTask ? 'Edit Task' : 'Create New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-3 hover:bg-gray-100/50 rounded-xl transition-all duration-500 hover:scale-125 transform-gpu hover:rotate-90 glass-3d"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-4 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm glass-3d text-sm transition-all duration-500 focus:scale-[1.02] transform-gpu"
              placeholder="Enter task title..."
              required
            />
          </div>

          <div className="animate-slide-in-right" style={{ animationDelay: '0.2s' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-4 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 h-24 resize-none shadow-sm glass-3d text-sm transition-all duration-500 focus:scale-[1.02] transform-gpu"
              placeholder="Add a description (optional)..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-4 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm glass-3d text-sm transition-all duration-500 focus:scale-[1.02] transform-gpu"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-4 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm glass-3d text-sm transition-all duration-500 focus:scale-[1.02] transform-gpu"
                required
              />
            </div>
          </div>

          <div className="animate-slide-in-right" style={{ animationDelay: '0.4s' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-4 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm glass-3d text-sm transition-all duration-500 focus:scale-[1.02] transform-gpu"
              required
            />
          </div>

          <div className="animate-slide-in-right" style={{ animationDelay: '0.5s' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Priority Level
            </label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' })}>
              <SelectTrigger className="w-full glass-3d border border-gray-200/50 rounded-xl px-4 py-4 text-sm transition-all duration-500 hover:scale-[1.02] transform-gpu">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl animate-scale-in">
                <SelectItem value="high" className="text-sm transition-all duration-300 hover:scale-105 text-red-700">🔴 High Priority</SelectItem>
                <SelectItem value="medium" className="text-sm transition-all duration-300 hover:scale-105 text-orange-700">🟡 Medium Priority</SelectItem>
                <SelectItem value="low" className="text-sm transition-all duration-300 hover:scale-105 text-green-700">🟢 Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="animate-slide-in-right" style={{ animationDelay: '0.6s' }}>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Color Theme
            </label>
            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
              <SelectTrigger className="w-full glass-3d border border-gray-200/50 rounded-xl px-4 py-4 text-sm transition-all duration-500 hover:scale-[1.02] transform-gpu">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${formData.color} border-2 border-gray-300 animate-pulse shadow-sm`} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl animate-scale-in">
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value} className="text-sm transition-all duration-300 hover:scale-105">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${color.preview} border border-gray-300 shadow-sm`} />
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editingTask && (
            <div className="flex items-center gap-3 animate-slide-in-right" style={{ animationDelay: '0.7s' }}>
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-300 transition-all duration-500 transform hover:scale-125"
              />
              <label htmlFor="completed" className="text-sm font-medium text-gray-700">
                Mark as completed
              </label>
            </div>
          )}

          <div className="flex gap-4 pt-6 animate-slide-in-right" style={{ animationDelay: '0.8s' }}>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-4 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50/50 transition-all duration-500 shadow-sm text-sm font-medium hover:scale-[1.02] transform-gpu glass-3d"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-500 shadow-lg hover:shadow-xl text-sm font-medium hover:scale-[1.02] transform-gpu"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskOverlay;
