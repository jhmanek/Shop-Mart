import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import User, { IUser } from "@/model/user";
import connection from "@/lib/mongoose";

interface JwtPayload {
  userId?: string;
  id?: string;
  role?: string;
}

export const authenticate = async (req: NextRequest): Promise<IUser | null> => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return null;

    const token = authHeader.split(" ")[1];
    if (!token) return null;

    // Decode with both secrets (admin first)
    let decoded: JwtPayload | null = null;

    try {
      decoded = jwt.verify(token, process.env.JWT_ADMIN_SECRET!) as JwtPayload;
    } catch {
      try {
        decoded = jwt.verify(token, process.env.JWT_USER_SECRET!) as JwtPayload;
      } catch {
        return null;
      }
    }

    const userId = decoded.userId || decoded.id;
    if (!userId) return null;

    await connection();

    const user = await User.findById(userId).select("-password"); // ✅ no .lean()

    // Return full Mongoose IUser type
    return user as IUser;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
};

export const isAdmin = async (req: NextRequest): Promise<IUser | null> => {
  const user = await authenticate(req);
  return user?.role === "admin" ? user : null;
};
