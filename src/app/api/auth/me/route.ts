import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, unauthorizedResponse, successResponse, errorResponse } from "@/lib/middleware-auth";
import { NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    const user = await prisma.user.findUnique({
      where: { id: result.id },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    if (!user) return unauthorizedResponse("User not found");

    return successResponse(user);
  } catch (error) {
    console.error("Get me error:", error);
    return errorResponse("Internal server error", 500);
  }
}
