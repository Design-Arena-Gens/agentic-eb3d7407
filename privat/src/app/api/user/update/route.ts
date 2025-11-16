import { NextResponse } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/session";
import { updateUserProfile, findUserById } from "@/lib/db";

const UpdateSchema = z.object({
  displayName: z.string().min(2).max(50).optional(),
  statusMessage: z.string().max(140).optional(),
  avatarUrl: z.string().url().or(z.string().startsWith("data:")).optional(),
  isPrivate: z.boolean().optional(),
});

export async function POST(req: Request) {
  const session = await getSession();
  if (!session.userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  const parse = UpdateSchema.safeParse(body);
  if (!parse.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const user = updateUserProfile(session.userId, parse.data);
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  const fresh = findUserById(session.userId)!;
  return NextResponse.json({
    user: {
      id: fresh.id,
      displayName: fresh.profile.displayName,
      avatarUrl: fresh.profile.avatarUrl || null,
      statusMessage: fresh.profile.statusMessage || "",
      isPrivate: fresh.profile.isPrivate,
      isAdmin: fresh.isAdmin || false,
    },
  });
}
