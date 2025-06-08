
import { Task, CalendarViewType } from '../types';
import { Edit2 } from 'lucide-react';

interface CalendarViewProps {
  view: CalendarViewType;
  selectedDate: Date;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDateChange: (date: Date) => void;
}

const CalendarView = ({ view, selectedDate, tasks, onTaskEdit, onDateChange }: CalendarViewProps) => {
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric',
              year: 'numeric'
            })}
          </h3>
        </div>
        <div className="p-4">
          <div className="space-y-1">
            {hours.map(hour => {
              const hourStr = hour.toString().padStart(2, '0') + ':00';
              const hourTasks = dayTasks.filter(task => 
                task.startTime <= hourStr && task.endTime > hourStr
              );

              return (
                <div key={hour} className="flex border-b border-gray-50 py-2">
                  <div className="w-16 text-sm text-gray-500 flex-shrink-0">
                    {hour === 0 ? '12 AM' : 
                     hour < 12 ? `${hour} AM` : 
                     hour === 12 ? '12 PM' : 
                     `${hour - 12} PM`}
                  </div>
                  <div className="flex-1 ml-4">
                    {hourTasks.map(task => (
                      <div
                        key={task.id}
                        className={`${task.color} p-2 rounded-lg mb-1 border border-gray-200 shadow-sm hover:shadow-md transition-shadow cursor-pointer group`}
                        onClick={() => onTaskEdit(task)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-gray-800 text-sm">{task.title}</h4>
                            <p className="text-xs text-gray-600">
                              {task.startTime} - {task.endTime}
                            </p>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-1">{task.description}</p>
                            )}
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {weekDays.map((day, index) => (
            <div key={index} className="p-4 text-center border-r border-gray-100 last:border-r-0">
              <div className="text-sm text-gray-500">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-medium mt-1 ${
                day.toDateString() === today.toDateString() ? 'text-blue-600' : 'text-gray-800'
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
              <div key={index} className="p-2 border-r border-gray-100 last:border-r-0">
                <div className="space-y-1">
                  {dayTasks.map(task => (
                    <div
                      key={task.id}
                      className={`${task.color} p-2 rounded-lg text-xs cursor-pointer hover:shadow-md transition-shadow border border-gray-200`}
                      onClick={() => onTaskEdit(task)}
                    >
                      <div className="font-medium text-gray-800 truncate">{task.title}</div>
                      <div className="text-gray-600">{task.startTime}</div>
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-4 text-center text-sm font-medium text-gray-500 border-r border-gray-100 last:border-r-0">
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
                className={`min-h-24 p-2 border-r border-b border-gray-100 last:border-r-0 cursor-pointer hover:bg-gray-50 transition-colors ${
                  !isCurrentMonth ? 'bg-gray-25 text-gray-400' : ''
                }`}
                onClick={() => onDateChange(day)}
              >
                <div className={`text-sm mb-1 ${
                  isToday ? 'bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-medium' : 
                  isCurrentMonth ? 'text-gray-800' : 'text-gray-400'
                }`}>
                  {day.getDate()}
                </div>
                <div className="space-y-1">
                  {dayTasks.slice(0, 2).map(task => (
                    <div
                      key={task.id}
                      className={`${task.color} p-1 rounded text-xs truncate border border-gray-200 hover:shadow-sm transition-shadow`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onTaskEdit(task);
                      }}
                    >
                      <span className="font-medium text-gray-800">{task.title}</span>
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
