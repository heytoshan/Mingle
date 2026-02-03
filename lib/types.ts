import { z } from "zod";
export const UserSignUpSchema = z.object({
  email: z.string().email(),
  firstname: z.string(),
  lastname: z.optional(z.string()),
  password: z.string().min(6),
  username: z.string(),
});
export type EmailInputData = {
  email: string;
  firstname: string;
  otp: number;
};
export type UserSignUp = z.infer<typeof UserSignUpSchema>;

export interface User {
  id: number;
  email: string;
  username: string;
  avatar: string | null;
  firstName: string;
  lastName: string | null;
}

export interface ChatRoomUser {
  user: User;
}


export interface ChatRoom {
  id: string;
  name: string | null;
  isGroup: boolean;
  createdAt: Date;
  ChatRoomUser: ChatRoomUser[];
  users: User[];
}

export interface Message {
  from: number;
  //to: number;
  content: string;
}

export interface ServerMessage {
  message: Message;
  roomId: string;
}
export const imageSchema = z.object({
  fileName: z.string(),
  fileType: z.string(),
  fileData: z.string(),
})

export type imageSchemaType = z.infer<typeof imageSchema>

export type FileDataType = {
  fileName: string,
  fileSize: number,
  fileType: string,
}
