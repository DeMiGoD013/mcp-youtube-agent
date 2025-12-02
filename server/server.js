// ---------------------------------------------
// Imports
// ---------------------------------------------
const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const { google } = require("googleapis");
const { getToolDefinitionsForOpenAI, callTool } = require("./mcp/mcpServer");

// ---------------------------------------------
// App Setup
// ---------------------------------------------
const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
  })
);

// ---------------------------------------------
// Health Check
// ---------------------------------------------
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "mcp-youtube-agent-server",
  });
});

// ---------------------------------------------
// CHAT ENDPOINT (MCP + OPENAI)
// ---------------------------------------------
app.post("/api/chat", async (req, res) => {
  try {
    const userMessage = req.body.message;

    if (!userMessage) {
      return res.status(400).json({ error: "Message is required" });
    }

    const model = process.env.OPENAI_MODEL || "gpt-4o-mini";

    const systemPrompt = `
You are an AI YouTube agent connected to an MCP server.
- Provide clean answers.
- Use markdown.
- Trigger YouTube search tool when helpful.
`;

    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userMessage },
    ];

    const tools = getToolDefinitionsForOpenAI();

    const first = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model,
        messages,
        tools,
        tool_choice: "auto",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const firstMsg = first.data.choices[0].message;
    let aggregatedVideos = [];

    if (firstMsg.tool_calls?.length > 0) {
      const toolMessages = [];

      for (const toolCall of firstMsg.tool_calls) {
        const args = JSON.parse(toolCall.function.arguments || "{}");
        const result = await callTool(toolCall.function.name, args);

        if (toolCall.function.name === "youtube_search") {
          aggregatedVideos = result;
        }

        toolMessages.push({
          role: "tool",
          name: toolCall.function.name,
          tool_call_id: toolCall.id,
          content: JSON.stringify(result),
        });
      }

      const second = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model,
          messages: [...messages, firstMsg, ...toolMessages],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      return res.json({
        reply: second.data.choices[0].message.content,
        videos: aggregatedVideos,
      });
    }

    // No tool call → normal reply
    return res.json({
      reply: firstMsg.content,
      videos: [],
    });
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: "Chat processing error" });
  }
});

// ------------------------------------------------------------
// YOUTUBE AUTH CLIENT
// ------------------------------------------------------------
function getYouTubeClient() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.YOUTUBE_CLIENT_ID,
    process.env.YOUTUBE_CLIENT_SECRET,
    "http://localhost"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.YOUTUBE_REFRESH_TOKEN,
  });

  return google.youtube({
    version: "v3",
    auth: oauth2Client,
  });
}

// ------------------------------------------------------------
// ❤️ LIKE VIDEO
// ------------------------------------------------------------
app.post("/api/like", async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) return res.status(400).json({ error: "Missing videoId" });

    const youtube = getYouTubeClient();

    await youtube.videos.rate({
      id: videoId,
      rating: "like",
    });

    res.json({ success: true, message: "Video liked successfully!" });
  } catch (err) {
    console.error("Like error:", err);
    res.status(500).json({ error: "Failed to like video" });
  }
});

// ------------------------------------------------------------
// ❌ UNLIKE VIDEO
// ------------------------------------------------------------
app.post("/api/unlike", async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) return res.status(400).json({ error: "Missing videoId" });

    const youtube = getYouTubeClient();

    await youtube.videos.rate({
      id: videoId,
      rating: "none",
    });

    res.json({ success: true, message: "Like removed successfully!" });
  } catch (err) {
    console.error("Unlike error:", err);
    res.status(500).json({ error: "Failed to unlike video" });
  }
});

// ------------------------------------------------------------
// GET ❤️ LIKED VIDEOS
// ------------------------------------------------------------
app.get("/api/liked", async (req, res) => {
  try {
    const youtube = getYouTubeClient();

    const response = await youtube.playlistItems.list({
      playlistId: "LL",
      part: ["snippet"],
      maxResults: 20,
    });

    const items = response.data.items || [];

    const formatted = items.map((i) => ({
      videoId: i.snippet.resourceId.videoId,
      title: i.snippet.title,
      thumbnail: i.snippet.thumbnails?.medium?.url,
      channelTitle: i.snippet.videoOwnerChannelTitle,
      publishedAt: i.snippet.publishedAt,
    }));

    res.json({ liked: formatted });
  } catch (err) {
    console.error("Liked fetch error:", err);
    res.status(500).json({ error: "Failed to fetch liked videos" });
  }
});

// ------------------------------------------------------------
// GET 🔁 WATCH HISTORY
// ------------------------------------------------------------
app.get("/api/history", async (req, res) => {
  try {
    const youtube = getYouTubeClient();

    const response = await youtube.playlistItems.list({
      playlistId: "HL",
      part: ["snippet"],
      maxResults: 20,
    });

    const items = response.data.items || [];

    const formatted = items.map((i) => ({
      videoId: i.snippet.resourceId.videoId,
      title: i.snippet.title,
      thumbnail: i.snippet.thumbnails?.medium?.url,
      channelTitle: i.snippet.videoOwnerChannelTitle,
      publishedAt: i.snippet.publishedAt,
    }));

    res.json({ history: formatted });
  } catch (err) {
    console.error("History fetch error:", err);
    res.status(500).json({ error: "Failed to fetch watch history" });
  }
});

// ---------------------------------------------
// START SERVER
// ---------------------------------------------
app.listen(PORT, () => {
  console.log(`MCP YouTube Agent server running on port ${PORT}`);
});
