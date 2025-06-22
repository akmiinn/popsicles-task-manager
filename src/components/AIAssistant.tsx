
import { useState } from 'react';
import { Send, Bot, User, Sparkles, Plus, Edit, Trash2 } from 'lucide-react';
import { Task, ChatMessage } from '../types';
import { supabase } from '../integrations/supabase/client';

interface AIAssistantProps {
  onAddTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  tasks: Task[];
}

const AIAssistant = ({ onAddTask, tasks }: AIAssistantProps) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: 'Hello! I\'m your AI assistant for Popsicles. I can help you manage your tasks, provide productivity tips, and answer questions about time management. You can ask me to:\n\n• Create new tasks by describing them\n• Edit existing tasks\n• Get productivity advice\n• Organize your schedule\n\nHow can I help you today?',
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const parseTaskFromAI = (aiResponse: string): Omit<Task, 'id' | 'completed'> | null => {
    // Enhanced task parsing logic
    const taskKeywords = ['create task', 'add task', 'new task', 'schedule', 'remind me', 'appointment'];
    const hasTaskKeyword = taskKeywords.some(keyword => aiResponse.toLowerCase().includes(keyword));
    
    if (!hasTaskKeyword) return null;

    // Extract task details using regex patterns
    const titleMatch = aiResponse.match(/(?:task|appointment|meeting|reminder):\s*([^\n\.,]+)/i) ||
                      aiResponse.match(/(?:create|add|schedule)\s+(?:a\s+)?(?:task\s+)?(?:for\s+)?(?:to\s+)?([^\n\.,]+)/i);
    
    const timeMatch = aiResponse.match(/(?:at\s+|from\s+)?(\d{1,2}):?(\d{2})?\s*(am|pm)?(?:\s*(?:to|-)\s*(\d{1,2}):?(\d{2})?\s*(am|pm)?)?/i);
    const dateMatch = aiResponse.match(/(?:on\s+|for\s+)?(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|saturday|sunday|\d{1,2}\/\d{1,2}|\d{4}-\d{2}-\d{2})/i);
    
    const title = titleMatch ? titleMatch[1].trim() : 'New Task';
    
    // Default times
    let startTime = '09:00';
    let endTime = '10:00';
    
    if (timeMatch) {
      const hour1 = parseInt(timeMatch[1]);
      const min1 = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      const period1 = timeMatch[3]?.toLowerCase();
      
      let adjustedHour1 = hour1;
      if (period1 === 'pm' && hour1 !== 12) adjustedHour1 += 12;
      if (period1 === 'am' && hour1 === 12) adjustedHour1 = 0;
      
      startTime = `${adjustedHour1.toString().padStart(2, '0')}:${min1.toString().padStart(2, '0')}`;
      
      if (timeMatch[4]) {
        const hour2 = parseInt(timeMatch[4]);
        const min2 = timeMatch[5] ? parseInt(timeMatch[5]) : 0;
        const period2 = timeMatch[6]?.toLowerCase() || period1;
        
        let adjustedHour2 = hour2;
        if (period2 === 'pm' && hour2 !== 12) adjustedHour2 += 12;
        if (period2 === 'am' && hour2 === 12) adjustedHour2 = 0;
        
        endTime = `${adjustedHour2.toString().padStart(2, '0')}:${min2.toString().padStart(2, '0')}`;
      } else {
        // Add 1 hour to start time
        endTime = `${(adjustedHour1 + 1).toString().padStart(2, '0')}:${min1.toString().padStart(2, '0')}`;
      }
    }

    // Date handling
    let taskDate = new Date().toISOString().split('T')[0];
    if (dateMatch) {
      const dateStr = dateMatch[0].toLowerCase();
      if (dateStr.includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        taskDate = tomorrow.toISOString().split('T')[0];
      } else if (dateStr.includes('today')) {
        taskDate = new Date().toISOString().split('T')[0];
      }
      // Add more date parsing logic as needed
    }

    return {
      title,
      description: '',
      startTime,
      endTime,
      date: taskDate,
      priority: 'medium' as 'medium',
      color: 'task-pastel-blue'
    };
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: inputMessage,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Add task context to the message
      const contextualMessage = `Current tasks: ${tasks.length > 0 ? tasks.map(t => `${t.title} (${t.date} ${t.startTime}-${t.endTime})`).join(', ') : 'None'}\n\nUser message: ${currentInput}`;

      const { data, error } = await supabase.functions.invoke('gemini-chat', {
        body: { message: contextualMessage }
      });

      if (error) throw error;

      const aiResponse = data.response || 'Sorry, I could not generate a response.';

      // Check if AI response suggests creating a task
      const suggestedTask = parseTaskFromAI(aiResponse);
      if (suggestedTask) {
        try {
          await onAddTask(suggestedTask);
          const taskCreatedMessage = `\n\n✅ I've created a task: "${suggestedTask.title}" scheduled for ${suggestedTask.date} from ${suggestedTask.startTime} to ${suggestedTask.endTime}.`;
          
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: aiResponse + taskCreatedMessage,
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        } catch (taskError) {
          console.error('Error creating task:', taskError);
          const aiMessage: ChatMessage = {
            id: (Date.now() + 1).toString(),
            content: aiResponse + '\n\n❌ I encountered an error creating the task. Please try again.',
            isUser: false,
            timestamp: new Date(),
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } else {
        const aiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          isUser: false,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: 'Sorry, I encountered an error. Please make sure the Gemini API key is configured in the project settings.',
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
      sendMessage();
    }
  };

  const quickActions = [
    { text: "Create a meeting for tomorrow at 2 PM", icon: Plus },
    { text: "Show me my tasks for today", icon: Edit },
    { text: "Help me organize my schedule", icon: Sparkles },
  ];

  return (
    <div className="flex-1 flex flex-col p-6 animate-fade-in">
      <div className="glass-3d rounded-2xl shadow-xl border border-gray-300 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 animate-slide-in-right">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light text-gray-900">AI Task Assistant</h2>
              <p className="text-sm text-gray-600">Powered by Google Gemini • Smart task management</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-4 border-b border-gray-200 animate-slide-in-right" style={{ animationDelay: '0.1s' }}>
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => setInputMessage(action.text)}
                className="flex items-center gap-2 px-3 py-2 text-xs bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-lg hover:from-purple-200 hover:to-pink-200 transition-all duration-300 hover:scale-105 glass-3d"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <action.icon className="w-3 h-3" />
                {action.text}
              </button>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message, index) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-in-right ${message.isUser ? 'justify-end' : 'justify-start'}`}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              {!message.isUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-[75%] p-4 rounded-2xl glass-3d transition-all duration-300 hover:scale-[1.02] ${
                  message.isUser
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/70 text-gray-800 shadow-md'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                <p className={`text-xs mt-2 ${message.isUser ? 'text-purple-100' : 'text-gray-500'}`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
              {message.isUser && (
                <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 justify-start animate-fade-in">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="max-w-[75%] p-4 rounded-2xl glass-3d bg-white/70 shadow-md">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-6 border-t border-gray-200 animate-slide-in-right" style={{ animationDelay: '0.3s' }}>
          <div className="flex gap-3">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me to create tasks, organize your schedule, or get productivity tips..."
              className="flex-1 px-4 py-3 border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-300 shadow-sm glass-3d text-sm transition-all duration-300 focus:scale-[1.02]"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            Try: "Create a meeting tomorrow at 2 PM" or "Help me organize my tasks"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
