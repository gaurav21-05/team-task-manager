import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromCookies } from "./auth";
import { AuthUser, UserRole } from "@/types";

export function getAuthUser(request: NextRequest): AuthUser | null {
  const cookieHeader = request.headers.get("cookie");
  const token = getTokenFromCookies(cookieHeader);
  if (!token) return null;
  return verifyToken(token);
}

export function unauthorizedResponse(message = "Authentication required") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  );
}

export function forbiddenResponse(message = "Insufficient permissions") {
  return NextResponse.json(
    { success: false, error: message },
    { status: 403 }
  );
}

export function requireAuth(request: NextRequest): AuthUser | NextResponse {
  const user = getAuthUser(request);
  if (!user) return unauthorizedResponse();
  return user;
}

export function requireRole(
  request: NextRequest,
  role: UserRole
): AuthUser | NextResponse {
  const result = requireAuth(request);
  if (result instanceof NextResponse) return result;
  if (result.role !== role) return forbiddenResponse();
  return result;
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    { success: false, error: message },
    { status }
  );
}

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data },
    { status }
  );
}
