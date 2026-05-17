import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, successResponse, forbiddenResponse } from "@/lib/middleware-auth";
import { projectSchema } from "@/lib/validations";

// GET /api/projects/[id] — Get a single project with details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    const { id } = await params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true, role: true } },
          },
          orderBy: { createdAt: "asc" },
        },
        tasks: {
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: { select: { members: true, tasks: true } },
      },
    });

    if (!project) {
      return errorResponse("Project not found", 404);
    }

    // Check access: admin can see all, members only their projects
    if (result.role !== "ADMIN") {
      const isMember = project.members.some((m) => m.userId === result.id);
      if (!isMember) return forbiddenResponse("You are not a member of this project");
    }

    return successResponse(project);
  } catch (error) {
    console.error("Get project error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// PUT /api/projects/[id] — Update a project (ADMIN only)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    if (result.role !== "ADMIN") return forbiddenResponse();

    const { id } = await params;
    const body = await request.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map((e) => e.message).join(", "),
        400
      );
    }

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return errorResponse("Project not found", 404);

    const { title, description } = validation.data;

    const project = await prisma.project.update({
      where: { id },
      data: { title, description: description || null },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Updated project "${title}"`,
        userId: result.id,
        projectId: project.id,
      },
    });

    return successResponse(project);
  } catch (error) {
    console.error("Update project error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/projects/[id] — Delete a project (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    if (result.role !== "ADMIN") return forbiddenResponse();

    const { id } = await params;

    const existing = await prisma.project.findUnique({ where: { id } });
    if (!existing) return errorResponse("Project not found", 404);

    await prisma.project.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: `Deleted project "${existing.title}"`,
        userId: result.id,
        projectId: null,
      },
    });

    return successResponse({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Delete project error:", error);
    return errorResponse("Internal server error", 500);
  }
}
