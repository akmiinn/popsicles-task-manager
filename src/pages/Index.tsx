
import { useState, useEffect } from 'react';
import { Calendar, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TaskOverlay from '../components/TaskOverlay';
import CalendarView from '../components/CalendarView';
import TaskList from '../components/TaskList';
import Profile from '../components/Profile';
import AIAssistant from '../components/AIAssistant';
import { Task, CalendarViewType } from '../types';

const Index = () => {
  const [currentView, setCurrentView] = useState<CalendarViewType>('daily');
  const [currentPage, setCurrentPage] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskOverlay, setShowTaskOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Sample tasks for demonstration
  useEffect(() => {
    const sampleTasks: Task[] = [
      {
        id: '1',
        title: 'Morning Workout',
        description: 'Gym session',
        startTime: '07:00',
        endTime: '08:30',
        date: new Date().toISOString().split('T')[0],
        priority: 'high',
        color: 'bg-pink-200'
      },
      {
        id: '2',
        title: 'Team Meeting',
        description: 'Weekly standup',
        startTime: '10:00',
        endTime: '11:00',
        date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        color: 'bg-blue-200'
      },
      {
        id: '3',
        title: 'Lunch Break',
        description: 'Lunch with colleagues',
        startTime: '12:00',
        endTime: '13:00',
        date: new Date().toISOString().split('T')[0],
        priority: 'low',
        color: 'bg-green-200'
      }
    ];
    setTasks(sampleTasks);
  }, []);

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString()
    };
    setTasks(prev => [...prev, newTask]);
    setShowTaskOverlay(false);
  };

  const updateTask = (updatedTask: Task) => {
    setTasks(prev => prev.map(task => task.id === updatedTask.id ? updatedTask : task));
    setEditingTask(null);
    setShowTaskOverlay(false);
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(task => task.id !== taskId));
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (currentView === 'daily') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
    } else if (currentView === 'weekly') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    } else if (currentView === 'monthly') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    setSelectedDate(newDate);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'calendar':
        return (
          <div className="flex-1 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-light text-gray-800">
                  {selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                    ...(currentView === 'daily' && { day: 'numeric' })
                  })}
                </h2>
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as CalendarViewType[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-4 py-2 rounded-lg transition-colors capitalize ${
                      currentView === view
                        ? 'bg-gray-800 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {view}
                  </button>
                ))}
              </div>
            </div>
            <CalendarView
              view={currentView}
              selectedDate={selectedDate}
              tasks={filteredTasks}
              onTaskEdit={setEditingTask}
              onDateChange={setSelectedDate}
            />
          </div>
        );
      case 'tasks':
        return (
          <TaskList
            tasks={filteredTasks}
            onTaskEdit={setEditingTask}
            onTaskDelete={deleteTask}
          />
        );
      case 'profile':
        return <Profile />;
      case 'ai':
        return <AIAssistant onAddTask={addTask} tasks={tasks} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onAddTask={() => setShowTaskOverlay(true)}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-light text-gray-800">Popsicles</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 w-64"
                />
              </div>
              {currentPage === 'calendar' && (
                <button
                  onClick={() => setShowTaskOverlay(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              )}
            </div>
          </div>
        </div>

        {renderContent()}
      </div>

      {/* Task Overlay */}
      {showTaskOverlay && (
        <TaskOverlay
          isOpen={showTaskOverlay}
          onClose={() => {
            setShowTaskOverlay(false);
            setEditingTask(null);
          }}
          onSave={editingTask ? updateTask : addTask}
          editingTask={editingTask}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Index;
