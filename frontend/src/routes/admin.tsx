import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import React, { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { StudentDashboard } from "@/components/StudentDashboard";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isSessionLoading && !session) {
      navigate({
        to: "/login",
        search: {
          redirectTo: "/admin",
        },
      });
    }
  }, [session, isSessionLoading, navigate]);

  if (isSessionLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!session) {
    return null; // This will be shown briefly before the redirect happens
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100">
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h1>

        <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2 text-white">
              Welcome, {session.user?.email || "Admin"}
            </h2>
            <p className="text-gray-400">This is a protected admin area.</p>
          </div>

          {/* Student Dashboard */}
          <StudentDashboard />
        </div>
      </div>
      <Toaster />
    </div>
  );
}
