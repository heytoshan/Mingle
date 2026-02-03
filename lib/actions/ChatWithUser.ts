"use server";
import { prisma } from "@/Client";
import { auth } from "@/auth";
import { ChatRoom } from "../types";

export const ChatWithOtherUser = async (): Promise<{ groupsData: ChatRoom[]; singleChatData: ChatRoom[] }> => {
  const session = await auth();
  const userId = parseInt(session?.user?.id as string);
  const chatRooms = await prisma.chatRoom.findMany({
    where: {
      ChatRoomUser: {
        some: {
          userId: userId,
        },
      },
    },
    include: {
      ChatRoomUser: {
        include: {
          user: {
            select: {
              id: true,
              email: true,
              username: true,
              avatar: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });

  const groupedChats = chatRooms.reduce(
    (acc, chatRoom) => {
      const users = chatRoom.ChatRoomUser.map((chatRoomUser) => chatRoomUser.user);

      const chatRoomWithUsers: ChatRoom = {
        id: chatRoom.id,
        name: chatRoom.name,
        isGroup: chatRoom.isGroup,
        createdAt: chatRoom.createdAt,
        users: users, // Assign only users here
        ChatRoomUser: [], // We don't need this anymore
      };

      if (chatRoom.isGroup) {
        acc.groupsData.push(chatRoomWithUsers);
      } else {
        acc.singleChatData.push(chatRoomWithUsers);
      }

      return acc;
    },
    { groupsData: [] as ChatRoom[], singleChatData: [] as ChatRoom[] }
  );
  return groupedChats;
}

export const GetRoomMessage = async (roomId: string) => {
  const msgData = await prisma.message.findMany({
    where: {
      ChatRoomId: roomId
    },
    select: {
      content: true,
      userId: true,
      ChatRoomId: true
    },
    orderBy: {
      createdAt: 'asc'
    }
  });

  return msgData.map(msg => ({
    from: msg.userId,
    content: msg.content
  }));

}
