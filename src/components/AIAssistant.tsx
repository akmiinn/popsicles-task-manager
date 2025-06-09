
import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Task } from '../types';

interface AIAssistantProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  tasks: Task[];
}

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const AIAssistant = ({ onAddTask, tasks }: AIAssistantProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: "Hi! I'm your AI assistant. I can help you create tasks and manage your schedule. Try saying things like 'Add workout session next Monday at 7 AM' or 'Schedule meeting on June 15th, 2025 at 2 PM'.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getRandomPastelColor = () => {
    const pastelColors = [
      'task-pastel-pink',
      'task-pastel-blue',
      'task-pastel-green',
      'task-pastel-yellow',
      'task-pastel-purple',
      'task-pastel-orange',
      'task-pastel-indigo',
      'task-pastel-teal'
    ];
    return pastelColors[Math.floor(Math.random() * pastelColors.length)];
  };

  const parseDate = (input: string): string => {
    const today = new Date();
    const inputLower = input.toLowerCase();

    // Handle "next week [day]" or "coming [day]"
    if (inputLower.includes('next week') || inputLower.includes('coming')) {
      const dayMatch = inputLower.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
      if (dayMatch) {
        const targetDay = dayMatch[1];
        const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const targetDayIndex = daysOfWeek.indexOf(targetDay);
        
        // Get next occurrence of that day
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7); // Go to next week
        
        // Find the target day in next week
        const daysUntilTarget = (targetDayIndex - nextWeek.getDay() + 7) % 7;
        nextWeek.setDate(nextWeek.getDate() + daysUntilTarget);
        
        return nextWeek.toISOString().split('T')[0];
      }
    }

    // Handle specific dates like "15th June 2025", "June 15th, 2025", "15/6/2025"
    const specificDatePatterns = [
      /(\d{1,2})(st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})(st|nd|rd|th)?,?\s+(\d{4})/i,
      /(\d{1,2})\/(\d{1,2})\/(\d{4})/,
      /(\d{4})-(\d{1,2})-(\d{1,2})/
    ];

    for (const pattern of specificDatePatterns) {
      const match = inputLower.match(pattern);
      if (match) {
        try {
          let day, month, year;
          
          if (pattern === specificDatePatterns[0]) { // "15th June 2025"
            day = parseInt(match[1]);
            month = getMonthNumber(match[3]);
            year = parseInt(match[4]);
          } else if (pattern === specificDatePatterns[1]) { // "June 15th, 2025"
            day = parseInt(match[2]);
            month = getMonthNumber(match[1]);
            year = parseInt(match[4]);
          } else if (pattern === specificDatePatterns[2]) { // "15/6/2025"
            day = parseInt(match[1]);
            month = parseInt(match[2]);
            year = parseInt(match[3]);
          } else if (pattern === specificDatePatterns[3]) { // "2025-6-15"
            year = parseInt(match[1]);
            month = parseInt(match[2]);
            day = parseInt(match[3]);
          }
          
          const date = new Date(year, month - 1, day);
          if (!isNaN(date.getTime())) {
            return date.toISOString().split('T')[0];
          }
        } catch (e) {
          // Continue to next pattern
        }
      }
    }

    // Handle relative days
    if (inputLower.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    
    if (inputLower.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    // Handle this week days
    const dayMatch = inputLower.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
    if (dayMatch) {
      const targetDay = dayMatch[1];
      const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const targetDayIndex = daysOfWeek.indexOf(targetDay);
      
      const daysUntilTarget = (targetDayIndex - today.getDay() + 7) % 7;
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + (daysUntilTarget === 0 ? 7 : daysUntilTarget));
      
      return targetDate.toISOString().split('T')[0];
    }

    // Default to today if no date found
    return today.toISOString().split('T')[0];
  };

  const getMonthNumber = (monthName: string): number => {
    const months = {
      'january': 1, 'february': 2, 'march': 3, 'april': 4,
      'may': 5, 'june': 6, 'july': 7, 'august': 8,
      'september': 9, 'october': 10, 'november': 11, 'december': 12
    };
    return months[monthName.toLowerCase()] || 1;
  };

  const parseTime = (input: string): { startTime: string; endTime: string } => {
    const timeMatch = input.match(/(\d{1,2})\s*(:\d{2})?\s*(am|pm|AM|PM)?/);
    
    if (timeMatch) {
      let hour = parseInt(timeMatch[1]);
      const minutes = timeMatch[2] ? timeMatch[2].substring(1) : '00';
      const period = timeMatch[3] ? timeMatch[3].toLowerCase() : '';
      
      // Convert to 24-hour format
      if (period === 'pm' && hour !== 12) {
        hour += 12;
      } else if (period === 'am' && hour === 12) {
        hour = 0;
      }
      
      const startTime = `${hour.toString().padStart(2, '0')}:${minutes}`;
      const endHour = hour + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${minutes}`;
      
      return { startTime, endTime };
    }
    
    // Default to next available hour
    const now = new Date();
    const nextHour = now.getHours() + 1;
    return {
      startTime: `${nextHour.toString().padStart(2, '0')}:00`,
      endTime: `${(nextHour + 1).toString().padStart(2, '0')}:00`
    };
  };

  const parseTaskFromMessage = (message: string): Omit<Task, 'id'> | null => {
    const lowerMessage = message.toLowerCase();
    
    // Extract task title (remove command words)
    let title = message.replace(/^(add|create|schedule|make|set up|plan)\s+/i, '');
    title = title.replace(/\s+(on|at|for|from|to)\s+.*/i, '');
    
    if (!title.trim()) {
      title = "New Task";
    }

    const date = parseDate(message);
    const { startTime, endTime } = parseTime(message);
    
    // Determine priority based on keywords
    let priority: 'low' | 'medium' | 'high' = 'medium';
    if (lowerMessage.includes('urgent') || lowerMessage.includes('important') || lowerMessage.includes('asap')) {
      priority = 'high';
    } else if (lowerMessage.includes('low priority') || lowerMessage.includes('when possible')) {
      priority = 'low';
    }

    return {
      title: title.trim(),
      description: '',
      startTime,
      endTime,
      date,
      priority,
      color: getRandomPastelColor(),
      completed: false
    };
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Message = {
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
      const task = parseTaskFromMessage(inputMessage);
      
      if (task) {
        onAddTask(task);
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Great! I've created a task "${task.title}" for ${new Date(task.date).toLocaleDateString()} from ${task.startTime} to ${task.endTime}. You can view and edit it in your calendar.`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      } else {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: "I couldn't understand that request. Try something like 'Add workout session next Monday at 7 AM' or 'Schedule meeting on June 15th, 2025 at 2 PM'.",
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);
      }
      
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="flex-1 p-4 animate-fade-in">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="glass-3d rounded-2xl shadow-xl border border-gray-300 flex-1 flex flex-col overflow-hidden animate-scale-in">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center gap-3">
              <Bot className="w-6 h-6 text-gray-700 animate-pulse" />
              <div>
                <h2 className="text-lg font-medium text-gray-900">AI Assistant</h2>
                <p className="text-sm text-gray-600">Your intelligent scheduling companion</p>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex gap-3 animate-slide-up`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-500 hover:scale-110 ${
                  message.isUser ? 'bg-gray-600 text-white' : 'bg-gray-200 text-gray-700'
                }`}>
                  {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`flex-1 p-4 rounded-2xl glass-3d border transition-all duration-500 hover:scale-[1.01] transform-gpu ${
                  message.isUser 
                    ? 'bg-gray-100 border-gray-200 text-gray-900' 
                    : 'bg-gray-50 border-gray-200 text-gray-900'
                }`}>
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="flex-1 p-4 rounded-2xl glass-3d border bg-gray-50 border-gray-200">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="p-6 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex gap-3">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message... (e.g., 'Add workout session next Monday at 7 AM')"
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 shadow-sm glass-3d text-sm transition-all duration-500 focus:scale-[1.02] transform-gpu"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="px-6 py-3 rounded-xl transition-all duration-500 shadow-lg hover:shadow-xl text-sm font-medium hover:scale-105 transform-gpu glossy-button-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
