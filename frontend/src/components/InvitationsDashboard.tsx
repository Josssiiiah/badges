import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Mail, UserPlus, X, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { fetchWithAuth } from "@/lib/api-client";
import { useState } from "react";

type Invitation = {
  id: string;
  email: string;
  type: "administrator" | "student";
  status: "pending" | "used" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
  organizationName?: string;
};

export function InvitationsDashboard() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newInviteEmail, setNewInviteEmail] = useState("");
  const [newInviteType, setNewInviteType] = useState<"administrator" | "student">("student");

  // Fetch invitations
  const { data: invitations, isLoading } = useQuery({
    queryKey: ["invitations"],
    queryFn: async () => {
      try {
        const response = await fetchWithAuth("invitations/list");
        const data = await response.json();
        return (data.invitations || []) as Invitation[];
      } catch (error) {
        console.error("Error fetching invitations:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch invitations",
        });
        return [];
      }
    },
  });

  // Create invitation mutation
  const createInvitationMutation = useMutation({
    mutationFn: async (data: { email: string; type: "administrator" | "student" }) => {
      const response = await fetchWithAuth("invitations/create", {
        method: "POST",
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create invitation");
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations"] });
      setIsCreateDialogOpen(false);
      setNewInviteEmail("");
      setNewInviteType("student");
      toast({
        title: "Success",
        description: "Invitation sent successfully",
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
      const response = await fetchWithAuth(`invitations/revoke/${invitationId}`, {
        method: "DELETE",
      });

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
      const response = await fetchWithAuth(`invitations/resend/${invitationId}`, {
        method: "POST",
      });

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

  const handleCreateInvitation = () => {
    if (!newInviteEmail || !newInviteEmail.includes("@")) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid email address",
      });
      return;
    }

    createInvitationMutation.mutate({
      email: newInviteEmail,
      type: newInviteType,
    });
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

  const pendingInvitations = invitations?.filter((inv) => inv.status === "pending") || [];
  const otherInvitations = invitations?.filter((inv) => inv.status !== "pending") || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Team Invitations</h2>
          <p className="text-sm text-gray-600 mt-1">
            Invite administrators and students to your organization
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-black/80">
              <UserPlus className="h-4 w-4 mr-2" />
              Send Invitation
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Send Invitation</DialogTitle>
              <DialogDescription>
                Invite a new team member to join your organization
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-4">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={newInviteEmail}
                  onChange={(e) => setNewInviteEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Role</Label>
                <Select
                  value={newInviteType}
                  onValueChange={(value: "administrator" | "student") =>
                    setNewInviteType(value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="administrator">Administrator</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateInvitation}
                disabled={createInvitationMutation.isPending}
                className="bg-black text-white hover:bg-black/80"
              >
                {createInvitationMutation.isPending ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Pending Invitations */}
          {pendingInvitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
                <CardDescription>
                  Invitations waiting to be accepted
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Expires</TableHead>
                      <TableHead>Sent</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {invitation.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {invitation.type === "administrator"
                              ? "Administrator"
                              : "Student"}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(invitation.expiresAt)}</TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(invitation.createdAt)}
                        </TableCell>
                        <TableCell className="text-right">
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
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Past Invitations */}
          {otherInvitations.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Invitation History</CardTitle>
                <CardDescription>
                  Previously sent invitations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sent</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {otherInvitations.map((invitation) => (
                      <TableRow key={invitation.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            {invitation.email}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {invitation.type === "administrator"
                              ? "Administrator"
                              : "Student"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(invitation.status)}>
                            {invitation.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-600">
                          {formatDate(invitation.createdAt)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {invitations && invitations.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Mail className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No invitations yet
                </h3>
                <p className="text-gray-600">
                  Send your first invitation to get started
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
