import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { sendDirectMessage, findUserById } from "@/lib/db";

const SendSchema = z.object({
  toId: z.string().min(4),
  type: z.enum(["text", "image", "file"]),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  fileName: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = SendSchema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { toId, ...content } = parse.data;
  if (!findUserById(toId)) return NextResponse.json({ error: "Recipient not found" }, { status: 404 });
  const msg = sendDirectMessage(session.userId, toId, content);
  if (!msg) return NextResponse.json({ error: "Failed" }, { status: 400 });
  return NextResponse.json({ message: msg });
}
