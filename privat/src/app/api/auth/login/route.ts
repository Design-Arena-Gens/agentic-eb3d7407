import { NextResponse } from "next/server";
import { z } from "zod";
import { validateLogin } from "@/lib/db";
import { getSession } from "@/lib/session";

const LoginSchema = z.object({
  id: z.string().min(4),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parse = LoginSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const { id, password } = parse.data;
  const user = validateLogin(id, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }
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
