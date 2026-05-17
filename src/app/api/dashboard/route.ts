import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, successResponse } from "@/lib/middleware-auth";

// GET /api/dashboard — Get dashboard statistics
export async function GET(request: NextRequest) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    const isAdmin = result.role === "ADMIN";
    const now = new Date();

    // Build base task filter
    const taskWhere = isAdmin ? {} : { assignedToId: result.id };
    const projectWhere = isAdmin ? {} : { members: { some: { userId: result.id } } };

    // Get task counts
    const [totalTasks, completedTasks, pendingTasks, inProgressTasks, totalProjects] =
      await Promise.all([
        prisma.task.count({ where: taskWhere }),
        prisma.task.count({ where: { ...taskWhere, status: "COMPLETED" } }),
        prisma.task.count({ where: { ...taskWhere, status: "PENDING" } }),
        prisma.task.count({ where: { ...taskWhere, status: "IN_PROGRESS" } }),
        prisma.project.count({ where: projectWhere }),
      ]);

    // Count overdue tasks
    const overdueTasks = await prisma.task.count({
      where: {
        ...taskWhere,
        status: { not: "COMPLETED" },
        dueDate: { lt: now },
      },
    });

    // Get total unique members (admin sees all, member sees their project members)
    let totalMembers = 0;
    if (isAdmin) {
      totalMembers = await prisma.user.count();
    } else {
      const memberProjects = await prisma.projectMember.findMany({
        where: { userId: result.id },
        select: { projectId: true },
      });
      const projectIds = memberProjects.map((m) => m.projectId);
      totalMembers = await prisma.projectMember
        .findMany({
          where: { projectId: { in: projectIds } },
          select: { userId: true },
          distinct: ["userId"],
        })
        .then((m) => m.length);
    }

    // Recent activity
    const activityWhere = isAdmin
      ? {}
      : { userId: result.id };

    const recentActivity = await prisma.activityLog.findMany({
      where: activityWhere,
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, title: true } },
      },
      orderBy: { timestamp: "desc" },
      take: 10,
    });

    return successResponse({
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      overdueTasks,
      totalProjects,
      totalMembers,
      recentActivity,
      tasksByStatus: [
        { status: "COMPLETED", count: completedTasks },
        { status: "IN_PROGRESS", count: inProgressTasks },
        { status: "PENDING", count: pendingTasks },
        { status: "OVERDUE", count: overdueTasks },
      ],
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return errorResponse("Internal server error", 500);
  }
}
