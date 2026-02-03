"use client";
import { ChatRoom, Message, User } from '@/lib/types';
import React, { useContext, useEffect, useState } from 'react';
import { signOut, useSession } from "next-auth/react";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '@/components/ui/resizable';
import "../globals.css"
import { LogOut, } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ChatSidebar from '@/components/ChatSidebar';
import { ChatWithOtherUser } from '@/lib/actions/ChatWithUser';
import ConversationalPanel from '@/components/ConversationalPanel';
import { UserContext } from '../Provider';
import { Select, SelectContent, SelectTrigger } from '@/components/ui/select';

interface ExtendedUser extends User {
  isOnline: boolean;
}

interface ExtendedChatRoom extends ChatRoom {
  users: ExtendedUser[];
}

const Dashboard = () => {
  const { data: session, status } = useSession();
  const [activeChat, setActiveChat] = useState<ExtendedChatRoom>();
  const [ws, setWs] = useState<WebSocket>();
  const [onlineUsers, setOnlineUsers] = useState<number[]>([]);
  const [incomingMessage, setIncomingMessage] = useState<Message | null>(null)
  const [chatsData, setChatsData] = useState<{ groupsData: ChatRoom[]; singleChatData: ChatRoom[] }>();
  const userData = useContext(UserContext)

  //get chat data
  async function getChatData() {
    const result = await ChatWithOtherUser();
    setChatsData(result);
  }

  useEffect(() => {
    const webSocketUrl = process.env.NEXT_PUBLIC_WEBSOCKET_URL;

    getChatData();
    const lastChat = localStorage.getItem("lastChat");
    if (lastChat) {
      setActiveChat(JSON.parse(lastChat))
    }

    if (!webSocketUrl) {
      console.error("WebSocket URL is not defined");
      return;
    }

    const socket = new WebSocket(webSocketUrl);

    socket.onopen = () => {
      console.log("WebSocket connection established");
      // Automatically connect when socket opens
      if (session?.user?.id) {
        socket.send(JSON.stringify({
          type: "connect",
          userId: parseInt(session.user.id)
        }));
      }
    };

    socket.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        handleMessage(parsedData);

      } catch (error) {
        console.error("Error parsing message:", error);
      }
    };

    socket.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    socket.onclose = (event) => {
      console.log("WebSocket connection closed:", event);
    };

    setWs(socket);

    return () => {
      socket.close();
    };
  }, [session?.user?.id, status]);

  //handle messsage
  function handleMessage(data: any) {
    switch (data.type) {
      case "connectedUsers": setOnlineUsers(data.message)
        break;
      case "connection": console.log("connected to server");
        break;
      case "join": console.log('connection to room successfully established')
        break;
      case "message": setIncomingMessage(data.message)
        break;
      default: console.log(data);
    }
  }

  function handleLogout() {
    localStorage.clear();
    signOut()
  }
  return (
    <div className="flex h-screen text-gray-300/90 overflow-hidden bg-DarkNavy">
      <main className='h-screen w-full' >
        <ResizablePanelGroup direction='horizontal' >
          <ResizablePanel className='' minSize={15} maxSize={30} defaultSize={20} >
            <div className='' >
              <nav className='flex justify-between items-center py-6 px-4 border-b border-white/10 ' >
                <div className='flex h-8 w-8 bg- space-x-2 items-center' >
                  <span className='text-base text-white font-semibold cursor-default '>@{userData?.user.username}</span>
                </div>
                <div className='flex cursor-pointer items-center hover:bg-white/10  rounded-lg py-2 gap-3' >
                  <Select>
                    <SelectTrigger className='border-0 flex items-center gap-3 focus:ring-0' >
                      <Avatar className='h-8 w-8 border border-white' >
                        <AvatarImage src={userData?.user.avatar || `https://github.com/shadcn.png`} />
                        <AvatarFallback>UN</AvatarFallback>
                      </Avatar>
                    </SelectTrigger>
                    <SelectContent className='bg-white/10 cursor-pointer backdrop-blur-sm border-white/10' >
                      <div className='flex text-gray-300/80 py-2 gap-2 px-1' onClick={() => handleLogout()} >
                        <div className='items-center flex '><LogOut className='h-5 w-5' /></div>
                        <div>logout</div>
                      </div>
                    </SelectContent>
                  </Select>
                </div>
              </nav>
              {/* sub-section sidebar */}
              <div className='h-screen ' >
                <ChatSidebar chatsData={chatsData!} ws={ws!} userId={parseInt(session?.user?.id!)} setActiveChat={setActiveChat} activeChat={activeChat!} onlineUsers={onlineUsers} />
              </div>
            </div>

          </ResizablePanel>
          <ResizableHandle className='bg-white/10 text-white/10' />
          <ResizablePanel className='' defaultSize={80} >
            <ConversationalPanel ws={ws!} setIncomingMessage={setIncomingMessage} userId={parseInt(session?.user?.id!)} activeChat={activeChat!} incomingMessage={incomingMessage!} />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main >
    </div>
  );
};

export default Dashboard;
