import React from 'react'
import { ChatRoom, Message, User } from '@/lib/types'
import SingleChatPanel from './SingleChatPanel'
import GroupChatPanel from './GroupChatPanel';

interface ExtendedUser extends User {
  isOnline: boolean;
}

interface ExtendedChatRoom extends ChatRoom {
  users: ExtendedUser[];
}

interface ConversationalPanelProps {
  activeChat: ExtendedChatRoom
  ws: WebSocket
  incomingMessage: Message
  setIncomingMessage: React.Dispatch<React.SetStateAction<Message | null>>
  userId: number
}

const ConversationalPanel: React.FC<ConversationalPanelProps> = ({ activeChat, ws, incomingMessage, userId, setIncomingMessage }) => {
  if (!activeChat) {
    return (
      <div className='flex h-screen justify-center text-xl items-center text-gray-300/50'>
        select chat to start
      </div>
    );
  }

  return (
    <>
      {!activeChat.isGroup ? (
        <SingleChatPanel activeChat={activeChat} ws={ws} incomingMessage={incomingMessage} userId={userId} setIncomingMessage={setIncomingMessage} />
      ) :
        <GroupChatPanel activeChat={activeChat} ws={ws} incomingMessage={incomingMessage} userId={userId} setIncomingMessage={setIncomingMessage} />
      }
    </ >
  )
}

export default ConversationalPanel

