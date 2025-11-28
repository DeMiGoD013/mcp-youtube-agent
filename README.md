🎥 MCP YouTube Agent
A full-stack Model Context Protocol (MCP) powered YouTube Agent that connects a modern frontend UI with a backend Node.js server to fetch YouTube video metadata, captions, and perform YouTube-related automation tasks.

This project includes:

🔍 Fetch video metadata  
🎞 Get thumbnails  
📝 Fetch captions (auto/manual)  
📺 Get channel info  
🎛 MCP Tools integration  
🌐 Full frontend + backend setup  
⚡ Works without OAuth (using YouTube API key)

This is a template MCP YouTube agent built for extending into full automation such as likes, history, etc.

---

# 🚀 Live Demo (If you deploy later)
Frontend (Vercel)  
🔗 *Add your Vercel URL here*

Backend (Render / Railway / Local)  
🔗 *Add your backend URL here*

---

# 🏗 Project Architecture

```

mcp-youtube-agent-1/
│
├── server/                            # Backend (Node.js + Express)
│   ├── server.js                      # Main API server
│   ├── package.json                   # Backend dependencies
│   ├── .env.example                   # Sample .env file
│   ├── mcp/                           # MCP tools
│   │   ├── getVideoInfo.js            # Tool: fetches metadata
│   │   ├── getCaptions.js             # Tool: fetches captions
│   │   └── index.js                   # Exports all tools
│   └── utils/                         # YouTube helpers, parsers
│
├── frontend/                          # Frontend UI (React or HTML)
│   ├── src/
│   │   ├── App.jsx                    # Main UI logic
│   │   ├── api.js                     # Communicates with backend
│   └── index.html                     # UI layout
│
└── README.md                          # (This file)

```

---

# 🔐 Authentication Setup
Your project uses:

✔ **YOUTUBE_API_KEY** (no OAuth needed)  
✔ Backend reads `.env`  
✔ Frontend calls backend securely

Example `.env`:

```

YOUTUBE_API_KEY=your_key_here
PORT=5000

```

---

# ⚙️ Backend Environment Variables

Set inside `server/.env`:

```

YOUTUBE_API_KEY=xxxxxxxxxxxxxxxxxxxxx
PORT=3001

```

---

# ⚙️ Frontend Environment Variables (If using Vite)
Add inside `frontend/.env`:

```

VITE_API_BASE_URL=[http://localhost:3001](http://localhost:3001)

```

---

# 🧠 MCP Tools Implemented

| MCP Tool             | Description                    |
|----------------------|--------------------------------|
| youtube.videoInfo    | Fetch video metadata           |
| youtube.getCaptions  | Fetch captions (auto/manual)   |
| youtube.search       | Search YouTube videos          |

Tools are located in the `server/mcp/` folder.

---

# ⭐ Current Features (Updated)

### ✅ 1. Video Information Fetching
- Title  
- Description  
- Views  
- Channel details  
- Thumbnail  

### ✅ 2. Captions Fetching
Supports:
- English captions  
- Auto-generated subtitles  

### ✅ 3. Frontend UI
- Input field for video URL / ID  
- Displays full video card  
- Shows metadata + captions  

### ✅ 4. Responsive Layout
✔ Desktop view  
✔ Mobile-friendly layout  

### ✅ 5. Persistent Results
Search results stay until replaced  
No auto-clear issues  

---

# 📱 Responsive UI
✔ Two-column grid on desktop  
✔ Single column on mobile  
✔ Smooth UI transitions  

---

# 🧩 System Flow

```

User
↓
Frontend (React / HTML)
↓  /api/video-info / api/captions
Backend (Node.js + MCP)
↓
YouTube Data API
↓
Backend → Frontend UI Display

````

---

# 🛠 Local Development Guide

## Backend
```bash
cd server
npm install
npm start
````

Runs at:
👉 [http://localhost:5000](http://localhost:3001)

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at:
👉 [http://localhost:5173](http://localhost:5173)

---

# 🧪 Example Commands (Frontend Input)

🔍 Fetch Video Info

```
https://youtu.be/dQw4w9WgXcQ
```

🎬 Captions

```
captions dQw4w9WgXcQ
```

🔎 Search Example

```
search ai videos
```

ℹ Get Metadata

```
info VIDEO_ID
```

---

# 🎯 Assignment Requirements (Checked)

| Requirement                      | Status  |
| -------------------------------- | ------- |
| Build MCP Agent                  | ✅       |
| Integrate external API (YouTube) | ✅       |
| Expose MCP tools                 | ✅       |
| Complete frontend + backend      | ✅       |
| Working demo                     | ⚡ Ready |
| Public GitHub repo               | ✅       |
| Clean UI                         | ✔       |

---

# 🧑‍💻 Author

**Sai Prasad Padmanabha**
MCP Agent Developer
