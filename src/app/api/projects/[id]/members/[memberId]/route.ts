import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, errorResponse, successResponse, forbiddenResponse } from "@/lib/middleware-auth";

// DELETE /api/projects/[id]/members/[memberId] — Remove a member (ADMIN only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; memberId: string }> }
) {
  try {
    const result = requireAuth(request);
    if (result instanceof NextResponse) return result;

    if (result.role !== "ADMIN") return forbiddenResponse();

    const { id: projectId, memberId } = await params;

    // Check project exists
    const project = await prisma.project.findUnique({ where: { id: projectId } });
    if (!project) return errorResponse("Project not found", 404);

    // Find the membership
    const member = await prisma.projectMember.findUnique({
      where: { id: memberId },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!member || member.projectId !== projectId) {
      return errorResponse("Member not found in this project", 404);
    }

    // Prevent removing the project creator
    if (member.userId === project.createdById) {
      return errorResponse("Cannot remove the project creator", 400);
    }

    await prisma.projectMember.delete({ where: { id: memberId } });

    await prisma.activityLog.create({
      data: {
        action: `Removed ${member.user.name} from project "${project.title}"`,
        userId: result.id,
        projectId,
      },
    });

    return successResponse({ message: "Member removed successfully" });
  } catch (error) {
    console.error("Remove member error:", error);
    return errorResponse("Internal server error", 500);
  }
}
