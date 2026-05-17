"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addMemberSchema, AddMemberInput } from "@/lib/validations";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import toast from "react-hot-toast";

interface AddMemberFormProps {
  projectId: string;
  onSuccess: () => void;
}

export default function AddMemberForm({ projectId, onSuccess }: AddMemberFormProps) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddMemberInput>({
    resolver: zodResolver(addMemberSchema),
  });

  const onSubmit = async (data: AddMemberInput) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (result.success) {
        toast.success("Member added successfully!");
        reset();
        onSuccess();
      } else {
        toast.error(result.error || "Failed to add member");
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
        label="Member Email"
        type="email"
        placeholder="Enter the member's email address"
        error={errors.email?.message}
        icon={
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        }
        {...register("email")}
      />
      <p className="text-xs text-gray-500 dark:text-gray-400">
        The user must have an account. They will be added as a member of this project.
      </p>
      <Button type="submit" loading={loading} className="w-full">
        Add Member
      </Button>
    </form>
  );
}
