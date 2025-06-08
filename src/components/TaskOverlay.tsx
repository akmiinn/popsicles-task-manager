
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

  // Suggested time periods
  const suggestedTimes = [
    { start: '09:00', end: '10:00', label: 'Morning (9-10 AM)' },
    { start: '10:00', end: '11:00', label: 'Mid-Morning (10-11 AM)' },
    { start: '12:00', end: '13:00', label: 'Lunch (12-1 PM)' },
    { start: '14:00', end: '15:00', label: 'Afternoon (2-3 PM)' },
    { start: '16:00', end: '17:00', label: 'Late Afternoon (4-5 PM)' },
    { start: '19:00', end: '20:00', label: 'Evening (7-8 PM)' },
  ];

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
      // Set default suggested time (next available hour)
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

  const handleSuggestedTime = (start: string, end: string) => {
    setFormData({ ...formData, startTime: start, endTime: end });
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
      <div className="bg-white/95 backdrop-blur-lg rounded-xl p-6 w-80 max-h-[85vh] overflow-y-auto shadow-2xl border border-gray-200/50">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-800">
            {editingTask ? 'Edit Task' : 'Add New Task'}
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100/50 rounded-lg transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm bg-white/80 backdrop-blur-sm text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 h-16 resize-none shadow-sm bg-white/80 backdrop-blur-sm text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Suggested Time Slots
            </label>
            <div className="grid grid-cols-2 gap-2 mb-3">
              {suggestedTimes.map((time, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSuggestedTime(time.start, time.end)}
                  className={`p-2 text-xs rounded-lg border transition-all duration-200 ${
                    formData.startTime === time.start && formData.endTime === time.end
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm bg-white/80 backdrop-blur-sm text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm bg-white/80 backdrop-blur-sm text-sm"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm bg-white/80 backdrop-blur-sm text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as 'low' | 'medium' | 'high' })}
              className="w-full px-3 py-2 border border-gray-200/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm bg-white/80 backdrop-blur-sm text-sm"
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
            <div className="grid grid-cols-3 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, color: color.value })}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 shadow-sm hover:shadow-md ${color.value} ${
                    formData.color === color.value ? 'border-gray-400 ring-2 ring-gray-300' : 'border-gray-200/50'
                  }`}
                >
                  <span className="text-xs font-medium text-gray-700">{color.label}</span>
                </button>
              ))}
            </div>
          </div>

          {editingTask && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="completed"
                checked={formData.completed}
                onChange={(e) => setFormData({ ...formData, completed: e.target.checked })}
                className="w-4 h-4 text-gray-600 rounded focus:ring-gray-300"
              />
              <label htmlFor="completed" className="text-sm font-medium text-gray-700">
                Mark as completed
              </label>
            </div>
          )}

          <div className="flex gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200/50 text-gray-600 rounded-lg hover:bg-gray-50/50 transition-all duration-200 shadow-sm text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-sm hover:shadow-md text-sm"
            >
              {editingTask ? 'Update' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskOverlay;
