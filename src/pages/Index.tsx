
import { useState } from 'react';
import { Calendar, Search, Plus, ChevronLeft, ChevronRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TaskOverlay from '../components/TaskOverlay';
import CalendarView from '../components/CalendarView';
import TaskList from '../components/TaskList';
import Profile from '../components/Profile';
import AIAssistant from '../components/AIAssistant';
import { CalendarViewType } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useTasks } from '../hooks/useTasks';
import { useProfile } from '../hooks/useProfile';

const Index = () => {
  const [currentView, setCurrentView] = useState<CalendarViewType>('daily');
  const [currentPage, setCurrentPage] = useState('calendar');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTaskOverlay, setShowTaskOverlay] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingTask, setEditingTask] = useState(null);

  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { tasks, loading: tasksLoading, addTask, updateTask, deleteTask, toggleTaskCompletion } = useTasks();
  const { profile } = useProfile();

  // Redirect to auth if not logged in
  if (!authLoading && !user) {
    navigate('/auth');
    return null;
  }

  // Show loading while checking auth
  if (authLoading || tasksLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleTaskEdit = (task: any) => {
    setEditingTask(task);
    setShowTaskOverlay(true);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const handleTaskSave = async (taskData: any) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, taskData);
      } else {
        await addTask(taskData);
      }
      setShowTaskOverlay(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
          <div className="flex-1 p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigateDate('prev')}
                  className="p-2 glossy-button-3d text-gray-700 rounded-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <h2 className="text-lg font-medium text-gray-900">
                  {selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                    ...(currentView === 'daily' && { day: 'numeric' })
                  })}
                </h2>
                <button
                  onClick={() => navigateDate('next')}
                  className="p-2 glossy-button-3d text-gray-700 rounded-lg transition-all duration-300 hover:scale-110"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              <div className="flex gap-1">
                {(['daily', 'weekly', 'monthly'] as CalendarViewType[]).map((view) => (
                  <button
                    key={view}
                    onClick={() => setCurrentView(view)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 capitalize text-sm hover:scale-105 ${
                      currentView === view
                        ? 'glossy-button-dark'
                        : 'glossy-button-3d'
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
              onViewChange={setCurrentView}
              userProfile={profile}
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
        return <Profile onSignOut={handleSignOut} />;
      case 'ai':
        return <AIAssistant onAddTask={addTask} tasks={tasks} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex">
      <Sidebar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onAddTask={() => setShowTaskOverlay(true)}
      />
      
      <div className="flex-1 flex flex-col">
        {/* Top Navigation */}
        <div className="glass-3d border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-medium text-gray-900">Hybridus</h1>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-400 w-56 glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
                />
              </div>
              {currentPage === 'calendar' && (
                <button
                  onClick={() => setShowTaskOverlay(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 shadow-lg text-sm hover:scale-105 glossy-button-dark"
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
          onSave={handleTaskSave}
          editingTask={editingTask}
          selectedDate={selectedDate}
        />
      )}
    </div>
  );
};

export default Index;
