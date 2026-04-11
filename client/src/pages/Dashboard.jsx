import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { Hash, Send, Plus, Search, LogOut, Settings } from "lucide-react";
import toast from "react-hot-toast";

export default function Dashboard() {
  const { user, logout, token } = useAuth();
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState({ groupsData: [], singleChatData: [] });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null);

  // Keep activeChatRef in sync so WebSocket handler always has latest value
  useEffect(() => {
    activeChatRef.current = activeChat;
  }, [activeChat]);

  useEffect(() => {
    fetchChats();
    const socket = setupWebSocket();
    return () => {
      socket?.close();
    };
  }, []);

  useEffect(() => {
    if (activeChat) fetchMessages(activeChat.id);
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const setupWebSocket = () => {
    const wsProtocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const socket = new WebSocket(`${wsProtocol}//localhost:3002`);

    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "connect", userId: user?.id }));
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "message") {
        const currentChat = activeChatRef.current;
        if (currentChat && data.message.roomId === currentChat.id) {
          setMessages((prev) => [...prev, data.message]);
        }
      } else if (data.type === "connectedUsers") {
        setOnlineUsers(data.message);
      }
    };

    socket.onerror = (err) => {
      console.error("WebSocket error", err);
    };

    setWs(socket);
    return socket;
  };

  const fetchChats = async () => {
    try {
      const res = await axios.get("/api/chats");
      setChats(res.data);
    } catch (err) {
      console.error("Fetch chats error", err);
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

    const msgData = {
      type: "message",
      message: inputMessage,
      roomId: activeChat.id,
      from: user.id,
    };
    ws.send(JSON.stringify(msgData));
    setMessages((prev) => [...prev, { from: user.id, content: inputMessage }]);
    setInputMessage("");
  };

  const handleJoinChat = (chat) => {
    setActiveChat(chat);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "join", roomId: chat.id }));
    }
  };

  return (
    <div className="flex h-screen bg-DarkIndigo overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-white/5 border-r border-gray-800/50 flex flex-col flex-shrink-0">
        {/* Header */}
        <div className="p-5 border-b border-gray-800/50 flex justify-between items-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow bg-clip-text text-transparent">
            Mingle
          </h1>
          <button onClick={logout} title="Logout" className="text-gray-500 hover:text-white transition-colors">
            <LogOut size={18} />
          </button>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-5">
          {/* Groups */}
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Groups</h2>
              <Plus size={14} className="text-gray-500 cursor-pointer hover:text-white" />
            </div>
            <div className="space-y-0.5">
              {chats.groupsData.length === 0 && (
                <p className="text-gray-600 text-xs px-3 py-2">No groups yet</p>
              )}
              {chats.groupsData.map((group) => (
                <button
                  key={group.id}
                  onClick={() => handleJoinChat(group)}
                  className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    activeChat?.id === group.id
                      ? "bg-MineBlue/20 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <Hash size={16} className="mr-2.5 opacity-70 flex-shrink-0" />
                  <span className="font-medium text-sm truncate">{group.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="flex items-center justify-between mb-2 px-2">
              <h2 className="text-gray-500 text-[11px] font-bold uppercase tracking-widest">Direct Messages</h2>
            </div>
            <div className="space-y-0.5">
              {chats.singleChatData.length === 0 && (
                <p className="text-gray-600 text-xs px-3 py-2">No direct messages</p>
              )}
              {chats.singleChatData.map((dm) => {
                const otherUser = dm.users.find((u) => u.id !== user?.id);
                if (!otherUser) return null;
                const isOnline = onlineUsers.includes(otherUser.id);
                return (
                  <button
                    key={dm.id}
                    onClick={() => handleJoinChat(dm)}
                    className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 ${
                      activeChat?.id === dm.id
                        ? "bg-MineBlue/20 text-white"
                        : "text-gray-400 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <div className="relative mr-3 flex-shrink-0">
                      <img src={otherUser.avatar} className="h-8 w-8 rounded-full object-cover border border-gray-700" alt="" />
                      <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#0b0c15] ${isOnline ? "bg-green-400" : "bg-gray-600"}`} />
                    </div>
                    <span className="font-medium text-sm truncate">{otherUser.username}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="p-4 border-t border-gray-800/50 flex items-center space-x-3">
          <img src={user?.avatar} className="h-9 w-9 rounded-full border border-MineBlue/50 object-cover flex-shrink-0" alt="" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
          <button className="text-gray-600 hover:text-white flex-shrink-0 transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeChat ? (
          <>
            {/* Chat Header */}
            <div className="px-6 py-4 bg-white/[0.03] border-b border-gray-800/50 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-3">
                <div className="bg-MineBlue/10 p-2 rounded-lg">
                  <Hash size={18} className="text-MineBlue" />
                </div>
                <div>
                  <h3 className="font-bold text-white leading-tight">
                    {activeChat.isGroup
                      ? activeChat.name
                      : activeChat.users.find((u) => u.id !== user?.id)?.username}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activeChat.isGroup ? `${activeChat.users.length} members` : "Direct Message"}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <search size={18} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
                <Settings size={18} className="text-gray-500 cursor-pointer hover:text-white transition-colors" />
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-3">
              {messages.map((msg, idx) => {
                const isMe = msg.from === user?.id;
                return (
                  <div key={idx} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? "bg-MineBlue text-white rounded-br-none"
                          : "bg-white/5 text-gray-200 border border-white/10 rounded-bl-none"
                      }`}
                    >
                      {msg.content}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-800/50 flex-shrink-0">
              <form onSubmit={sendMessage} className="flex items-center space-x-3">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  placeholder={`Message ${activeChat.isGroup ? activeChat.name : activeChat.users.find((u) => u.id !== user?.id)?.username || ""}...`}
                  className="flex-1 bg-white/5 border border-white/10 text-white px-5 py-3 rounded-xl focus:outline-none focus:border-MineBlue transition-colors placeholder:text-gray-600"
                />
                <button
                  type="submit"
                  className="p-3 bg-gradient-to-r from-MineBlue to-MinePink text-white rounded-xl hover:opacity-90 active:scale-95 transition-all flex-shrink-0"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="h-20 w-20 bg-gradient-to-br from-MineBlue via-MinePink to-MineYellow p-0.5 rounded-3xl mb-6">
              <div className="h-full w-full bg-DarkIndigo rounded-[22px] flex items-center justify-center">
                <Hash size={36} className="text-MineBlue" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No chat selected</h2>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
              Select a conversation from the sidebar to start mingling with your friends and groups.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
