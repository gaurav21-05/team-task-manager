import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, successResponse, forbiddenResponse } from "@/lib/middleware-auth";
import { projectSchema } from "@/lib/validations";

// GET /api/projects — Get all projects for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    let projects;

    if (result.role === "ADMIN") {
      // Admins can see all projects
      projects = await prisma.project.findMany({
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Members can only see projects they belong to
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId: result.id } },
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          _count: { select: { members: true, tasks: true } },
        },
        orderBy: { createdAt: "desc" },
      });
    }

    return successResponse(projects);
  } catch (error) {
    console.error("Get projects error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// POST /api/projects — Create a new project (ADMIN only)
export async function POST(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    if (result.role !== "ADMIN") return forbiddenResponse();

    const body = await request.json();
    const validation = projectSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        validation.error.issues.map((e) => e.message).join(", "),
        400
      );
    }

    const { title, description } = validation.data;

    const project = await prisma.project.create({
      data: {
        title,
        description: description || null,
        createdById: result.id,
        members: {
          create: { userId: result.id }, // Creator is automatically a member
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        _count: { select: { members: true, tasks: true } },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        action: `Created project "${title}"`,
        userId: result.id,
        projectId: project.id,
      },
    });

    return successResponse(project, 201);
  } catch (error) {
    console.error("Create project error:", error);
    return errorResponse("Internal server error", 500);
  }
}
