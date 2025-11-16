import { NextResponse } from "next/server";
import { z } from "zod";
import { pollSignals } from "@/lib/db";
import { getSession } from "@/lib/session";

const Schema = z.object({ since: z.number().optional() });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = Schema.safeParse(body || {});
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const list = pollSignals(session.userId, parse.data.since);
  return NextResponse.json({ signals: list });
}
