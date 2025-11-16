import { NextResponse } from "next/server";
import { z } from "zod";
import { createGroup } from "@/lib/db";
import { getSession } from "@/lib/session";

const Schema = z.object({ name: z.string().min(2).max(50) });

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = Schema.safeParse(body);
  if (!parse.success) return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  const g = createGroup(parse.data.name, session.userId);
  return NextResponse.json({ group: { id: g.id, name: g.name } });
}
