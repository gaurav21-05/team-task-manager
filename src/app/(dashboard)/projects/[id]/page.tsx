"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { ProjectType, TaskType } from "@/types";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import TaskForm from "@/components/forms/TaskForm";
import AddMemberForm from "@/components/forms/AddMemberForm";
import ProjectForm from "@/components/forms/ProjectForm";
import { Skeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      if (data.success) setProject(data.data);
    } catch {
      toast.error("Failed to load project");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchProject(); }, [fetchProject]);

  const handleStatusChange = async (taskId: string, status: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Task updated");
        fetchProject();
      } else {
        toast.error(data.error || "Failed to update");
      }
    } catch { toast.error("Network error"); }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Task deleted"); fetchProject(); }
      else toast.error(data.error || "Failed");
    } catch { toast.error("Network error"); }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/projects/${id}/members/${memberId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) { toast.success("Member removed"); fetchProject(); }
      else toast.error(data.error || "Failed");
    } catch { toast.error("Network error"); }
  };

  const isAdmin = user?.role === "ADMIN";

  const getStatusBadge = (task: TaskType) => {
    const now = new Date();
    const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== "COMPLETED";
    if (isOverdue) return <Badge variant="danger" dot>Overdue</Badge>;
    if (task.status === "COMPLETED") return <Badge variant="success" dot>Completed</Badge>;
    if (task.status === "IN_PROGRESS") return <Badge variant="info" dot>In Progress</Badge>;
    return <Badge variant="warning" dot>Pending</Badge>;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-96" />
        <div className="grid md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Project not found</h2>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{project.title}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {project.description || "No description"} · Created by {project.createdBy?.name}
          </p>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => setShowEditModal(true)}>Edit</Button>
            <Button onClick={() => setShowTaskModal(true)}>
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Task
            </Button>
            <Button variant="outline" onClick={() => setShowMemberModal(true)}>Add Member</Button>
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks ({project.tasks?.length || 0})
          </h2>
          {(!project.tasks || project.tasks.length === 0) ? (
            <div className="text-center py-12 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
              <p className="text-gray-500 dark:text-gray-400">No tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {(project.tasks as TaskType[]).map((task) => (
                <div
                  key={task.id}
                  className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">{task.title}</h3>
                        {getStatusBadge(task)}
                      </div>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        {task.assignedTo && <span>Assigned to: {task.assignedTo.name}</span>}
                        {task.dueDate && (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(task.id, e.target.value)}
                        className="text-xs rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="COMPLETED">Completed</option>
                      </select>
                      {isAdmin && (
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Members */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Members ({project.members?.length || 0})
          </h2>
          <div className="space-y-2">
            {project.members?.map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <span className="text-xs font-bold text-white">
                    {member.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.user?.name}</p>
                  <p className="text-xs text-gray-500 truncate">{member.user?.email}</p>
                </div>
                <Badge variant={member.user?.role === "ADMIN" ? "purple" : "default"} size="sm">
                  {member.user?.role}
                </Badge>
                {isAdmin && member.userId !== project.createdById && (
                  <button
                    onClick={() => handleRemoveMember(member.id)}
                    className="p-1 rounded-lg text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showTaskModal} onClose={() => setShowTaskModal(false)} title="Create Task" size="lg">
        <TaskForm projectId={id} members={project.members as any} onSuccess={() => { setShowTaskModal(false); fetchProject(); }} />
      </Modal>

      <Modal isOpen={showMemberModal} onClose={() => setShowMemberModal(false)} title="Add Member">
        <AddMemberForm projectId={id} onSuccess={() => { setShowMemberModal(false); fetchProject(); }} />
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Project">
        <ProjectForm
          projectId={id}
          initialData={{ title: project.title, description: project.description }}
          onSuccess={() => { setShowEditModal(false); fetchProject(); }}
        />
      </Modal>
    </div>
  );
}
