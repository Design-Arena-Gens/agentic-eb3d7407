import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { findUserById, removeUser } from "@/lib/db";

const Schema = z.object({ id: z.string().min(4) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const me = findUserById(session.userId);
  if (!me || !me.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json().catch(() => null);
  const parse = Schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const ok = removeUser(parse.data.id);
  if (!ok) return NextResponse.json({ error: "Failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
