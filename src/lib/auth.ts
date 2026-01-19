import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export function getAuthUser(req: NextRequest) {
  const token = req.cookies.get("auth_token")?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      role: string;
    };
  } catch {
    return null;
  }
}

export function requireRole(
  user: { role: string } | null,
  roles: string[]
) {
  if (!user || !roles.includes(user.role)) {
    throw new Error("UNAUTHORIZED");
  }
}
