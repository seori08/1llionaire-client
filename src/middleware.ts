import { NextResponse } from "next/server";
export function middleware() {
  // Auth is restored through /api/auth/me with HttpOnly cookies.
  // Role checks remain in ProtectedRoute and on the backend API.
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
