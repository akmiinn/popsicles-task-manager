import React from 'react';
import { Calendar, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { Task, CalendarViewType, UserProfile } from '../types';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays } from 'date-fns';

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

  const renderDailyView = () => {
    const dailyTasks = getTasksForDate(selectedDate);

    return (
      <div className="glass-3d rounded-xl p-4">
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {formatDate(selectedDate)}
        </h2>
        <ul className="space-y-2">
          {dailyTasks.length > 0 ? (
            dailyTasks.map((task) => (
              <li
                key={task.id}
                className="flex items-center justify-between p-3 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
                style={{ backgroundColor: task.color }}
              >
                <div>
                  <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                  <p className="text-xs text-gray-600">{task.description}</p>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {task.startTime} - {task.endTime}
                  </div>
                </div>
                <div>
                  <button
                    onClick={() => onTaskEdit(task)}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full text-xs transition-colors duration-300"
                  >
                    Edit
                  </button>
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => onTaskToggle(task.id)}
                    className="ml-3 h-5 w-5 rounded-full border-gray-300 text-indigo-600 shadow-sm focus:ring-indigo-500 transition-all duration-300 cursor-pointer"
                  />
                </div>
              </li>
            ))
          ) : (
            <li className="text-gray-500">No tasks for today.</li>
          )}
        </ul>
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
                onClick={() => onDateChange(day)}
              >
                <div className="text-sm font-medium text-gray-900 mb-2">
                  {formatDate(day)}
                </div>
                <ul className="space-y-1">
                  {dayTasks.map((task) => (
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
                onClick={() => onDateChange(day)}
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
                  {formatDate(day)}
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
