import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request })
  const isAuthenticated = !!token

  // Public paths that don't require authentication
  const publicPaths = ["/login"]

  // Check if the current path is a public path
  const isPublicPath = publicPaths.some((path) => request.nextUrl.pathname.startsWith(path))

  // Redirect logic
  if (isPublicPath) {
    // If user is on a public path and is authenticated, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
    // Otherwise, allow access to the public path
    return NextResponse.next()
  }

  // If user is not authenticated and trying to access a protected route
  if (!isAuthenticated) {
    // Store the original URL they were trying to access
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.url)
    return NextResponse.redirect(url)
  }

  // Role-based access control
  if (token) {
    const userRole = token.role as string

    // Admin-only paths
    const adminOnlyPaths = ["/dashboard/admin"]
    const isAdminPath = adminOnlyPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    // Manager and admin paths
    const managerPaths = ["/dashboard/reports"]
    const isManagerPath = managerPaths.some((path) => request.nextUrl.pathname.startsWith(path))

    // Check permissions based on role
    if (isAdminPath && userRole !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }

    if (isManagerPath && userRole !== "ADMIN" && userRole !== "MANAGER") {
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  // Allow the request to continue
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
