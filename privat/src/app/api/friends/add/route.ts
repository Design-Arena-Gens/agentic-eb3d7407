import { NextResponse } from "next/server";
import { z } from "zod";
import { addFriendRequest, findUserById } from "@/lib/db";
import { getSession } from "@/lib/session";

const AddSchema = z.object({ targetId: z.string().min(4) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = AddSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { targetId } = parse.data;
  if (!findUserById(targetId)) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const res = addFriendRequest(session.userId, targetId);
  if (!res.ok) return NextResponse.json({ error: res.error || "Failed" }, { status: 400 });
  return NextResponse.json({ ok: true });
}
