
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
      <div className="glass-3d rounded-2xl p-6 h-[700px] overflow-y-auto animate-fade-in">
        <div className="relative">
          {timeSlots.map((slot) => {
            const slotTasks = dayTasks.filter(task => {
              const taskStart = timeToMinutes(task.startTime);
              const taskEnd = timeToMinutes(task.endTime);
              const slotStart = slot.hour * 60;
              const slotEnd = (slot.hour + 1) * 60;
              
              return taskStart < slotEnd && taskEnd > slotStart;
            });

            return (
              <div key={slot.time} className="flex border-b border-gray-200/30 min-h-[70px] relative hover:bg-gray-50/30 transition-all duration-300">
                <div className="w-24 flex-shrink-0 py-3 text-sm text-gray-600 font-medium border-r border-gray-200/30">
                  {userProfile.dateFormat === '12h' 
                    ? (slot.hour === 0 ? '12:00 AM' 
                       : slot.hour < 12 ? `${slot.hour}:00 AM` 
                       : slot.hour === 12 ? '12:00 PM' 
                       : `${slot.hour - 12}:00 PM`)
                    : slot.time
                  }
                </div>
                <div className="flex-1 relative px-2">
                  {slotTasks.map((task) => {
                    const taskStart = timeToMinutes(task.startTime);
                    const taskEnd = timeToMinutes(task.endTime);
                    const slotStart = slot.hour * 60;
                    const slotEnd = (slot.hour + 1) * 60;
                    
                    // Calculate the portion of the task that overlaps with this slot
                    const overlapStart = Math.max(taskStart, slotStart);
                    const overlapEnd = Math.min(taskEnd, slotEnd);
                    const overlapDuration = overlapEnd - overlapStart;
                    
                    if (overlapDuration <= 0) return null;
                    
                    // Calculate position and height for continuous display
                    const height = (overlapDuration / 60) * 70; // 70px per hour
                    const topOffset = ((overlapStart - slotStart) / 60) * 70;
                    
                    // Only show the task content in the first slot it appears
                    const isFirstSlot = taskStart >= slotStart && taskStart < slotEnd;
                    
                    return (
                      <div
                        key={task.id}
                        className={`absolute left-2 right-2 ${task.color} rounded-lg border border-gray-800/10 cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg task-3d glass-3d animate-scale-in ${
                          task.completed ? 'opacity-60' : ''
                        }`}
                        style={{
                          top: `${topOffset}px`,
                          height: `${height}px`,
                          minHeight: '40px',
                          zIndex: 10
                        }}
                        onClick={() => onTaskEdit(task)}
                      >
                        {isFirstSlot && (
                          <div className="p-3 h-full flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-semibold text-sm truncate ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                                {task.title}
                              </h4>
                              <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                                <Clock className="w-3 h-3" />
                                <span>{task.startTime} - {task.endTime}</span>
                              </div>
                              {task.description && (
                                <p className="text-xs text-gray-500 mt-1 truncate">{task.description}</p>
                              )}
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskToggle(task.id);
                              }}
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-300 glass-3d ml-2 flex-shrink-0 hover:scale-110 ${
                                task.completed 
                                  ? 'bg-green-500 border-green-500 text-white shadow-lg' 
                                  : 'border-gray-400 hover:border-green-400 hover:bg-green-50'
                              }`}
                            >
                              {task.completed && <span className="text-xs">✓</span>}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  
                  {slotTasks.length === 0 && (
                    <div className="h-full flex items-center justify-center opacity-0 hover:opacity-100 transition-all duration-300">
                      <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100/50 transition-all duration-200">
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

    const timeSlots = [];
    for (let hour = 6; hour <= 22; hour++) {
      timeSlots.push(hour);
    }

    return (
      <div className="glass-3d rounded-2xl p-6 h-[700px] overflow-hidden animate-fade-in">
        {/* Week Header */}
        <div className="grid grid-cols-8 gap-2 mb-6">
          <div className="p-3"></div>
          {weekDays.map((day, index) => {
            const isToday = day.toDateString() === new Date().toDateString();
            const dayTasks = getTasksForDate(day);
            return (
              <div 
                key={index} 
                className={`text-center p-4 rounded-xl transition-all duration-300 hover:scale-105 cursor-pointer glass-3d animate-slide-in-right ${
                  isToday ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200' : 'hover:bg-gray-50/50'
                }`}
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => {
                  onDateChange(day);
                  onViewChange('daily');
                }}
              >
                <div className={`text-sm font-semibold ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className={`text-2xl font-bold mt-1 ${isToday ? 'text-blue-800' : 'text-gray-800'}`}>
                  {day.getDate()}
                </div>
                {dayTasks.length > 0 && (
                  <div className="flex justify-center mt-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Week Grid */}
        <div className="overflow-y-auto h-[500px] rounded-xl border border-gray-200/50">
          <div className="grid grid-cols-8 gap-0 min-h-full">
            {/* Time column */}
            <div className="border-r border-gray-200/50 bg-gray-50/30">
              {timeSlots.map((hour) => (
                <div key={hour} className="h-16 flex items-center justify-center text-xs text-gray-600 font-medium border-b border-gray-200/30">
                  {userProfile.dateFormat === '12h' 
                    ? (hour === 0 ? '12 AM' 
                       : hour < 12 ? `${hour} AM` 
                       : hour === 12 ? '12 PM' 
                       : `${hour - 12} PM`)
                    : `${hour}:00`
                  }
                </div>
              ))}
            </div>

            {/* Day columns */}
            {weekDays.map((day, dayIndex) => {
              const dayTasks = getTasksForDate(day);
              return (
                <div key={dayIndex} className="border-r border-gray-200/50 relative">
                  {timeSlots.map((hour) => (
                    <div key={hour} className="h-16 border-b border-gray-200/30 relative hover:bg-blue-50/30 transition-colors duration-200">
                      {dayTasks
                        .filter(task => {
                          const taskStart = timeToMinutes(task.startTime);
                          const taskEnd = timeToMinutes(task.endTime);
                          const slotStart = hour * 60;
                          const slotEnd = (hour + 1) * 60;
                          return taskStart < slotEnd && taskEnd > slotStart;
                        })
                        .map((task) => {
                          const taskStart = timeToMinutes(task.startTime);
                          const isFirstSlot = taskStart >= hour * 60 && taskStart < (hour + 1) * 60;
                          
                          if (!isFirstSlot) return null;
                          
                          const taskDuration = timeToMinutes(task.endTime) - taskStart;
                          const height = Math.max((taskDuration / 60) * 64, 40);
                          
                          return (
                            <div
                              key={task.id}
                              className={`absolute left-1 right-1 ${task.color} p-2 rounded-lg text-xs cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg task-3d glass-3d animate-scale-in z-10 ${
                                task.completed ? 'opacity-60' : ''
                              }`}
                              style={{
                                height: `${height}px`,
                                top: '2px'
                              }}
                              onClick={() => onTaskEdit(task)}
                            >
                              <div className={`font-semibold truncate ${task.completed ? 'line-through' : ''}`}>
                                {task.title}
                              </div>
                              <div className="text-xs text-gray-600 mt-1">
                                {task.startTime}
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
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
      <div className="glass-3d rounded-2xl p-6 h-[700px] animate-fade-in">
        <div className="h-full flex flex-col">
          <UICalendar
            mode="single"
            selected={selectedDate}
            onSelect={handleDateSelect}
            className="w-full flex-1 rounded-xl"
            classNames={{
              months: "flex w-full flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0 flex-1",
              month: "space-y-4 w-full flex flex-col flex-1",
              table: "w-full border-collapse space-y-1 flex-1",
              head_row: "flex",
              head_cell: "text-gray-600 rounded-lg w-full font-semibold text-sm flex-1 p-3",
              row: "flex w-full mt-2",
              cell: "relative p-1 text-center text-sm focus-within:relative focus-within:z-20 flex-1 h-32 rounded-lg hover:bg-gray-50/50 transition-all duration-300",
              day: "h-full w-full p-0 font-normal aria-selected:opacity-100 hover:bg-blue-50/50 hover:scale-105 focus:bg-blue-50 focus:text-blue-800 rounded-lg flex flex-col justify-start items-start transition-all duration-300 glass-3d"
            }}
            components={{
              DayContent: ({ date }) => {
                const dayTasks = getTasksForDate(date);
                const isToday = date.toDateString() === new Date().toDateString();
                return (
                  <div className={`w-full h-full p-2 flex flex-col cursor-pointer rounded-lg transition-all duration-300 hover:shadow-lg ${
                    isToday ? 'bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-blue-300' : ''
                  }`}>
                    <div className={`text-lg font-bold mb-2 ${isToday ? 'text-blue-800' : 'text-gray-800'}`}>
                      {date.getDate()}
                    </div>
                    <div className="flex-1 w-full space-y-1 overflow-hidden">
                      {dayTasks.slice(0, 3).map((task, index) => (
                        <div
                          key={task.id}
                          className={`${task.color} text-xs p-1.5 rounded-md truncate transition-all duration-300 hover:scale-105 animate-slide-in-right ${
                            task.completed ? 'opacity-60 line-through' : ''
                          }`}
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="font-medium truncate">{task.title}</div>
                          <div className="text-xs text-gray-600">{task.startTime}</div>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500 font-medium bg-gray-100 p-1 rounded-md animate-pulse">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                      {dayTasks.length > 0 && (
                        <div className="flex justify-center mt-1">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
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
