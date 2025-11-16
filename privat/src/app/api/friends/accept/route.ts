import { NextResponse } from "next/server";
import { z } from "zod";
import { acceptFriendRequest } from "@/lib/db";
import { getSession } from "@/lib/session";

const AcceptSchema = z.object({ fromId: z.string().min(4) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = AcceptSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const ok = acceptFriendRequest(session.userId, parse.data.fromId);
  if (!ok) return NextResponse.json({ error: "Failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
