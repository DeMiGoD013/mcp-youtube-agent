require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');

const {
  getToolDefinitionsForOpenAI,
  callTool
} = require('./mcp/mcpServer');

const app = express();
const PORT = process.env.PORT || 3001;

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

// Middleware
app.use(
  cors({
    origin: ALLOWED_ORIGIN,
    credentials: false
  })
);
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'mcp-youtube-agent-server' });
});

/**
 * /api/chat
 * Body: { message: string }
 * Response: { reply: string, videos: array }
 */
app.post('/api/chat', async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: 'message is required and must be a string' });
    }

    if (!process.env.OPENAI_API_KEY) {
      return res
        .status(500)
        .json({ error: 'OPENAI_API_KEY is not configured on the server' });
    }

    const model = process.env.OPENAI_MODEL || 'gpt-4o-mini';

    const systemPrompt = `
You are an AI YouTube assistant connected to a Model Context Protocol (MCP) server.

The MCP server exposes tools (such as youtube_search) that wrap YouTube's Data API.
Your job:
- Understand the user's request.
- Decide when to call MCP tools.
- Use youtube_search to find videos that match the user's needs.
- Analyze the returned videos and give a clear, helpful recommendation.
- Always include explanations in natural language, not just raw data.
- If the user wants learning paths, order the videos logically from beginner to advanced.
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const tools = getToolDefinitionsForOpenAI();

    // First call: let the model decide if tools are needed
    const firstResponse = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model,
        messages,
        tools,
        tool_choice: 'auto'
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    const firstMessage = firstResponse.data.choices[0].message;

    let aggregatedVideos = [];
    let finalAssistantMessage = firstMessage;

    // Handle tool calls (MCP server)
    if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
      const toolMessages = [];

      for (const toolCall of firstMessage.tool_calls) {
        const toolName = toolCall.function.name;
        let toolArgs = {};

        try {
          toolArgs = JSON.parse(toolCall.function.arguments || '{}');
        } catch (err) {
          console.error('Failed to parse tool arguments', err);
        }

        // Call the MCP tool
        const toolResult = await callTool(toolName, toolArgs);

        // For frontend convenience, capture YouTube results
        if (toolName === 'youtube_search') {
          aggregatedVideos = toolResult;
        }

        toolMessages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolName,
          content: JSON.stringify(toolResult)
        });
      }

      // Second call: provide tool results so the LLM can summarize / reason
      const secondResponse = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model,
          messages: [...messages, firstMessage, ...toolMessages]
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );

      finalAssistantMessage = secondResponse.data.choices[0].message;
    }

    return res.json({
      reply: finalAssistantMessage.content,
      videos: aggregatedVideos
    });
  } catch (err) {
    console.error('Error in /api/chat:', err?.response?.data || err.message || err);
    return res.status(500).json({
      error: 'Internal server error',
      details: err?.response?.data || err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`MCP YouTube Agent server running on http://localhost:${PORT}`);
});
