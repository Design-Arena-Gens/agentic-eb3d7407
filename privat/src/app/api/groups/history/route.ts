import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getGroupMessages } from "@/lib/db";

const Schema = z.object({ groupId: z.string().min(4), since: z.number().optional() });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = Schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const messages = getGroupMessages(parse.data.groupId, parse.data.since);
  return NextResponse.json({ messages });
}
