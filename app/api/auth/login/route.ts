import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { email, phone } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user || !user.active) {
    console.log("USER NOT FOUND OR INACTIVE");
    return NextResponse.json({ success: false }, { status: 401 });
  }

  console.log("LOGIN EMAIL:", email);
  console.log("LOGIN PHONE:", phone);
  console.log("HASH FROM DB:", user.phoneHash);

  const cleanPhone = phone.trim();
  const valid = await bcrypt.compare(cleanPhone, user.phoneHash);

  console.log("BCRYPT RESULT:", valid);

  if (!valid) {
    return NextResponse.json({ success: false }, { status: 401 });
  }

const token = jwt.sign(
  { role: user.role },          // 👈 NO userId here
  process.env.JWT_SECRET!,
  {
    subject: user.id,           // 👈 THIS sets payload.sub
    expiresIn: "7d",
  }
);


  const response = NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });

  response.cookies.set("auth_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
