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
import { Award, GraduationCap, Building, Edit } from "lucide-react";
import { cn } from "@/lib/utils";
import { Navigate } from "@tanstack/react-router";
import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/admin")({
  component: AdminRoute,
});

function AdminRoute() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();

  if (isPending) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if the user is an administrator and verified
  if (!session || session.user?.role !== "administrator") {
    // Redirect to login page instead of showing access denied
    return <Navigate to="/login" />;
  }
  if (session.user?.emailVerified === false) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-[#ffffff] border border-gray-light rounded-xl p-6 text-center">
          <h2 className="text-2xl font-semibold text-text mb-2">
            Verify your email
          </h2>
          <p className="text-text-muted mb-6">
            Please confirm your email address to access the Dashboard.
          </p>
          <button
            onClick={async () => {
              try {
                const resp = await fetch(
                  `${import.meta.env.VITE_BACKEND_URL}/api/auth/send-verification-email`,
                  {
                    method: "POST",
                    credentials: "include",
                  }
                );
                if (!resp.ok)
                  throw new Error("Failed to send verification email");
                alert("Verification email sent. Please check your inbox.");
              } catch (e) {
                alert(e instanceof Error ? e.message : "Error sending email");
              }
            }}
            className="px-4 py-2 bg-black text-white rounded hover:bg-black/80 transition-colors"
          >
            Resend verification email
          </button>
        </div>
      </div>
    );
  }

  return <AdminPage />;
}

function AdminAccessDenied({ error }: { error: Error }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#ffffff] flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold mb-4 text-text">Access Denied</h1>
      <p className="mb-8 text-center max-w-md text-text-muted">
        {error.message}
      </p>
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

  // All hooks must be called at the top level, before any conditional returns
  const [activeTab, setActiveTab] = React.useState("templates");
  const tabsRef = React.useRef<HTMLDivElement>(null);
  const [indicatorStyle, setIndicatorStyle] = React.useState({
    width: 0,
    left: 0,
  });
  const [isEditingCode, setIsEditingCode] = React.useState(false);
  const [newShortCode, setNewShortCode] = React.useState("");

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

  React.useEffect(() => {
    const updateIndicator = () => {
      if (!tabsRef.current) return;

      const tabs = tabsRef.current.querySelectorAll('[role="tab"]');
      const activeIndex =
        activeTab === "templates" ? 0 : activeTab === "students" ? 1 : 2;
      const activeTabElement = tabs[activeIndex] as HTMLElement;

      if (activeTabElement) {
        const containerRect = tabsRef.current.getBoundingClientRect();
        const tabRect = activeTabElement.getBoundingClientRect();
        const left = tabRect.left - containerRect.left;
        const width = tabRect.width;

        setIndicatorStyle({ width, left });
      }
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [activeTab]);

  // If the data is still loading, show a loading spinner
  if (
    isSessionLoading ||
    isBadgesLoading ||
    isStudentsLoading ||
    isOrganizationLoading
  ) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  console.log("Current organization:", organization);

  const activeStudents = students?.length || 0;

  return (
    <div className="container mx-auto px-4 py-8 bg-[#ffffff]">
      {/* Organization Header Section - ABOVE TABS */}
      <div className="mb-12">
        <h1 className="text-5xl font-bold text-gray-900 mb-10">
          {organization?.name || "Organization"}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Students */}
          <div>
            <div className="text-sm text-gray-600 mb-1">Active Students</div>
            <div className="text-2xl font-semibold text-gray-900">
              {activeStudents}
            </div>
          </div>

          {/* Organization Code */}
          <div>
            <div className="text-sm text-gray-600 mb-1">Organization Code</div>
            <div className="flex items-center gap-2">
              {isEditingCode ? (
                <>
                  <Input
                    value={newShortCode}
                    onChange={(e) => setNewShortCode(e.target.value)}
                    className="max-w-xs"
                  />
                  <Button size="sm" onClick={() => setIsEditingCode(false)}>
                    Save
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setIsEditingCode(false)}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <div className="text-2xl font-semibold text-gray-900">
                    {organization?.short_code || "No code"}
                  </div>
                  <button
                    onClick={() => {
                      setNewShortCode(organization?.short_code || "");
                      setIsEditingCode(true);
                    }}
                    className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
                  >
                    <Edit className="h-4 w-4 text-gray-600" />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* Sleek tab design - always show the sleek version */}
        <div className="mb-8">
          <div className="border-b border-gray-200 relative">
            <TabsList
              ref={tabsRef}
              className="inline-flex h-auto items-center gap-8 bg-transparent p-0 border-0 rounded-none"
            >
              <TabsTrigger
                value="templates"
                className={cn(
                  "relative px-0 py-4 text-sm font-medium bg-transparent border-0 rounded-none transition-colors",
                  "data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-500",
                  "hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                )}
              >
                <Award className="h-4 w-4 inline-block mr-2" />
                Badges
              </TabsTrigger>
              <TabsTrigger
                value="students"
                className={cn(
                  "relative px-0 py-4 text-sm font-medium bg-transparent border-0 rounded-none transition-colors",
                  "data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-500",
                  "hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                )}
              >
                <GraduationCap className="h-4 w-4 inline-block mr-2" />
                Students
              </TabsTrigger>
              <TabsTrigger
                value="organization"
                className={cn(
                  "relative px-0 py-4 text-sm font-medium bg-transparent border-0 rounded-none transition-colors",
                  "data-[state=active]:text-gray-900 data-[state=inactive]:text-gray-500",
                  "hover:text-gray-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                )}
              >
                <Building className="h-4 w-4 inline-block mr-2" />
                Organization
              </TabsTrigger>
            </TabsList>
            {/* Sliding underline indicator */}
            <div
              className="absolute bottom-0 h-0.5 bg-gray-900 transition-all duration-300 ease-in-out"
              style={{
                width: `${indicatorStyle.width}px`,
                left: `${indicatorStyle.left}px`,
              }}
            />
          </div>
        </div>

        <TabsContent
          value="templates"
          className="mt-6 rounded-xl p-6 bg-[#ffffff] border border-gray-light"
        >
          <BadgesDashboard badges={badges || []} />
        </TabsContent>

        <TabsContent value="students" className="mt-6 bg-[#ffffff]">
          <StudentDashboard students={students || []} badges={badges || []} />
        </TabsContent>

        <TabsContent value="organization" className="mt-6 bg-[#ffffff]">
          <OrganizationsDashboard />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
