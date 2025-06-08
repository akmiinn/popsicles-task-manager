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
      case 'high': return 'text-red-600 bg-red-50 border-red-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const TaskSection = ({ title, tasks: sectionTasks }: { title: string; tasks: Task[] }) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="space-y-3">
        {sectionTasks.map(task => (
          <div
            key={task.id}
            className={`${task.color} p-4 rounded-xl border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 glass-effect ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => onTaskToggle(task.id)}
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    task.completed 
                      ? 'bg-green-500 border-green-500 text-white' 
                      : 'border-gray-300 hover:border-green-400'
                  }`}
                >
                  {task.completed && <Check className="w-4 h-4" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {task.title}
                    </h4>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize border ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  {task.description && (
                    <p className={`text-sm mb-2 ${task.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                      {task.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{task.startTime} - {task.endTime}</span>
                    </div>
                    <span>{new Date(task.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onTaskEdit(task)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onTaskDelete(task.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {sectionTasks.length === 0 && (
          <div className="text-center py-8 text-gray-600">
            <p>No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Task Summary */}
        <div className="glass-effect rounded-2xl shadow-xl border border-gray-300 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-light text-gray-900">Tasks</h2>
              <p className="text-gray-700">Manage and track your tasks</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300">
              <div className="text-3xl font-bold text-gray-900">{tasks.length}</div>
              <div className="text-sm text-gray-700">Total</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300">
              <div className="text-3xl font-bold text-gray-900">{completedTasks.length}</div>
              <div className="text-sm text-gray-700">Completed</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl border border-gray-300">
              <div className="text-3xl font-bold text-gray-900">{upcomingTasks.length}</div>
              <div className="text-sm text-gray-700">Upcoming</div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
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
