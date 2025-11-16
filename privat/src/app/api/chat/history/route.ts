import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { getDirectMessages } from "@/lib/db";

const HistorySchema = z.object({
  partnerId: z.string().min(4),
  since: z.number().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = HistorySchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { partnerId, since } = parse.data;
  const messages = getDirectMessages(session.userId, partnerId, since);
  return NextResponse.json({ messages });
}
