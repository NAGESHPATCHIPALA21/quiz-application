# ⚡ V-Quiz — Real-Time Multiplayer Quiz Platform

[![Stack](https://img.shields.io/badge/Stack-MERN%20%2B%20Socket.io-00f2fe?style=for-the-badge)](https://github.com/NAGESHPATCHIPALA21/quiz-application)
[![Node](https://img.shields.io/badge/Node.js-v18%2B-green?style=for-the-badge&logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)](https://react.dev)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4-black?style=for-the-badge&logo=socketdotio)](https://socket.io)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-brightgreen?style=for-the-badge&logo=mongodb)](https://mongodb.com)

A high-performance, full-stack real-time multiplayer quiz gaming platform built with **React**, **Node.js**, **Express.js**, **MongoDB**, and **Socket.io**.

---

## 🌟 Key Features

### 🎮 Real-Time Multiplayer Engine
- **Instant Room Generation**: Quiz creators generate unique 6-character room codes (e.g., `VQ8492`) for frictionless lobby joining.
- **Synchronized Question Delivery**: Sub-50ms question countdown dispatch synchronized across all connected player sockets simultaneously.
- **Dynamic Speed & Streak Scoring**: Kahoot/Quizizz-style scoring algorithm where players earn maximum points for rapid correct submissions combined with consecutive answer streak bonuses.
- **Live Round Analytics**: Interactive answer distribution charts reveal how many participants picked each option immediately after each round.
- **Victory Podium**: Grand finale 1st, 2nd, and 3rd place animated podium complete with gold/silver/bronze medals, accuracy statistics, and confetti celebrations.

### 🛡️ Authentication & Role-Based Access Control (RBAC)
- **Quiz Creators**: Authorized to author quizzes, manage question banks, adjust time limits & points, host live multiplayer rooms, and oversee round progression.
- **Participants**: Can join rooms with instant room PINs, customize player nicknames and avatars, compete in real-time, or practice in Solo Sprint mode.
- **Stateless JWT Security**: Secure token issuance, password hashing via `bcryptjs`, and protected API routes.

### 🛠️ Creator Studio & Catalog
- **Interactive Question Builder**: Define question prompts, multiple-choice options, answer keys, custom countdown timers (10s, 15s, 20s, 30s), points multipliers, and explanations.
- **Multi-Category Catalog**: Seeded with pre-loaded quizzes across **World History**, **Core Science**, **Pop Culture & Cinema**, and **Full-Stack Engineering**.

### ⚡ Adaptive Storage Architecture
- **Dual-Mode Persistence**: Automatically connects to MongoDB via Mongoose. If MongoDB is not active locally, the engine automatically switches to an optimized in-memory store, ensuring 100% functionality out of the box with zero setup hurdles.

---

## 🏗️ Architecture & Project Structure

```
v-quiz/
├── client/                     # Frontend (React 18 + Vite)
│   ├── src/
│   │   ├── components/         # Navbar, RoomLobby, LiveGame, Podium, Confetti
│   │   ├── context/            # AuthContext, SocketContext
│   │   ├── pages/              # Home, QuizList, QuizCreate, SoloQuiz, LeaderboardPage, MultiplayerRoom
│   │   ├── utils/              # api.js, sound.js (Web Audio API synthesizers)
│   │   ├── App.jsx             # Main Router & view coordinator
│   │   └── index.css           # Modern Cyberpunk game design system
│   ├── index.html
│   ├── package.json
│   └── vite.config.js          # Proxies /api and /socket.io to backend
│
├── server/                     # Backend (Node.js + Express + Socket.io)
│   ├── config/                 # db.js (Adaptive Mongo / in-memory store)
│   ├── middleware/             # auth.js (JWT validation & role checks)
│   ├── models/                 # User.js, Quiz.js, Score.js, store.js
│   ├── routes/                 # authRoutes, quizRoutes, leaderboardRoutes
│   ├── sockets/                # gameSocket.js (Real-time room state manager)
│   ├── seedData.js             # Initial quizzes & demo accounts
│   ├── server.js               # Entry point
│   ├── package.json
│   └── .env
│
├── package.json                # Monorepo management scripts
└── README.md
```

---

## 📡 Socket.io Real-Time Protocol

| Event | Direction | Description |
| :--- | :--- | :--- |
| `host:create-room` | Client ➔ Server | Host creates a room with `quizId` and receives unique room PIN |
| `player:join-room` | Client ➔ Server | Player enters room code, nickname, and avatar |
| `room:players-updated` | Server ➔ Room | Broadcasts updated list of players in the lobby |
| `host:start-game` | Client ➔ Server | Host initiates 3-second synchronized countdown |
| `game:new-question` | Server ➔ Room | Dispatches question prompt and starts synchronized server timer |
| `game:timer-tick` | Server ➔ Room | Broadcasts remaining seconds countdown |
| `player:submit-answer` | Client ➔ Server | Submits choice and computes speed/streak points |
| `game:question-revealed` | Server ➔ Room | Reveals correct answer, distribution bar chart, and current ranks |
| `host:next-question` | Client ➔ Server | Advances to next question or final podium |
| `game:over` | Server ➔ Room | Delivers 1st/2nd/3rd place podium standings and persists scores |

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Node.js** v18+ installed
- *(Optional)* **MongoDB** running locally on port 27017 (falls back to standalone mode automatically)

### 2. Install Dependencies
```bash
# In the root v-quiz directory:
cd server && npm install
cd ../client && npm install
```

### 3. Start Development Servers
**Terminal 1 — Backend Server (Port 5000):**
```bash
cd server
npm start
```

**Terminal 2 — Frontend Client (Port 5173):**
```bash
cd client
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo Credentials

| Role | Username / Email | Password |
| :--- | :--- | :--- |
| **Quiz Creator (Host)** | `creator@vquiz.dev` | `quizmaster123` |
| **Quick Demo Button** | Click **"⚡ Demo Host"** in the top navbar for 1-click login! |

---

## 📤 How to Push to GitHub Repo

To push this complete platform into your GitHub repository `https://github.com/NAGESHPATCHIPALA21/quiz-application`:

```bash
# Inside the v-quiz project root folder:
git init
git add .
git commit -m "feat: upgrade to full-stack V-Quiz real-time multiplayer platform (React, Node, Express, Socket.io, MongoDB)"

# Link to your GitHub repository
git remote add origin https://github.com/NAGESHPATCHIPALA21/quiz-application.git

# Push changes (force push if replacing initial static files)
git branch -M main
git push -u origin main --force
```

---

## 📄 License
MIT License. Created by **Nagesh Patchipala**.
