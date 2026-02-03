import React, { FormEvent, useContext, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChatRoom, Message, User } from '@/lib/types';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { GetRoomMessage } from '@/lib/actions/ChatWithUser';
import { uploadOnRedis } from '@/lib/actions/RedisMessageUpload';
import { ShineBorder } from '@/components/magicui/shine-border';
import { BorderBeam } from '@/components/border-beam';
import { Paperclip, SendHorizontal, ChevronLeft, MoreVertical } from 'lucide-react';
import { UserContext } from '@/app/Provider';
import FileDialog from './FileDialog';

interface ExtendedUser extends User {
  isOnline: boolean;
}

interface ExtendedChatRoom extends ChatRoom {
  users: ExtendedUser[];
}

interface ConversationalPanelProps {
  activeChat: ExtendedChatRoom;
  ws: WebSocket;
  incomingMessage: Message;
  setIncomingMessage: React.Dispatch<React.SetStateAction<Message | null>>;
  userId: number;
}

const SingleChatPanel: React.FC<ConversationalPanelProps> = ({
  activeChat,
  ws,
  incomingMessage,
  userId,
  setIncomingMessage,
}) => {
  const [focusedInput, setFocusedInput] = useState(false);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [messageData, setMessageData] = useState<Message[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [activeUser, setActiveUser] = useState<ExtendedUser>();
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [fileData, setFileData] = useState<File>();

  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  async function getServerMessages(roomId: string) {
    const result = await GetRoomMessage(roomId);
    setMessageData(result);
  }

  useEffect(() => {
    if (activeChat && !activeChat.isGroup && activeChat.users.length > 0) {
      setActiveUser(activeChat.users.filter(user => user.id !== userId)[0]);
      getServerMessages(activeChat.id);
    }
  }, [activeChat, activeUser, userId]);

  useEffect(() => {
    if (incomingMessage && Object.keys(incomingMessage).length !== 0) {
      setMessageData(prev => [...prev, incomingMessage]);
      setIncomingMessage(null);
    }
  }, [incomingMessage, setIncomingMessage]);

  useEffect(() => {
    scrollToBottom();
  }, [messageData]);

  async function handleUplaod(msg: Message, roomId: string) {
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
      handleUplaod({ from: userId, content: inputMessage.trim() }, activeChat.id);
      setMessageData(prev => [...prev, { content: inputMessage.trim(), from: userId }]);
      setInputMessage('');
    }
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const inputFiles = e.target.files;
    if (!inputFiles) return;
    const file = inputFiles[0];
    const fileSize = file.size / 1000000;
    if (fileSize > 100) {
      return;
    }
    setFileData(file)
    setOpenDialog(true)
  }

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-DarkIndigo to-DarkNavy">
      {/* Header */}
      <FileDialog open={openDialog} file={fileData} setOpen={setOpenDialog} />
      <div className="sticky top-0 z-20 border-b border-white/10 bg-DarkNavy/95 backdrop-blur-md">
        {activeUser ? (
          <motion.div
            className="flex items-center justify-between px-4 py-3"
            onHoverStart={() => setShowUserInfo(true)}
            onHoverEnd={() => setShowUserInfo(false)}
          >
            <div className="flex items-center space-x-3">
              <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                <ChevronLeft className="h-5 w-5 text-white/70" />
              </button>
              <Avatar className="h-10 w-10 ring-2 ring-offset-2 ring-offset-DarkNavy/50 ring-white/20">
                <AvatarImage src={activeUser.avatar || "https://github.com/shadcn.png"} />
              </Avatar>
              <div className="flex flex-col">
                <span className="text-white font-medium">{activeUser.username}</span>
                <span className={`text-sm ${activeUser.isOnline ? 'text-green-400' : 'text-white/50'}`}>
                  {activeUser.isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <MoreVertical className="h-5 w-5 text-white/70" />
            </button>
          </motion.div>
        ) : (
          <div className="px-4 py-4 text-center">
            <h2 className="text-xl font-semibold text-white/90">Welcome to Chat</h2>
          </div>
        )}
        {activeUser && <UserInfoOverlay user={activeUser} isVisible={showUserInfo} />}
      </div>

      {/* Messages Container */}
      <div className="flex-1 overflow-hidden relative">
        {!activeUser ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-4">
              <p className="text-white/30">Select a chat to start messaging</p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            {/* Scrollable Messages Area */}
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-gray-300  dark:[&::-webkit-scrollbar-track]:bg-blue-950  dark:[&::-webkit-scrollbar-thumb]:bg-DarkIndigo/50 px-4 py-6 pb-20">
              <div className="space-y-6">
                {messageData.map((message, index) => (
                  <MessageBubble
                    key={index}
                    message={message}
                    isOwn={message.from === userId}
                    userAvatar={activeUser.avatar!}
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
                    className="p-2.5 hover:bg-white/10 relative rounded-full transition-colors"
                  >
                    <input type='file' onChange={(e) => handleFileChange(e)} className='absolute h-8 opacity-0 cursor-pointer top-0 left-0 w-10 ' />
                    <Paperclip className="h-5 w-5 text-white/70" />
                  </button>
                  <div className="flex-1 relative rounded-2xl overflow-hidden">
                    {focusedInput && <BorderBeam size={1000} duration={6} delay={4} />}
                    <input
                      placeholder="Type a message..."
                      className="w-full bg-white/10 px-4 py-2.5 focus:outline-none text-white/90 placeholder:text-white/30"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onFocus={() => setFocusedInput(true)}
                      onBlur={() => setFocusedInput(false)}
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
        )}
      </div>
    </div>
  );
};

const UserInfoOverlay = ({ user, isVisible }: { user: ExtendedUser; isVisible: boolean }) => (
  <AnimatePresence>
    {isVisible && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="absolute z-10 top-full left-0 right-0 backdrop-blur-lg bg-DarkNavy/10 border-b border-white/10"
      >
        <motion.div
          className="p-6 space-y-4"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex items-center gap-6">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
              className='relative rounded-full p-1'
            >
              <ShineBorder
                borderRadius={9999}
                className="relative p-1"
                color={["#A07CFE", "#FE8FB5", "#FFBE7B"]}
              >
                <Avatar className="h-20 w-20 ring-2 ring-offset-1 ring-offset-DarkNavy ring-white/20">
                  <AvatarImage src={user.avatar || "https://github.com/shadcn.png"} />
                </Avatar>
              </ShineBorder>
            </motion.div>

            <div className="space-y-2">
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                <h2 className="text-xl font-medium text-white">
                  {user.firstName} {user.lastName}
                </h2>
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/60"
              >
                @{user.username}
              </motion.div>

              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-sm text-white/50">{user.email}</span>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

const MessageBubble = ({ message, isOwn, userAvatar }: { message: Message; isOwn: boolean, userAvatar: string }) => {
  const userData = useContext(UserContext)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-4`}
    >
      <div className={`flex items-end gap-2 max-w-[70%] ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={isOwn ? userData?.user.avatar! : userAvatar} />
        </Avatar>
        <div
          className={`px-4 py-2 rounded-2xl ${isOwn
            ? 'bg-indigo-600 text-white rounded-br-none'
            : 'bg-white/10 text-white/90 rounded-bl-none'
            }`}
        >
          <p className="text-sm">{message.content}</p>
        </div>
      </div>
    </motion.div>
  )
}

export default SingleChatPanel;
