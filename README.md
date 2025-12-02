# 🎥 MCP YouTube Agent — (Full Automation + MCP + OAuth + Netflix UI)

A full-stack **Model Context Protocol (MCP) powered YouTube Agent** with a modern **React frontend**, **Node.js backend**, and **Google OAuth integration**.

This agent intelligently interacts with YouTube using:

✔ YouTube Data API (Search, Metadata)
✔ OAuth2 (Like / Unlike videos + Watch History + Liked List)
✔ MCP Tools (search + metadata)
✔ Clean cinematic UI with Netflix-style design

This project started as a metadata tool but has now grown into a **full YouTube automation assistant**.

---

# 🚀 Live Demo

**Frontend (Vercel):**
🔗 [https://mcp-youtube-agent-rouge.vercel.app/](https://mcp-youtube-agent-rouge.vercel.app/)

**Backend (Render):**
🔗 [https://mcp-youtube-agent.onrender.com/](https://mcp-youtube-agent.onrender.com/)

---

# 🏗 Project Architecture (Updated)

```
mcp-youtube-agent/
│
├── server/                               # Backend (Node.js + Express)
│   ├── server.js                         # REST API + OAuth + MCP integration
│   ├── youtubeClient.js                  # YouTube search wrapper (API Key)
│   ├── services/
│   │     ├── youtubeOAuth.js             # OAuth like/unlike/history/liked
│   ├── mcp/
│   │     ├── tools/
│   │     │     ├── youtube.js            # MCP search tool
│   │     └── mcpServer.js                # MCP tool registry
│   ├── .env.example                      # Credentials template
│   └── package.json
│
├── frontend/
│   ├── src/
│   │    ├── App.jsx                      # Full UI + chat + like/unlike system
│   │    ├── App.css                      # Netflix + glassmorphism UI
│   │    └── main.jsx
│   ├── index.html
│   ├── package.json
│
└── README.md
```

---

# 🔐 Authentication Setup (Updated)

Your project uses **two types of authentication**:

## 1️⃣ YouTube API Key (for search + metadata)

Used by MCP tools inside `youtubeClient.js`.

```
YT_API_KEY=your_key_here
```

## 2️⃣ Google OAuth2 (for likes / unlikes / history / liked videos)

Required for **real** YouTube interactions.

Environment variables:

```
YOUTUBE_CLIENT_ID=xxxxxxxxxxxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=xxxxxxxxxxxx
YOUTUBE_REFRESH_TOKEN=xxxxxxxxxxxx
```

The refresh token is generated using the `getRefreshToken.js` helper script.

---

# ⚙ Backend Environment Variables (Final)

Your `server/.env` looks like:

```
OPENAI_API_KEY=your_key
OPENAI_MODEL=gpt-4o-mini

YT_API_KEY=your_youtube_api_key

YOUTUBE_CLIENT_ID=xxx.apps.googleusercontent.com
YOUTUBE_CLIENT_SECRET=xxxxx
YOUTUBE_REFRESH_TOKEN=xxxxx

PORT=3001
ALLOWED_ORIGIN=https://mcp-youtube-agent-rouge.vercel.app
```

---

# ⚙ Frontend Environment Variables (Vite)

Create `frontend/.env`:

```
VITE_API_BASE_URL=https://mcp-youtube-agent.onrender.com
```

---

# 🧠 MCP Tools Implemented

| Tool                 | Description                           |
| -------------------- | ------------------------------------- |
| youtube.search       | Searches YouTube videos using API key |
| youtube.videoInfo    | Fetches metadata                      |
| youtube.getCaptions  | Fetches captions                      |
| *(More extendable…)* |                                       |

---

# ⭐ Current Features (Updated)

### ✅ 1. **YouTube Search (MCP)**

* Query-based search
* Returns video metadata
* Displays thumbnails, channels, dates

### ✅ 2. **YouTube OAuth Automations**

✔ Like any video
✔ Unlike video
✔ Fetch full **Liked Videos List**
✔ Fetch **Watch History (HL playlist)**
✔ State sync with UI

### ✅ 3. **Smart UI State Management**

✔ Like button turns green (`✔ Liked`)
✔ Clicking again removes like
✔ Automatically syncs when fetching liked videos

### ✅ 4. **Cinematic Netflix-Style UI**

* Black + red theme
* Glassmorphism message bubbles
* Floating message list
* Modern chat interface

### ✅ 5. **Chat with AI (OpenAI)**

* Ask for recommendations
* Ask for learning paths
* AI decides when to call MCP tools

---

# 🧩 System Flow (Updated)

```
User
 ↓
Frontend (React UI)
 ↓  /api/chat            /api/like /api/unlike /api/liked /api/history
Backend (Node.js + OAuth + MCP)
 ↓
YouTube API (Search + OAuth)
 ↓
Response → UI (Videos + Like State)
```

---

# 🛠 Local Development Guide

## Start Backend

```
cd server
npm install
npm start
```

Runs on:
👉 [http://localhost:3001](http://localhost:3001)

## Start Frontend

```
cd frontend
npm install
npm run dev
```

Runs on:
👉 [http://localhost:5173](http://localhost:5173)

---

# 🧪 Example Chat Queries

### 🔍 Searching

```
search AI tools
```

### ❤️ Liked Videos

```
show my liked videos
```

### 👍 Like/Unlike

User presses *Like* → `✔ Liked`
Presses again → unlikes video

### 🎓 Learning queries

```
Recommend me a Kubernetes learning path
```

---

# 🎯 Assignment Requirements (Updated)

| Requirement                       | Status                |
| --------------------------------- | --------------------- |
| MCP Agent                         | ✅                     |
| YouTube API Integration           | ✅                     |
| OAuth automation (likes, history) | ✅                     |
| Frontend UI                       | 🎨 Premium Netflix UI |
| Full-stack architecture           | ✅                     |
| Working deployment                | 🔥 Live               |
| Documentation                     | ✔ Complete            |

---

# 👨‍💻 Author

**Sai Prasad Padmanabha**

