import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                     req.nextUrl.pathname.startsWith("/landing");
  const isApiAuth = req.nextUrl.pathname.startsWith("/api/auth");
  const isPublicPage = req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/landing";

  // Allow API auth routes
  if (isApiAuth) return;

  // If logged in and trying to access login/landing, redirect to dashboard
  if (isLoggedIn && isAuthPage) {
    return Response.redirect(new URL("/", req.url));
  }

  // If not logged in and trying to access protected route
  if (!isLoggedIn && !isPublicPage && !isAuthPage) {
    return Response.redirect(new URL("/landing", req.url));
  }

  return;
});

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|api/).*)"],
};
