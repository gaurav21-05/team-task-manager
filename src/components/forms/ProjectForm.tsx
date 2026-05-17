"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { projectSchema, ProjectInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface ProjectFormProps {
  onSuccess: () => void;
  initialData?: { title: string; description: string | null };
  projectId?: string;
}

export default function ProjectForm({ onSuccess, initialData, projectId }: ProjectFormProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!projectId;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (data: ProjectInput) => {
    setLoading(true);
    try {
      const res = await fetch(
        isEditing ? `/api/projects/${projectId}` : "/api/projects",
        {
          method: isEditing ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        }
      );
      const result = await res.json();
      if (result.success) {
        toast.success(isEditing ? "Project updated!" : "Project created!");
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
      <Input
        label="Project Title"
        placeholder="Enter project title"
        error={errors.title?.message}
        {...register("title")}
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          Description
        </label>
        <textarea
          {...register("description")}
          placeholder="Describe your project (optional)"
          rows={3}
          className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-900 dark:text-white placeholder-gray-400 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all resize-none"
        />
        {errors.description && (
          <p className="mt-1.5 text-sm text-rose-500">{errors.description.message}</p>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" loading={loading} className="flex-1">
          {isEditing ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
