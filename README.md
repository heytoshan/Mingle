# Mingle - Real-Time Chat Application

Mingle is a professional-grade, full-stack real-time chat application built using the MERN stack (MongoDB, Express, React, Node.js). It features seamless WebSocket communication, background worker processing for message persistence, and a premium modern UI.

## 🚀 Key Features

- **Real-Time Communication**: Instant messaging powered by WebSockets.
- **Group & Private Chats**: Support for both community rooms and direct messages.
- **Secure Authentication**: JWT-based authentication system.
- **Microservice Architecture**: Decoupled client, server, and worker services for scalability.
- **Premium UI/UX**: Built with React, Tailwind CSS, and Framer Motion for smooth animations.

## 📁 Project Structure

```text
/
├── client/           # React frontend (Vite)
├── server/           # Express backend API
│   └── services/     # WebSocket, Worker, and Mock Redis services
├── .gitignore        # Root git exclusions
├── package.json      # Root monorepo configuration
└── README.md         # Project documentation
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Real-Time**: WebSockets (ws).
- **Messaging/Queue**: Redis (Pub/Sub and Persistence).
- **Development**: Concurrently, Nodemon.

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (Local or Atlas)
- Redis instance

### Installation & Setup

1. **Install dependencies for all projects:**
   ```bash
   npm run install-all
   ```

2. **Environment Variables:**
   - Configure `.env` in `server/` with `MONGODB_URI`, `JWT_SECRET`, and `REDIS_URL`.
   - Configure `.env` in `client/` if needed for API URLs.

3. **Run Development Mode:**
   ```bash
   npm run dev
   ```
   *This will concurrently start the backend server, the React frontend, the Redis mock service, and the background worker.*

## 📜 Scripts

- `npm run dev`: Starts all services concurrently.
- `npm run install-all`: Installs dependencies across root, server, and client.
- `npm run build`: Builds both client and server applications.

## 📄 License

MIT
