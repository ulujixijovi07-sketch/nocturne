import { auth } from "@/lib/auth";
import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

const intlMiddleware = createMiddleware({
  locales: ["en", "fr", "de", "es", "it"],
  defaultLocale: "en",
  localePrefix: "always",
});

// Pages that should NOT go through the intl middleware
const SKIP_INTL = ["/auth", "/admin", "/login"];

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // ─── Redirect /login → /auth/signin ────────────────────────────────────

  if (pathname === "/login" || pathname.match(/^\/(en|fr|de|es|it)\/login$/)) {
    const signInUrl = new URL("/auth/signin", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // ─── Admin route protection ───────────────────────────────────────────

  const isAdminRoute =
    pathname.startsWith("/admin") ||
    /^\/(en|fr|de|es|it)\/admin/.test(pathname);

  if (isAdminRoute) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const authUser = (req as any).auth?.user;
    const isLoggedIn = !!authUser;
    const isAdmin = authUser?.role === "ADMIN";

    if (!isLoggedIn) {
      const signInUrl = new URL("/auth/signin", req.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    if (!isAdmin) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    // Admin is authenticated — skip intl for /admin/* routes (they have no locale prefix)
    if (pathname.startsWith("/admin")) {
      return NextResponse.next();
    }
  }

  // ─── Skip intl for auth pages ─────────────────────────────────────────

  if (SKIP_INTL.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // ─── Everything else: delegate to intl ────────────────────────────────

  return intlMiddleware(req);
});

export const config = {
  matcher: [
    // Match all pathnames except:
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - static files (favicon, images, etc.)
    "/((?!api|_next|_vercel|.*\\..*).*)",
  ],
};
