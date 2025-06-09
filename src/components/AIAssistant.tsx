import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Task, ChatMessage } from '../types';

interface AIAssistantProps {
  onAddTask: (task: Omit<Task, 'id'>) => void;
  tasks: Task[];
}

const AIAssistant = ({ onAddTask, tasks }: AIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: "Hi! I'm your AI assistant. I can help you create tasks and manage your schedule. Try saying something like 'Schedule a meeting with John tomorrow at 2 PM' or 'Add workout session on Monday at 7 AM'.",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const parseDate = (text: string): string => {
    const today = new Date();
    const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
    
    // Handle "coming [day]" patterns
    const comingDayMatch = text.match(/coming\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (comingDayMatch) {
      const dayName = comingDayMatch[1].toLowerCase();
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      const targetDay = dayMap[dayName as keyof typeof dayMap];
      
      // Calculate days to add to get to the coming occurrence of that day
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd <= 0) daysToAdd += 7; // If it's today or past, go to next week
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      return targetDate.toISOString().split('T')[0];
    }

    // Handle "next [day]" patterns
    const nextDayMatch = text.match(/next\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (nextDayMatch) {
      const dayName = nextDayMatch[1].toLowerCase();
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      const targetDay = dayMap[dayName as keyof typeof dayMap];
      
      let daysToAdd = targetDay - currentDay + 7; // Always next week
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      return targetDate.toISOString().split('T')[0];
    }

    // Handle specific dates like "15th June 2025", "June 15 2025", "15/6/2025"
    const specificDateMatch = text.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i);
    if (specificDateMatch) {
      const day = parseInt(specificDateMatch[1]);
      const monthName = specificDateMatch[2].toLowerCase();
      const year = parseInt(specificDateMatch[3]);
      
      const monthMap = {
        january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
        july: 6, august: 7, september: 8, october: 9, november: 10, december: 11
      };
      
      const month = monthMap[monthName as keyof typeof monthMap];
      const targetDate = new Date(year, month, day);
      return targetDate.toISOString().split('T')[0];
    }

    // Handle "on [day]" patterns for this week
    const onDayMatch = text.match(/on\s+(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/i);
    if (onDayMatch) {
      const dayName = onDayMatch[1].toLowerCase();
      const dayMap = { sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6 };
      const targetDay = dayMap[dayName as keyof typeof dayMap];
      
      // Calculate days to add - if it's past this week's occurrence, go to next week
      let daysToAdd = targetDay - currentDay;
      if (daysToAdd < 0) daysToAdd += 7;
      
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + daysToAdd);
      return targetDate.toISOString().split('T')[0];
    }

    // Handle relative dates
    if (text.includes('today')) {
      return today.toISOString().split('T')[0];
    }
    
    if (text.includes('tomorrow')) {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return tomorrow.toISOString().split('T')[0];
    }

    // Default to today if no date pattern found
    return today.toISOString().split('T')[0];
  };

  const parseTime = (text: string): { startTime: string; endTime: string } => {
    // Handle time ranges like "2-3 PM", "2:30-4:00 PM"
    const timeRangeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(?:-|to)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (timeRangeMatch) {
      let startHour = parseInt(timeRangeMatch[1]);
      const startMin = timeRangeMatch[2] ? timeRangeMatch[2] : '00';
      let endHour = parseInt(timeRangeMatch[3]);
      const endMin = timeRangeMatch[4] ? timeRangeMatch[4] : '00';
      const period = timeRangeMatch[5].toLowerCase();

      if (period === 'pm' && startHour !== 12) startHour += 12;
      if (period === 'am' && startHour === 12) startHour = 0;
      if (period === 'pm' && endHour !== 12) endHour += 12;
      if (period === 'am' && endHour === 12) endHour = 0;

      return {
        startTime: `${startHour.toString().padStart(2, '0')}:${startMin}`,
        endTime: `${endHour.toString().padStart(2, '0')}:${endMin}`
      };
    }

    // Handle single times like "2 PM", "14:30", "7:00 AM"
    const singleTimeMatch = text.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
    if (singleTimeMatch) {
      let hour = parseInt(singleTimeMatch[1]);
      const min = singleTimeMatch[2] || '00';
      const period = singleTimeMatch[3].toLowerCase();

      if (period === 'pm' && hour !== 12) hour += 12;
      if (period === 'am' && hour === 12) hour = 0;

      const startTime = `${hour.toString().padStart(2, '0')}:${min}`;
      const endHour = hour + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${min}`;

      return { startTime, endTime };
    }

    // Handle 24-hour format
    const time24Match = text.match(/(\d{1,2}):(\d{2})/);
    if (time24Match) {
      const hour = parseInt(time24Match[1]);
      const min = time24Match[2];
      const startTime = `${hour.toString().padStart(2, '0')}:${min}`;
      const endHour = hour + 1;
      const endTime = `${endHour.toString().padStart(2, '0')}:${min}`;

      return { startTime, endTime };
    }

    // Default to 9 AM - 10 AM
    return { startTime: '09:00', endTime: '10:00' };
  };

  const extractTaskFromMessage = (message: string): Omit<Task, 'id'> | null => {
    const lowerMessage = message.toLowerCase();
    
    // Check if this looks like a task creation request
    const taskKeywords = ['schedule', 'add', 'create', 'meeting', 'appointment', 'task', 'reminder', 'book'];
    const hasTaskKeyword = taskKeywords.some(keyword => lowerMessage.includes(keyword));
    
    if (!hasTaskKeyword) {
      return null;
    }

    // Extract title
    let title = message;
    
    // Remove task keywords from title
    taskKeywords.forEach(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      title = title.replace(regex, '').trim();
    });
    
    // Remove time and date patterns from title
    title = title.replace(/\b(?:at|on|from|to)\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/gi, '');
    title = title.replace(/\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '');
    title = title.replace(/\bcoming\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '');
    title = title.replace(/\bnext\s+(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b/gi, '');
    title = title.replace(/\d{1,2}(?:st|nd|rd|th)?\s+(?:january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}/gi, '');
    
    // Clean up title
    title = title.replace(/\s+/g, ' ').trim();
    title = title.replace(/^(a|an|the)\s+/i, '');
    
    if (!title) {
      title = 'New Task';
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

    // Determine color based on task type
    let color = 'bg-blue-100';
    if (lowerMessage.includes('meeting') || lowerMessage.includes('call')) color = 'bg-blue-100';
    else if (lowerMessage.includes('workout') || lowerMessage.includes('exercise') || lowerMessage.includes('gym')) color = 'bg-green-100';
    else if (lowerMessage.includes('meal') || lowerMessage.includes('lunch') || lowerMessage.includes('dinner')) color = 'bg-orange-100';
    else if (lowerMessage.includes('doctor') || lowerMessage.includes('appointment') || lowerMessage.includes('medical')) color = 'bg-red-100';
    else if (lowerMessage.includes('study') || lowerMessage.includes('learn') || lowerMessage.includes('course')) color = 'bg-purple-100';

    return {
      title: title.charAt(0).toUpperCase() + title.slice(1),
      description: `Created from: "${message}"`,
      startTime,
      endTime,
      date,
      priority,
      color,
      completed: false
    };
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Try to extract task from message
    const extractedTask = extractTaskFromMessage(inputValue);
    
    let aiResponse: ChatMessage;
    if (extractedTask) {
      onAddTask(extractedTask);
      aiResponse = {
        id: (Date.now() + 1).toString(),
        content: `Great! I've created a task "${extractedTask.title}" for ${new Date(extractedTask.date).toLocaleDateString()} from ${extractedTask.startTime} to ${extractedTask.endTime}. You can view and edit it in your calendar.`,
        isUser: false,
        timestamp: new Date()
      };
    } else {
      const responses = [
        "I'd be happy to help you create a task! Try telling me something like 'Schedule a meeting with Sarah tomorrow at 3 PM' or 'Add gym session on Monday at 7 AM'.",
        "I can help you manage your schedule. Just tell me what you'd like to do, when, and I'll create a task for you!",
        "To create a task, you can say something like 'Book dentist appointment next Friday at 2 PM' or 'Add team meeting on Wednesday at 10 AM'."
      ];
      
      aiResponse = {
        id: (Date.now() + 1).toString(),
        content: responses[Math.floor(Math.random() * responses.length)],
        isUser: false,
        timestamp: new Date()
      };
    }

    setTimeout(() => {
      setMessages(prev => [...prev, aiResponse]);
    }, 500);

    setInputValue('');
  };

  return (
    <div className="flex-1 p-4">
      <div className="max-w-4xl mx-auto h-full flex flex-col">
        <div className="glass-3d rounded-lg p-4 mb-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">AI Assistant</h2>
          <p className="text-sm text-gray-700">
            Let me help you create and manage your tasks. Just describe what you want to schedule!
          </p>
        </div>

        <div className="flex-1 glass-3d rounded-lg overflow-hidden flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 animate-fade-in ${
                  message.isUser ? 'flex-row-reverse' : ''
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 glass-3d ${
                  message.isUser ? 'bg-gray-900 text-white' : 'bg-white text-gray-700'
                }`}>
                  {message.isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl glass-3d ${
                  message.isUser 
                    ? 'bg-gray-900 text-white' 
                    : 'bg-white text-gray-900'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-300 glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
              />
              <button
                onClick={handleSendMessage}
                className="px-4 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all duration-300 shadow-lg hover:scale-105 glass-3d"
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
