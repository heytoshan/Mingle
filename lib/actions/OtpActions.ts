import { prisma } from "@/Client";

export const isOtpExist = async (email: string) => {
  const existingOtp = await prisma.otp.findUnique({
    where: {
      email: email,
    },
  });
  if (!existingOtp) return;
  return existingOtp;
};

export const deleteOtp = async () => {
  const now = new Date();
  const twoMinAgo = new Date(now.getTime() - 2 * 60 * 1000); //date of twoMinAgo
  await prisma.otp.deleteMany({
    where: {
      createdAt: {
        lt: twoMinAgo,
      },
    },
  });
};

export const isOtpValid = async (email: string, otp: number) => {
  const getOtp = await prisma.otp.findUnique({
    where: {
      email: email,
    },
  });
  if (getOtp?.otp == otp) return true;
  return false;
};
