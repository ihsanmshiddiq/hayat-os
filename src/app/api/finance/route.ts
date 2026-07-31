import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  const user = await ensureSeedData();
  const [transactions, budgets] = await Promise.all([
    db.financeTransaction.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 100 }),
    db.budget.findMany({ where: { userId: user.id }, orderBy: { category: "asc" } }),
  ]);
  const income = transactions.filter((item) => item.type === "income").reduce((sum, item) => sum + item.amount, 0);
  const expense = transactions.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.amount, 0);
  return NextResponse.json({ transactions, budgets, summary: { income, expense, balance: income - expense } });
}

export async function POST(req: NextRequest) {
  const user = await ensureSeedData();
  const body = await req.json();
  if (body.kind === "budget") {
    const budget = await db.budget.upsert({ where: { userId_category: { userId: user.id, category: body.category } }, create: { userId: user.id, category: body.category, monthlyLimit: Number(body.monthlyLimit) }, update: { monthlyLimit: Number(body.monthlyLimit) } });
    return NextResponse.json({ budget });
  }
  const transaction = await db.financeTransaction.create({ data: { userId: user.id, amount: Number(body.amount), type: body.type === "income" ? "income" : "expense", category: body.category || "Lainnya", note: body.note || null, date: body.date ? new Date(body.date) : new Date() } });
  return NextResponse.json({ transaction });
}

export async function DELETE(req: NextRequest) {
  const user = await ensureSeedData();
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  await db.financeTransaction.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ ok: true });
}
