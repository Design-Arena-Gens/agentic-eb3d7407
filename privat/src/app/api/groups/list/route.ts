import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { findUserById, snapshotDb } from "@/lib/db";

export async function GET() {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = findUserById(session.userId);
  if (!me) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const snap = snapshotDb();
  const groups = snap.groups
    .filter((g) => g.members.includes(me.id))
    .map((g) => ({ id: g.id, name: g.name }));
  return NextResponse.json({ groups });
}
