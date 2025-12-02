import "./App.css";
import React, { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001";

function App() {
  const [messages, setMessages] = useState([
    {
      from: "agent",
      text: "Hi! I am your YouTube MCP agent. Ask me for video recommendations or learning paths on any topic.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Stores user like states
  const [likedVideos, setLikedVideos] = useState({});

  // -------------------------------------------------------------
  // ❤️ Fetch Liked Videos
  // -------------------------------------------------------------
  const fetchLiked = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/liked`);
      const data = await res.json();

      // Mark UI liked states based on fetched list
      const likedMap = {};
      (data.liked || []).forEach((v) => {
        likedMap[v.videoId] = true;
      });
      setLikedVideos(likedMap);

      const likedMsg = {
        from: "agent",
        text: "Here are your liked videos ❤️",
        videos: data.liked || [],
      };

      setMessages((prev) => [...prev, likedMsg]);
    } catch (err) {
      alert("Failed to fetch liked videos");
    }
  };

  // -------------------------------------------------------------
  // 💬 Chat
  // -------------------------------------------------------------
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { from: "user", text: trimmed }]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();

      const agentMsg = {
        from: "agent",
        text: data.reply,
        videos: data.videos || [],
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: "agent", text: `Error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 👍 TOGGLE LIKE / UNLIKE VIDEO
  // -------------------------------------------------------------
  const toggleLike = async (videoId, isLiked) => {
    try {
      const endpoint = isLiked ? "/api/unlike" : "/api/like";

      await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId }),
      });

      // Update UI state
      setLikedVideos((prev) => ({
        ...prev,
        [videoId]: !isLiked,
      }));
    } catch (err) {
      alert("Failed to update like status.");
    }
  };

  // -------------------------------------------------------------
  // Enter to Send
  // -------------------------------------------------------------
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>MCP YouTube Agent</h1>
        <p>Ask for YouTube video recommendations powered by MCP tools.</p>

        <button className="liked-btn" onClick={fetchLiked}>
          ❤️ Show My Liked Videos
        </button>
      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.map((msg, i) => (
            <MessageBubble
              key={i}
              message={msg}
              toggleLike={toggleLike}
              likedVideos={likedVideos}
            />
          ))}
        </div>

        <div className="input-bar">
          <textarea
            rows={2}
            placeholder="Ask: 'Recommend a learning path for Kubernetes'..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button onClick={handleSend} disabled={loading}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </div>
      </main>
    </div>
  );
}

// -------------------------------------------------------------
// 💬 Message Bubble Component
// -------------------------------------------------------------
function MessageBubble({ message, toggleLike, likedVideos }) {
  const isUser = message.from === "user";

  return (
    <div className={`message-row ${isUser ? "user" : "agent"}`}>
      <div className="message-bubble">
        <div className="message-from">{isUser ? "You" : "Agent"}</div>
        <div className="message-text">{message.text}</div>

        {message.videos?.length > 0 && (
          <VideoList
            videos={message.videos}
            toggleLike={toggleLike}
            likedVideos={likedVideos}
          />
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 🎞 Video List Component (with TRUE Like/Unlike)
// -------------------------------------------------------------
function VideoList({ videos, toggleLike, likedVideos }) {
  return (
    <div className="video-list">
      <h4>Videos</h4>
      <div className="video-grid">
        {videos.map((v) => {
          const isLiked = likedVideos[v.videoId];

          return (
            <div className="video-card" key={v.videoId}>
              <a
                href={`https://www.youtube.com/watch?v=${v.videoId}`}
                target="_blank"
                rel="noreferrer"
              >
                <img src={v.thumbnail} alt={v.title} />
              </a>

              <div className="video-info">
                <a
                  href={`https://www.youtube.com/watch?v=${v.videoId}`}
                  target="_blank"
                  rel="noreferrer"
                  className="video-title"
                >
                  {v.title}
                </a>

                <div className="video-channel">{v.channelTitle}</div>
                <div className="video-date">
                  {new Date(v.publishedAt).toLocaleDateString()}
                </div>

                <button
                  className={isLiked ? "liked-btn-green" : "like-btn"}
                  onClick={() => toggleLike(v.videoId, isLiked)}
                >
                  {isLiked ? "✔ Liked" : "👍 Like"}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default App;
