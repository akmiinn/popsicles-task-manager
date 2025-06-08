
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Task } from '../types';

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
    color: 'bg-blue-200',
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
      setFormData({
        title: '',
        description: '',
        startTime: '',
        endTime: '',
        date: selectedDate.toISOString().split('T')[0],
        priority: 'medium',
        color: 'bg-blue-200',
        completed: false
      });
    }
  }, [editingTask, selectedDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask) {
      onSave({ ...editingTask, ...formData });
    } else {
      onSave(formData);
    }
  };

  const colorOptions = [
    { value: 'bg-pink-200', label: 'Pink' },
    { value: 'bg-blue-200', label: 'Blue' },
    { value: 'bg-green-200', label: 'Green' },
    { value: 'bg-yellow-200', label: 'Yellow' },
    { value: 'bg-purple-200', label: 'Purple' },
    { value: 'bg-orange-200', label: 'Orange' },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/90 backdrop-blur-lg rounded-2xl p-8 w-96 max-h-[80vh] overflow-y-auto shadow-2xl border border-gray-200/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-2xl font-light text-gray-800">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100/50 rounded-xl transition-all duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg bg-white/80 backdrop-blur-sm"
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
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 h-24 resize-none shadow-lg bg-white/80 backdrop-blur-sm"
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
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg bg-white/80 backdrop-blur-sm"
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
                className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg bg-white/80 backdrop-blur-sm"
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
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg bg-white/80 backdrop-blur-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg bg-white/80 backdrop-blur-sm"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <div className="grid grid-cols-3 gap-3">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-lg hover:shadow-xl ${color.value} ${
                    formData.color === color.value ? 'border-purple-400 ring-2 ring-purple-300' : 'border-gray-200/50'
                  }`}
                >
                  <span className="text-xs font-medium text-gray-700">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {editingTask && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="w-4 h-4 text-purple-600 rounded focus:ring-purple-300"
              />
              <label htmlFor="completed" className="text-sm font-medium text-gray-700">
                Mark as completed
              </label>
            </div>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-200/50 text-gray-600 rounded-xl hover:bg-gray-50/50 transition-all duration-200 shadow-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {editingTask ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskOverlay;
