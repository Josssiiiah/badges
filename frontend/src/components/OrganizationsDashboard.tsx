import * as React from "react";
import { authClient } from "@/lib/auth-client";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, CalendarDays, UserPlus, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { fetchWithAuth } from "@/lib/api-client";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

type Invitation = {
  id: string;
  email: string;
  type: "administrator" | "student";
  status: "pending" | "used" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
};

export function OrganizationsDashboard() {
  const { data: session } = authClient.useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isInviteDialogOpen, setIsInviteDialogOpen] = React.useState(false);
  const [inviteEmail, setInviteEmail] = React.useState("");

  // Fetch organization data
  const { data: organization, isLoading: isLoadingOrg } = useQuery({
    queryKey: ["organization"],
    queryFn: async () => {
      const response = await fetchWithAuth("organizations/current");
      const data = await response.json();
      return data.organization as Organization;
    },
    enabled: !!session?.user,
  });

  // Fetch organization users (for administrators list)
  const { data: orgUsers, isLoading: isLoadingUsers } = useQuery({
    queryKey: ["organization-users", organization?.id],
    queryFn: async () => {
      if (!organization?.id) return [];
      const response = await fetchWithAuth(
        `organizations/${organization.id}/users`
      );
      const data = await response.json();
      return data.users || [];
    },
    enabled: !!organization?.id,
  });

  // Fetch invitations (administrator only)
  const { data: invitations } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      const response = await fetchWithAuth("invitations/list");
      const data = await response.json();
      const allInvitations = data.invitations || [];
      // Filter to only show administrator invitations
      return allInvitations.filter(
        (inv: Invitation) => inv.type === "administrator"
      );
    },
    enabled: !!organization?.id,
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await fetchWithAuth("invitations/create", {
        method: "POST",
        body: JSON.stringify({ email, type: "administrator" }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invitation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setIsInviteDialogOpen(false);
      setInviteEmail("");
      toast({
        title: "Success",
        description: "Administrator invitation sent successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Revoke invitation mutation
  const revokeInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetchWithAuth(
        `invitations/revoke/${invitationId}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to revoke invitation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast({
        title: "Success",
        description: "Invitation revoked successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  // Resend invitation mutation
  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const response = await fetchWithAuth(
        `invitations/resend/${invitationId}`,
        {
          method: "POST",
        }
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to resend invitation");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      toast({
        title: "Success",
        description: "Invitation resent successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });

  const handleSendInvitation = () => {
    if (!inviteEmail || !inviteEmail.includes("@")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }
    createInvitationMutation.mutate(inviteEmail);
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "default";
      case "used":
        return "secondary";
      case "expired":
        return "destructive";
      case "revoked":
        return "outline";
      default:
        return "default";
    }
  };

  const isLoading = isLoadingOrg || isLoadingUsers;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const administrators =
    orgUsers?.filter((u: OrganizationUser) => u.role === "administrator") || [];
  const pendingInvitations =
    invitations?.filter((inv: Invitation) => inv.status === "pending") || [];
  const otherInvitations =
    invitations?.filter((inv: Invitation) => inv.status !== "pending") || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">
          Administrator Invitations
        </h2>
        <Button
          onClick={() => setIsInviteDialogOpen(true)}
          className="bg-black text-white hover:bg-black/80"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Send Invitation
        </Button>
      </div>

      {/* Invitations Section */}
      <div className="space-y-4">
        {/* Pending Invitations */}
        {pendingInvitations.length > 0 && (
          <div className="bg-[#ffffff] rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="text-gray-600 font-medium py-4 px-6">
                    Email
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium py-4 px-6">
                    Expires
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium py-4 px-6">
                    Sent
                  </TableHead>
                  <TableHead className="text-right text-gray-600 font-medium py-4 px-6">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvitations.map(
                  (invitation: Invitation, index: number) => (
                    <TableRow
                      key={invitation.id}
                      className={cn(
                        "border-0 hover:bg-gray-50/50 transition-colors",
                        index !== pendingInvitations.length - 1 &&
                          "border-b border-gray-100"
                      )}
                    >
                      <TableCell className="font-medium py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {invitation.email}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        {formatDate(invitation.expiresAt)}
                      </TableCell>
                      <TableCell className="text-gray-600 py-4 px-6">
                        {formatDate(invitation.createdAt)}
                      </TableCell>
                      <TableCell className="text-right py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              resendInvitationMutation.mutate(invitation.id)
                            }
                            disabled={resendInvitationMutation.isPending}
                          >
                            <RefreshCw className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              revokeInvitationMutation.mutate(invitation.id)
                            }
                            disabled={revokeInvitationMutation.isPending}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Past Invitations */}
        {otherInvitations.length > 0 && (
          <div className="bg-[#ffffff] rounded-lg">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-b border-gray-100">
                  <TableHead className="text-gray-600 font-medium py-4 px-6">
                    Email
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium py-4 px-6">
                    Status
                  </TableHead>
                  <TableHead className="text-gray-600 font-medium py-4 px-6">
                    Sent
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {otherInvitations.map(
                  (invitation: Invitation, index: number) => (
                    <TableRow
                      key={invitation.id}
                      className={cn(
                        "border-0 hover:bg-gray-50/50 transition-colors",
                        index !== otherInvitations.length - 1 &&
                          "border-b border-gray-100"
                      )}
                    >
                      <TableCell className="font-medium py-4 px-6">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          {invitation.email}
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <Badge
                          variant={getStatusBadgeVariant(invitation.status)}
                        >
                          {invitation.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-600 py-4 px-6">
                        {formatDate(invitation.createdAt)}
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {pendingInvitations.length === 0 && otherInvitations.length === 0 && (
          <div className="bg-[#ffffff] rounded-lg p-12 text-center text-gray-600">
            <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No invitations yet</p>
            <p className="text-sm mt-2">
              Send your first invitation to get started
            </p>
          </div>
        )}
      </div>

      {/* Separator */}
      <Separator className="my-8" />

      {/* Administrators Section */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900">Administrators</h2>

        {/* Administrators Table - Sleek like students */}
        <div className="bg-[#ffffff] rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-b border-gray-100">
                <TableHead className="text-gray-600 font-medium py-4 px-6 w-12"></TableHead>
                <TableHead className="text-gray-600 font-medium py-4 px-6">
                  Name
                </TableHead>
                <TableHead className="text-gray-600 font-medium py-4 px-6">
                  Email
                </TableHead>
                <TableHead className="text-gray-600 font-medium py-4 px-6">
                  Joined
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {administrators.length === 0 ? (
                <TableRow className="border-0">
                  <TableCell
                    colSpan={4}
                    className="h-24 text-center text-gray-500 py-8"
                  >
                    No administrators found.
                  </TableCell>
                </TableRow>
              ) : (
                administrators.map((admin: OrganizationUser, index: number) => (
                  <TableRow
                    key={admin.id}
                    className={cn(
                      "cursor-pointer border-0 hover:bg-gray-50/50 transition-colors",
                      index !== administrators.length - 1 &&
                        "border-b border-gray-100"
                    )}
                  >
                    <TableCell className="py-4 px-6">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-gray-100 text-gray-900">
                          {getInitials(admin.name)}
                        </AvatarFallback>
                      </Avatar>
                    </TableCell>
                    <TableCell className="text-gray-900 py-4 px-6 font-medium">
                      {admin.name || "No name"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4 px-6">
                      {admin.email || "No email"}
                    </TableCell>
                    <TableCell className="text-gray-600 py-4 px-6">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        {formatDate(admin.createdAt)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Invite Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Administrator Invitation</DialogTitle>
            <DialogDescription>
              Invite a new administrator to join your organization
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-4">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsInviteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSendInvitation}
              disabled={createInvitationMutation.isPending}
              className="bg-black text-white hover:bg-black/80"
            >
              {createInvitationMutation.isPending
                ? "Sending..."
                : "Send Invitation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
