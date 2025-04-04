import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Building,
  Users,
  User,
  CalendarDays,
  Shield,
  GraduationCap,
  Copy,
  Check,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { fetchWithAuth } from "@/lib/api-client";
import { useState } from "react";

// Get the backend URL from environment variables
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

type Organization = {
  id: string;
  name: string;
  short_code?: string;
  createdAt?: string;
  updatedAt?: string;
};

type OrganizationUser = {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  createdAt: string;
};

export function OrganizationsDashboard() {
  const { data: session } = authClient.useSession();
  const { toast } = useToast();
  const [copiedShortCode, setCopiedShortCode] = useState(false);

  // Check if the organizations API is working correctly
  const { data: healthCheck } = useQuery({
    queryKey: ["org-api-health"],
    queryFn: async () => {
      try {
        console.log(
          `Checking API health at: ${BACKEND_URL}/organizations/health`
        );
        const response = await fetch(`${BACKEND_URL}/organizations/health`, {
          credentials: "include",
          headers: {
            Accept: "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Organizations API is not available");
        }

        return await response.json();
      } catch (error) {
        console.error("API health check failed:", error);
        return { status: "error" };
      }
    },
  });

  // Fetch the current organization data
  const { data: organization, isLoading: isLoadingOrg } = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      try {
        if (!session?.user) {
          console.log("No user in session");
          return null;
        }

        // Fetch organization data from the backend API
        console.log("Fetching organization data from API");
        const response = await fetchWithAuth("organizations/current");

        if (!response.ok) {
          console.error("Organization API error:", response.status);
          throw new Error("Failed to fetch organization data");
        }

        const data = await response.json();
        console.log("Organization data from API:", data);

        if (!data.organization) {
          console.log("No organization returned from API");
          return {
            id: "unknown",
            name: "No organization",
          } as Organization;
        }

        return data.organization as Organization;
      } catch (error) {
        console.error("Error fetching organization:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch organization details",
        });
        return {
          id: "unknown",
          name: "Error loading organization",
        } as Organization;
      }
    },
    enabled: !!session?.user,
  });

  // Fetch organization users
  const { data: orgUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["organization-users", organization?.id],
    queryFn: async () => {
      try {
        if (!organization?.id || organization.id === "unknown") {
          console.log("No valid organization ID for fetching users");
          return [];
        }

        // Check if the API health check failed
        if (healthCheck?.status !== "ok") {
          console.log("Skipping user fetch - API health check failed");
          return [];
        }

        const url = `${BACKEND_URL}/organizations/${organization.id}/users`;
        console.log(`Fetching users from: ${url}`);

        const response = await fetch(url, {
          credentials: "include", // Include cookies for auth
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        // First check for the content type
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Received non-JSON response:", await response.text());
          throw new Error("Server did not return JSON");
        }

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response from API:", errorData);
          throw new Error(
            errorData.error || "Failed to fetch organization users"
          );
        }

        const data = await response.json();
        console.log("Received organization users:", data);
        return Array.isArray(data.users) ? data.users : [];
      } catch (error) {
        console.error("Error fetching organization users:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description:
            error instanceof Error
              ? error.message
              : "Failed to fetch organization users",
        });
        return [];
      }
    },
    enabled:
      !!organization?.id &&
      organization.id !== "unknown" &&
      healthCheck?.status === "ok",
  });

  // Fetch students from the students table
  const { data: students, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      try {
        if (!organization?.id || organization.id === "unknown") {
          console.log("No valid organization ID for fetching students");
          return [];
        }

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
    enabled: !!organization?.id && organization.id !== "unknown",
  });

  const isLoading = isLoadingOrg || isLoadingUsers || isLoadingStudents;

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "administrator":
        return "bg-blue-100 text-black dark:bg-blue-900/30 dark:text-black";
      case "student":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "??";
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const handleCopyShortCode = () => {
    if (organization?.short_code) {
      navigator.clipboard.writeText(organization.short_code);
      setCopiedShortCode(true);
      setTimeout(() => setCopiedShortCode(false), 2000);

      toast({
        title: "Short code copied",
        description: "Organization short code copied to clipboard",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--main-text)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Organization Overview Card */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-br from-white/20 to-white/5 backdrop-filter backdrop-blur-md border border-white/30 shadow-xl overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[var(--accent-bg)]/20">
                  <Building className="h-6 w-6 text-[var(--main-text)]" />
                </div>
                <div>
                  <CardTitle className="text-xl">
                    Organization Profile
                  </CardTitle>
                  <CardDescription>Basic organization details</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-center p-4 rounded-lg bg-[var(--accent-bg)]/10">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-[var(--main-text)]/70" />
                    <span className="text-sm font-medium text-[var(--main-text)]/60">
                      Organization
                    </span>
                  </div>
                  <span className="text-base font-semibold text-[var(--main-text)]">
                    {organization?.name || "No organization"}
                  </span>
                </div>

                <div className="flex justify-between items-center p-4 rounded-lg bg-[var(--accent-bg)]/10">
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-[var(--main-text)]/70" />
                    <span className="text-sm font-medium text-[var(--main-text)]/60">
                      Organization Code
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-semibold text-[var(--main-text)]">
                      {organization?.short_code || "No code available"}
                    </span>
                    <button
                      onClick={handleCopyShortCode}
                      className="p-1 rounded-md hover:bg-[var(--accent-bg)]/20 transition-colors"
                      aria-label="Copy organization code"
                    >
                      {copiedShortCode ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-[var(--main-text)]/70" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-white/20 to-white/5 backdrop-filter backdrop-blur-md border border-white/30 shadow-xl">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-[var(--accent-bg)]/20">
                  <Users className="h-6 w-6 text-[var(--main-text)]" />
                </div>
                <div>
                  <CardTitle className="text-xl">Member Statistics</CardTitle>
                  <CardDescription>
                    Overview of organization members
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-[var(--accent-bg)]/10 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-[var(--main-text)]">
                    {orgUsers?.filter(
                      (u: OrganizationUser) => u.role === "administrator"
                    ).length || 0}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[var(--main-text)]/60 font-medium">
                    <Shield className="h-3.5 w-3.5" />
                    <span>Administrators</span>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-[var(--accent-bg)]/10 flex flex-col items-center justify-center">
                  <div className="text-3xl font-bold text-[var(--main-text)]">
                    {students?.length || 0}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-[var(--main-text)]/60 font-medium">
                    <GraduationCap className="h-3.5 w-3.5" />
                    <span>Students</span>
                  </div>
                </div>
              </div>

              <Button className="w-full" variant="outline">
                <User className="h-4 w-4 mr-2" />
                Invite New Administrator
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organization Members Card */}
      <Card className="bg-gradient-to-br from-white/20 to-white/5 backdrop-filter backdrop-blur-md border border-white/30 shadow-xl overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-full bg-[var(--accent-bg)]/20">
                <Users className="h-5 w-5 text-[var(--main-text)]" />
              </div>
              <div>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                  Manage your organization's users
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {orgUsers && orgUsers.length > 0 ? (
            <div className="rounded-xl overflow-hidden border border-white/20">
              <Table>
                <TableHeader className="bg-[var(--accent-bg)]/15">
                  <TableRow className="hover:bg-transparent dark:hover:bg-transparent">
                    <TableHead className="w-12"></TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Join Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orgUsers.map((user: OrganizationUser) => (
                    <TableRow
                      key={user.id}
                      className="hover:bg-[var(--accent-bg)]/5"
                    >
                      <TableCell className="font-medium p-4">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-[var(--accent-bg)]/30 text-[var(--main-text)]">
                            {getInitials(user.name)}
                          </AvatarFallback>
                        </Avatar>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-[var(--main-text)]">
                            {user.name || "No name"}
                          </span>
                          <span className="text-sm text-[var(--main-text)]/60">
                            {user.email || "No email"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${getRoleColor(user.role)} capitalize px-2 py-1`}
                        >
                          {user.role === "administrator" ? (
                            <Shield className="inline h-3 w-3 mr-1" />
                          ) : (
                            <User className="inline h-3 w-3 mr-1" />
                          )}
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <CalendarDays className="h-4 w-4 mr-2 text-[var(--main-text)]/50" />
                          <span className="text-sm">
                            {new Date(user.createdAt).toLocaleDateString(
                              undefined,
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-[var(--accent-bg)]/5 rounded-lg">
              <Users className="h-10 w-10 text-[var(--main-text)]/40 mb-2" />
              <p className="text-center text-[var(--main-text)]/70 mb-4">
                No members found for this organization.
              </p>
              <Button variant="outline" size="sm">
                <User className="h-4 w-4 mr-2" />
                Add Administrators
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
