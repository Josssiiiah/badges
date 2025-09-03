import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BadgesDashboard } from "@/components/BadgesDashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import { OrganizationsDashboard } from "@/components/OrganizationsDashboard";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { Award, GraduationCap, Building } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if the user is an administrator
  if (!session || session.user?.role !== "administrator") {
    // Redirect to login page instead of showing access denied
    return <Navigate to="/login" />;
  }

  return <AdminPage />;
}

function AdminAccessDenied({ error }: { error: Error }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-secondary flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-text">Access Denied</h1>
      <p className="mb-8 text-center max-w-md text-text-muted">{error.message}</p>
      <button
        onClick={() => navigate({ to: "/" })}
        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition-colors"
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

  // Fetch organization data
  const { data: organization, isLoading: isOrganizationLoading } = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      try {
        const response = await fetchWithAuth("organizations/current");
        if (!response.ok) {
          console.error("Organization API error:", response.status);
          throw new Error("Failed to fetch organization data");
        }
        const data = await response.json();
        console.log("Organization data:", data);
        return data.organization || null;
      } catch (error) {
        console.error("Error fetching organization:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch organization data",
        });
        return null;
      }
    },
  });

  // Fetch badges
  const { data: badges, isLoading: isBadgesLoading } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const response = await fetchWithAuth("badges/all");
      const data = await response.json();
      return data.badges || [];
    },
  });

  // Fetch students
  const { data: students, isLoading: isStudentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        const response = await fetchWithAuth("students/all");
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
  if (
    isSessionLoading ||
    isBadgesLoading ||
    isStudentsLoading ||
    isOrganizationLoading
  ) {
    return (
      <div className="min-h-screen bg-surface-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log("Current organization:", organization);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-text">
        Admin Dashboard
      </h1>
      <p className="text-text-muted mb-8">
        Organization: {organization?.name || "No organization"}
      </p>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="w-full max-w-md mx-auto mb-6 bg-surface-accent p-1 rounded-lg">
          <TabsTrigger
            value="templates"
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 transition-all",
              "data-[state=active]:bg-surface data-[state=active]:shadow-sm data-[state=active]:text-text",
              "data-[state=inactive]:text-text-muted hover:text-text",
            )}
          >
            <Award className="h-4 w-4" />
            <span>Badges</span>
          </TabsTrigger>
          <TabsTrigger
            value="students"
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 transition-all",
              "data-[state=active]:bg-surface data-[state=active]:shadow-sm data-[state=active]:text-text",
              "data-[state=inactive]:text-text-muted hover:text-text",
            )}
          >
            <GraduationCap className="h-4 w-4" />
            <span>Students</span>
          </TabsTrigger>
          <TabsTrigger
            value="organization"
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 transition-all",
              "data-[state=active]:bg-surface data-[state=active]:shadow-sm data-[state=active]:text-text",
              "data-[state=inactive]:text-text-muted hover:text-text",
            )}
          >
            <Building className="h-4 w-4" />
            <span>Organization</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent
          value="templates"
          className="mt-6 rounded-xl p-6 bg-surface border border-gray-light"
        >
          <BadgesDashboard badges={badges || []} />
        </TabsContent>

        <TabsContent
          value="students"
          className="mt-6 rounded-xl p-6 bg-surface border border-gray-light"
        >
          <StudentDashboard students={students || []} badges={badges || []} />
        </TabsContent>

        <TabsContent
          value="organization"
          className="mt-6 rounded-xl p-6 bg-surface border border-gray-light"
        >
          <OrganizationsDashboard />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
