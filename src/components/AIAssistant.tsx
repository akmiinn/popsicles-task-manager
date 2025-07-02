
import { useState } from 'react';
import { Send, Bot, User, Loader } from 'lucide-react';
import { ChatMessage, Task } from '../types';
import { supabase } from '../integrations/supabase/client';

interface AIAssistantProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => Promise<Task>;
  tasks: Task[];
}

const AIAssistant = ({ onAddTask, tasks }: AIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your Assistant. I can help you create, edit, and manage your tasks using natural language. I can also help you avoid schedule conflicts by recommending better arrangements. Try saying something like "add a meeting tomorrow at 2pm" or "schedule workout for Monday morning".',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const checkScheduleConflict = (newTask: { startTime: string; endTime: string; date: string }) => {
    return tasks.filter(task => {
      if (task.date !== newTask.date) return false;
      
      const newStart = new Date(`2000-01-01T${newTask.startTime}:00`);
      const newEnd = new Date(`2000-01-01T${newTask.endTime}:00`);
      const existingStart = new Date(`2000-01-01T${task.startTime}:00`);
      const existingEnd = new Date(`2000-01-01T${task.endTime}:00`);
      
      return (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      );
    });
  };

  const generateConflictRecommendation = (conflictingTasks: Task[], newTask: any) => {
    const conflicts = conflictingTasks.map(task => `${task.title} (${task.startTime}-${task.endTime})`).join(', ');
    return `⚠️ Schedule conflict detected! The time slot ${newTask.startTime}-${newTask.endTime} on ${newTask.date} conflicts with: ${conflicts}. 

I recommend:
1. Moving the new task to an available time slot
2. Shortening the duration of existing tasks
3. Rescheduling to a different day

Would you like me to suggest specific alternative times?`;
  };

  const parseTaskFromResponse = (response: string) => {
    try {
      const lines = response.split('\n');
      const actionLine = lines.find(line => line.startsWith('ACTION:'));
      
      if (!actionLine) return null;

      const action = actionLine.split('ACTION:')[1].trim();
      const jsonStart = response.indexOf('{');
      const jsonEnd = response.lastIndexOf('}') + 1;
      
      if (jsonStart === -1 || jsonEnd === 0) return null;

      const jsonStr = response.substring(jsonStart, jsonEnd);
      const taskData = JSON.parse(jsonStr);

      return { action, taskData };
    } catch (error) {
      console.error('Error parsing task response:', error);
      return null;
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { 
          message: inputMessage,
          tasks: tasks.map(task => ({
            id: task.id,
            title: task.title,
            date: task.date,
            startTime: task.startTime,
            endTime: task.endTime,
            priority: task.priority,
            description: task.description
          }))
        }
      });

      if (error) throw error;

      const response = data.response;
      const parsedTask = parseTaskFromResponse(response);

      let botResponse = response;

      if (parsedTask && parsedTask.action === 'CREATE') {
        try {
          const newTask: Omit<Task, 'id' | 'completed'> = {
            title: parsedTask.taskData.title || 'New Task',
            description: parsedTask.taskData.description || '',
            startTime: parsedTask.taskData.startTime || '09:00',
            endTime: parsedTask.taskData.endTime || '10:00',
            date: parsedTask.taskData.date || new Date().toISOString().split('T')[0],
            priority: parsedTask.taskData.priority || 'medium',
            color: 'task-pastel-blue'
          };

          // Check for schedule conflicts
          const conflictingTasks = checkScheduleConflict(newTask);
          
          if (conflictingTasks.length > 0) {
            botResponse = generateConflictRecommendation(conflictingTasks, newTask);
          } else {
            await onAddTask(newTask);
            botResponse = `Perfect! I've created a new task: "${newTask.title}" scheduled for ${newTask.date} from ${newTask.startTime} to ${newTask.endTime}. Priority: ${newTask.priority}. No schedule conflicts detected! ✅`;
          }
        } catch (error) {
          console.error('Error creating task:', error);
          botResponse = 'I understood you want to create a task, but there was an error saving it. Please try again.';
        }
      } else if (parsedTask && parsedTask.action === 'EDIT') {
        botResponse = 'I understand you want to edit a task. This feature is coming soon! For now, you can edit tasks directly in the calendar view.';
      } else if (parsedTask && parsedTask.action === 'DELETE') {
        botResponse = 'I understand you want to delete a task. This feature is coming soon! For now, you can delete tasks directly in the calendar view.';
      } else {
        // Clean up the response to remove ACTION: lines if they exist
        botResponse = response.replace(/ACTION:.*?\n/g, '').trim();
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please make sure the GEMINI_API_KEY is configured in your Supabase secrets.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 p-6 animate-fade-in">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="glass-3d rounded-2xl p-6 flex flex-col h-full animate-scale-in">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Assistant</h2>
              <p className="text-sm text-gray-600">Your intelligent task management companion</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-4 mb-6 pr-2">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-slide-in-right ${
                  message.isUser ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.isUser 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600' 
                    : 'bg-gradient-to-br from-purple-500 to-pink-600'
                }`}>
                  {message.isUser ? (
                    <User className="w-4 h-4 text-white" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
                <div className={`max-w-[80%] p-4 rounded-2xl shadow-sm ${
                  message.isUser 
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white' 
                    : 'glass-3d'
                }`}>
                  <p className={`text-sm leading-relaxed ${
                    message.isUser ? 'text-white' : 'text-gray-800'
                  }`}>
                    {message.content}
                  </p>
                  <p className={`text-xs mt-2 ${
                    message.isUser ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="glass-3d p-4 rounded-2xl">
                  <div className="flex items-center gap-2">
                    <Loader className="w-4 h-4 animate-spin text-gray-600" />
                    <p className="text-sm text-gray-600">Thinking...</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to create, edit, or manage your tasks..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
