import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Browser API requests forward the access token explicitly because the
  // session may live in localStorage rather than a request cookie. Resolve
  // that bearer token here so unauthenticated API calls are rejected before
  // they reach Prisma.
  let authenticatedUser = user;
  const bearerToken = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!authenticatedUser && bearerToken && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    const bearerClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    authenticatedUser = (await bearerClient.auth.getUser(bearerToken)).data.user;
  }

  const isPublicApi = request.nextUrl.pathname === "/api/health";
  if (!authenticatedUser && request.nextUrl.pathname.startsWith("/api/") && !isPublicApi) {
    return NextResponse.json({ error: "Authentication required" }, { status: 401 });
  }

  // Protected routes - redirect to login if not authenticated
  if (
    !authenticatedUser &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/landing") &&
    !request.nextUrl.pathname.startsWith("/auth/callback") &&
    !request.nextUrl.pathname.startsWith("/api/") &&
    !request.nextUrl.pathname.startsWith("/api/auth") &&
    request.nextUrl.pathname !== "/"
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/landing";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
