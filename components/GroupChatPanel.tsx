import React, { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatRoom, Message, User } from '@/lib/types';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { GetRoomMessage } from '@/lib/actions/ChatWithUser';
import { uploadOnRedis } from '@/lib/actions/RedisMessageUpload';
import { Paperclip, SendHorizontal, ChevronLeft, MoreVertical } from 'lucide-react';

interface GroupChatPanelProps {
  activeChat: ChatRoom;
  ws: WebSocket;
  incomingMessage: Message;
  setIncomingMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  userId: number;
}

const GroupChatPanel: React.FC<GroupChatPanelProps> = ({
  activeChat,
  ws,
  incomingMessage,
  userId,
  setIncomingMessage,
}) => {
  // const [focusedInput, setFocusedInput] = useState(false);
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messageData, setMessageData] = useState<Message[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function getServerMessages(roomId: string) {
    const result = await GetRoomMessage(roomId);
    setMessageData(result);
  }

  useEffect(() => {
    if (activeChat) {
      getServerMessages(activeChat.id);
    }
  }, [activeChat]);

  useEffect(() => {
    if (incomingMessage && Object.keys(incomingMessage).length !== 0) {
      setMessageData(prev => [...prev, incomingMessage]);
      setIncomingMessage(null);
    }
  }, [incomingMessage, setIncomingMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messageData]);

  async function handleUpload(msg: Message, roomId: string) {
    await uploadOnRedis(msg, roomId);
  }

  function handleMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inputMessage.trim()) {
      ws.send(JSON.stringify({
        type: "message",
        message: inputMessage.trim(),
        roomId: activeChat.id,
        from: userId
      }));
      handleUpload({ from: userId, content: inputMessage.trim() }, activeChat.id);
      setMessageData(prev => [...prev, { content: inputMessage.trim(), from: userId }]);
      setInputMessage('');
    }
  }

  const getSenderDetails = (senderId: number) => {
    return activeChat.users.find(user => user.id === senderId);
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-DarkIndigo to-DarkNavy">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-white/10 cursor-pointer bg-DarkNavy/95 backdrop-blur-md">
        <motion.div
          className="flex items-center justify-between px-4 py-3"
          onClick={() => setShowGroupInfo(prev => !prev)}
        >
          <div className="flex items-center space-x-3">
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <ChevronLeft className="h-5 w-5 text-white/70" />
            </button>
            <div className="flex flex-col">
              <span className="text-white font-medium">{activeChat.name}</span>
              <span className="text-sm text-white/50">
                {activeChat.users.length} members
              </span>
            </div>
          </div>
          <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <MoreVertical className="h-5 w-5 text-white/70" />
          </button>
        </motion.div>
        <GroupInfoOverlay chat={activeChat} isVisible={showGroupInfo} />
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden relative">
        <div className="flex flex-col h-full">
          {/* Scrollable Messages Area */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300  dark:[&::-webkit-scrollbar-track]:bg-blue-950  dark:[&::-webkit-scrollbar-thumb]:bg-DarkIndigo/50 px-4 py-6 pb-20">
            <div className="space-y-6">
              {messageData.map((message, index) => (
                <MessageBubble
                  key={index}
                  message={message}
                  isOwn={message.from === userId}
                  sender={getSenderDetails(message.from)!}
                />
              ))}
              <div ref={messageEndRef} />
            </div>
          </div>

          {/* Fixed Input Area */}
          <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-white/5 backdrop-blur-md">
            <form onSubmit={handleMessage} className="p-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-2.5 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Paperclip className="h-5 w-5 text-white/70" />
                </button>
                <div className="flex-1 relative rounded-2xl overflow-hidden">
                  <input
                    placeholder="Type a message..."
                    className="w-full bg-white/10 px-4 py-2.5 focus:outline-none text-white/90 placeholder:text-white/30"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                  // onFocus={() => setFocusedInput(true)}
                  // onBlur={() => setFocusedInput(false)}
                  />
                </div>
                <button
                  type="submit"
                  className="p-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-full transition-colors"
                >
                  <SendHorizontal className="h-5 w-5 text-white" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

const MessageBubble = ({ message, isOwn, sender }: { message: Message; isOwn: boolean; sender: User }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
    >
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <div className="flex flex-col items-center gap-1">
          <Avatar className="h-8 w-8 ring-1 ring-white/20">
            <AvatarImage src={sender?.avatar || "https://github.com/shadcn.png"} />
          </Avatar>
        </div>
        <div
          className={`group px-4 py-2 rounded-2xl ${isOwn
            ? 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-br-none'
            : 'bg-white/10 hover:bg-white/20 text-white/90 rounded-bl-none'
            } transition-colors`}
        >
          {!isOwn && <span className="text-xs text-white/50">{sender?.username}</span>}
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </motion.div >
  )
};

const GroupInfoOverlay = ({ chat, isVisible }: { chat: ChatRoom; isVisible: boolean }) => {
  const chatCreatedDate = new Date(chat.createdAt).toLocaleDateString();
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="absolute z-10 top-full left-0 right-0 bg-gradient-to-b from-DarkNavy/95 to-DarkNavy/90 backdrop-blur-xl border-b border-white/10"
        >
          <motion.div
            className="p-6"
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <h2 className="text-xl font-medium text-white">{chat.name}</h2>
                  <p className="text-sm text-white/50">Created on {chatCreatedDate}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/70">Group Members</h3>
                <div className="grid grid-cols-2 gap-4">
                  {chat.users.map((user) => (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar!} />
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm text-white">{user.username}</span>
                        <span className="text-xs text-white/50">{user.email}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default GroupChatPanel;
