import { NextRequest, NextResponse } from "next/server";
import { getToken, GetTokenParams } from "next-auth/jwt";

const secret = process.env.NEXTAUTH_SECRET;

if (!secret) {
  throw new Error("NEXTAUTH_SECRET is not set in the environment variables");
}
export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: secret as string, raw: true });

  if (!token) {
    console.log("No token found, redirecting to login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  console.log("Token found, proceeding");
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*"],
};
