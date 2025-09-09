import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { fetchWithAuth } from "@/lib/api-client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Toaster } from "@/components/ui/toaster";

type Badge = {
  id: string; // assignment id
  name: string;
  issuedBy: string;
  description: string | null;
  imageData?: string | null;
};

export const Route = createFileRoute("/create-account")({
  component: CreateAccountPage,
});

function CreateAccountPage() {
  const navigate = useNavigate();
  const { data: session, isPending: isSessionPending } = authClient.useSession();

  const params = new URLSearchParams(typeof window !== "undefined" ? window.location.search : "");
  const assignmentId = params.get("assignmentId") || "";

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [badge, setBadge] = React.useState<Badge | null>(null);
  const [loadingBadge, setLoadingBadge] = React.useState(true);

  React.useEffect(() => {
    // Prefill name and email from session when available
    if (session?.user) {
      setEmail(session.user.email || "");
      setName(session.user.name || "");
    }
  }, [session]);

  React.useEffect(() => {
    let isMounted = true;
    async function loadBadge() {
      if (!assignmentId) {
        setLoadingBadge(false);
        return;
      }
      try {
        const resp = await fetchWithAuth(`api/badges/${assignmentId}`);
        const data = await resp.json();
        if (data && data.badge) {
          if (!isMounted) return;
          setBadge({
            id: assignmentId,
            name: data.badge.name,
            issuedBy: data.badge.issuedBy,
            description: data.badge.description,
            imageData: data.badge.imageData,
          });
        }
      } catch (e) {
        // ignore; page still works without preview
      } finally {
        if (isMounted) setLoadingBadge(false);
      }
    }
    loadBadge();
    return () => {
      isMounted = false;
    };
  }, [assignmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      // Require a session (invite link should have created one). If missing, show expired message.
      if (!session?.user) {
        setError("Your secure link has expired. Please request a new one from your instructor.");
        return;
      }

      {
        console.log("[create-account] Changing password for user");
        const { data, error } = await authClient.changePassword({
          currentPassword: import.meta.env.VITE_TEMP_PASSWORD, 
          newPassword: password,
          revokeOtherSessions: false, 
        });
        
        if (error) {
          console.error("[create-account] Failed to change password:", error);
          throw new Error(error.message || "Failed to change password");
        }
        console.log("[create-account] Password changed successfully");
      }

      // Update name if changed
      if (name && name !== (session.user.name || "")) {
        const resp = await fetchWithAuth("api/auth/update-user", {
          method: "POST",
          body: JSON.stringify({ name }),
        });
        if (!resp.ok) {
          const t = await resp.text();
          throw new Error(t || "Failed to update profile");
        }
      }

      // Redirect to public badge page
      const target = `/badges/${encodeURIComponent(assignmentId)}`;
      navigate({ to: target, replace: true });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state until we know session state
  if (isSessionPending) {
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

  // If no session, the invite link likely expired
  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Create your account</CardTitle>
              <CardDescription>
                Your secure link has expired or is invalid. Please request a new link from your instructor.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              Set your password to continue. Your email is verified via this secure link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingBadge ? (
              <div className="mb-6">
                <Skeleton className="h-32 w-full" />
              </div>
            ) : (
              badge && (
                <div className="mb-6 p-4 border rounded-lg bg-surface">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 flex items-center justify-center bg-surface-accent/10 rounded">
                      {badge.imageData ? (
                        <img src={badge.imageData} alt={badge.name} className="max-w-full max-h-16 object-contain" />
                      ) : (
                        <div className="text-text-muted text-sm">Badge</div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{badge.name}</div>
                      <div className="text-sm text-text-muted">Issued by {badge.issuedBy}</div>
                    </div>
                  </div>
                </div>
              )
            )}

            {error && (
              <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/30 text-red-200 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="text-black" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={email} readOnly className="text-black opacity-80 cursor-not-allowed" />
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
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="text-black"
                />
              </div>
              <Button type="submit" disabled={submitting} className="bg-black text-white hover:bg-black/80 w-full">
                {submitting ? "Creating account..." : "Create account"}
              </Button>
            </form>
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
