import React, { useContext, useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Hash } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { ChatRoom, User } from "@/lib/types";
import { CreateGroupDialog } from "./CreateGroupDialog";

interface ChatSidebarProps {
  chatsData: { groupsData: ChatRoom[]; singleChatData: ChatRoom[] };
  onlineUsers: number[];
  setActiveChat: React.Dispatch<React.SetStateAction<ExtendedChatRoom | undefined>>
  activeChat: ExtendedChatRoom
  ws: WebSocket
  userId: number
}

interface ExtendedUser extends User {
  isOnline: boolean;
}

interface ExtendedChatRoom extends ChatRoom {
  users: ExtendedUser[];
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({ chatsData, onlineUsers, setActiveChat, userId, activeChat, ws }) => {
  const [groupChat, setGroupChat] = useState<boolean>(false);
  const [singleChat, setSingleChat] = useState<boolean>(false);
  const [updatedChatsData, setUpdatedChatsData] = useState<{ groupsData: ExtendedChatRoom[]; singleChatData: ExtendedChatRoom[]; }>();
  const [selectedChatId, setSelectedChatId] = useState<string>()


  useEffect(() => {
    const value = localStorage.getItem("ChatSidebar");
    if (value) {
      const data = JSON.parse(value);
      setGroupChat(data.groupChat);
      setSingleChat(data.singleChat);
    }

    if (chatsData) {
      const updateRoomUsers = (chat: ChatRoom): ExtendedChatRoom => ({
        ...chat,
        users: chat.users.map((user) => ({
          ...user,
          isOnline: onlineUsers.includes(user.id),
        })),
      });

      const updatedData = {
        groupsData: chatsData.groupsData.map(updateRoomUsers),
        singleChatData: chatsData.singleChatData.map(updateRoomUsers),
      };

      setUpdatedChatsData(updatedData);
    }

  }, [onlineUsers, chatsData]);

  const finalChatsData = updatedChatsData
  if (!finalChatsData) return null;

  const { groupsData, singleChatData } = finalChatsData;

  const groups =
    groupsData && groupsData.length > 0
      ? groupsData.map((group) => ({
        id: group.id,
        name: group.name || "Unnamed Group",
        unread: 0,
        users: group.users,
      }))
      : [];

  const SidebarSection = <T,>({
    title,
    isOpen,
    onToggle,
    items,
    renderItem,
  }: {
    title: string;
    isOpen: boolean;
    onToggle: () => void;
    items: T[];
    renderItem: (item: T) => React.ReactNode;
  }) => (
    <div className="space-y-2 mb-2">
      <button
        onClick={onToggle}
        className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300/30 rounded-lg hover:bg-white/5 transition-colors duration-200"
      >
        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        <span className="text-gray-300/40 font-medium flex-1 text-left">{title}</span>
      </button>
      {isOpen && <div className="space-y-1 pl-4">{items.map(renderItem)}</div>}
    </div>
  );

  return (
    <div className="px-4 py-2 space-y-4">
      <div className="flex w-full items-center justify-between py-3 px-2 cursor-default rounded-lg">
        <h2 className="text-white font-semibold">Chat</h2>
        <CreateGroupDialog singleChatData={singleChatData} userId={userId} />
      </div>

      {/* Groups Section */}
      {groups.length > 0 && (
        <SidebarSection
          title="Groups"
          isOpen={groupChat}
          onToggle={() => {
            const newGroupChat = !groupChat;
            setGroupChat(newGroupChat);
            localStorage.setItem("ChatSidebar", JSON.stringify({ groupChat: newGroupChat, singleChat }));
          }}
          items={groups}
          renderItem={(group: { id: string; name: string; unread: number; users: ExtendedUser[] }) => (
            <button
              key={group.id}
              onClick={() => {
                setSelectedChatId(group.id)
                const selectedGroupChat = groupsData.find(g => g.id === group.id)
                localStorage.setItem("lastChat", JSON.stringify(selectedGroupChat))
                setActiveChat(selectedGroupChat)
                ws.send(JSON.stringify({ type: "join", roomId: group.id }))
              }}
              className={`w-full flex items-center px-3 py-2 rounded-md hover:bg-white/5 text-gray-300/50 ${activeChat?.id === group.id && "bg-white/10 text-white"}  hover:text-white transition-colors duration-200`}
            >
              <Hash className={`h-4 w-4 mr-2 ${group.unread > 0 ? "text-white" : ""}`} />
              <span className={`flex-1 text-left ${group.unread > 0 ? "text-white" : ""}`}>{group.name}</span>
              {group.unread > 0 && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded-full">{group.unread}</span>
              )}
            </button>
          )}
        />
      )}

      {/* Direct Messages Section */}
      <SidebarSection
        title="Direct Messages"
        isOpen={singleChat}
        onToggle={() => {
          const newSingleChat = !singleChat;
          setSingleChat(newSingleChat);
          localStorage.setItem("ChatSidebar", JSON.stringify({ groupChat, singleChat: newSingleChat }));
        }}
        items={singleChatData}
        renderItem={(dm: ExtendedChatRoom) => {
          const otherUser = dm.users.filter(user => user.id != userId)[0];
          return (
            <button
              key={dm.id}
              onClick={() => {
                setSelectedChatId(dm.id)
                setActiveChat(dm)
                localStorage.setItem("lastChat", JSON.stringify(dm))
                ws.send(JSON.stringify({ type: "join", roomId: dm.id }))
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/5 text-gray-300/50 hover:text-white ${activeChat?.id === dm.id && "bg-white/10 text-white"} transition-colors duration-200`}
            >
              <div className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={otherUser.avatar || "https://avatars.githubusercontent.com/u/124599?v=4"} />
                  <AvatarFallback>{otherUser.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div
                  className={`h-3 w-3 absolute border-2 border-DarkIndigo right-0 top-6 ${otherUser.isOnline ? "bg-green-400" : "bg-gray-400"
                    } rounded-full`}
                />
              </div>
              <span>{otherUser.username}</span>
            </button>
          );
        }}
      />
    </div>
  );
};

export default ChatSidebar;
