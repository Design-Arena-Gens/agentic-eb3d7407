import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const user = findUserById(session.userId);
  if (!user) return NextResponse.json({ user: null }, { status: 200 });
  return NextResponse.json({
    user: {
      id: user.id,
      displayName: user.profile.displayName,
      avatarUrl: user.profile.avatarUrl || null,
      statusMessage: user.profile.statusMessage || "",
      isPrivate: user.profile.isPrivate,
      isAdmin: user.isAdmin || false,
      friends: Array.from(user.friends),
      incomingRequests: Array.from(user.incomingRequests),
      outgoingRequests: Array.from(user.outgoingRequests),
    },
  });
}
