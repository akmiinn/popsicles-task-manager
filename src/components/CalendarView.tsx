import { Task, CalendarViewType } from '../types';
import { Edit2, Check } from 'lucide-react';

interface CalendarViewProps {
  view: CalendarViewType;
  selectedDate: Date;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDateChange: (date: Date) => void;
  onTaskToggle: (taskId: string) => void;
}

const CalendarView = ({ view, selectedDate, tasks, onTaskEdit, onDateChange, onTaskToggle }: CalendarViewProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.date === date)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  };

  const renderDailyView = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayTasks = getTasksForDate(dateStr);
    
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="p-6 border-b border-gray-100/50 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="font-medium text-gray-800">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-2">
            {hours.map(hour => {
              const hourStr = hour.toString().padStart(2, '0') + ':00';
              const hourTasks = dayTasks.filter(task => 
                task.startTime <= hourStr && task.endTime > hourStr
              );

              return (
                <div key={hour} className="flex border-b border-gray-50/50 py-3">
                  <div className="w-20 text-sm text-gray-500 flex-shrink-0 font-medium">
                    {hour === 0 ? '12 AM' : 
                     hour < 12 ? `${hour} AM` : 
                     hour === 12 ? '12 PM' : 
                     `${hour - 12} PM`}
                  </div>
                  <div className="flex-1 ml-6">
                    {hourTasks.map(task => (
                      <div
                        key={task.id}
                        className={`${task.color} p-4 rounded-xl mb-2 border border-gray-200/30 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer group backdrop-blur-sm ${
                          task.completed ? 'opacity-60' : ''
                        }`}
                        onClick={() => onTaskEdit(task)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskToggle(task.id);
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                                task.completed 
                                  ? 'bg-green-500 border-green-500 text-white' 
                                  : 'border-gray-400 hover:border-green-400'
                              }`}
                            >
                              {task.completed && <Check className="w-3 h-3" />}
                            </button>
                            <div>
                              <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {task.title}
                              </h4>
                              <p className="text-xs text-gray-600">
                                {task.startTime} - {task.endTime}
                              </p>
                              {task.description && (
                                <p className={`text-xs mt-1 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {task.description}
                                </p>
                              )}
                            </div>
                          </div>
                          <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const startOfWeek = new Date(selectedDate);
    startOfWeek.setDate(selectedDate.getDate() - selectedDate.getDay());
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100/50">
          {weekDays.map((day, index) => (
            <div key={index} className="p-4 text-center border-r border-gray-100/50 last:border-r-0 bg-gradient-to-b from-gray-50 to-white">
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-medium mt-1 ${
                day.toDateString() === today.toDateString() ? 'text-purple-600' : 'text-gray-800'
              }`}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-96">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDate(day.toISOString().split('T')[0]);
            return (
              <div key={index} className="p-3 border-r border-gray-100/50 last:border-r-0">
                <div className="space-y-2">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`${task.color} p-2 rounded-lg text-xs cursor-pointer hover:shadow-lg transition-all duration-200 border border-gray-200/30 backdrop-blur-sm ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                      onClick={() => onTaskEdit(task)}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onTaskToggle(task.id);
                          }}
                          className={`w-3 h-3 rounded-full border flex items-center justify-center ${
                            task.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-400'
                          }`}
                        >
                          {task.completed && <Check className="w-2 h-2" />}
                        </button>
                        <div className="flex-1">
                          <div className={`font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                            {task.title}
                          </div>
                          <div className="text-gray-600">{task.startTime}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return (
      <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100/50">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 border-r border-gray-100/50 last:border-r-0 bg-gradient-to-b from-gray-50 to-white">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const isCurrentMonth = day.getMonth() === month;
            const isToday = day.toDateString() === today.toDateString();
            const dayTasks = getTasksForDate(day.toISOString().split('T')[0]);
            
            return (
              <div
                key={index}
                className={`min-h-28 p-3 border-r border-b border-gray-100/50 last:border-r-0 cursor-pointer hover:bg-gray-50/50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-25 text-gray-400' : ''
                }`}
                onClick={() => onDateChange(day)}
              >
                <div className={`text-sm mb-2 ${
                  isToday ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-medium' : 
                  isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`${task.color} p-1 rounded text-xs truncate border border-gray-200/30 hover:shadow-sm transition-all duration-200 backdrop-blur-sm ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskEdit(task);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {task.completed && <Check className="w-2 h-2 text-green-600" />}
                        <span className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {task.title}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-500">
                      +{dayTasks.length - 2} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  switch (view) {
    case 'daily':
      return renderDailyView();
    case 'weekly':
      return renderWeeklyView();
    case 'monthly':
      return renderMonthlyView();
    default:
      return null;
  }
};

export default CalendarView;
