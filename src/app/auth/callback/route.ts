import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const requestedNext = searchParams.get("next") ?? "/";
  const next = requestedNext.startsWith("/") ? requestedNext : "/";
  const response = NextResponse.redirect(`${origin}${next}`);

  if (!code) return NextResponse.redirect(`${origin}/login?error=auth-error`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.headers.get("cookie")?.split(";").map((item) => {
          const [name, ...value] = item.trim().split("=");
          return { name, value: value.join("=") };
        }) ?? [],
        setAll: (cookies) => cookies.forEach(({ name, value, options }) => response.cookies.set(name, value, options)),
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);
  return error ? NextResponse.redirect(`${origin}/login?error=auth-error`) : response;
}
