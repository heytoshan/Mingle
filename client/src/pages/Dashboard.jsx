import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { 
  Hash, Send, Plus, Search, LogOut, Settings, Sun, Moon, MessageCircle, 
  Video, Phone, PhoneOff, Mic, MicOff, VideoOff, X, Check, Edit2, Smile, Upload 
} from "lucide-react";
import toast from "react-hot-toast";

// Curated list of premium 3D/flat avatars
const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=150"
];

// Complete Categorised Emoji Database
const EMOJI_CATEGORIES = {
  "Smileys": ["😄", "😃", "😀", "😊", "😉", "😍", "🥰", "😘", "😜", "🤪", "🤔", "😬", "😔", "😢", "😭", "😡", "😎", "🤡", "💩", "😴", "😮", "🥱"],
  "Gestures": ["👍", "👎", "👊", "✊", "✌️", "👌", "✋", "👐", "👏", "🙌", "🤝", "🙏", "💪", "✍️", "🤳", "💅"],
  "Hearts": ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "💔", "❣️", "💕", "💞", "💓", "💗", "💘", "💝"],
  "Activities": ["🚀", "🛸", "🎮", "🎧", "🎤", "🎬", "🎨", "🏆", "🎁", "🎈", "🎉", "🥳", "🍻", "🍕", "🎂", "🌍", "🐱", "🐶", "🔥", "✨", "⭐", "🌟", "💥"]
};

// Helper to convert simple Markdown text and emojis inside the UI
function renderMessageContent(text) {
  if (!text) return "";
  
  // Replace simple shortcodes with actual Emojis
  let formatted = text
    .replace(/:\)/g, "😄")
    .replace(/:\(/g, "😢")
    .replace(/:smile:/g, "😄")
    .replace(/:fire:/g, "🔥")
    .replace(/:heart:/g, "❤️")
    .replace(/<3/g, "❤️")
    .replace(/:joy:/g, "😂")
    .replace(/:rocket:/g, "🚀")
    .replace(/:applause:/g, "👏");

  const parts = [];
  const regex = /(\*\*|__)(.*?)\1|(\*)(.*?)\3|(`)(.*?)\5/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(formatted)) !== null) {
    const matchIndex = match.index;
    
    // Push preceding text
    if (matchIndex > lastIndex) {
      parts.push(formatted.substring(lastIndex, matchIndex));
    }

    if (match[1]) { // Bold: ** or __
      parts.push(<strong key={matchIndex} className="font-extrabold">{match[2]}</strong>);
    } else if (match[3]) { // Italic: *
      parts.push(<em key={matchIndex} className="italic">{match[4]}</em>);
    } else if (match[5]) { // Inline Code: `
      parts.push(
        <code key={matchIndex} className="bg-black/20 dark:bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs text-MinePink border border-white/5">
          {match[6]}
        </code>
      );
    }
    
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < formatted.length) {
    parts.push(formatted.substring(lastIndex));
  }

  return parts.length > 0 ? parts : formatted;
}

