"use server";

import { z } from "zod";
import cloudinary from "../cloudinary";
import { prisma } from "@/Client";
import { auth } from "@/auth";
import { NextResponse } from "next/server";

const imageSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileData: z.string(),
})

type imageSchemaType = z.infer<typeof imageSchema>

export const UploadImage = async (file: imageSchemaType) => {
  const session = await auth();
  if (!session?.user?.id) {
    NextResponse.redirect("/login");
    return null;
  }
  const userId = parseInt(session.user.id);

  const { success, data } = imageSchema.safeParse(file)
  if (!success) {
    console.log("invalide file")
    return null;
  }
  const base64Data = data.fileData;
  const buffer = Buffer.from(base64Data, "base64");
  try {
    const result = await new Promise((res, rej) => {
      cloudinary.uploader.upload_stream(
        { folder: "chat-app" },
        (err, result) => {
          if (err) rej(err);
          res(result);
        }
      ).end(buffer)
    })
    if (!result || typeof result !== 'object' || !('secure_url' in result)) {
      return null;
    }
    if (!result.secure_url) {
      return null;
    }
    await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        avatar: result.secure_url
      }
    })
    return result.secure_url;
  } catch (e) {
    console.log("error while uplaoding image");
    console.error(e);
    return null;
  }

}
