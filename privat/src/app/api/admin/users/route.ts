import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { snapshotDb, findUserById } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = findUserById(session.userId);
  if (!me || !me.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const snap = snapshotDb();
  return NextResponse.json({ users: snap.users.map((u) => ({ id: u.id, name: u.profile.displayName, isAdmin: !!u.isAdmin })) });
}
