import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { findUserById } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = findUserById(session.userId);
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const friends = Array.from(me.friends).map((id) => {
    const u = findUserById(id)!;
    return {
      id: u.id,
      displayName: u.profile.displayName,
      statusMessage: u.profile.statusMessage || "",
      avatarUrl: u.profile.avatarUrl || null,
    };
  });
  const incoming = Array.from(me.incomingRequests);
  const outgoing = Array.from(me.outgoingRequests);
  return NextResponse.json({ friends, incoming, outgoing });
}
