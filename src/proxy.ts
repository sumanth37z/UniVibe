import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for member-only routes. Runs before any HTML streams, so guests
 * get a real 307 to /login (with the path they wanted preserved as ?next=).
 *
 * This checks cookie *presence* only — the pages themselves still call
 * requireUser() which validates the session against the database, so an
 * invalid/expired session can't bypass anything.
 */
export function proxy(request: NextRequest) {
  const hasSession = Boolean(request.cookies.get("uv_session")?.value);
  if (!hasSession) {
    const url = request.nextUrl.clone();
    const destination = `/login?next=${encodeURIComponent(url.pathname)}`;
    return NextResponse.redirect(new URL(destination, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/registrations/:path*",
    "/my-events/:path*",
    "/profile/:path*",
    "/events/new",
    "/events/:id/edit",
  ],
};
