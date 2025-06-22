import { Calendar, Clock, Plus } from 'lucide-react';
import { Task, CalendarViewType, UserProfile } from '../types';
import { Calendar as UICalendar } from './ui/calendar';

interface CalendarViewProps {
  view: CalendarViewType;
  selectedDate: Date;
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onDateChange: (date: Date) => void;
  onTaskToggle: (taskId: string) => void;
  onViewChange: (view: CalendarViewType) => void;
  userProfile: UserProfile;
}

const CalendarView = ({ 
  view, 
  selectedDate, 
  tasks, 
  onTaskEdit, 
  onDateChange,
  onTaskToggle,
  userProfile
}: CalendarViewProps) => {
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push({
        time: `${hour.toString().padStart(2, '0')}:00`,
        hour: hour
      });
    }
    return slots;
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return tasks.filter(task => task.date === dateStr);
  };

  const renderDailyView = () => {
    const timeSlots = generateTimeSlots();
    const dayTasks = getTasksForDate(selectedDate);
    
    return (
      <div className="glass-3d rounded-lg p-4 h-[600px] overflow-y-auto">
        <div className="relative">
          {timeSlots.map((slot) => {
            // Find tasks that span this time slot
            const slotTasks = dayTasks.filter(task => {
              const taskStart = timeToMinutes(task.startTime);
              const taskEnd = timeToMinutes(task.endTime);
              const slotStart = slot.hour * 60;
              const slotEnd = (slot.hour + 1) * 60;
              
              // Check if this slot is within the task duration
              return taskStart <= slotStart && taskEnd > slotStart;
            });

            return (
              <div key={slot.time} className="flex border-b border-gray-200 min-h-[60px] relative">
                <div className="w-20 flex-shrink-0 py-2 text-sm text-gray-600 font-medium">
                  {userProfile.dateFormat === '12h' 
                    ? (slot.hour === 0 ? '12:00 AM' 
                       : slot.hour < 12 ? `${slot.hour}:00 AM` 
                       : slot.hour === 12 ? '12:00 PM' 
                       : `${slot.hour - 12}:00 PM`)
                    : slot.time
                  }
                </div>
                <div className="flex-1 relative">
                  {slotTasks.map((task) => {
                    const taskStart = timeToMinutes(task.startTime);
                    const taskEnd = timeToMinutes(task.endTime);
                    const slotStart = slot.hour * 60;
                    const slotEnd = (slot.hour + 1) * 60;
                    
                    // Calculate the height and position within this slot
                    const taskStartInSlot = Math.max(taskStart, slotStart);
                    const taskEndInSlot = Math.min(taskEnd, slotEnd);
                    const duration = taskEndInSlot - taskStartInSlot;
                    const height = (duration / 60) * 60; // 60px per hour
                    const topOffset = ((taskStartInSlot - slotStart) / 60) * 60;
                    
                    // Only render if there's actual duration in this slot
                    if (duration <= 0) return null;
                    
                    return (
                      <div
                        key={task.id}
                        className={`absolute left-2 right-2 ${task.color} p-2 rounded-lg border border-gray-800/10 cursor-pointer transition-all duration-200 hover:scale-[1.02] task-3d glass-3d ${
                          task.completed ? 'opacity-60' : ''
                        }`}
                        style={{
                          top: `${topOffset}px`,
                          height: `${height}px`,
                          minHeight: '40px'
                        }}
                        onClick={() => onTaskEdit(task)}
                      >
                        <div className="flex items-center justify-between h-full">
                          <div className="flex-1 min-w-0">
                            <h4 className={`font-medium text-sm truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                              {task.title}
                            </h4>
                            <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                              <Clock className="w-3 h-3" />
                              <span>{task.startTime} - {task.endTime}</span>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onTaskToggle(task.id);
                            }}
                            className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all duration-200 glass-3d ml-2 flex-shrink-0 ${
                              task.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-400 hover:border-green-400'
                            }`}
                          >
                            {task.completed && <span className="text-xs">✓</span>}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {slotTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <button className="p-1 text-gray-400 hover:text-gray-600 rounded-md">
                        <Plus className="w-4 h-4" />
                      </button>
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

  const renderWeeklyView = () => {
    const startOfWeek = new Date(selectedDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (userProfile.weekStart === 'monday' ? (day === 0 ? -6 : 1) : 0);
    startOfWeek.setDate(diff);

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      weekDays.push(day);
    }

    return (
      <div className="glass-3d rounded-lg p-4">
        <div className="grid grid-cols-8 gap-2 mb-4">
          <div className="text-sm font-medium text-gray-600"></div>
          {weekDays.map((day, index) => (
            <div key={index} className="text-center">
              <div className="text-sm font-medium text-gray-900">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg text-gray-700">
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-8 gap-2">
          <div className="space-y-4">
            {Array.from({ length: 24 }, (_, hour) => (
              <div key={hour} className="h-12 text-sm text-gray-600 flex items-center">
                {userProfile.dateFormat === '12h' 
                  ? (hour === 0 ? '12 AM' 
                     : hour < 12 ? `${hour} AM` 
                     : hour === 12 ? '12 PM' 
                     : `${hour - 12} PM`)
                  : `${hour.toString().padStart(2, '0')}:00`
                }
              </div>
            ))}
          </div>
          
          {weekDays.map((day, dayIndex) => {
            const dayTasks = getTasksForDate(day);
            return (
              <div key={dayIndex} className="space-y-1">
                {Array.from({ length: 24 }, (_, hour) => {
                  const hourTasks = dayTasks.filter(task => {
                    const taskHour = parseInt(task.startTime.split(':')[0]);
                    return taskHour === hour;
                  });

                  return (
                    <div key={hour} className="h-12 border border-gray-200 rounded relative">
                      {hourTasks.map((task) => (
                        <div
                          key={task.id}
                          className={`absolute inset-1 ${task.color} p-1 rounded text-xs cursor-pointer task-3d glass-3d ${
                            task.completed ? 'opacity-60' : ''
                          }`}
                          onClick={() => onTaskEdit(task)}
                        >
                          <div className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    return (
      <div className="glass-3d rounded-lg p-4">
        <UICalendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && onDateChange(date)}
          className="w-full"
        />
        
        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Tasks for {selectedDate.toLocaleDateString()}
          </h3>
          <div className="space-y-2">
            {getTasksForDate(selectedDate).map((task) => (
              <div
                key={task.id}
                className={`${task.color} p-3 rounded-lg border border-gray-800/10 cursor-pointer transition-all duration-200 hover:scale-[1.02] task-3d glass-3d ${
                  task.completed ? 'opacity-60' : ''
                }`}
                onClick={() => onTaskEdit(task)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.startTime} - {task.endTime}</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onTaskToggle(task.id);
                    }}
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 glass-3d ${
                      task.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'border-gray-400 hover:border-green-400'
                    }`}
                  >
                    {task.completed && <span className="text-xs">✓</span>}
                  </button>
                </div>
              </div>
            ))}
          </div>
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
      return renderDailyView();
  }
};

export default CalendarView;
