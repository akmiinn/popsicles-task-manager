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
    const lowerMessage = message.toLowerCase();
    
    // Check for specific dates (MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD)
    const specificDatePatterns = [
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/,
      /(\d{1,2})-(\d{1,2})-(\d{4})/,
    ];
    
    for (const pattern of specificDatePatterns) {
      const match = message.match(pattern);
      if (match) {
        let year, month, day;
        if (pattern.source.includes('(\\d{4})')) {
          year = parseInt(match[1]);
          month = parseInt(match[2]) - 1;
          day = parseInt(match[3]);
        } else {
          month = parseInt(match[1]) - 1;
          day = parseInt(match[2]);
          year = match[3] ? parseInt(match[3]) : today.getFullYear();
        }
        const parsedDate = new Date(year, month, day);
        return parsedDate.toISOString().split('T')[0];
      }
    }
    
    // Check for day names with better logic
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const currentDay = today.getDay();
    
    for (let i = 0; i < dayNames.length; i++) {
      if (lowerMessage.includes(dayNames[i])) {
        const targetDay = new Date(today);
        let daysUntilTarget = (i - currentDay + 7) % 7;
        
        // If it's the same day, check for "coming", "this", or "next"
        if (daysUntilTarget === 0) {
          if (lowerMessage.includes('coming') || lowerMessage.includes('this') || lowerMessage.includes('next')) {
            daysUntilTarget = 7; // Next week
          } else {
            daysUntilTarget = 0; // Today
          }
        }
        
        // Handle "coming [day]" - should be next occurrence
        if (lowerMessage.includes('coming')) {
          if (daysUntilTarget === 0) daysUntilTarget = 7;
        }
        
        // Handle "next [day]"
        if (lowerMessage.includes('next')) {
          daysUntilTarget = daysUntilTarget === 0 ? 7 : daysUntilTarget + 7;
        }
        
        targetDay.setDate(today.getDate() + daysUntilTarget);
        return targetDay.toISOString().split('T')[0];
      }
    }
    
    // Check for relative dates
    if (lowerMessage.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    } else if (lowerMessage.includes('today')) {
      return today.toISOString().split('T')[0];
    } else if (lowerMessage.includes('day after tomorrow')) {
      const dayAfter = new Date(today);
      dayAfter.setDate(today.getDate() + 2);
      return dayAfter.toISOString().split('T')[0];
    } else if (lowerMessage.includes('next week')) {
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return nextWeek.toISOString().split('T')[0];
    }
    
    const relativeMatch = lowerMessage.match(/in (\d+) days?/);
    if (relativeMatch) {
      const daysToAdd = parseInt(relativeMatch[1]);
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + daysToAdd);
      return futureDate.toISOString().split('T')[0];
    }
    
    const weekMatch = lowerMessage.match(/in (\d+) weeks?/);
    if (weekMatch) {
      const weeksToAdd = parseInt(weekMatch[1]);
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + (weeksToAdd * 7));
      return futureDate.toISOString().split('T')[0];
    }
    
    return today.toISOString().split('T')[0]; // Default to today
  };

  const parseTaskFromMessage = (message: string): Omit<Task, 'id'> | null => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('create') || lowerMessage.includes('add') || lowerMessage.includes('schedule') || lowerMessage.includes('book') || lowerMessage.includes('plan')) {
      // Enhanced time parsing
      const timePatterns = [
        /(\d{1,2}):(\d{2})\s*(am|pm)/i,        // 10:30 am
        /(\d{1,2})\s*(am|pm)/i,                // 10 am
        /(\d{1,2}):(\d{2})/,                   // 14:30 (24h format)
        /at\s+(\d{1,2}):?(\d{0,2})\s*(am|pm)?/i, // at 10pm, at 10:30
        /(\d{1,2})\s*o'?clock/i,               // 10 o'clock
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
          if (!period && hour < 8) hour += 12; // Assume PM for times before 8 without AM/PM
          
          startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          const endHour = hour + 1;
          endTime = `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          break;
        }
      }

      // Enhanced task name extraction
      let title = 'New Task';
      
      // Look for quoted text first
      const quotedMatch = message.match(/"([^"]+)"/);
      if (quotedMatch) {
        title = quotedMatch[1];
      } else {
        // Enhanced keyword matching
        const taskKeywords = {
          'meeting': 'Meeting',
          'workout': 'Workout',
          'exercise': 'Exercise',
          'gym': 'Gym Session',
          'lunch': 'Lunch',
          'dinner': 'Dinner',
          'breakfast': 'Breakfast',
          'call': 'Phone Call',
          'appointment': 'Appointment',
          'study': 'Study Session',
          'work': 'Work Session',
          'presentation': 'Presentation',
          'conference': 'Conference',
          'interview': 'Interview',
          'doctor': 'Doctor Appointment',
          'dentist': 'Dentist Appointment',
          'shopping': 'Shopping',
          'grocery': 'Grocery Shopping',
          'class': 'Class',
          'lesson': 'Lesson',
          'review': 'Review Session',
          'break': 'Break',
          'walk': 'Walk',
          'run': 'Running',
          'bike': 'Biking',
        };

        for (const [keyword, taskTitle] of Object.entries(taskKeywords)) {
          if (lowerMessage.includes(keyword)) {
            title = taskTitle;
            
            // Look for additional context around the keyword
            const contextMatch = message.match(new RegExp(`(\\w+\\s+)?${keyword}(\\s+\\w+)?`, 'i'));
            if (contextMatch && contextMatch[0].trim().length > keyword.length) {
              title = contextMatch[0].trim();
            }
            break;
          }
        }

        // If no keyword found, try to extract from create/add/schedule patterns
        if (title === 'New Task') {
          const patterns = [
            /(?:create|add|schedule|book|plan|set up)\s+(?:a\s+)?([^,\s]+(?:\s+[^,\s]+)*?)(?:\s+(?:at|on|for|tomorrow|today|monday|tuesday|wednesday|thursday|friday|saturday|sunday)|\s*$)/i,
          ];

          for (const pattern of patterns) {
            const match = message.match(pattern);
            if (match && match[1] && match[1].trim()) {
              title = match[1].trim();
              break;
            }
          }
        }
      }

      // Capitalize first letter
      title = title.charAt(0).toUpperCase() + title.slice(1);

      const date = parseDate(message);

      // Cycle through pastel colors
      const pastelColors = [
        'bg-pink-200',
        'bg-blue-200', 
        'bg-green-200',
        'bg-yellow-200',
        'bg-purple-200',
        'bg-indigo-200',
        'bg-red-200',
        'bg-orange-200'
      ];
      const randomColor = pastelColors[Math.floor(Math.random() * pastelColors.length)];

      return {
        title,
        description: `Created via AI assistant`,
        startTime,
        endTime,
        date,
        priority: 'medium',
        color: randomColor,
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

      // Enhanced task creation detection
      if (lowerInput.includes('create') || lowerInput.includes('add') || lowerInput.includes('schedule') || 
          lowerInput.includes('book') || lowerInput.includes('plan') || lowerInput.includes('set up')) {
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
            response = `Perfect! I've created "${newTask.title}" for ${new Date(newTask.date).toLocaleDateString()} from ${newTask.startTime} to ${newTask.endTime}. The task has been added to your calendar.`;
          }
        } else {
          response = 'I\'d be happy to help you create a task! Please provide more details like the task name, date, and time. For example: "Create a team meeting tomorrow at 2pm", "Schedule workout on Friday at 6am", or "Add dentist appointment on 12/25 at 3pm"';
        }
      } else if (lowerInput.includes('today') && (lowerInput.includes('task') || lowerInput.includes('schedule'))) {
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

• Creating tasks: "Create a meeting tomorrow at 3pm", "Schedule workout on Friday at 6am"
• Specific dates: "Add doctor appointment on 12/25 at 2pm", "Book lunch on Monday at 1pm"
• Various time formats: "Plan review session at 2:30pm", "Set up call at 14:00"
• Checking your schedule: "Show me my tasks for today"
• Managing conflicts: I'll automatically detect and suggest solutions

What would you like me to help you with?`;
      } else {
        response = 'I understand you want to manage your tasks and schedule. You can ask me to create tasks with specific dates and times, check your schedule, or help resolve conflicts. Try saying something like:\n\n• "Create a workout session on Friday at 6am"\n• "Schedule meeting tomorrow at 2:30pm"\n• "Add doctor appointment on 12/25 at 3pm"\n• "Show me my tasks for today"';
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
      <div className="glass-3d border-b border-gray-800/20 p-4 shadow-lg">
        <h2 className="text-lg font-medium text-gray-900">AI Assistant</h2>
        <p className="text-xs text-gray-600 mt-1">Ask me to create tasks, manage your schedule, or resolve conflicts</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[calc(100vh-200px)]">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-2xl ${message.isUser ? 'flex-row-reverse' : 'flex-row'} gap-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 glass-3d ${
                message.isUser 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-gray-100 text-gray-900'
              }`}>
                {message.isUser ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}
              </div>
              <div className={`rounded-xl p-3 glass-3d max-w-md ${
                message.isUser 
                  ? 'bg-gray-900 text-white' 
                  : 'bg-white text-gray-900'
              }`}>
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
                <div className={`flex items-center gap-1 mt-1 text-xs ${
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
            <div className="flex gap-2 max-w-2xl">
              <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-900 flex items-center justify-center flex-shrink-0 glass-3d">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white glass-3d rounded-xl p-3">
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

      <div className="glass-3d border-t border-gray-800/20 p-4 shadow-lg">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={conflictingSuggestion ? "Please respond with 1, 2, or 3..." : "Type your message... (e.g., 'Create a meeting coming Wednesday at 7pm')"}
            className="flex-1 px-4 py-3 border border-gray-800/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 glass-3d text-sm"
            disabled={isLoading}
          />
          <button
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed glass-3d"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
