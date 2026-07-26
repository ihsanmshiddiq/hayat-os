import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ensureSeedData } from "@/lib/seed";
import { CALC_METHODS } from "@/lib/islamic";

export const dynamic = "force-dynamic";

/** GET /api/settings — current user settings. */
export async function GET() {
  const user = await ensureSeedData();
  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    location: user.location,
    latitude: user.latitude,
    longitude: user.longitude,
    method: user.method ?? "Kemenag",
    methods: Object.entries(CALC_METHODS).map(([k, m]) => ({ key: k, name: m.name })),
  });
}

/**
 * PUT /api/settings — update user settings.
 * Body: { name?, location?, latitude?, longitude?, method? }
 * Geocoding is intentionally simple — caller may pass lat/lng directly.
 * If only `location` changes, lat/lng are preserved (the demo doesn't ship a geocoder).
 */
export async function PUT(req: NextRequest) {
  const user = await ensureSeedData();
  const body = await req.json();
  const { name, location, latitude, longitude, method } = body as {
    name?: string;
    location?: string;
    latitude?: number;
    longitude?: number;
    method?: string;
  };

  // Validate calc method
  if (method && !CALC_METHODS[method]) {
    return NextResponse.json({ error: "Unknown calc method" }, { status: 400 });
  }

  const updated = await db.user.update({
    where: { id: user.id },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(location !== undefined ? { location } : {}),
      ...(latitude !== undefined ? { latitude } : {}),
      ...(longitude !== undefined ? { longitude } : {}),
      ...(method !== undefined ? { method } : {}),
    },
    select: {
      id: true,
      name: true,
      email: true,
      location: true,
      latitude: true,
      longitude: true,
      method: true,
    },
  });

  return NextResponse.json({ ok: true, user: updated });
}
