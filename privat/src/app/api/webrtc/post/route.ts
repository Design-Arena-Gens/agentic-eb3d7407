import { NextResponse } from "next/server";
import { z } from "zod";
import { enqueueSignal } from "@/lib/db";
import { getSession } from "@/lib/session";

const Schema = z.object({
  targetId: z.string().min(4),
  type: z.string(),
  data: z.any(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = Schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  enqueueSignal(parse.data.targetId, session.userId, parse.data.type, parse.data.data);
  return NextResponse.json({ ok: true });
}
