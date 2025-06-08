
import { useState, useEffect } from 'react';
import { Calendar, Search, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import TaskOverlay from '../components/TaskOverlay';
import CalendarView from '../components/CalendarView';
import TaskList from '../components/TaskList';
import Profile from '../components/Profile';
import AIAssistant from '../components/AIAssistant';
import { Task, CalendarViewType, UserProfile } from '../types';

const Index = () => {
  const [currentView, setCurrentView] = useState<CalendarViewType>('daily');
  const [currentPage, setCurrentPage] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showTaskOverlay, setShowTaskOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '',
    bio: 'Product manager passionate about productivity and organization.',
    timezone: 'America/New_York',
    theme: 'light',
    notifications: true,
    language: 'English',
    dateFormat: '12h',
    weekStart: 'monday'
  });

  // Load profile from localStorage on component mount
  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

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
        color: 'bg-pink-200',
        completed: false
      },
      {
        id: '2',
        title: 'Team Meeting',
        description: 'Weekly standup',
        startTime: '10:00',
        endTime: '11:00',
        date: new Date().toISOString().split('T')[0],
        priority: 'medium',
        color: 'bg-blue-200',
        completed: false
      },
      {
        id: '3',
        title: 'Lunch Break',
        description: 'Lunch with colleagues',
        startTime: '12:00',
        endTime: '13:00',
        date: new Date().toISOString().split('T')[0],
        priority: 'low',
        color: 'bg-green-200',
        completed: true
      }
    ];
    setTasks(sampleTasks);
  }, []);

  const addTask = (taskData: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      completed: false
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

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(prev => prev.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleTaskEdit = (task: Task) => {
    setEditingTask(task);
    setShowTaskOverlay(true);
  };

  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setUserProfile(updatedProfile);
    // Save to localStorage
    localStorage.setItem('userProfile', JSON.stringify(updatedProfile));
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
                  className="p-3 hover:bg-gray-100/50 rounded-xl transition-all duration-200 hover:shadow-lg"
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
                  className="p-3 hover:bg-gray-100/50 rounded-xl transition-all duration-200 hover:shadow-lg"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="flex gap-2">
                {(['daily', 'weekly', 'monthly'] as CalendarViewType[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-6 py-3 rounded-xl transition-all duration-200 capitalize shadow-lg hover:shadow-xl ${
                      currentView === view
                        ? 'bg-gradient-to-r from-gray-800 to-gray-900 text-white shadow-xl'
                        : 'bg-white text-gray-600 hover:bg-gray-50'
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
              onTaskEdit={handleTaskEdit}
              onDateChange={setSelectedDate}
              onTaskToggle={toggleTaskCompletion}
            />
          </div>
        );
      case 'tasks':
        return (
          <TaskList
            tasks={filteredTasks}
            onTaskEdit={handleTaskEdit}
            onTaskDelete={deleteTask}
            onTaskToggle={toggleTaskCompletion}
          />
        );
      case 'profile':
        return <Profile profile={userProfile} onProfileUpdate={handleProfileUpdate} />;
      case 'ai':
        return <AIAssistant onAddTask={addTask} tasks={tasks} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onAddTask={() => setShowTaskOverlay(true)}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 px-6 py-4 shadow-lg">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-light text-gray-800 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Popsicles</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 w-64 bg-white/80 backdrop-blur-sm shadow-lg"
                />
              </div>
              {currentPage === 'calendar' && (
                <button
                  onClick={() => setShowTaskOverlay(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
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
