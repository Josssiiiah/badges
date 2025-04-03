import { createFileRoute } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TemplatesDashboard } from "@/components/TemplatesDashboard";
import { StudentDashboard } from "@/components/StudentDashboard";
import { OrganizationsDashboard } from "@/components/OrganizationsDashboard";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="min-h-screen bg-oxford flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pure"></div>
      </div>
    );
  }

  // Check if the user is an administrator
  if (!session || session.user?.role !== "administrator") {
    return (
      <AdminAccessDenied
        error={new Error("You must be an administrator to access this page")}
      />
    );
  }

  return <AdminPage />;
}

function AdminAccessDenied({ error }: { error: Error }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-oxford text-pure flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
      <p className="mb-8 text-center max-w-md">{error.message}</p>
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
  if (isSessionLoading || isBadgesLoading || isStudentsLoading) {
    return (
      <div className="min-h-screen bg-oxford flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pure"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-2 text-[var(--main-text)]">
        Admin Dashboard
      </h1>
      <p className="text-gray-500 mb-8">
        Organization: {session?.user?.organization || "No organization"}
      </p>

      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="templates">Badges</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="organization">Organization</TabsTrigger>
        </TabsList>

        <TabsContent
          value="templates"
          className="mt-6 rounded-xl p-6 bg-white/10 backdrop-filter backdrop-blur-lg border-2 border-white/30 shadow-xl ring-1 ring-white/50"
        >
          <TemplatesDashboard badges={badges || []} />
        </TabsContent>

        <TabsContent
          value="students"
          className="mt-6 rounded-xl p-6 bg-white/10 backdrop-filter backdrop-blur-lg border-2 border-white/30 shadow-xl ring-1 ring-white/50"
        >
          <StudentDashboard students={students || []} badges={badges || []} />
        </TabsContent>

        <TabsContent
          value="organization"
          className="mt-6 rounded-xl p-6 bg-white/10 backdrop-filter backdrop-blur-lg border-2 border-white/30 shadow-xl ring-1 ring-white/50"
        >
          <OrganizationsDashboard />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
