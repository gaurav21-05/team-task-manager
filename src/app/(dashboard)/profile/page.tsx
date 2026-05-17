"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Badge from "@/components/ui/Badge";
import Card, { CardContent } from "@/components/ui/Card";

export default function ProfilePage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Profile</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Your account information</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center text-center py-10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/25">
            <span className="text-3xl font-bold text-white">{user.name.charAt(0).toUpperCase()}</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{user.name}</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-3">{user.email}</p>
          <Badge variant={user.role === "ADMIN" ? "purple" : "info"} size="md" dot>
            {user.role}
          </Badge>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h3 className="font-semibold text-gray-900 dark:text-white">Account Details</h3>
          <div className="space-y-3">
            {[
              { label: "Full Name", value: user.name },
              { label: "Email", value: user.email },
              { label: "Role", value: user.role },
              { label: "User ID", value: user.id },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <span className="text-sm text-gray-500 dark:text-gray-400">{item.label}</span>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{item.value}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h3 className="font-semibold text-gray-900 dark:text-white">Permissions</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Create Projects", allowed: user.role === "ADMIN" },
              { label: "Delete Projects", allowed: user.role === "ADMIN" },
              { label: "Manage Members", allowed: user.role === "ADMIN" },
              { label: "Create Tasks", allowed: user.role === "ADMIN" },
              { label: "Assign Tasks", allowed: user.role === "ADMIN" },
              { label: "Update Task Status", allowed: true },
              { label: "View Dashboard", allowed: true },
              { label: "View Assigned Tasks", allowed: true },
            ].map((perm) => (
              <div key={perm.label} className="flex items-center gap-2">
                {perm.allowed ? (
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                )}
                <span className={`text-sm ${perm.allowed ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
                  {perm.label}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
