import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

// Public routes that don't require authentication
const publicRoutes = ["/login", "/", "/api/auth/login"];

// This array defines which routes require authentication and which roles can access them
const protectedRoutes = [
  {
    path: "/admin",
    roles: ["admin"],
  },
  {
    path: "/invigilator",
    roles: ["invigilator"],
  },
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for next.js internal routes and API routes that don't need auth
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.startsWith("/images") ||
    pathname.includes(".") || // Skip files like favicon.ico, manifest.json etc.
    pathname.startsWith("/api/auth/login") // Allow login API route
  ) {
    return NextResponse.next();
  }

  // Allow access to public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from login page
  if (pathname === "/login") {
    try {
      const authHeader = request.headers.get("authorization");
      if (authHeader && authHeader.startsWith("Bearer ")) {
        const token = authHeader.substring(7);
        // User is already logged in, redirect based on role
        const encodedKey = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, encodedKey);
        const role = payload.role as string;

        if (role === "admin") {
          return NextResponse.redirect(new URL("/admin/courses", request.url));
        } else if (role === "invigilator") {
          return NextResponse.redirect(new URL("/invigilator", request.url));
        }
        // For any other role, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    } catch (error) {
      // If token is invalid, allow access to login page
      return NextResponse.next();
    }
  }

  // Check if this is a protected route
  const protectedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.path)
  );
  if (!protectedRoute) {
    return NextResponse.next();
  }

  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return redirectToLogin(request);
    }

    const token = authHeader.substring(7);

    // Verify JWT token
    const encodedKey = new TextEncoder().encode(JWT_SECRET);
    const { payload } = await jwtVerify(token, encodedKey);

    // Check if user has required role
    const userRole = payload.role as string;
    if (!protectedRoute.roles.includes(userRole)) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
  } catch (error) {
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const redirectUrl = new URL("/login", request.url);
  redirectUrl.searchParams.set("from", request.nextUrl.pathname);
  return NextResponse.redirect(redirectUrl);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/auth/login (login API route)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/auth/login).*)",
  ],
};
