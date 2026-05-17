"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProjectType } from "@/types";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import AddMemberForm from "@/components/forms/AddMemberForm";
import { CardSkeleton } from "@/components/ui/Skeleton";
import toast from "react-hot-toast";

export default function TeamPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch("/api/projects");
      const data = await res.json();
      if (data.success) setProjects(data.data);
    } catch {
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const fetchProjectDetails = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const data = await res.json();
      if (data.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, members: data.data.members } : p))
        );
      }
    } catch {}
  };

  const handleRemoveMember = async (projectId: string, memberId: string) => {
    if (!confirm("Remove this member?")) return;
    try {
      const res = await fetch(`/api/projects/${projectId}/members/${memberId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        toast.success("Member removed");
        fetchProjectDetails(projectId);
      } else toast.error(data.error || "Failed");
    } catch { toast.error("Network error"); }
  };

  const isAdmin = user?.role === "ADMIN";

  // Load details for all projects on mount
  useEffect(() => {
    if (!loading && projects.length > 0) {
      projects.forEach((p) => {
        if (!p.members) fetchProjectDetails(p.id);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Team Members</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Manage team members across all projects</p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-20 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <p className="text-gray-500 dark:text-gray-400">No projects found</p>
        </div>
      ) : (
        <div className="space-y-6">
          {projects.map((project) => (
            <div key={project.id} className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900 dark:text-white">{project.title}</h2>
                    <p className="text-xs text-gray-500">{project._count?.members || 0} members</p>
                  </div>
                </div>
                {isAdmin && (
                  <Button size="sm" variant="outline" onClick={() => setSelectedProjectId(project.id)}>
                    Add Member
                  </Button>
                )}
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {project.members ? (
                  project.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{member.user?.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{member.user?.name}</p>
                        <p className="text-xs text-gray-500">{member.user?.email}</p>
                      </div>
                      <Badge variant={member.user?.role === "ADMIN" ? "purple" : "default"} size="sm">{member.user?.role}</Badge>
                      {isAdmin && member.userId !== project.createdById && (
                        <button onClick={() => handleRemoveMember(project.id, member.id)} className="p-1 rounded-lg text-gray-400 hover:text-rose-500 transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-6 py-4 text-sm text-gray-500">Loading members...</div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {selectedProjectId && (
        <Modal isOpen={!!selectedProjectId} onClose={() => setSelectedProjectId(null)} title="Add Team Member">
          <AddMemberForm
            projectId={selectedProjectId}
            onSuccess={() => {
              setSelectedProjectId(null);
              fetchProjects();
            }}
          />
        </Modal>
      )}
    </div>
  );
}
