import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { StudentDashboard } from "@/components/StudentDashboard";
import { TemplatesDashboard } from "@/components/TemplatesDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  beforeLoad: async ({ context }) => {
    // Get the session synchronously to determine whether to render the route
    const session = await authClient.getSession();

    // For debugging - log the session structure
    console.log("Session structure:", JSON.stringify(session, null, 2));

    // Redirect if user is not authenticated or not an administrator
    // Use type assertion to access the correct property
    if (!session || (session as any).data?.user?.role !== "administrator") {
      throw new Error("Unauthorized: Administrator access required");
    }

    return {};
  },
  onError: ({ error }) => {
    // Handle any errors including authentication failures
    console.error("Admin route error:", error);

    return {
      element: <AdminAccessDenied error={error} />,
    };
  },
});

// Component to display when access is denied
function AdminAccessDenied({ error }: { error: Error }) {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-3xl font-bold text-red-500 mb-4">Access Denied</h1>
      <p className="text-lg mb-6 text-center max-w-md">
        {error.message ||
          "You don't have permission to access this page. Administrator privileges are required."}
      </p>
      <button
        onClick={() => navigate({ to: "/" })}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
      >
        Return to Home
      </button>
    </div>
  );
}

function AdminPage() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch badges
  const { data: badges, isLoading: isBadgesLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/badges/all`
      );
      const data = await response.json();
      return data.badges || [];
    },
  });

  // Fetch students
  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/students/all`
        );
        const data = await response.json();
        return data.students || [];
      } catch (error) {
        console.error("Error fetching students:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch students",
        });
        return [];
      }
    },
  });

  // If the data is still loading, show a loading spinner
  if (isSessionLoading || isBadgesLoading || isStudentsLoading) {
    return (
      <div className="min-h-screen bg-oxford flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pure"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-[var(--main-text)]">
        Admin Dashboard
      </h1>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Badge Templates</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <TemplatesDashboard badges={badges || []} />
        </TabsContent>

        <TabsContent value="students" className="mt-6">
          <StudentDashboard students={students || []} badges={badges || []} />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
