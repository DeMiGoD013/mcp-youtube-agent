// ---------------------------------------------
// Imports
// ---------------------------------------------
const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const { google } = require("googleapis");   // <-- Added for YouTube Like API
const { getToolDefinitionsForOpenAI, callTool } = require('./mcp/mcpServer');

// ---------------------------------------------
// App Setup
// ---------------------------------------------
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || '*'
  })
);

// ---------------------------------------------
// Health Check
// ---------------------------------------------
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'mcp-youtube-agent-server'
  });
});

// ---------------------------------------------
// /api/chat (MAIN ENDPOINT)
// ---------------------------------------------
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
You are an AI YouTube agent connected to an MCP server.

Your goals:
- Provide helpful, well-structured, clean responses.
- ALWAYS use Markdown formatting (bold, headings, lists).
- Decide when to call youtube_search tool via MCP.
- Give clear recommendations based on returned videos.
- Keep responses short, clean, and readable.
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];

    const tools = getToolDefinitionsForOpenAI();

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

    if (firstMessage.tool_calls && firstMessage.tool_calls.length > 0) {
      const toolMessages = [];

      for (const toolCall of firstMessage.tool_calls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments || '{}');

        const toolResult = await callTool(toolName, toolArgs);

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

// ------------------------------------------------------------
// 📌 NEW: YOUTUBE LIKE ENDPOINT
// ------------------------------------------------------------
function getYouTubeClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    "http://localhost"   // Required for Desktop OAuth flow
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN
  });

  return google.youtube({
    version: "v3",
    auth: oauth2Client
  });
}

app.post("/api/like", async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId)
      return res.status(400).json({ error: "Missing videoId" });

    const youtube = getYouTubeClient();

    await youtube.videos.rate({
      id: videoId,
      rating: "like"
    });

    res.json({ success: true, message: "Video liked successfully!" });
  } catch (err) {
    console.error("Error liking video:", err);
    res.status(500).json({ error: "Failed to like video" });
  }
});

app.get("/api/liked", async (req, res) => {
  try {
    const youtube = getYouTubeClient();

    const response = await youtube.playlistItems.list({
      playlistId: "LL",   // Liked Videos Playlist
      part: ["snippet"],
      maxResults: 20
    });

    const items = response.data.items || [];

    const formatted = items.map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.videoOwnerChannelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    return res.json({ liked: formatted });
  } catch (err) {
    console.error("Error fetching liked videos:", err);
    return res.status(500).json({ error: "Failed to fetch liked videos" });
  }
});


app.get("/api/history", async (req, res) => {
  try {
    const youtube = getYouTubeClient();

    const response = await youtube.playlistItems.list({
      playlistId: "HL",   // Watch History playlist
      part: ["snippet"],
      maxResults: 20
    });

    const items = response.data.items || [];

    const formatted = items.map((item) => ({
      videoId: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails?.medium?.url,
      channelTitle: item.snippet.videoOwnerChannelTitle,
      publishedAt: item.snippet.publishedAt
    }));

    return res.json({ history: formatted });
  } catch (err) {
    console.error("Error fetching watch history:", err);
    return res.status(500).json({ error: "Failed to fetch watch history" });
  }
});


// ---------------------------------------------
// Start Server
// ---------------------------------------------
app.listen(PORT, () => {
  console.log(`MCP YouTube Agent server running on port ${PORT}`);
});
