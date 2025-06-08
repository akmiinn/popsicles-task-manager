
import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Clock } from 'lucide-react';
import { ChatMessage, Task } from '../types';

interface AIAssistantProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  tasks: Task[];
}

const AIAssistant = ({ onAddTask, tasks }: AIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant. I can help you create tasks, manage your schedule, and resolve conflicts. Try saying "Create a meeting tomorrow at 7pm" or "Show me my tasks for today".',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseTaskFromMessage = (message: string): Omit<Task, 'id'> | null => {
    const lowerMessage = message.toLowerCase();
    
    // Simple parsing for demonstration
    if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('schedule')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Extract time
      const timeMatch = message.match(/(\d{1,2}):?(\d{0,2})\s*(am|pm)/i);
      let startTime = '10:00';
      let endTime = '11:00';
      
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        const period = timeMatch[3].toLowerCase();
        
        if (period === 'pm' && hour !== 12) hour += 12;
        if (period === 'am' && hour === 12) hour = 0;
        
        startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endHour = hour + 1;
        endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      }

      // Extract task name
      let title = 'New Task';
      if (lowerMessage.includes('meeting')) title = 'Meeting';
      else if (lowerMessage.includes('workout')) title = 'Workout';
      else if (lowerMessage.includes('lunch')) title = 'Lunch';
      else if (lowerMessage.includes('call')) title = 'Phone Call';

      // Determine date
      let date = new Date().toISOString().split('T')[0];
      if (lowerMessage.includes('tomorrow')) {
        date = tomorrow.toISOString().split('T')[0];
      } else if (lowerMessage.includes('today')) {
        date = new Date().toISOString().split('T')[0];
      }

      return {
        title,
        description: `Created via AI assistant`,
        startTime,
        endTime,
        date,
        priority: 'medium',
        color: 'bg-purple-200'
      };
    }
    
    return null;
  };

  const checkForConflicts = (newTask: Omit<Task, 'id'>): Task[] => {
    return tasks.filter(task => {
      if (task.date !== newTask.date) return false;
      
      const taskStart = task.startTime;
      const taskEnd = task.endTime;
      const newStart = newTask.startTime;
      const newEnd = newTask.endTime;
      
      return (
        (newStart >= taskStart && newStart < taskEnd) ||
        (newEnd > taskStart && newEnd <= taskEnd) ||
        (newStart <= taskStart && newEnd >= taskEnd)
      );
    });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI processing
    setTimeout(() => {
      let response = '';
      const lowerInput = inputMessage.toLowerCase();

      if (lowerInput.includes('create') || lowerInput.includes('add') || lowerInput.includes('schedule')) {
        const newTask = parseTaskFromMessage(inputMessage);
        if (newTask) {
          const conflicts = checkForConflicts(newTask);
          
          if (conflicts.length > 0) {
            response = `I found a conflict with "${conflicts[0].title}" at ${conflicts[0].startTime}-${conflicts[0].endTime}. Would you like me to:
            
1. Schedule the new task at a different time?
2. Move the existing task?
3. Proceed anyway with overlapping tasks?

Please let me know your preference and I'll help resolve this conflict.`;
          } else {
            onAddTask(newTask);
            response = `Great! I've created "${newTask.title}" for ${newTask.date} from ${newTask.startTime} to ${newTask.endTime}. The task has been added to your calendar.`;
          }
        } else {
          response = 'I\'d be happy to help you create a task! Please provide more details like the task name, date, and time. For example: "Create a team meeting tomorrow at 2pm"';
        }
      } else if (lowerInput.includes('today') && lowerInput.includes('task')) {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(task => task.date === today);
        
        if (todayTasks.length > 0) {
          response = `Here are your tasks for today:\n\n${todayTasks.map(task => 
            `• ${task.title} (${task.startTime}-${task.endTime})`
          ).join('\n')}`;
        } else {
          response = 'You don\'t have any tasks scheduled for today. Would you like me to help you add some?';
        }
      } else if (lowerInput.includes('help')) {
        response = `I can help you with:

• Creating tasks: "Create a meeting tomorrow at 3pm"
• Checking your schedule: "Show me my tasks for today"
• Managing conflicts: I'll automatically detect and suggest solutions
• Rescheduling: "Move my 2pm meeting to 4pm"

What would you like me to help you with?`;
      } else {
        response = 'I understand you want to manage your tasks and schedule. You can ask me to create tasks, check your schedule, or help resolve conflicts. Try saying something like "Create a workout session tomorrow at 6am" or "Show me my tasks for today".';
      }

      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="bg-white border-b border-gray-200 p-4">
        <h2 className="text-xl font-light text-gray-800">AI Assistant</h2>
        <p className="text-sm text-gray-600 mt-1">Ask me to create tasks, manage your schedule, or resolve conflicts</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-3xl ${message.isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.isUser ? 'bg-gray-800' : 'bg-blue-100'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4 text-white" />
                ) : (
                  <Bot className="w-4 h-4 text-blue-600" />
                )}
              </div>
              <div className={`rounded-xl p-4 ${
                message.isUser 
                  ? 'bg-gray-800 text-white' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  message.isUser ? 'text-gray-300' : 'text-gray-500'
                }`}>
                  <Clock className="w-3 h-3" />
                  <span>{message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex gap-3 max-w-3xl">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-blue-600" />
              </div>
              <div className="bg-gray-100 rounded-xl p-4">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (e.g., 'Create a meeting tomorrow at 7pm')"
            className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