export default function Dashboard() {
  const { user, logout, token, setUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Active Chats & Messages
  const [activeChat, setActiveChat] = useState(null);
  const [chats, setChats] = useState({ groupsData: [], singleChatData: [] });
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [ws, setWs] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  // Search & Group Modals & Drawers
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showSettingsDrawer, setShowSettingsDrawer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedGroupUsers, setSelectedGroupUsers] = useState([]);
  const [newGroupName, setNewGroupName] = useState("");

  // Emoji Picker States
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [activeEmojiCategory, setActiveEmojiCategory] = useState("Smileys");

  // User Profile Settings Edit
  const [editFirstName, setEditFirstName] = useState(user?.firstName || "");
  const [editLastName, setEditLastName] = useState(user?.lastName || "");
  const [editUsername, setEditUsername] = useState(user?.username || "");
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || "");

  // Message Editing States
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editingContent, setEditingContent] = useState("");

  // WebRTC Video/Audio Calling States
  const [callState, setCallState] = useState("idle"); // idle, ringing-out, ringing-in, connected
  const [callType, setCallType] = useState("video"); // video, audio
  const [peerId, setPeerId] = useState(null); // ID of person calling or being called
  const [peerUser, setPeerUser] = useState(null); // Object of user being called
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // WebRTC Signaling & Connection Refs
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const pendingIceCandidates = useRef([]);

  const messagesEndRef = useRef(null);
  const activeChatRef = useRef(null);
  const wsRef = useRef(null);
  const callStateRef = useRef("idle");
  const emojiPickerRef = useRef(null);

  useEffect(() => { activeChatRef.current = activeChat; }, [activeChat]);
  useEffect(() => { wsRef.current = ws; }, [ws]);
  useEffect(() => { callStateRef.current = callState; }, [callState]);

  // Handle outside click to close emoji picker
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync edit profile values when user loads
  useEffect(() => {
    if (user) {
      setEditFirstName(user.firstName || "");
      setEditLastName(user.lastName || "");
      setEditUsername(user.username || "");
      setSelectedAvatar(user.avatar || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user?.id) return;

    fetchChats();
    const socket = setupWebSocket();
    return () => { 
      socket?.close();
      cleanupWebRTC();
    };
  }, [user?.id]);

  useEffect(() => {
    if (activeChat) {
      fetchMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 🎵 Web Audio Calling Sound Synth (Ringing and Dialing Tone generator)
  useEffect(() => {
    let stopAudio = null;

    if (callState === "ringing-in") {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playBeep = () => {
        if (audioCtx.state === "suspended") audioCtx.resume();
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(480, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 1.2);
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 1.2);
        osc2.stop(audioCtx.currentTime + 1.2);
      };

      playBeep();
      const interval = setInterval(playBeep, 2000);
      stopAudio = () => {
        clearInterval(interval);
        audioCtx.close();
      };
    } else if (callState === "ringing-out") {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const playDialTone = () => {
        if (audioCtx.state === "suspended") audioCtx.resume();
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.setValueAtTime(350, audioCtx.currentTime);
        osc2.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.04, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.5);
        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc1.start();
        osc2.start();
        osc1.stop(audioCtx.currentTime + 1.5);
        osc2.stop(audioCtx.currentTime + 1.5);
      };

      playDialTone();
      const interval = setInterval(playDialTone, 4000);
      stopAudio = () => {
        clearInterval(interval);
        audioCtx.close();
      };
    }

    return () => {
      if (stopAudio) stopAudio();
    };
  }, [callState]);

  // 🔥 WebRTC Binding: Force re-attach and play on connection state transitions
  useEffect(() => {
    if (callState === "connected") {
      setTimeout(() => {
        if (remoteVideoRef.current && remoteStreamRef.current) {
          remoteVideoRef.current.srcObject = remoteStreamRef.current;
          remoteVideoRef.current.play().catch(e => console.error("Remote video play failed:", e));
        }
        if (localVideoRef.current && localStreamRef.current) {
          localVideoRef.current.srcObject = localStreamRef.current;
          localVideoRef.current.play().catch(e => console.error("Local preview play failed:", e));
        }
      }, 300);
    }
  }, [callState]);

  // Handle incoming remote WebRTC media tracks
  const handleTrackEvent = (e) => {
    if (e.streams && e.streams[0]) {
      remoteStreamRef.current = e.streams[0];
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = e.streams[0];
        remoteVideoRef.current.play().catch(err => console.error("track play error:", err));
      }
    }
  };

  // Initialize WebRTC Peer Connection
  const createPeerConnection = (targetUserId) => {
    if (pcRef.current) return pcRef.current;

    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: "ice-candidate",
          to: targetUserId,
          candidate: event.candidate
        }));
      }
    };

    pc.ontrack = handleTrackEvent;

    pcRef.current = pc;
    return pc;
  };

  const setupWebSocket = () => {
    const wsUrl = import.meta.env.VITE_WS_URL || `ws://localhost:3000`;
    const socket = new WebSocket(wsUrl);
    socket.onopen = () => {
      socket.send(JSON.stringify({ type: "connect", userId: user?.id }));
    };

    socket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      switch (data.type) {
        case "message":
          if (activeChatRef.current && data.message.roomId?.toString() === activeChatRef.current.id?.toString()) {
            setMessages((prev) => [...prev, data.message]);
          }
          break;

        case "edit-message":
          if (activeChatRef.current && data.message.roomId?.toString() === activeChatRef.current.id?.toString()) {
            setMessages((prev) => prev.map(m => m.id?.toString() === data.message.id?.toString() ? { ...m, content: data.message.content } : m));
          }
          break;

        case "connectedUsers":
          setOnlineUsers(data.message);
          break;

        case "new-room":
          // Instantly refresh list of chats in real-time
          fetchChats();
          toast("New chat channel added!", { icon: "💬" });
          break;

        // ── WEBRTC SIGNALING HANDLERS ──
        case "incoming-call": {
          if (callStateRef.current !== "idle") {
            // Send back direct hang-up if busy
            socket.send(JSON.stringify({ type: "hang-up", to: data.from }));
            return;
          }
          
          setPeerId(data.from);
          setCallType(data.callType || "video"); // Dynamically bind incoming call style (video/audio)
          // Resolve Caller Details
          try {
            const userRes = await axios.get("/api/users/search?query=");
            const caller = userRes.data.find(u => u._id === data.from || u.id === data.from);
            setPeerUser(caller || { username: "Someone", avatar: PRESET_AVATARS[0] });
          } catch (err) {
            setPeerUser({ username: "Someone", avatar: PRESET_AVATARS[0] });
          }

          setCallState("ringing-in");
          // Save the SDP offer for acceptance later
          pcRef.current = createPeerConnection(data.from);
          await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.offer));
          break;
        }

        case "call-accepted": {
          if (pcRef.current && callStateRef.current === "ringing-out") {
            await pcRef.current.setRemoteDescription(new RTCSessionDescription(data.answer));
            setCallState("connected");
            
            // Add any queued ICE candidates
            while (pendingIceCandidates.current.length > 0) {
              const candidate = pendingIceCandidates.current.shift();
              await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
            }
          }
          break;
        }

        case "ice-candidate": {
          if (pcRef.current) {
            if (pcRef.current.remoteDescription && pcRef.current.remoteDescription.type) {
              await pcRef.current.addIceCandidate(new RTCIceCandidate(data.candidate));
            } else {
              pendingIceCandidates.current.push(data.candidate);
            }
          }
          break;
        }

        case "call-hung-up":
          cleanupWebRTC();
          toast.error("Call ended / declined.");
          break;
      }
    };

    setWs(socket);
    return socket;
  };

  const cleanupWebRTC = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    remoteStreamRef.current = null;
    pendingIceCandidates.current = [];
    setCallState("idle");
    setPeerId(null);
    setPeerUser(null);
    setIsMuted(false);
    setIsVideoOff(false);
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

  // Keyboard and Message Input Send logic
  const handleSendMessage = (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || !ws || ws.readyState !== WebSocket.OPEN || !activeChat) return;

    ws.send(JSON.stringify({ 
      type: "message", 
      message: inputMessage, 
      roomId: activeChat.id, 
      from: user.id 
    }));
    setInputMessage("");
    setShowEmojiPicker(false);
  };

  // Key Event Handlers for Message Compose
  const handleInputKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    } else if (e.key === "ArrowUp" && !inputMessage && messages.length > 0) {
      e.preventDefault();
      // Find last message sent by ME
      const myMessages = messages.filter(m => m.from === user.id);
      if (myMessages.length > 0) {
        const lastMsg = myMessages[myMessages.length - 1];
        setEditingMessageId(lastMsg.id);
        setEditingContent(lastMsg.content);
      }
    }
  };

  const handleEditMessageSubmit = (e) => {
    e.preventDefault();
    if (!editingContent.trim() || !ws || ws.readyState !== WebSocket.OPEN) return;

    ws.send(JSON.stringify({
      type: "edit-message",
      messageId: editingMessageId,
      content: editingContent,
      roomId: activeChat.id
    }));

    setEditingMessageId(null);
    setEditingContent("");
    toast.success("Message updated");
  };

  const handleJoinChat = (chat) => {
    setActiveChat(chat);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({ type: "join", roomId: chat.id }));
    }
  };

  // User Search Logic
  const handleUserSearch = async (val) => {
    setSearchQuery(val);
    try {
      const res = await axios.get(`/api/users/search?query=${val}`);
      setSearchResults(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  // Start Direct Message (DM) Chatroom
  const handleStartDM = async (targetUser) => {
    const toastId = toast.loading("Opening chat room...");
    try {
      // Find existing direct chat first or create group with size 2
      const res = await axios.get("/api/chats");
      const existingDm = res.data.singleChatData.find(dm => 
        dm.users.some(u => u.id === targetUser._id || u.id === targetUser.id)
      );

      if (existingDm) {
        handleJoinChat(existingDm);
        setShowSearchModal(false);
        toast.dismiss(toastId);
        return;
      }

      // If DM doesn't exist, create it cleanly on the backend!
      const targetUserId = targetUser._id || targetUser.id;
      const createRes = await axios.post("/api/chats", { targetUserId });
      const newDmRoom = createRes.data;

      // Notify the recipient in real-time via WebSockets so their list refreshes
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "create-room",
          roomId: newDmRoom._id || newDmRoom.id,
          userIds: [targetUserId, user.id]
        }));
      }

      await fetchChats();
      
      handleJoinChat({
        id: newDmRoom._id || newDmRoom.id,
        name: "",
        isGroup: false,
        users: [
          { id: user.id, username: user.username, avatar: user.avatar, firstName: user.firstName, lastName: user.lastName },
          { id: targetUser.id || targetUser._id, username: targetUser.username, avatar: targetUser.avatar, firstName: targetUser.firstName, lastName: targetUser.lastName }
        ]
      });

      setShowSearchModal(false);
      toast.success("Chat channel opened! 👋", { id: toastId });
    } catch (err) {
      toast.error("Failed to start direct message", { id: toastId });
    }
  };

  // Local Avatar Image Upload handler from PC
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB restriction
      toast.error("Avatar image must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedAvatar(reader.result); // Save Base64 representation in state
      toast.success("Image loaded! Click save below to apply 🎉");
    };
    reader.readAsDataURL(file);
  };

  const activeChatPartner = useMemo(() => {
    if (!activeChat || activeChat.isGroup) return null;
    return activeChat.users.find((u) => {
      const uId = (u.id || u._id)?.toString();
      const myId = (user?.id || user?._id)?.toString();
      return uId && myId && uId !== myId;
    });
  }, [activeChat, user]);

  // Inject clicked emoji into textarea
  const handleSelectEmoji = (emoji) => {
    setInputMessage(prev => prev + emoji);
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-[#0b0c15] text-gray-900 dark:text-white overflow-hidden transition-colors duration-300">
      
      {/* ── Sidebar ── */}
      <aside className="w-72 flex-shrink-0 flex flex-col border-r bg-white border-gray-200 dark:bg-white/5 dark:border-gray-800/50 transition-colors duration-300">
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
              onClick={() => {
                setShowSearchModal(true);
                handleUserSearch(""); // Fetch all users instantly
              }}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-all"
              title="Search Users & Direct Chats"
            >
              <Search size={15} />
            </button>
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
              <Plus 
                size={13} 
                onClick={() => {
                  setShowGroupModal(true);
                  // Load users to invite instantly
                  axios.get("/api/users/search?query=").then(res => setSearchResults(res.data));
                }}
                className="text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-white" 
              />
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
              <Plus 
                size={13} 
                onClick={() => {
                  setShowSearchModal(true);
                  handleUserSearch(""); // Fetch all users instantly
                }} 
                className="text-gray-400 cursor-pointer hover:text-gray-700 dark:hover:text-white" 
              />
            </div>
            {chats.singleChatData.length === 0
              ? <p className="text-xs text-gray-400 px-3 py-1">No conversations yet</p>
              : chats.singleChatData.map((dm) => {
                const other = dm.users.find((u) => {
                  const uId = (u.id || u._id)?.toString();
                  const myId = (user?.id || user?._id)?.toString();
                  return uId && myId && uId !== myId;
                });
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
          <button 
            onClick={() => setShowSettingsDrawer(true)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-white flex-shrink-0 transition-colors"
          >
            <Settings size={15} />
          </button>
        </div>
      </aside>

      {/* ── Main Chat Canvas ── */}
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
                      : activeChatPartner?.username}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {activeChat.isGroup ? `${activeChat.users.length} members` : "Direct Message"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* 📞 Audio & Video Calling Buttons (Available in Direct Messages) */}
                {!activeChat.isGroup && (
                  <>
                    <button
                      onClick={() => initiateCall("video")}
                      className="p-2 rounded-xl text-MineBlue hover:bg-MineBlue/10 transition-all"
                      title="Start Video Call"
                    >
                      <Video size={18} />
                    </button>
                    <button
                      onClick={() => initiateCall("audio")}
                      className="p-2 rounded-xl text-green-500 hover:bg-green-500/10 transition-all"
                      title="Start Audio Call"
                    >
                      <Phone size={17} />
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Messages Board */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
              {messages.map((msg, idx) => {
                const isMe = msg.from === user?.id;
                const isEditingThis = editingMessageId === msg.id;

                return (
                  <div key={msg.id || idx} className={`flex ${isMe ? "justify-end" : "justify-start"} group relative`}>
                    <div className={`max-w-[65%] px-4 py-3 rounded-2xl text-sm leading-relaxed relative ${
                      isMe
                        ? "bg-MineBlue text-white rounded-br-none shadow-lg shadow-MineBlue/20"
                        : "bg-white dark:bg-white/5 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-white/10 rounded-bl-none"
                    }`}>
                      {/* Inline Editing Mode */}
                      {isEditingThis ? (
                        <form onSubmit={handleEditMessageSubmit} className="flex flex-col gap-2 min-w-[250px]">
                          <textarea
                            className="w-full bg-black/10 dark:bg-black/20 text-white rounded p-1.5 focus:outline-none border border-white/10 text-xs"
                            value={editingContent}
                            onChange={(e) => setEditingContent(e.target.value)}
                            rows={2}
                            autoFocus
                          />
                          <div className="flex justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingMessageId(null)}
                              className="px-2 py-1 text-[10px] uppercase font-bold text-gray-400 hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-2 py-1 text-[10px] uppercase font-bold bg-green-500 text-white rounded"
                            >
                              Save
                            </button>
                          </div>
                        </form>
                      ) : (
                        renderMessageContent(msg.content)
                      )}

                      {/* Edit Button overlay (For My messages) */}
                      {isMe && !isEditingThis && (
                        <button
                          onClick={() => {
                            setEditingMessageId(msg.id);
                            setEditingContent(msg.content);
                          }}
                          className="absolute -left-8 top-1/2 -translate-y-1/2 p-1.5 bg-white dark:bg-gray-800 text-gray-400 hover:text-MineBlue rounded-lg opacity-0 group-hover:opacity-100 transition-all border border-gray-100 dark:border-white/5 shadow-md"
                          title="Edit Message"
                        >
                          <Edit2 size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Composer Area */}
            <div className="p-4 bg-white dark:bg-[#0c0d17] border-t border-gray-200 dark:border-gray-800/50 flex-shrink-0 relative">
              
              {/* 😍 CATEGORISED EMOJI PICKER POPOVER */}
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="absolute bottom-20 right-4 w-72 bg-white dark:bg-[#151726] border border-gray-200 dark:border-gray-800 rounded-2xl shadow-2xl p-4 z-30 animate-fade-in text-gray-800 dark:text-white">
                  {/* Category Nav Tabs */}
                  <div className="flex border-b border-gray-200 dark:border-gray-800 pb-2 mb-3 gap-1.5 overflow-x-auto">
                    {Object.keys(EMOJI_CATEGORIES).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveEmojiCategory(cat)}
                        className={`text-xs px-2.5 py-1 rounded-lg font-bold transition-all flex-shrink-0 ${
                          activeEmojiCategory === cat 
                            ? "bg-MineBlue/10 dark:bg-MineBlue/20 text-MineBlue" 
                            : "text-gray-400 hover:text-gray-700 dark:hover:text-white"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-6 gap-2 max-h-40 overflow-y-auto pr-1">
                    {EMOJI_CATEGORIES[activeEmojiCategory].map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleSelectEmoji(emoji)}
                        className="text-2xl p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl active:scale-90 transition-all text-center"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendMessage} className="flex items-end gap-3">
                <div className="flex-1 bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl flex items-end px-4 py-2 text-sm focus-within:ring-2 focus-within:ring-MineBlue transition-all">
                  <textarea
                    rows={1}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder={`Write in ${activeChat.isGroup ? activeChat.name : activeChatPartner?.username || ""}... (Shift+Enter for newline, ArrowUp to edit last message)`}
                    className="flex-1 bg-transparent border-none text-gray-900 dark:text-white outline-none resize-none max-h-32 py-1 text-sm placeholder:text-gray-400 dark:placeholder:text-gray-600"
                    style={{ height: "auto" }}
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-1 transition-colors ${showEmojiPicker ? "text-MineYellow" : "text-gray-400 hover:text-MineYellow"}`}
                    title="Insert Emoji"
                  >
                    <Smile size={17} />
                  </button>
                </div>
                <button type="submit"
                  className="p-3 bg-gradient-to-r from-MineBlue to-MinePink text-white rounded-xl hover:opacity-90 active:scale-95 transition-all flex-shrink-0 shadow-lg shadow-MineBlue/20">
                  <Send size={17} />
                </button>
              </form>
            </div>
          </>
        ) : (
          /* Empty/Welcome dashboard view */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <div className="w-20 h-20 bg-gradient-to-br from-MineBlue via-MinePink to-MineYellow p-0.5 rounded-3xl mb-6 shadow-2xl shadow-MineBlue/20 animate-pulse">
              <div className="w-full h-full bg-gray-50 dark:bg-DarkIndigo rounded-[22px] flex items-center justify-center">
                <Hash size={34} className="text-MineBlue" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No chat selected</h2>
            <p className="text-gray-500 dark:text-gray-500 max-w-xs text-sm leading-relaxed mb-6">
              Select a conversation from the sidebar or click Search to start mingling with your friends.
            </p>
            <button
              onClick={() => {
                setShowSearchModal(true);
                handleUserSearch(""); // Load all registered users instantly
              }}
              className="px-6 py-3 font-semibold bg-MineBlue text-white rounded-xl shadow-lg shadow-MineBlue/20 hover:opacity-95 transition-all"
            >
              Discover and Mingle
            </button>
          </div>
        )}
      </div>

      {/* ── WebRTC Calling overlays ── */}
      {callState !== "idle" && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl animate-fade-in text-white p-6">
          <div className="max-w-xl w-full flex flex-col items-center text-center space-y-6">
            
            {/* Visual Ringing states */}
            {callState === "ringing-in" && (
              <>
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-MineBlue/20 animate-ping" />
                  <img src={peerUser?.avatar || PRESET_AVATARS[0]} className="w-28 h-28 rounded-full object-cover relative border-4 border-MineBlue shadow-2xl shadow-MineBlue/40" alt="" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Incoming {callType === "video" ? "Video" : "Audio"} Call...</h2>
                <p className="text-gray-400 text-sm"><b>{peerUser?.firstName} ({peerUser?.username})</b> wants to connect with you.</p>
                <div className="flex items-center gap-6 mt-4">
                  <button onClick={declineCall} className="p-4 bg-red-600 hover:bg-red-500 rounded-full shadow-lg shadow-red-600/30 active:scale-95 transition-all">
                    <PhoneOff size={24} />
                  </button>
                  <button onClick={acceptCall} className="p-4 bg-green-500 hover:bg-green-400 rounded-full shadow-lg shadow-green-500/30 active:scale-95 transition-all animate-bounce">
                    <Phone size={24} />
                  </button>
                </div>
              </>
            )}

            {callState === "ringing-out" && (
              <>
                <div className="relative">
                  <span className="absolute inset-0 rounded-full bg-MinePink/20 animate-ping" />
                  <img src={peerUser?.avatar || PRESET_AVATARS[0]} className="w-28 h-28 rounded-full object-cover relative border-4 border-MinePink shadow-2xl shadow-MinePink/40" alt="" />
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight">Ringing...</h2>
                <p className="text-gray-400 text-sm">Calling <b>{peerUser?.firstName} ({peerUser?.username})</b></p>
                <button onClick={hangUpCall} className="p-4 bg-red-600 hover:bg-red-500 rounded-full shadow-lg shadow-red-600/30 mt-6 active:scale-95 transition-all">
                  <PhoneOff size={24} />
                </button>
              </>
            )}

            {/* Connection established / Active call layout */}
            {callState === "connected" && (
              <div className="w-full aspect-video bg-gray-900 rounded-3xl overflow-hidden relative shadow-2xl border border-white/5 flex flex-col justify-between">
                
                {/* Peer remote video/audio feed element */}
                <video
                  ref={remoteVideoRef}
                  autoPlay
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                />

                {/* Local Camera Picture-in-Picture (PiP) */}
                {callType === "video" && (
                  <div className="absolute top-4 right-4 w-32 aspect-video bg-black rounded-xl overflow-hidden border border-white/10 shadow-lg z-10">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Overlay Header */}
                <div className="relative p-6 z-10 bg-gradient-to-b from-black/60 to-transparent flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img src={peerUser?.avatar || PRESET_AVATARS[0]} className="w-10 h-10 rounded-full object-cover border border-white/20" alt="" />
                    <div className="text-left">
                      <p className="font-bold text-sm text-white">{peerUser?.firstName}</p>
                      <p className="text-xs text-green-400 flex items-center gap-1.5"><span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" /> Live connection</p>
                    </div>
                  </div>
                </div>

                {/* Overlay Footer / Controls */}
                <div className="relative p-6 z-10 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center gap-4">
                  <button 
                    onClick={toggleMute}
                    className={`p-3.5 rounded-full transition-all ${isMuted ? "bg-red-600" : "bg-white/10 hover:bg-white/20 text-white"}`}
                  >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                  </button>
                  
                  {callType === "video" && (
                    <button 
                      onClick={toggleVideo}
                      className={`p-3.5 rounded-full transition-all ${isVideoOff ? "bg-red-600" : "bg-white/10 hover:bg-white/20 text-white"}`}
                    >
                      {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                  )}

                  <button onClick={hangUpCall} className="p-3.5 bg-red-600 hover:bg-red-500 text-white rounded-full transition-all shadow-lg shadow-red-600/30">
                    <PhoneOff size={20} />
                  </button>
                </div>

              </div>
            )}

          </div>
        </div>
      )}

      {/* ── USER SEARCH / PRIVATE DM CREATION MODAL ── */}
      {showSearchModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141622] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Start a Conversation</h3>
              <button onClick={() => { setShowSearchModal(false); setSearchQuery(""); setSearchResults([]); }} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl pl-10 pr-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-MineBlue"
                placeholder="Search colleagues by username or name..."
                value={searchQuery}
                onChange={(e) => handleUserSearch(e.target.value)}
                autoFocus
              />
            </div>

            {/* Results */}
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {searchResults.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">{searchQuery ? "No members found" : "Type to look up Mingle contacts..."}</p>
              ) : (
                searchResults.map(u => (
                  <button
                    key={u.id || u._id}
                    onClick={() => handleStartDM(u)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-white/5 text-left transition-all group"
                  >
                    <img src={u.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                    </div>
                    <span className="text-xs text-MineBlue opacity-0 group-hover:opacity-100 transition-opacity font-bold">Mingle &rarr;</span>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── GROUP CHAT CREATOR MODAL ── */}
      {showGroupModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#141622] border border-gray-200 dark:border-gray-800 rounded-3xl w-full max-w-lg shadow-2xl p-6 transition-all">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Create Group Chat</h3>
              <button onClick={() => { setShowGroupModal(false); setNewGroupName(""); setSelectedGroupUsers([]); }} className="text-gray-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            {/* Group Name */}
            <div className="mb-4">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Group Channel Name</label>
              <input
                type="text"
                className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-MineBlue"
                placeholder="e.g. Design Sync, Marketing Hub"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
              />
            </div>

            {/* Select Users List */}
            <div className="mb-6">
              <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Select Invitees</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-200 dark:border-gray-800 rounded-2xl p-3 bg-gray-50 dark:bg-black/25">
                {searchResults.map(u => {
                  const isChecked = selectedGroupUsers.includes(u.id || u._id);
                  return (
                    <label key={u.id || u._id} className="flex items-center justify-between p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer text-sm">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatar} className="w-8 h-8 rounded-full object-cover" alt="" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.firstName}</p>
                          <p className="text-xs text-gray-400">@{u.username}</p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const uId = u.id || u._id;
                          setSelectedGroupUsers(prev => 
                            prev.includes(uId) ? prev.filter(id => id !== uId) : [...prev, uId]
                          );
                        }}
                        className="rounded border-gray-300 text-MineBlue focus:ring-MineBlue h-4 w-4"
                      />
                    </label>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleCreateGroup}
              disabled={!newGroupName.trim() || selectedGroupUsers.length === 0}
              className="w-full py-3 text-sm font-bold text-white bg-gradient-to-r from-MineBlue to-MinePink rounded-xl shadow-lg shadow-MineBlue/20 hover:opacity-95 active:scale-95 disabled:opacity-40 transition-all"
            >
              Launch Group Channel 🚀
            </button>
          </div>
        </div>
      )}

      {/* ── PROFILE & SETTINGS SLIDEOUT DRAWER ── */}
      {showSettingsDrawer && (
        <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-full max-w-md bg-white dark:bg-[#11121d] border-l border-gray-200 dark:border-gray-800/80 h-full p-6 flex flex-col justify-between shadow-2xl relative animate-slide-in">
            <div className="overflow-y-auto pr-1 flex-1 pb-4">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-extrabold text-xl">Mingle Settings</h3>
                <button onClick={() => setShowSettingsDrawer(false)} className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5">
                  <X size={18} />
                </button>
              </div>

              {/* Avatar Picker Section */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-gray-400 mb-3">Choose Avatar</label>
                <div className="flex flex-col items-center gap-3 mb-5">
                  <div className="relative group cursor-pointer">
                    <img src={selectedAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} className="w-24 h-24 rounded-full object-cover ring-4 ring-MineBlue/50 transition-all group-hover:opacity-75" alt="" />
                    <label className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity text-[10px] font-bold text-white uppercase text-center p-2">
                      <Upload size={14} className="mb-1" />
                      Upload from PC
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  <p className="text-[11px] text-gray-400 text-center">Click the avatar circle above to upload from your PC, or select a preset avatar below:</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PRESET_AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedAvatar(av)}
                      className={`aspect-square rounded-full overflow-hidden border-2 transition-all hover:scale-105 active:scale-95 ${
                        selectedAvatar === av ? "border-MineBlue ring-2 ring-MineBlue/20" : "border-transparent"
                      }`}
                    >
                      <img src={av} className="w-full h-full object-cover" alt="" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Edit Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">First Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-MineBlue animate-none"
                      value={editFirstName}
                      onChange={(e) => setEditFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Last Name</label>
                    <input
                      type="text"
                      className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-MineBlue"
                      value={editLastName}
                      onChange={(e) => setEditLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-gray-400 mb-1.5">Username</label>
                  <input
                    type="text"
                    className="w-full bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-gray-800 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-MineBlue"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleUpdateProfile}
              className="w-full py-3.5 bg-gradient-to-r from-MineBlue via-MinePink to-MineYellow font-bold text-white rounded-xl shadow-lg shadow-MineBlue/20 hover:opacity-95 active:scale-95 transition-all mt-3 flex-shrink-0"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

    </div>
  );

  // ── WebRTC Actions Implementation ──

  async function getAdaptiveMediaStream(wantVideo) {
    let devices = [];
    try {
      devices = await navigator.mediaDevices.enumerateDevices();
    } catch (e) {
      console.warn("Failed to enumerate devices:", e);
    }

    const hasMic = devices.some(d => d.kind === "audioinput");
    const hasCam = devices.some(d => d.kind === "videoinput");

    // Fallback if list is empty (permissions not granted yet), request normally so browser prompts user
    const constraints = {
      audio: hasMic || devices.length === 0,
      video: wantVideo && (hasCam || devices.length === 0)
    };

    if (!constraints.audio && !constraints.video) {
      throw new Error("No microphone or camera hardware detected on this computer.");
    }

    return await navigator.mediaDevices.getUserMedia(constraints);
  }

  async function initiateCall(type) {
    if (!activeChat || activeChat.isGroup) return;
    
    const otherUser = activeChat.users.find(u => {
      const uId = (u.id || u._id)?.toString();
      const myId = (user?.id || user?._id)?.toString();
      return uId && myId && uId !== myId;
    });
    if (!otherUser) return;

    setCallType(type);
    setPeerId(otherUser.id);
    setPeerUser(otherUser);
    setCallState("ringing-out");

    try {
      const stream = await getAdaptiveMediaStream(type === "video");
      localStreamRef.current = stream;

      const pc = createPeerConnection(otherUser.id);
      
      // Add local media tracks to peer connection
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Display local stream in preview
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      if (wsRef.current) {
        wsRef.current.send(JSON.stringify({
          type: "call-user",
          to: otherUser.id,
          offer,
          callType: type
        }));
      }
    } catch (err) {
      console.error("WebRTC getUserMedia Error:", err);
      cleanupWebRTC();
      toast.error(err.message || "Failed to access camera/microphone.");
    }
  }

  async function acceptCall() {
    if (!peerId || !wsRef.current) return;

    try {
      const stream = await getAdaptiveMediaStream(callType === "video");
      localStreamRef.current = stream;

      const pc = createPeerConnection(peerId);
      stream.getTracks().forEach(track => pc.addTrack(track, stream));

      // Bind local video node
      setTimeout(() => {
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      }, 100);

      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      wsRef.current.send(JSON.stringify({
        type: "accept-call",
        to: peerId,
        answer
      }));

      setCallState("connected");
    } catch (err) {
      console.error("Failed to accept call WebRTC:", err);
      cleanupWebRTC();
      toast.error(err.message || "Could not activate camera/audio devices.");
    }
  }

  function declineCall() {
    if (peerId && wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "hang-up", to: peerId }));
    }
    cleanupWebRTC();
  }

  function hangUpCall() {
    if (peerId && wsRef.current) {
      wsRef.current.send(JSON.stringify({ type: "hang-up", to: peerId }));
    }
    cleanupWebRTC();
  }

  // Toggle local mute states
  function toggleMute() {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }

  // Toggle local webcam video feeds
  function toggleVideo() {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }

  // ── Modals & Profile APIs ──

  async function handleCreateGroup() {
    const toastId = toast.loading("Launching group...");
    try {
      const res = await axios.post("/api/chats/group", {
        name: newGroupName,
        userIds: selectedGroupUsers
      });
      
      const newRoom = res.data;
      
      // Notify other participants dynamically over socket
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "create-room",
          roomId: newRoom._id || newRoom.id,
          userIds: selectedGroupUsers
        }));
      }

      await fetchChats();
      handleJoinChat({
        id: newRoom._id || newRoom.id,
        name: newRoom.name,
        isGroup: true,
        users: []
      });

      setShowGroupModal(false);
      setNewGroupName("");
      setSelectedGroupUsers([]);
      toast.success(`Group "${newRoom.name}" is live!`, { id: toastId });
    } catch (err) {
      toast.error("Failed to launch group channel", { id: toastId });
    }
  }

  async function handleUpdateProfile() {
    const toastId = toast.loading("Saving settings...");
    try {
      const res = await axios.put("/api/users", {
        firstName: editFirstName,
        lastName: editLastName,
        username: editUsername,
        avatar: selectedAvatar
      });

      // Update local state context
      setUser(res.data);
      setShowSettingsDrawer(false);
      toast.success("Profile saved!", { id: toastId });
    } catch (err) {
      toast.error("Failed to update profile info", { id: toastId });
    }
  }
}
