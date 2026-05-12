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
└── README.md         # Project documentation
```

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Framer Motion, Axios.
- **Backend**: Node.js, Express, MongoDB (Mongoose).
- **Real-Time**: WebSockets (ws).
- **Development**: Nodemon, Vite.

## ⚙️ Getting Started

### Prerequisites

- Node.js 18+
- MongoDB instance (Local or Atlas)

### Installation & Setup

1. **Install dependencies:**
   
   In separate terminals, navigate to `client` and `server` folders to install dependencies:
   ```bash
   # For the Frontend
   cd client
   npm install

   # For the Backend
   cd server
   npm install
   ```

2. **Environment Variables:**
   - Configure `.env` in `server/` with `MONGODB_URI` and `JWT_SECRET`.
   - Configure `.env` in `client/` if needed for API URLs.

3. **Run Development Mode:**
   
   Start each folder separately in its own terminal window:

   **Terminal 1 (Backend):**
   ```bash
   cd server
   npm run dev
   ```

   **Terminal 2 (Frontend):**
   ```bash
   cd client
   npm run dev
   ```

## 📜 Available Scripts

### Client (Frontend)
- `npm run dev`: Starts the Vite development server.
- `npm run build`: Builds the production bundle.
- `npm run lint`: Runs ESLint check.
- `npm run preview`: Previews the production build locally.

### Server (Backend)
- `npm run dev`: Starts the backend server using nodemon for automatic restarts.
- `npm run start`: Starts the backend server in production mode using Node.js.

## 📄 License

MIT
