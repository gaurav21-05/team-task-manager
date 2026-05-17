"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema, TaskInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";
import { ProjectType, ProjectMemberType } from "@/types";

interface TaskFormProps {
  onSuccess: () => void;
  projectId?: string;
  members?: ProjectMemberType[];
}

export default function TaskForm({ onSuccess, projectId, members }: TaskFormProps) {
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [projectMembers, setProjectMembers] = useState<ProjectMemberType[]>(members || []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<TaskInput>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      projectId: projectId || "",
      status: "PENDING",
    },
  });

  const selectedProjectId = watch("projectId");

  // Load projects if not provided
  useEffect(() => {
    if (!projectId) {
      fetch("/api/projects")
        .then((r) => r.json())
        .then((d) => { if (d.success) setProjects(d.data); })
        .catch(() => {});
    }
  }, [projectId]);

  // Load members when project changes
  useEffect(() => {
    if (selectedProjectId && !members) {
      fetch(`/api/projects/${selectedProjectId}/members`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setProjectMembers(d.data); })
        .catch(() => {});
    }
  }, [selectedProjectId, members]);

  const onSubmit = async (data: TaskInput) => {
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Task created!");
        onSuccess();
      } else {
        toast.error(result.error || "Something went wrong");
      }
    } catch {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {!projectId && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project</label>
          <select
            {...register("projectId")}
            className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          >
            <option value="">Select a project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          {errors.projectId && <p className="mt-1.5 text-sm text-rose-500">{errors.projectId.message}</p>}
        </div>
      )}

      <Input
        label="Task Title"
        placeholder="Enter task title"
        error={errors.title?.message}
        {...register("title")}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
        <textarea
          {...register("description")}
          placeholder="Describe the task (optional)"
          rows={3}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all resize-none"
        />
      </div>

      <Input
        label="Due Date"
        type="date"
        error={errors.dueDate?.message}
        {...register("dueDate")}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assign To</label>
        <select
          {...register("assignedToId")}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
        >
          <option value="">Unassigned</option>
          {projectMembers.map((m) => (
            <option key={m.user?.id || m.userId} value={m.user?.id || m.userId}>
              {m.user?.name || "Unknown"} ({m.user?.email})
            </option>
          ))}
        </select>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Create Task
      </Button>
    </form>
  );
}
