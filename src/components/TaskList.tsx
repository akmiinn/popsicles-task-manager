
import { Edit2, Trash2, Clock, Check } from 'lucide-react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
  onTaskToggle: (taskId: string) => void;
}

const TaskList = ({ tasks, onTaskEdit, onTaskDelete, onTaskToggle }: TaskListProps) => {
  const today = new Date().toISOString().split('T')[0];
  
  const completedTasks = tasks.filter(task => task.completed);
  const upcomingTasks = tasks
    .filter(task => task.date >= today && !task.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.date !== b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  const pastTasks = tasks
    .filter(task => task.date < today && !task.completed)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.date !== b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-700 bg-red-50 border-red-200';
      case 'medium': return 'text-orange-700 bg-orange-50 border-orange-200';
      case 'low': return 'text-green-700 bg-green-50 border-green-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const TaskSection = ({ title, tasks: sectionTasks }: { title: string; tasks: Task[] }) => (
    <div className="mb-6">
      <h3 className="text-base font-medium text-gray-900 mb-3">{title}</h3>
      <div className="space-y-2">
        {sectionTasks.map(task => (
          <div
            key={task.id}
            className={`${task.color} p-3 rounded-lg border border-gray-800/10 task-3d glass-3d ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => onTaskToggle(task.id)}
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 glass-3d ${
                    task.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-400 hover:border-green-400'
                  }`}
                >
                  {task.completed && <Check className="w-3 h-3" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-medium text-sm ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize border glass-3d ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className={`text-xs mb-1 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.startTime} - {task.endTime}</span>
                    </div>
                    <span>{new Date(task.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => onTaskEdit(task)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors glass-3d"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => onTaskDelete(task.id)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors glass-3d"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {sectionTasks.length === 0 && (
          <div className="text-center py-6 text-gray-600">
            <p className="text-sm">No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Task Summary */}
        <div className="glass-3d rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
              <p className="text-sm text-gray-700">Manage and track your tasks</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 glass-3d rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{tasks.length}</div>
              <div className="text-xs text-gray-700">Total</div>
            </div>
            <div className="text-center p-3 glass-3d rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{completedTasks.length}</div>
              <div className="text-xs text-gray-700">Completed</div>
            </div>
            <div className="text-center p-3 glass-3d rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{upcomingTasks.length}</div>
              <div className="text-xs text-gray-700">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <TaskSection title="Upcoming Tasks" tasks={upcomingTasks} />
          {completedTasks.length > 0 && (
            <TaskSection title="Completed Tasks" tasks={completedTasks} />
          )}
          {pastTasks.length > 0 && (
            <TaskSection title="Overdue Tasks" tasks={pastTasks} />
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskList;
