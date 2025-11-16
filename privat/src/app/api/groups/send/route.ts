import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { sendGroupMessage } from "@/lib/db";

const Schema = z.object({
  groupId: z.string().min(4),
  type: z.enum(["text", "image", "file"]),
  text: z.string().optional(),
  mediaUrl: z.string().optional(),
  fileName: z.string().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = Schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const { groupId, ...content } = parse.data;
  const msg = sendGroupMessage(session.userId, groupId, content);
  if (!msg) return NextResponse.json({ error: "Failed" }, { status: 400 });
  return NextResponse.json({ message: msg });
}
