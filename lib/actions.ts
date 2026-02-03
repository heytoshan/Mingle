"use server";
import { prisma } from "@/Client";
import { CredentialsSignin, User } from "next-auth";
import bcrypt from "bcryptjs";
import { signIn } from "@/auth";
import { createOtp } from "./actions/OtpGenerate";
import { deleteOtp, isOtpExist, isOtpValid } from "./actions/OtpActions";
import { UserSignUp, UserSignUpSchema } from "./types";

export async function isUsernameAllowed(username: string): Promise<boolean> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (user) return false;
    return true;
  } catch (error) {
    return false;
  }
}

export async function getUser(email: string): Promise<User | any> {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        username: true,
      }
    });
    return user;
  } catch (error) {
    throw new Error("Failed to fetch user");
  }
}

export async function handleEmailValidation(data: UserSignUp) {
  const parsedCredential = UserSignUpSchema.safeParse(data);
  if (!parsedCredential.success) {
    return "Invalid Credentials";
  }

  const { email, firstname } =
    parsedCredential.data;
  const user = await getUser(email);
  if (user) {
    return "user from this user already exists";
  }

  await deleteOtp();
  const existedOtp = await isOtpExist(email);
  console.log(existedOtp);
  if (!existedOtp) {
    const otp = Math.floor(1000 + Math.random() * 9000);
    await createOtp({ email: email, firstname: firstname, otp: otp });
    if (!createOtp) {
      console.log("something gone off so otp doesn't created");
      return "something's gone wrong";
    }
  }
  return;
}

export async function CreateAccount(data: UserSignUp, otp: number) {
  const parsedCredetial = UserSignUpSchema.safeParse(data);
  if (!parsedCredetial.success) return "Invalid Credentials";
  const { email, firstname, username, lastname, password } =
    parsedCredetial.data;
  const validOtp = await isOtpValid(email, otp);
  if (!validOtp) return "Invalid Otp";
  const hashedPassword = await bcrypt.hash(password, 10);
  const newAccount = await prisma.user.create({
    data: {
      email: email,
      firstName: firstname,
      lastName: lastname,
      password: hashedPassword,
      username: username,
    },
  });
  if (!newAccount) return "Something went wrong";

  await signIn("credentials", {
    email,
    password
  });
  return;
}

export async function LoginHandler(email: string, password: string) {
  try {
    await signIn("credentials", {
      email,
      password,
    });
  } catch (error) {
    const err = error as CredentialsSignin;
    return err.cause;
  }
}
