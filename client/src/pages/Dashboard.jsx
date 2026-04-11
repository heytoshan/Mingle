import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Hash, Send, Plus, Search, LogOut, Settings, Sun, Moon, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState({ groupsData: [], singleChatData: [] });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);

  useEffect(() => {
    fetchChats();
    const socket = setupWebSocket();
    return () => { socket?.close(); };
  }, []);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat.id);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setupWebSocket = () => {
    const socket = new WebSocket(`ws://localhost:3002`);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "connect", userId: user?.id }));
    };
    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        if (activeChatRef.current && data.message.roomId === activeChatRef.current.id) {
          setMessages((prev) => [...prev, data.message]);
        }
      } else if (data.type === "connectedUsers") {
        setOnlineUsers(data.message);
      }
    };
    setWs(socket);
    return socket;
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/chats");
      setChats(res.data);
    } catch (err) {
      toast.error("Failed to load chats");
    }
  };

  const fetchMessages = async (roomId) => {
    try {
      const res = await axios.get(`/api/chats/${roomId}/messages`);
      setMessages(res.data);
    } catch (err) {
      console.error("Fetch messages error", err);
    }
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN || !activeChat) return;
    ws.send(JSON.stringify({ type: "message", message: inputMessage, roomId: activeChat.id, from: user.id }));
    setMessages((prev) => [...prev, { from: user.id, content: inputMessage }]);
    setInputMessage("");
  };

  const handleJoinChat = (chat) => {
    setActiveChat(chat);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "join", roomId: chat.id }));
    }
  };

  const sidebarBase = "w-72 flex-shrink-0 flex flex-col border-r transition-colors duration-300";
  const sidebarTheme = "bg-white border-gray-200 dark:bg-white/5 dark:border-gray-800/50";

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-DarkIndigo overflow-hidden transition-colors duration-300">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarBase} ${sidebarTheme}`}>
        {/* Header */}
        <div className="p-5 border-b border-gray-200 dark:border-gray-800/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageCircle size={18} className="text-MineBlue" />
            <h1 className="text-lg font-bold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent">
              Mingle
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              title="Toggle Theme"
            >
              {isDark ? <Sun size={15} className="text-MineYellow" /> : <Moon size={15} className="text-MineBlue" />}
            </button>
            <button
              onClick={logout}
              className="p-1.5 rounded-lg text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
              title="Logout"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6">
          {/* Groups */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Groups</span>
              <Plus size={13} className="text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-white" />
            </div>
            {chats.groupsData.length === 0
              ? <p className="text-xs text-gray-400 px-3 py-1">No groups yet</p>
              : chats.groupsData.map((group) => (
                <button key={group.id} onClick={() => handleJoinChat(group)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                    activeChat?.id === group.id
                      ? "bg-MineBlue/10 dark:bg-MineBlue/20 text-MineBlue"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <Hash size={15} className="mr-2.5 flex-shrink-0" />
                  <span className="truncate">{group.name}</span>
                </button>
              ))
            }
          </div>

          {/* Direct Messages */}
          <div>
            <div className="flex items-center justify-between px-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Direct Messages</span>
            </div>
            {chats.singleChatData.length === 0
              ? <p className="text-xs text-gray-400 px-3 py-1">No conversations yet</p>
              : chats.singleChatData.map((dm) => {
                const other = dm.users.find((u) => u.id !== user?.id);
                if (!other) return null;
                const isOnline = onlineUsers.includes(other.id);
                return (
                  <button key={dm.id} onClick={() => handleJoinChat(dm)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                      activeChat?.id === dm.id
                        ? "bg-MineBlue/10 dark:bg-MineBlue/20 text-MineBlue"
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <div className="relative mr-3 flex-shrink-0">
                      <img src={other.avatar} alt="" className="h-7 w-7 rounded-full object-cover" />
                      <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white dark:border-[#0b0c15] ${isOnline ? "bg-green-400" : "bg-gray-300 dark:bg-gray-600"}`} />
                    </div>
                    <span className="truncate">{other.username}</span>
                  </button>
                );
              })
            }
          </div>
        </div>

        {/* User Profile */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800/50 flex items-center gap-3">
          <img src={user?.avatar} alt="" className="h-8 w-8 rounded-full object-cover flex-shrink-0 ring-2 ring-MineBlue/30" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-white flex-shrink-0 transition-colors">
            <Settings size={15} />
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-[#0d0e1b] transition-colors duration-300">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white dark:bg-white/[0.03] border-b border-gray-200 dark:border-gray-800/50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-MineBlue/10 dark:bg-MineBlue/10 p-2 rounded-lg">
                  <Hash size={17} className="text-MineBlue" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                    {activeChat.isGroup
                      ? activeChat.name
                      : activeChat.users.find((u) => u.id !== user?.id)?.username}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activeChat.isGroup ? `${activeChat.users.length} members` : "Direct Message"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Search size={17} className="text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors" />
                <Settings size={17} className="text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-white transition-colors" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {messages.map((msg, idx) => {
                const isMe = msg.from === user?.id;
                return (
                  <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                      isMe
                        ? "bg-MineBlue text-white rounded-br-none shadow-lg shadow-MineBlue/20"
                        : "bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 rounded-bl-none"
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 bg-white dark:bg-transparent border-t border-gray-200 dark:border-gray-800/50 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex items-center gap-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${activeChat.isGroup ? activeChat.name : activeChat.users.find((u) => u.id !== user?.id)?.username || ""}...`}
                  className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white px-5 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-MineBlue transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
                <button type="submit"
                  className="p-3 bg-gradient-to-r from-MineBlue to-MinePink text-white rounded-xl hover:opacity-90 active:scale-95 transition-all flex-shrink-0 shadow-lg shadow-MineBlue/20">
                  <Send size={17} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-MineBlue via-MinePink to-MineYellow p-0.5 rounded-3xl mb-6 shadow-2xl shadow-MineBlue/20">
              <div className="w-full h-full bg-gray-50 dark:bg-DarkIndigo rounded-[22px] flex items-center justify-center">
                <Hash size={34} className="text-MineBlue" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No chat selected</h2>
            <p className="text-gray-500 dark:text-gray-500 max-w-xs text-sm leading-relaxed">
              Select a conversation from the sidebar to start mingling with your friends.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
