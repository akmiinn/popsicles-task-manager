
import { Task, CalendarViewType, UserProfile } from '../types';
import { Edit2, Check } from 'lucide-react';

interface CalendarViewProps {
  view: CalendarViewType;
  selectedDate: Date;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDateChange: (date: Date) => void;
  onTaskToggle: (taskId: string) => void;
  onViewChange?: (view: CalendarViewType) => void;
  userProfile?: UserProfile;
}

const CalendarView = ({ view, selectedDate, tasks, onTaskEdit, onDateChange, onTaskToggle, onViewChange, userProfile }: CalendarViewProps) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const formatTime = (time: string, format: '12h' | '24h' = '12h') => {
    if (!time) return time;
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    
    if (format === '12h') {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${period}`;
    } else {
      return time;
    }
  };

  const getTasksForDate = (date: string) => {
    return tasks.filter(task => task.date === date)
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
  };

  const handleDateClick = (date: Date) => {
    onDateChange(date);
    if (onViewChange) {
      onViewChange('daily');
    }
  };

  const handleTaskToggle = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    
    // Add completion animation
    const taskElement = (event.target as HTMLElement).closest('.task-item');
    if (taskElement) {
      taskElement.classList.add('animate-completion-celebrate');
      setTimeout(() => {
        taskElement.classList.remove('animate-completion-celebrate');
        taskElement.classList.add('animate-completion-bounce');
        setTimeout(() => {
          taskElement.classList.remove('animate-completion-bounce');
        }, 500);
      }, 600);
    }
    
    onTaskToggle(taskId);
  };

  const timeToMinutes = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const renderDailyView = () => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    const dayTasks = getTasksForDate(dateStr);
    
    const hours = Array.from({ length: 24 }, (_, i) => i);

    return (
      <div className="glass-3d rounded-2xl shadow-xl border border-gray-300 overflow-hidden animate-slide-up">
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
          <h3 className="font-medium text-gray-900 animate-fade-in">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-0 relative">
            {hours.map(hour => {
              const displayTime = userProfile?.dateFormat === '24h' 
                ? `${hour.toString().padStart(2, '0')}:00`
                : (hour === 0 ? '12 AM' : 
                   hour < 12 ? `${hour} AM` : 
                   hour === 12 ? '12 PM' : 
                   `${hour - 12} PM`);

              return (
                <div key={hour} className="flex border-b border-gray-100 py-4 relative min-h-[60px] animate-fade-in" style={{ animationDelay: `${hour * 0.02}s` }}>
                  <div className="w-20 text-sm text-gray-600 flex-shrink-0 font-medium">
                    {displayTime}
                  </div>
                  <div className="flex-1 ml-6 relative">
                    {/* Render tasks that span this hour */}
                    {dayTasks.map(task => {
                      const taskStartMinutes = timeToMinutes(task.startTime);
                      const taskEndMinutes = timeToMinutes(task.endTime);
                      const hourStartMinutes = hour * 60;
                      const hourEndMinutes = (hour + 1) * 60;

                      // Check if task overlaps with this hour
                      const overlaps = taskStartMinutes < hourEndMinutes && taskEndMinutes > hourStartMinutes;
                      
                      if (!overlaps) return null;

                      // Calculate position and height
                      const taskStart = Math.max(taskStartMinutes, hourStartMinutes);
                      const taskEnd = Math.min(taskEndMinutes, hourEndMinutes);
                      const duration = taskEnd - taskStart;
                      const height = (duration / 60) * 60; // 60px per hour
                      const top = ((taskStart - hourStartMinutes) / 60) * 60;

                      // Only render the task in its starting hour to avoid duplicates
                      const isStartingHour = taskStartMinutes >= hourStartMinutes && taskStartMinutes < hourEndMinutes;
                      if (!isStartingHour) return null;

                      // Calculate full height for the entire task duration
                      const fullDuration = taskEndMinutes - taskStartMinutes;
                      const fullHeight = (fullDuration / 60) * 60;

                      return (
                        <div
                          key={task.id}
                          className={`task-item ${task.color} absolute left-0 right-0 p-4 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-500 cursor-pointer group glass-3d hover:scale-[1.02] hover:translate-x-1 transform-gpu ${
                            task.completed ? 'opacity-60 task-completed' : ''
                          }`}
                          style={{ 
                            top: `${top}px`, 
                            height: `${fullHeight}px`,
                            zIndex: 10
                          }}
                          onClick={() => onTaskEdit(task)}
                        >
                          <div className="flex items-start justify-between h-full">
                            <div className="flex items-start gap-3 flex-1">
                              <button
                                onClick={(e) => handleTaskToggle(task.id, e)}
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-500 hover:scale-125 transform-gpu ${
                                  task.completed 
                                    ? 'bg-green-500 border-green-500 text-white checkbox-checked animate-bounce' 
                                    : 'border-gray-400 hover:border-green-400 hover:bg-green-50'
                                }`}
                              >
                                {task.completed && <Check className="w-3 h-3 animate-checkmark-draw" />}
                              </button>
                              <div className="flex-1">
                                <h4 className={`font-medium text-sm transition-all duration-300 ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                                  {task.title}
                                </h4>
                                <p className="text-xs text-gray-600 mt-1">
                                  {formatTime(task.startTime, userProfile?.dateFormat)} - {formatTime(task.endTime, userProfile?.dateFormat)}
                                </p>
                                {task.description && (
                                  <p className={`text-xs mt-1 transition-all duration-300 ${task.completed ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Edit2 className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:scale-110" />
                          </div>
                        </div>
                      );
                    })}
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
    const weekStart = userProfile?.weekStart === 'monday' ? 1 : 0;
    const daysDiff = (startOfWeek.getDay() - weekStart + 7) % 7;
    startOfWeek.setDate(selectedDate.getDate() - daysDiff);
    
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });

    const dayNames = userProfile?.weekStart === 'monday' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="glass-3d rounded-2xl shadow-xl border border-gray-300 overflow-hidden animate-scale-in">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map((day, index) => (
            <div key={index} className="p-4 text-center border-r border-gray-200 last:border-r-0 bg-gradient-to-b from-gray-50 to-white animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <div className="text-sm text-gray-600">
                {dayNames[index]}
              </div>
              <div className={`text-lg font-medium mt-1 cursor-pointer hover:scale-125 transition-all duration-500 transform-gpu ${
                day.toDateString() === today.toDateString() ? 'text-gray-900 bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center mx-auto' : 'text-gray-800'
              }`} onClick={() => handleDateClick(day)}>
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 min-h-96">
          {weekDays.map((day, index) => {
            const dayTasks = getTasksForDate(day.toISOString().split('T')[0]);
            return (
              <div key={index} className="p-3 border-r border-gray-200 last:border-r-0">
                <div className="space-y-2">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`task-item ${task.color} p-2 rounded-lg text-xs cursor-pointer hover:shadow-lg transition-all duration-300 border border-gray-200 glass-3d hover:scale-[1.02] ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                      onClick={() => onTaskEdit(task)}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => handleTaskToggle(task.id, e)}
                          className={`w-3 h-3 rounded-full border flex items-center justify-center transition-all duration-300 hover:scale-110 ${
                            task.completed 
                              ? 'bg-green-500 border-green-500 text-white' 
                              : 'border-gray-400'
                          }`}
                        >
                          {task.completed && <Check className="w-2 h-2" />}
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className={`font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                            {task.title}
                          </div>
                          <div className="text-gray-700 truncate">
                            {formatTime(task.startTime, userProfile?.dateFormat)}
                          </div>
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
    
    // Adjust for week start preference
    const weekStart = userProfile?.weekStart === 'monday' ? 1 : 0;
    const daysDiff = (firstDay.getDay() - weekStart + 7) % 7;
    startDate.setDate(startDate.getDate() - daysDiff);
    
    const days = [];
    const current = new Date(startDate);
    
    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    const dayNames = userProfile?.weekStart === 'monday' 
      ? ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
      <div className="glass-3d rounded-2xl shadow-xl border border-gray-300 overflow-hidden animate-fade-in">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map((day, index) => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0 bg-gradient-to-b from-gray-50 to-white animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
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
                className={`min-h-28 p-3 border-r border-b border-gray-200 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-all duration-500 hover:scale-[1.02] hover:shadow-lg transform-gpu animate-fade-in ${
                  !isCurrentMonth ? 'bg-gray-50 text-gray-400' : ''
                }`}
                style={{ animationDelay: `${index * 0.02}s` }}
                onClick={() => handleDateClick(day)}
              >
                <div className={`text-sm mb-2 transition-all duration-500 hover:scale-125 transform-gpu ${
                  isToday ? 'bg-gray-900 text-white w-6 h-6 rounded-full flex items-center justify-center font-medium animate-pulse' : 
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`task-item ${task.color} p-1 rounded text-xs truncate border border-gray-200 hover:shadow-sm transition-all duration-500 glass-3d hover:scale-[1.05] transform-gpu ${
                        task.completed ? 'opacity-60' : ''
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskEdit(task);
                      }}
                    >
                      <div className="flex items-center gap-1">
                        {task.completed && <Check className="w-2 h-2 text-green-600 animate-bounce" />}
                        <span className={`font-medium truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                      </div>
                    </div>
                  ))}
                  {dayTasks.length > 2 && (
                    <div className="text-xs text-gray-600 animate-pulse">
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
