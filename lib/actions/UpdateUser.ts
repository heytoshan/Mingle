'use server';
import { z } from "zod";
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/Client";

const userData = z.object({
  username: z.string(),
  email: z.string().email(),
})

type userDataType = z.infer<typeof userData>

export const UpdateUser = async (userChangeData: userDataType,) => {
  const session = await auth();
  if (!session?.user?.id) {
    NextResponse.redirect("/login");
    return null;
  }
  const userId: number = parseInt(session.user.id)
  try {
    const { success, data, error } = userData.safeParse(userChangeData);
    if (!success) {
      throw error
    }
    const { username, email } = data;
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        username: username,
        email: email,
      }
    })
    return "done";
  } catch (e) {
    console.error(e)
    return null
  }

}
