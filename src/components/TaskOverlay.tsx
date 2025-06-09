
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
    color: 'bg-blue-100',
    completed: false
  });

  useEffect(() => {
    if (editingTask) {
      setFormData({
        title: editingTask.title,
        description: editingTask.description,
        startTime: editingTask.startTime,
        endTime: editingTask.endTime,
        date: editingTask.date,
        priority: editingTask.priority,
        color: editingTask.color,
        completed: editingTask.completed
      });
    } else {
      const now = new Date();
      const nextHour = new Date(now.getTime() + 60 * 60 * 1000);
      const defaultStart = `${nextHour.getHours().toString().padStart(2, '0')}:00`;
      const defaultEnd = `${(nextHour.getHours() + 1).toString().padStart(2, '0')}:00`;
      
      setFormData({
        title: '',
        description: '',
        startTime: defaultStart,
        endTime: defaultEnd,
        date: selectedDate.toISOString().split('T')[0],
        priority: 'medium',
        color: 'bg-blue-100',
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
    { value: 'bg-pink-100', label: 'Pink', preview: 'bg-pink-100' },
    { value: 'bg-blue-100', label: 'Blue', preview: 'bg-blue-100' },
    { value: 'bg-green-100', label: 'Green', preview: 'bg-green-100' },
    { value: 'bg-yellow-100', label: 'Yellow', preview: 'bg-yellow-100' },
    { value: 'bg-purple-100', label: 'Purple', preview: 'bg-purple-100' },
    { value: 'bg-orange-100', label: 'Orange', preview: 'bg-orange-100' },
    { value: 'bg-indigo-100', label: 'Indigo', preview: 'bg-indigo-100' },
    { value: 'bg-teal-100', label: 'Teal', preview: 'bg-teal-100' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-[2px] flex items-center justify-center z-50 animate-fade-in">
      <div className="glass-3d rounded-2xl p-6 w-96 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium text-gray-900">
            {editingTask ? 'Edit Task' : 'New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/50 rounded-xl transition-all duration-300 hover:scale-110"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
              placeholder="Task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 h-20 resize-none shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
              placeholder="Optional description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value as 'low' | 'medium' | 'high' })}>
              <SelectTrigger className="w-full glass-3d border border-gray-200/50 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.02]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl">
                <SelectItem value="high" className="text-sm">High Priority</SelectItem>
                <SelectItem value="medium" className="text-sm">Medium Priority</SelectItem>
                <SelectItem value="low" className="text-sm">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
              <SelectTrigger className="w-full glass-3d border border-gray-200/50 rounded-xl px-4 py-3 text-sm transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${formData.color}`} />
                  <SelectValue />
                </div>
              </SelectTrigger>
              <SelectContent className="glass-3d border border-gray-200/50 rounded-xl shadow-xl">
                {colorOptions.map((color) => (
                  <SelectItem key={color.value} value={color.value} className="text-sm">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${color.preview}`} />
                      <span>{color.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {editingTask && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="w-4 h-4 text-gray-600 rounded focus:ring-gray-300 transition-all duration-300"
              />
              <label htmlFor="completed" className="text-sm font-medium text-gray-700">
                Mark as completed
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-xl hover:bg-gray-50/50 transition-all duration-300 shadow-sm text-sm font-medium hover:scale-[1.02] glass-3d"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl text-sm font-medium hover:scale-[1.02] glossy-button-3d"
            >
              {editingTask ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskOverlay;
