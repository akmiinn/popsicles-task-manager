
import { Edit2, Trash2, Clock } from 'lucide-react';
import { Task } from '../types';

interface TaskListProps {
  tasks: Task[];
  onTaskEdit: (task: Task) => void;
  onTaskDelete: (taskId: string) => void;
}

const TaskList = ({ tasks, onTaskEdit, onTaskDelete }: TaskListProps) => {
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingTasks = tasks
    .filter(task => task.date >= today)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.date !== b.date) {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  const pastTasks = tasks
    .filter(task => task.date < today)
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (a.date !== b.date) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const TaskSection = ({ title, tasks: sectionTasks }: { title: string; tasks: Task[] }) => (
    <div className="mb-8">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
      <div className="space-y-3">
        {sectionTasks.map(task => (
          <div
            key={task.id}
            className={`${task.color} p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium text-gray-800">{task.title}</h4>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                )}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{task.startTime} - {task.endTime}</span>
                  </div>
                  <span>{new Date(task.date).toLocaleDateString()}</span>
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
          <div className="text-center py-8 text-gray-500">
            <p>No tasks found</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 p-6">
      <div className="max-w-4xl mx-auto">
        <TaskSection title="Upcoming Tasks" tasks={upcomingTasks} />
        <TaskSection title="Past Tasks" tasks={pastTasks} />
      </div>
    </div>
  );
};

export default TaskList;
