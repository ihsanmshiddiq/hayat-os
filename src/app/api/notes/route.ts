import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

/** GET /api/notes — all notes (optionally by folder). */
export async function GET(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const folder = req.nextUrl.searchParams.get("folder");

  const notes = await db.note.findMany({
    where: { userId, ...(folder ? { folder } : {}) },
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });

  const folders = await db.note.findMany({
    where: { userId },
    select: { folder: true },
    distinct: ["folder"],
  });

  return NextResponse.json({
    notes: notes.map((n) => ({
      id: n.id,
      title: n.title,
      content: n.content,
      folder: n.folder,
      tags: n.tags ? n.tags.split(",").filter(Boolean) : [],
      pinned: n.pinned,
      updatedAt: n.updatedAt,
      createdAt: n.createdAt,
    })),
    folders: folders.map((f) => f.folder),
  });
}

/** POST /api/notes — create note. */
export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const body = await req.json();
  const { title, content = "", folder = "Inbox", tags = "", pinned = false } = body;
  const note = await db.note.create({
    data: { userId, title, content, folder, tags, pinned },
  });
  return NextResponse.json({ ok: true, note });
}

/** PATCH /api/notes?id=... — update note. */
export async function PATCH(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const body = await req.json();
  const { title, content, folder, tags, pinned } = body;
  const note = await db.note.update({
    where: { id },
    data: {
      ...(title !== undefined ? { title } : {}),
      ...(content !== undefined ? { content } : {}),
      ...(folder !== undefined ? { folder } : {}),
      ...(tags !== undefined ? { tags: Array.isArray(tags) ? tags.join(",") : tags } : {}),
      ...(pinned !== undefined ? { pinned } : {}),
    },
  });
  return NextResponse.json({ ok: true, note });
}

/** DELETE /api/notes?id=... */
export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const userId = user.id;
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.note.deleteMany({ where: { id, userId } });
  return NextResponse.json({ ok: true });
}
