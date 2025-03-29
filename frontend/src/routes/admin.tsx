import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import React, { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { StudentDashboard } from "@/components/StudentDashboard";
import { TemplatesDashboard } from "@/components/TemplatesDashboard";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

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

  if (isSessionLoading || isBadgesLoading || isStudentsLoading) {
    return (
      <div className="min-h-screen bg-oxford flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pure"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-primary text-pure">
      <div className="container mx-auto p-6">
        {/* Welcome Section */}
        <div className=" rounded-lg bg-slate-900/50 backdrop-blur-lg shadow-md p-6 border border-space-300 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-pure">Dashboard</h2>
          <p className="text-pure/80">
            Manage students, badges, and view statistics.
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-space-500/50 backdrop-blur-lg rounded-lg shadow-md p-6 border border-space-300">
          <Tabs defaultValue="students" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6 bg-oxford/50 p-1 rounded-lg">
              <TabsTrigger
                value="students"
                className="data-[state=active]:bg-violet-500 data-[state=active]:text-pure text-[var(--main-text)] rounded-md py-2"
              >
                Students
              </TabsTrigger>
              <TabsTrigger
                value="badges"
                className="data-[state=active]:bg-violet-500 data-[state=active]:text-pure text-[var(--main-text)] rounded-md py-2"
              >
                Badges
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="data-[state=active]:bg-violet-500 data-[state=active]:text-pure text-[var(--main-text)] rounded-md py-2"
              >
                Stats
              </TabsTrigger>
            </TabsList>
            <TabsContent value="students" className="mt-4">
              <StudentDashboard initialStudents={students} badges={badges} />
            </TabsContent>
            <TabsContent value="badges" className="mt-4">
              <TemplatesDashboard />
            </TabsContent>
            <TabsContent value="stats" className="mt-4">
              <div className="text-center py-12">
                <p className="text-pure/80">Statistics coming soon...</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
