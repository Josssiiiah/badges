import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Get the backend URL from environment variables
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000/api";

type Organization = {
  id: string;
  name: string;
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

        const orgId = session.user.organizationId;
        const orgName = session.user.organization;

        console.log("Session organization data:", {
          id: orgId,
          name: orgName,
          user: {
            id: session.user.id,
            role: session.user.role,
          },
        });

        if (!orgId && !orgName) {
          console.log("User doesn't have organization data");
          return null;
        }

        // We're just using the organization info from the session for now
        // In a more complete implementation, we would fetch detailed organization data
        return {
          id: orgId || "unknown",
          name: orgName || "No organization",
        } as Organization;
      } catch (error) {
        console.error("Error fetching organization:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch organization details",
        });
        return null;
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

  const isLoading = isLoadingOrg || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--main-text)]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-[var(--main-text)]">
          Organization Details
        </h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Info</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[var(--main-text)]/70">
                Organization Name
              </h3>
              <p className="text-lg font-medium text-[var(--main-text)]">
                {organization?.name || "No organization"}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-[var(--main-text)]/70">
                Organization ID
              </h3>
              <p className="text-lg font-medium text-[var(--main-text)]">
                {organization?.id || "N/A"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Organization Members</CardTitle>
        </CardHeader>
        <CardContent>
          {orgUsers && orgUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orgUsers.map((user: OrganizationUser) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name || "No name"}</TableCell>
                    <TableCell>{user.email || "No email"}</TableCell>
                    <TableCell className="capitalize">{user.role}</TableCell>
                    <TableCell>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-4 text-[var(--main-text)]/70">
              No members found for this organization.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
