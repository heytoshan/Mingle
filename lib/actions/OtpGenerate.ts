import { prisma } from "@/Client";
import { EmailTemplate } from "@/components/EmailTemplate";
import { Resend } from "resend";
import { deleteOtp, isOtpExist } from "./OtpActions";
import { EmailInputData } from "../types";

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendOtp({ email, firstname, otp }: EmailInputData) {
  try {
    const { data, error } = await resend.emails.send({
      from: "Mingle@sudhanshucodes.co",
      to: [email],
      subject: "mail verification",
      react: EmailTemplate({ firstname: firstname, otp: otp }),
    });
    if (error) {
      return error;
    }
    return data;
  } catch (err) {
    return err;
  }
}

export async function createOtp({ email, firstname, otp }: EmailInputData) {
  const createdOtp = await prisma.otp.create({
    data: {
      email: email,
      otp: otp,
    },
  });

  if (!createdOtp) {
    console.log("error while creating otp" + createdOtp);
    return;
  }

  try {
    const otpData = await sendOtp({ email, otp, firstname });
    console.log(otpData);
    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}
