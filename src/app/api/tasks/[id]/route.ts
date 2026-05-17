import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, successResponse, forbiddenResponse } from "@/lib/middleware-auth";
import { taskUpdateSchema } from "@/lib/validations";

// PUT /api/tasks/[id] — Update a task
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;
    const { id } = await params;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return errorResponse("Task not found", 404);

    const body = await request.json();

    // Members can only update status of tasks assigned to them
    if (result.role === "MEMBER") {
      if (existing.assignedToId !== result.id) return forbiddenResponse("You can only update tasks assigned to you");
      if (Object.keys(body).some((k) => k !== "status")) return forbiddenResponse("Members can only update task status");
    }

    const validation = taskUpdateSchema.safeParse(body);
    if (!validation.success) return errorResponse(validation.error.issues.map((e) => e.message).join(", "), 400);

    const { title, description, dueDate, status, assignedToId } = validation.data;

    const updateData: Record<string, unknown> = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (status !== undefined) updateData.status = status;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || null;

    const task = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, title: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: `Updated task "${task.title}"${status ? ` to ${status}` : ""}`,
        userId: result.id,
        projectId: task.projectId,
      },
    });

    return successResponse(task);
  } catch (error) {
    console.error("Update task error:", error);
    return errorResponse("Internal server error", 500);
  }
}

// DELETE /api/tasks/[id] — Delete a task (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;
    if (result.role !== "ADMIN") return forbiddenResponse();
    const { id } = await params;

    const existing = await prisma.task.findUnique({ where: { id } });
    if (!existing) return errorResponse("Task not found", 404);

    await prisma.task.delete({ where: { id } });

    await prisma.activityLog.create({
      data: {
        action: `Deleted task "${existing.title}"`,
        userId: result.id,
        projectId: existing.projectId,
      },
    });

    return successResponse({ message: "Task deleted successfully" });
  } catch (error) {
    console.error("Delete task error:", error);
    return errorResponse("Internal server error", 500);
  }
}
