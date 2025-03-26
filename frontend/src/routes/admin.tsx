import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { StudentDashboard } from "@/components/StudentDashboard";
import { TemplatesDashboard } from "@/components/TemplatesDashboard";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

type Badge = {
  id: string;
  name: string;
  description?: string | null;
  imageUrl?: string;
  imageData: string;
  createdAt?: Date | null;
  updatedAt?: Date | null;
};

type Student = {
  studentId: string;
  name: string;
  email: string;
  hasBadge: boolean;
  badgeId?: string;
  badge?: Badge;
};

// Use the environment variable for API URL
const API_URL = `${import.meta.env.VITE_BACKEND_URL}`;

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

function AdminPage() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"earners" | "templates">(
    "earners"
  );
  const { toast } = useToast();

  // Fetch badges
  const { data: badges, isLoading: isBadgesLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/badges/all`);
      const data = await response.json();
      console.log("Badges:", data.badges);
      return data.badges || [];
    },
  });

  // Fetch students
  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const response = await fetch(`${API_URL}/students/all`);
        const data = await response.json();
        console.log("Students:", data.students);
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
        {/* Welcome Section */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700 mb-8">
          <h2 className="text-xl font-semibold mb-2 text-white">
            Welcome, {session.user?.email || "Admin"}
          </h2>
          <p className="text-gray-400">This is a protected admin area.</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-700 mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("earners")}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === "earners"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              )}
            >
              Earners
            </button>
            <button
              onClick={() => setActiveTab("templates")}
              className={cn(
                "py-4 px-1 border-b-2 font-medium text-sm",
                activeTab === "templates"
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
              )}
            >
              Templates
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-lg shadow-md p-6 border border-gray-700">
          {activeTab === "earners" ? (
            <StudentDashboard initialStudents={students} badges={badges} />
          ) : (
            <TemplatesDashboard />
          )}
        </div>
      </div>
      <Toaster />
    </div>
  );
}
