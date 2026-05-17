import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, successResponse, forbiddenResponse } from "@/lib/middleware-auth";
import { addMemberSchema } from "@/lib/validations";

// POST /api/projects/[id]/members — Add a member to a project (ADMIN only)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    if (result.role !== "ADMIN") return forbiddenResponse();

    const { id: projectId } = await params;
    const body = await request.json();
    const validation = addMemberSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map((e) => e.message).join(", "),
        400
      );
    }

    // Check project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return errorResponse("Project not found", 404);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: validation.data.email },
    });
    if (!user) return errorResponse("User not found with this email", 404);

    // Check if already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: { userId_projectId: { userId: user.id, projectId } },
    });
    if (existingMember) return errorResponse("User is already a member of this project", 409);

    // Add member
    const member = await prisma.projectMember.create({
      data: { userId: user.id, projectId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Added ${user.name} to project "${project.title}"`,
        userId: result.id,
        projectId,
      },
    });

    return successResponse(member, 201);
  } catch (error) {
    console.error("Add member error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// GET /api/projects/[id]/members — Get all members of a project
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id: projectId } = await params;

    const members = await prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true, role: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    return successResponse(members);
  } catch (error) {
    console.error("Get members error:", error);
    return errorResponse("Internal server error", 500);
  }
}
