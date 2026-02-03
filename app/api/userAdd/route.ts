import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/Client';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const session = await auth();

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  const user1Id = parseInt(session.user?.id as string);
  const user2Id = body.selectedUserId;
  const usersId = [user1Id,user2Id];

  try {
    //check room created for both users
    const existingChatRoom = await prisma.chatRoom.findFirst({
      where :{
        isGroup:false,
        ChatRoomUser : {
          every : {
            userId:{
              in: usersId,
            },
          },
        },
      },
      include :{ChatRoomUser : true}
    })

    if(existingChatRoom){
      return NextResponse.json({
        message : "chat room already created with this user",
        chatRoom : existingChatRoom
      },{status: 200});
    }

    //create room for both users
    const newChatRoom = await prisma.chatRoom.create({
      data : {
        isGroup : false,
        name : null,
        ChatRoomUser : {
          create : [
            {userId : user1Id},
            {userId : user2Id},
          ]
        }
      },
      include : {ChatRoomUser : true}
    })

    return NextResponse.json({ message : "chat room created successfully",chatRoom: newChatRoom},{status : 200})
  } catch(error){
    console.error("Error while creating chat room with users: ",error);
    return NextResponse.json({message : "error while creating chat room"},{status : 500})
  }
}