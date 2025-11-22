import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { fetchWithAuth } from "@/lib/api-client";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/onboard/join-admin")({
  component: JoinAdminPage,
});

type InvitationData = {
  email: string;
  type: string;
  organizationName: string;
};

function JoinAdminPage() {
  const navigate = useNavigate();
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : ""
  );
  const token = params.get("token") || "";

  const [invitation, setInvitation] = React.useState<InvitationData | null>(
    null
  );
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [validationError, setValidationError] = React.useState("");

  const [userName, setUserName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    async function validateToken() {
      if (!token) {
        setValidationError("No invitation token provided");
        setLoading(false);
        return;
      }

      try {
        const resp = await fetchWithAuth("invitations/validate-token", {
          method: "POST",
          body: JSON.stringify({ token }),
        });

        const data = await resp.json();

        if (!resp.ok || !data.valid) {
          setValidationError(data.error || "Invalid invitation");
          setLoading(false);
          return;
        }

        if (data.invitation.type !== "administrator") {
          setValidationError("This invitation is not for an administrator");
          setLoading(false);
          return;
        }

        setInvitation(data.invitation);
      } catch (e) {
        setValidationError("Failed to validate invitation");
      } finally {
        setLoading(false);
      }
    }

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!userName) {
      setError("Please enter your name");
      return;
    }

    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const resp = await fetchWithAuth("invitations/complete-admin-join", {
        method: "POST",
        body: JSON.stringify({
          token,
          password,
          userName,
        }),
      });

      const data = await resp.json();

      if (!resp.ok) {
        throw new Error(data.error || "Failed to join organization");
      }

      // Success! Redirect to dashboard
      navigate({ to: "/dashboard", replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Skeleton className="h-10 w-2/3 mb-4" />
          <Skeleton className="h-6 w-1/2 mb-8" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-3" />
          <Skeleton className="h-10 w-full mb-6" />
        </div>
      </div>
    );
  }

  if (validationError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Invalid Invitation</CardTitle>
              <CardDescription>{validationError}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-text-muted">
                Please contact your administrator if you believe this is an error.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Join {invitation?.organizationName}</CardTitle>
            <CardDescription>
              You've been invited to join as an administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 text-red-500 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={invitation?.email || ""}
                  readOnly
                  className="text-black opacity-80 cursor-not-allowed"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="userName">Your Name</Label>
                <Input
                  id="userName"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="text-black"
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-black"
                  placeholder="At least 8 characters"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-black"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="bg-black text-white hover:bg-black/80 w-full"
              >
                {submitting ? "Joining..." : "Accept Invitation"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
