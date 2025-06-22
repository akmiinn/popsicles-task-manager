
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
  onViewChange,
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
            const slotTasks = dayTasks.filter(task => {
              const taskStart = timeToMinutes(task.startTime);
              const taskEnd = timeToMinutes(task.endTime);
              const slotStart = slot.hour * 60;
              
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
                    
                    const taskStartInSlot = Math.max(taskStart, slotStart);
                    const taskEndInSlot = Math.min(taskEnd, slotEnd);
                    const duration = taskEndInSlot - taskStartInSlot;
                    const height = Math.max((duration / 60) * 60, 40);
                    const topOffset = ((taskStartInSlot - slotStart) / 60) * 60;
                    
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
      <div className="glass-3d rounded-lg p-4 h-[600px] overflow-y-auto">
        <div className="grid grid-cols-7 gap-2 mb-4">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center p-2 border-b border-gray-200">
              <div className="text-sm font-medium text-gray-900">
                {day.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className="text-lg text-gray-700">
                {day.getDate()}
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2 h-96">
          {weekDays.map((day, dayIndex) => {
            const dayTasks = getTasksForDate(day);
            return (
              <div key={dayIndex} className="border border-gray-200 rounded p-2 space-y-1 overflow-y-auto">
                {dayTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`${task.color} p-2 rounded text-xs cursor-pointer task-3d glass-3d ${
                      task.completed ? 'opacity-60' : ''
                    }`}
                    onClick={() => onTaskEdit(task)}
                  >
                    <div className={`font-medium truncate ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-600">
                      {task.startTime}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderMonthlyView = () => {
    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        onDateChange(date);
        onViewChange('daily');
      }
    };

    return (
      <div className="glass-3d rounded-lg p-4 h-[600px]">
        <div className="h-full flex flex-col">
          <UICalendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="w-full flex-1"
            classNames={{
              months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
              month: "space-y-4 w-full flex flex-col flex-1",
              table: "w-full border-collapse space-y-1 flex-1",
              head_row: "flex",
              head_cell: "text-muted-foreground rounded-md w-full font-normal text-[0.8rem] flex-1",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected].day-range-end)]:rounded-r-md first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md flex-1 h-24",
              day: "h-full w-full p-0 font-normal aria-selected:opacity-100 hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground rounded-md flex flex-col justify-start items-start"
            }}
            components={{
              DayContent: ({ date }) => {
                const dayTasks = getTasksForDate(date);
                return (
                  <div className="w-full h-full p-1 flex flex-col">
                    <div className="text-sm font-medium">{date.getDate()}</div>
                    <div className="flex-1 w-full space-y-1 overflow-hidden">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={`${task.color} text-xs p-1 rounded truncate ${
                            task.completed ? 'opacity-60' : ''
                          }`}
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
              }
            }}
          />
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
