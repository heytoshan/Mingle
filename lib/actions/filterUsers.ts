"use server";
import { prisma } from "@/Client";
import { auth } from "@/auth";

export const filterUsers = async (matchingWord: string) => {
  const session = await auth();
  const users = await prisma.user.findMany({
    where: {
      username: {
        contains: matchingWord,
        mode: 'insensitive',
      },
      NOT:{
        email : session?.user?.email as string
      }
    },
    select: {
      username: true,
      id: true,
      firstName: true,
      email: true,
      avatar: true,
      lastName: true
    },
  })
  if (users) return users;
  return [];
}
