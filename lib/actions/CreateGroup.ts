"use server";

import { auth } from "@/auth";
import { prisma } from "@/Client";

async function CreateGroup(userIds: number[], groupName: string) {
  const session = await auth()
  const userId = parseInt(session?.user?.id!)
  userIds.push(userId)

  try {
    const chatRoom = await prisma.chatRoom.create({
      data: {
        name: groupName,
        isGroup: true,
        users: {
          connect: userIds.map((id) => ({ id })),
        },
        ChatRoomUser: {
          create: userIds.map((id) => ({
            user: { connect: { id } },
          })),
        },
      },
      include: { users: true }
    });
    return chatRoom
  } catch (e) {
    console.log("error creating group chat room", e)
  }
}
export default CreateGroup
