"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { DashboardStats } from "@/types";
import StatsCards from "@/components/dashboard/StatsCards";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Badge from "@/components/ui/Badge";

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-1">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <Badge variant={user?.role === "ADMIN" ? "purple" : "info"} dot>
            {user?.role}
          </Badge>
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          Here&apos;s an overview of your team&apos;s progress today.
        </p>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} loading={loading} />

      {/* Bottom section */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <RecentActivity
            activities={stats?.recentActivity || []}
            loading={loading}
          />
        </div>

        {/* Task Status Breakdown */}
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Task Breakdown</h3>
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-gray-200 dark:bg-gray-800" />
                  <div className="flex-1 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                  <div className="w-8 h-4 bg-gray-200 dark:bg-gray-800 rounded" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="space-y-4">
              {[
                { label: "Completed", value: stats.completedTasks, total: stats.totalTasks, color: "bg-emerald-500" },
                { label: "In Progress", value: stats.inProgressTasks, total: stats.totalTasks, color: "bg-blue-500" },
                { label: "Pending", value: stats.pendingTasks, total: stats.totalTasks, color: "bg-amber-500" },
                { label: "Overdue", value: stats.overdueTasks, total: stats.totalTasks, color: "bg-rose-500" },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-gray-600 dark:text-gray-400">{item.label}</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.value}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full transition-all duration-1000 ease-out`}
                      style={{ width: `${item.total > 0 ? (item.value / item.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>
    </div>
  );
}
