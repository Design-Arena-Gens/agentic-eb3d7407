import { NextResponse } from "next/server";
import { z } from "zod";
import { createUser } from "@/lib/db";
import { getSession } from "@/lib/session";

const RegisterSchema = z.object({
  displayName: z.string().min(2).max(50),
  password: z.string().min(6).max(100),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parse = RegisterSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { displayName, password } = parse.data;
  const user = createUser(displayName, password);
  const session = await getSession();
  session.userId = user.id;
  await session.save();
  return NextResponse.json({
    user: {
      id: user.id,
      displayName: user.profile.displayName,
      isAdmin: user.isAdmin || false,
    },
  });
}
