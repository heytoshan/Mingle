"use server";

import { auth } from "@/auth";
import { prisma } from "@/Client";
import { NextResponse } from "next/server";

export const UserData = async () => {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    NextResponse.redirect("/login")
    return null;
  }
  try {
    const data = prisma.user.findUnique({
      where: {
        id: parseInt(userId)
      },
      select: {
        id: true,
        email: true,
        username: true,
        firstName: true,
        lastName: true,
        avatar: true
      },
    })
    return data;
  } catch (e) {
    console.log("error while getting user data")
    console.error(e)
    return null;
  }
}

