
import React from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { Task, CalendarViewType, UserProfile } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, parse, isAfter, isBefore } from 'date-fns';

interface CalendarViewProps {
  view: CalendarViewType;
  selectedDate: Date;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDateChange: (date: Date) => void;
  onTaskToggle: (taskId: string) => void;
  onViewChange: (view: CalendarViewType) => void;
  userProfile?: UserProfile;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  view,
  selectedDate,
  tasks,
  onTaskEdit,
  onDateChange,
  onTaskToggle,
  onViewChange,
  userProfile
}) => {
  const getTasksForDate = (date: Date) => {
    return tasks.filter(task => task.date === format(date, 'yyyy-MM-dd'));
  };

  const getDaysInView = () => {
    const start = startOfWeek(selectedDate, { weekStartsOn: getWeekStart() as 0 | 1 });
    const end = endOfWeek(selectedDate, { weekStartsOn: getWeekStart() as 0 | 1 });
    const days = eachDayOfInterval({ start, end });
    return days;
  };

  const formatDate = (date: Date) => {
    const dateFormat = userProfile?.date_format || 'MM/dd/yyyy';
    return format(date, dateFormat);
  };

  const getWeekStart = () => {
    const weekStart = userProfile?.week_start || 'sunday';
    return weekStart === 'monday' ? 1 : 0;
  };

  const checkScheduleConflict = (newTask: { startTime: string; endTime: string; date: string }, existingTasks: Task[]) => {
    const conflictingTasks = existingTasks.filter(task => {
      if (task.date !== newTask.date) return false;
      
      const newStart = parse(newTask.startTime, 'HH:mm', new Date());
      const newEnd = parse(newTask.endTime, 'HH:mm', new Date());
      const existingStart = parse(task.startTime, 'HH:mm', new Date());
      const existingEnd = parse(task.endTime, 'HH:mm', new Date());
      
      return (
        (isAfter(newStart, existingStart) && isBefore(newStart, existingEnd)) ||
        (isAfter(newEnd, existingStart) && isBefore(newEnd, existingEnd)) ||
        (isBefore(newStart, existingStart) && isAfter(newEnd, existingEnd))
      );
    });
    
    return conflictingTasks;
  };

  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  const getTaskPosition = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.split(':')[0]);
    const end = parseInt(endTime.split(':')[0]);
    const startMinutes = parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[1]);
    
    const topPercent = ((start * 60 + startMinutes) / (24 * 60)) * 100;
    const heightPercent = (((end - start) * 60 + (endMinutes - startMinutes)) / (24 * 60)) * 100;
    
    return { top: `${topPercent}%`, height: `${heightPercent}%` };
  };

  const handleDateClick = (date: Date) => {
    onDateChange(date);
    if (view !== 'daily') {
      onViewChange('daily');
    }
  };

  const renderDailyView = () => {
    const dailyTasks = getTasksForDate(selectedDate);
    const timeSlots = generateTimeSlots();

    return (
      <div className="glass-3d rounded-xl p-4 h-full">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {formatDate(selectedDate)}
        </h2>
        <div className="relative h-96 overflow-y-auto border border-gray-200 rounded-lg bg-white/50">
          {/* Time slots */}
          {timeSlots.map((time, index) => (
            <div key={time} className="relative border-b border-gray-100 h-16 flex items-start">
              <div className="w-16 text-xs text-gray-500 p-2 border-r border-gray-100">
                {time}
              </div>
              <div className="flex-1 relative">
                {/* Tasks positioned absolutely within their time slots */}
                {dailyTasks
                  .filter(task => {
                    const taskHour = parseInt(task.startTime.split(':')[0]);
                    return taskHour === index;
                  })
                  .map((task) => {
                    const position = getTaskPosition(task.startTime, task.endTime);
                    return (
                      <div
                        key={task.id}
                        className="absolute left-1 right-1 rounded-md p-2 cursor-pointer transition-all duration-300 hover:scale-105 border border-gray-200 shadow-sm"
                        style={{
                          backgroundColor: task.color,
                          top: position.top,
                          height: position.height,
                          minHeight: '2rem'
                        }}
                        onClick={() => onTaskEdit(task)}
                      >
                        <div className="text-xs font-medium text-gray-900 truncate">
                          {task.title}
                        </div>
                        <div className="text-xs text-gray-600 truncate">
                          {task.startTime} - {task.endTime}
                        </div>
                        <input
                          type="checkbox"
                          checked={task.completed}
                          onChange={(e) => {
                            e.stopPropagation();
                            onTaskToggle(task.id);
                          }}
                          className="absolute top-1 right-1 h-3 w-3 rounded border-gray-300 text-indigo-600"
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderWeeklyView = () => {
    const daysInView = getDaysInView();

    return (
      <div className="glass-3d rounded-xl p-4">
        <div className="grid grid-cols-7 gap-4">
          {daysInView.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);

            return (
              <div
                key={day.toISOString()}
                className={`p-3 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 ${
                  isSelected
                    ? 'bg-blue-100 border border-blue-300'
                    : isToday
                      ? 'bg-green-50 border border-green-200'
                      : 'border border-gray-200'
                }`}
                onClick={() => handleDateClick(day)}
              >
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {format(day, 'EEE d')}
                </div>
                <ul className="space-y-1">
                  {dayTasks.slice(0, 3).map((task) => (
                    <li
                      key={task.id}
                      className="text-xs p-1 rounded truncate cursor-pointer transition-all duration-300 hover:opacity-80"
                      style={{ backgroundColor: task.color }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskEdit(task);
                      }}
                    >
                      {task.title}
                    </li>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{dayTasks.length - 3} more
                    </div>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart, { weekStartsOn: getWeekStart() as 0 | 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: getWeekStart() as 0 | 1 });
    
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    
    return (
      <div className="glass-3d rounded-xl p-4">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-xs font-medium text-gray-600 py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day) => {
            const dayTasks = getTasksForDate(day);
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
            
            return (
              <div
                key={day.toISOString()}
                onClick={() => handleDateClick(day)}
                className={`
                  min-h-20 p-2 rounded-lg cursor-pointer transition-all duration-300 hover:scale-105 border
                  ${isSelected 
                    ? 'glossy-button-dark text-white' 
                    : isToday 
                      ? 'bg-blue-50 border-blue-200 glossy-button-3d' 
                      : isCurrentMonth 
                        ? 'glossy-button-3d hover:bg-gray-50' 
                        : 'bg-gray-50 text-gray-400 border-gray-200'
                  }
                `}
              >
                <div className={`text-xs font-medium mb-1 ${isSelected ? 'text-white' : 'text-gray-900'}`}>
                  {format(day, 'd')}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map((task) => (
                    <div
                      key={task.id}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskEdit(task);
                      }}
                      className={`text-xs p-1 rounded truncate cursor-pointer transition-all duration-300 hover:opacity-80 ${
                        task.completed
                          ? 'bg-green-100 text-green-800 line-through'
                          : 'bg-white text-gray-700 border border-gray-200'
                      }`}
                      style={{ backgroundColor: task.completed ? undefined : task.color }}
                    >
                      {task.title}
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

  return (
    <div>
      {view === 'daily' && renderDailyView()}
      {view === 'weekly' && renderWeeklyView()}
      {view === 'monthly' && renderMonthlyView()}
    </div>
  );
};

export default CalendarView;
