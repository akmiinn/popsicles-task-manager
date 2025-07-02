
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, tasks = [] } = await req.json();
    const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

    if (!geminiApiKey) {
      throw new Error('GEMINI_API_KEY not found');
    }

    // Create a context-aware prompt for task management
    const taskContext = tasks.length > 0 
      ? `Current tasks: ${tasks.map((task: any) => 
          `- ${task.title} (${task.date} ${task.startTime}-${task.endTime}, Priority: ${task.priority})`
        ).join('\n')}`
      : 'No current tasks.';

    const systemPrompt = `You are a smart AI assistant for a task management app called Popsicles. You help users manage their tasks through natural language commands.

Key capabilities:
1. CREATE TASKS: When users say things like "add meeting tomorrow at 2pm" or "schedule workout session", extract:
   - Title (required)
   - Date (default to today if not specified)
   - Start time (required)
   - End time (estimate duration if not given)
   - Priority (low/medium/high - default medium)
   - Description (optional)

2. EDIT TASKS: When users want to modify existing tasks, identify which task they mean and what changes they want.

3. DELETE TASKS: When users want to remove tasks, identify which ones.

4. GENERAL HELP: Provide productivity tips and answer questions.

Current date: ${new Date().toISOString().split('T')[0]}
Current time: ${new Date().toTimeString().split(' ')[0]}

${taskContext}

IMPORTANT RESPONSE FORMAT:
- If the user wants to CREATE a task, respond with: ACTION:CREATE followed by task details in JSON format
- If the user wants to EDIT a task, respond with: ACTION:EDIT followed by task identification and changes in JSON format  
- If the user wants to DELETE a task, respond with: ACTION:DELETE followed by task identification in JSON format
- For general questions, respond normally with helpful advice

Example responses:
For "add meeting tomorrow at 2pm for 1 hour":
ACTION:CREATE
{
  "title": "Meeting",
  "date": "2024-01-16",
  "startTime": "14:00",
  "endTime": "15:00",
  "priority": "medium",
  "description": ""
}

For "change my workout to 6am":
ACTION:EDIT
{
  "taskId": "existing-task-id",
  "changes": {
    "startTime": "06:00",
    "endTime": "07:00"
  }
}

User message: ${message}`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: systemPrompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate response');
    }

    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not generate a response.';

    return new Response(JSON.stringify({ response: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in gemini-chat function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
