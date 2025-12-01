import "./App.css";
import React, { useState } from 'react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

function App() {
  const [messages, setMessages] = useState([
    {
      from: 'agent',
      text: 'Hi! I am your YouTube MCP agent. Ask me for video recommendations or learning paths on any topic.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // ---------------------------------------------
  // 🔁 Fetch Watch History
  // ---------------------------------------------
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/history`);
      const data = await res.json();

      const historyMsg = {
        from: 'agent',
        text: "Here are your previously watched videos 🔁",
        videos: data.history || []
      };

      setMessages((prev) => [...prev, historyMsg]);
    } catch (err) {
      alert("Failed to fetch watch history");
    }
  };

  // ---------------------------------------------
  // ❤️ Fetch Liked Videos
  // ---------------------------------------------

  const fetchLiked = async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/liked`);
    const data = await res.json();

    const likedMsg = {
      from: "agent",
      text: "Here are your liked videos ❤️",
      videos: data.liked || []
    };

    setMessages((prev) => [...prev, likedMsg]);
  } catch (err) {
    alert("Failed to fetch liked videos");
  }
};

  // ---------------------------------------------
  // 💬 Chat
  // ---------------------------------------------
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    const newMessages = [...messages, { from: 'user', text: trimmed }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });

      const data = await response.json();
      const agentMsg = {
        from: 'agent',
        text: data.reply,
        videos: data.videos || []
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { from: 'agent', text: `Oops, something went wrong: ${err.message}` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------------
  // 👍 Like Video
  // ---------------------------------------------
  const likeVideo = async (videoId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId })
      });
      const data = await res.json();
      alert(data.message || "Liked!");
    } catch (err) {
      alert("Failed to like video.");
    }
  };

  // ---------------------------------------------
  // Enter Key
  // ---------------------------------------------
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="app-root">
      <header className="app-header">
        <h1>MCP YouTube Agent</h1>
        <p>Ask for YouTube video recommendations powered by MCP tools.</p>

        {/* 🔁 Show Watch History Button */}
        <button className="history-btn" onClick={fetchHistory}>
          🔁 Show My Watch History
        </button>

        <button className="liked-btn" onClick={fetchLiked}>
          ❤️ Show My Liked Videos
        </button>

      </header>

      <main className="chat-container">
        <div className="messages">
          {messages.map((msg, index) => (
            <MessageBubble key={index} message={msg} likeVideo={likeVideo} />
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
            {loading ? 'Thinking...' : 'Send'}
          </button>
        </div>
      </main>
    </div>
  );
}

function MessageBubble({ message, likeVideo }) {
  const isUser = message.from === 'user';

  return (
    <div className={`message-row ${isUser ? 'user' : 'agent'}`}>
      <div className="message-bubble">
        <div className="message-from">{isUser ? 'You' : 'Agent'}</div>
        <div className="message-text">{message.text}</div>

        {message.videos && message.videos.length > 0 && (
          <VideoList videos={message.videos} likeVideo={likeVideo} />
        )}
      </div>
    </div>
  );
}

function VideoList({ videos, likeVideo }) {
  return (
    <div className="video-list">
      <h4>Videos</h4>
      <div className="video-grid">
        {videos.map((video) => (
          <div className="video-card" key={video.videoId}>
            {video.thumbnail && (
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noreferrer"
              >
                <img src={video.thumbnail} alt={video.title} />
              </a>
            )}

            <div className="video-info">
              <a
                href={`https://www.youtube.com/watch?v=${video.videoId}`}
                target="_blank"
                rel="noreferrer"
                className="video-title"
              >
                {video.title}
              </a>

              <div className="video-channel">{video.channelTitle}</div>
              <div className="video-date">
                {new Date(video.publishedAt).toLocaleDateString()}
              </div>

              {/* 👍 Like button */}
              <button
                className="like-btn"
                onClick={() => likeVideo(video.videoId)}
              >
                👍 Like
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
