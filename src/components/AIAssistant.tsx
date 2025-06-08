
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
      content: 'Hello! I\'m your AI assistant. I can help you create tasks, manage your schedule, and resolve conflicts. Try saying "Create a meeting tomorrow at 7pm" or "Create workout on Friday at 6am".',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingTask, setPendingTask] = useState<Omit<Task, 'id'> | null>(null);
  const [conflictingSuggestion, setConflictingSuggestion] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseDate = (message: string): string => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    const lowerMessage = message.toLowerCase();
    
    // Check for specific days
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = today.getDay();
    
    for (let i = 0; i < dayNames.length; i++) {
      if (lowerMessage.includes(dayNames[i])) {
        const targetDay = new Date(today);
        const daysUntilTarget = (i - currentDay + 7) % 7;
        if (daysUntilTarget === 0 && !lowerMessage.includes('today')) {
          targetDay.setDate(today.getDate() + 7); // Next week
        } else {
          targetDay.setDate(today.getDate() + daysUntilTarget);
        }
        return targetDay.toISOString().split('T')[0];
      }
    }
    
    // Check for relative dates
    if (lowerMessage.includes('tomorrow')) {
      return tomorrow.toISOString().split('T')[0];
    } else if (lowerMessage.includes('today')) {
      return today.toISOString().split('T')[0];
    } else if (lowerMessage.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }
    
    // Check for specific date patterns (MM/DD, DD/MM, etc.)
    const datePatterns = [
      /(\d{1,2})\/(\d{1,2})/,  // MM/DD or DD/MM
      /(\d{1,2})-(\d{1,2})/,   // MM-DD or DD-MM
    ];
    
    for (const pattern of datePatterns) {
      const match = message.match(pattern);
      if (match) {
        const month = parseInt(match[1]) - 1; // JS months are 0-indexed
        const day = parseInt(match[2]);
        const year = today.getFullYear();
        const parsedDate = new Date(year, month, day);
        
        // If the date is in the past, assume next year
        if (parsedDate < today) {
          parsedDate.setFullYear(year + 1);
        }
        
        return parsedDate.toISOString().split('T')[0];
      }
    }
    
    return today.toISOString().split('T')[0]; // Default to today
  };

  const parseTaskFromMessage = (message: string): Omit<Task, 'id'> | null => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('schedule')) {
      // Extract time
      const timePatterns = [
        /(\d{1,2}):?(\d{0,2})\s*(am|pm)/i,
        /(\d{1,2})\s*(am|pm)/i,
        /(\d{1,2}):(\d{2})/
      ];
      
      let startTime = '10:00';
      let endTime = '11:00';
      
      for (const pattern of timePatterns) {
        const timeMatch = message.match(pattern);
        if (timeMatch) {
          let hour = parseInt(timeMatch[1]);
          const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
          const period = timeMatch[3]?.toLowerCase();
          
          if (period === 'pm' && hour !== 12) hour += 12;
          if (period === 'am' && hour === 12) hour = 0;
          
          startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = hour + 1;
          endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          break;
        }
      }

      // Extract task name
      let title = 'New Task';
      const taskKeywords = {
        'meeting': 'Meeting',
        'workout': 'Workout',
        'gym': 'Gym Session',
        'lunch': 'Lunch',
        'dinner': 'Dinner',
        'call': 'Phone Call',
        'appointment': 'Appointment',
        'study': 'Study Session',
        'work': 'Work Session'
      };

      for (const [keyword, taskTitle] of Object.entries(taskKeywords)) {
        if (lowerMessage.includes(keyword)) {
          title = taskTitle;
          break;
        }
      }

      // Extract custom title from quotes or after "create"
      const titlePatterns = [
        /"([^"]+)"/,  // Text in quotes
        /create\s+([^,\s]+(?:\s+[^,\s]+)*)/i,  // Text after "create"
      ];

      for (const pattern of titlePatterns) {
        const match = message.match(pattern);
        if (match && match[1].trim() && !['a', 'an', 'the'].includes(match[1].trim().toLowerCase())) {
          title = match[1].trim();
          break;
        }
      }

      const date = parseDate(message);

      return {
        title,
        description: `Created via AI assistant`,
        startTime,
        endTime,
        date,
        priority: 'medium',
        color: 'bg-purple-200',
        completed: false
      };
    }
    
    return null;
  };

  const checkForConflicts = (newTask: Omit<Task, 'id'>): Task[] => {
    return tasks.filter(task => {
      if (task.date !== newTask.date || task.completed) return false;
      
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

  const suggestAlternativeTime = (newTask: Omit<Task, 'id'>, conflicts: Task[]): string => {
    const conflictEnd = conflicts[0].endTime;
    const [hour, minute] = conflictEnd.split(':').map(Number);
    const newStartHour = hour + (minute > 0 ? 1 : 0);
    const newEndHour = newStartHour + 1;
    
    return `${newStartHour.toString().padStart(2, '0')}:00 - ${newEndHour.toString().padStart(2, '0')}:00`;
  };

  const handleConflictResolution = (choice: string) => {
    if (!pendingTask) return;

    let response = '';
    
    if (choice === '1') {
      // Schedule at different time
      const conflicts = checkForConflicts(pendingTask);
      const suggestedTime = suggestAlternativeTime(pendingTask, conflicts);
      const [newStart, newEnd] = suggestedTime.split(' - ');
      
      const updatedTask = {
        ...pendingTask,
        startTime: newStart,
        endTime: newEnd
      };
      
      onAddTask(updatedTask);
      response = `Perfect! I've rescheduled "${pendingTask.title}" to ${suggestedTime} on ${pendingTask.date} to avoid the conflict.`;
    } else if (choice === '2') {
      // This would require additional logic to move existing task
      response = `I'll need to implement the functionality to move existing tasks. For now, let me schedule your new task at a different time.`;
      const conflicts = checkForConflicts(pendingTask);
      const suggestedTime = suggestAlternativeTime(pendingTask, conflicts);
      const [newStart, newEnd] = suggestedTime.split(' - ');
      
      const updatedTask = {
        ...pendingTask,
        startTime: newStart,
        endTime: newEnd
      };
      
      onAddTask(updatedTask);
    } else if (choice === '3') {
      // Proceed with overlapping
      onAddTask(pendingTask);
      response = `Understood! I've added "${pendingTask.title}" even though it overlaps with your existing task. You can manage the overlap as needed.`;
    }

    const aiMessage: ChatMessage = {
      id: (Date.now() + 1).toString(),
      content: response,
      isUser: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, aiMessage]);
    setPendingTask(null);
    setConflictingSuggestion(null);
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
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    // Check if this is a response to conflict resolution
    if (conflictingSuggestion && ['1', '2', '3'].includes(currentInput.trim())) {
      handleConflictResolution(currentInput.trim());
      setIsLoading(false);
      return;
    }

    // Simulate AI processing
    setTimeout(() => {
      let response = '';
      const lowerInput = currentInput.toLowerCase();

      if (lowerInput.includes('create') || lowerInput.includes('add') || lowerInput.includes('schedule')) {
        const newTask = parseTaskFromMessage(currentInput);
        if (newTask) {
          const conflicts = checkForConflicts(newTask);
          
          if (conflicts.length > 0) {
            setPendingTask(newTask);
            setConflictingSuggestion('conflict');
            response = `I found a conflict with "${conflicts[0].title}" at ${conflicts[0].startTime}-${conflicts[0].endTime}. Would you like me to:

1. Schedule the new task at a different time?
2. Move the existing task?
3. Proceed anyway with overlapping tasks?

Please respond with 1, 2, or 3.`;
          } else {
            onAddTask(newTask);
            response = `Great! I've created "${newTask.title}" for ${new Date(newTask.date).toLocaleDateString()} from ${newTask.startTime} to ${newTask.endTime}. The task has been added to your calendar.`;
          }
        } else {
          response = 'I\'d be happy to help you create a task! Please provide more details like the task name, date, and time. For example: "Create a team meeting tomorrow at 2pm" or "Schedule workout on Friday at 6am"';
        }
      } else if (lowerInput.includes('today') && lowerInput.includes('task')) {
        const today = new Date().toISOString().split('T')[0];
        const todayTasks = tasks.filter(task => task.date === today && !task.completed);
        
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
• Scheduling for specific days: "Schedule workout on Friday at 6am"
• Checking your schedule: "Show me my tasks for today"
• Managing conflicts: I'll automatically detect and suggest solutions

What would you like me to help you with?`;
      } else {
        response = 'I understand you want to manage your tasks and schedule. You can ask me to create tasks, check your schedule, or help resolve conflicts. Try saying something like "Create a workout session on Friday at 6am" or "Show me my tasks for today".';
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
    <div className="flex-1 flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 p-6 shadow-lg">
        <h2 className="text-2xl font-light text-gray-800">AI Assistant</h2>
        <p className="text-sm text-gray-600 mt-1">Ask me to create tasks, manage your schedule, or resolve conflicts</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 max-h-[calc(100vh-200px)]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-3xl ${message.isUser ? 'flex-row-reverse' : 'flex-row'} gap-3`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
                message.isUser 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                  : 'bg-gradient-to-r from-blue-500 to-blue-600'
              }`}>
                {message.isUser ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div className={`rounded-2xl p-4 shadow-lg backdrop-blur-sm max-w-lg ${
                message.isUser 
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                  : 'bg-white/80 text-gray-800 border border-gray-200/50'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                <div className={`flex items-center gap-1 mt-2 text-xs ${
                  message.isUser ? 'text-purple-100' : 'text-gray-500'
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
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-lg">
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

      <div className="bg-white/80 backdrop-blur-lg border-t border-gray-200/50 p-6 shadow-lg">
        <div className="flex gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={conflictingSuggestion ? "Please respond with 1, 2, or 3..." : "Type your message... (e.g., 'Create a meeting tomorrow at 7pm')"}
            className="flex-1 px-6 py-4 border border-gray-200/50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-lg bg-white/80 backdrop-blur-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
