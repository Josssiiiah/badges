import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Award } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api-client";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type UserData = {
  id: string;
  name: string;
  email: string;
  role: string;
  biography: string | null;
  organization: string | null;
  image?: string | null;
  isPublic: boolean;
};

export const Route = createFileRoute("/profile")({
  component: ProfileComponent,
});

function ProfileComponent() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();
  const [biography, setBiography] = React.useState("");
  const [initialBiography, setInitialBiography] = React.useState("");
  const [isPublic, setIsPublic] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = React.useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch user data directly from the backend
  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      if (!session?.user?.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetchWithAuth("users/profile");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.user as UserData;
    },
    enabled: !!session?.user?.id,
  });

  // Update biography state when user data is loaded
  React.useEffect(() => {
    if (userData) {
      setBiography(userData.biography || "");
      setInitialBiography(userData.biography || "");
      setIsPublic(userData.isPublic !== false); // Default to true if undefined
    } else if (session?.user) {
      // Fallback to session data if userData not available yet
      setBiography(session.user.biography || "");
      setInitialBiography(session.user.biography || "");
      setIsPublic(true); // Default to true for session user fallback
    }
  }, [userData, session]);

  const handleSaveBiography = async () => {
    if (!session?.user) return;

    setIsSaving(true);
    try {
      const response = await fetchWithAuth("users/update-biography", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ biography }),
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: "Biography updated successfully",
        });
        setInitialBiography(biography);

        // Update the query cache with the new biography
        queryClient.setQueryData(
          ["user-profile"],
          (oldData: UserData | undefined) => {
            if (!oldData) return undefined;
            return {
              ...oldData,
              biography,
            };
          }
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update biography",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleVisibility = async () => {
    if (!session?.user) return;

    setIsTogglingVisibility(true);
    try {
      const response = await fetchWithAuth("users/update-visibility", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isPublic: !isPublic }),
      });

      const data = await response.json();

      if (data.error) {
        toast({
          title: "Error",
          description: data.error,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Your profile is now ${!isPublic ? "public" : "private"}`,
        });
        setIsPublic(!isPublic);

        // Update the query cache with the new visibility setting
        queryClient.setQueryData(
          ["user-profile"],
          (oldData: UserData | undefined) => {
            if (!oldData) return undefined;
            return {
              ...oldData,
              isPublic: !isPublic,
            };
          }
        );
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile visibility",
        variant: "destructive",
      });
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  const hasChanges = biography !== initialBiography;
  const isLoading = isSessionLoading || isUserLoading;

  // Format date helper function
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Skeleton className="h-12 w-[250px] mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-4/5 mb-6" />
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-text-muted/80">
                  Please log in to view your profile
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Use userData if available, otherwise fall back to session user
  const user = userData || session.user;

  // If email not verified, block access with a prompt
  if (session.user.emailVerified === false) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto bg-surface border border-gray-light rounded-xl p-6 text-center">
          <h2 className="text-2xl font-semibold text-text mb-2">
            Verify your email
          </h2>
          <p className="text-text-muted mb-6">
            Please confirm your email address to access your profile. We can
            resend the verification email if needed.
          </p>
          <div className="flex gap-3 justify-center">
            <Button
              onClick={async () => {
                try {
                  const resp = await fetchWithAuth(
                    "api/auth/send-verification-email",
                    { method: "POST" }
                  );
                  if (!resp.ok)
                    throw new Error("Failed to send verification email");
                  alert("Verification email sent. Please check your inbox.");
                } catch (e) {
                  alert(e instanceof Error ? e.message : "Error sending email");
                }
              }}
              className="bg-black text-white hover:bg-black/80"
            >
              Resend verification email
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Card>
          {/* Centered User Info Section with different background */}
          <CardContent className="pt-6 pb-6 bg-surface-accent/10">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Avatar className="h-24 w-24 ring-4 ring-surface-accent/20 shadow-shadow">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-surface-accent to-surface-accent/70 text-text text-xl">
                  {getInitials(user.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-text-muted">
                  {user.name}
                </h2>
                <p className="text-text-muted/80 mt-1">{user.email}</p>

                <div className="flex items-center justify-center gap-1 text-sm text-primary mt-1">
                  <a
                    href={`/users/${user.name}`}
                    className="hover:underline flex items-center"
                  >
                    {/* <Share2 className="h-3 w-3 mr-1" />
                    Public Profile
                    <span className="ml-1 text-text-muted/60">
                      ({window.location.origin}/users/{user.name})
                    </span> */}
                  </a>
                </div>

                {user.organization && (
                  <BadgeUI variant="outline" className="mt-3">
                    {user.organization}
                  </BadgeUI>
                )}
              </div>
            </div>
          </CardContent>

          <CardContent className="pt-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-text-muted">Profile</h1>
            </div>

            {/* Personal Summary Section in rounded div with background */}
            <div className="bg-surface-accent/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-text-muted mb-4">
                Personal Summary
              </h3>
              <div className="space-y-2">
                <Textarea
                  placeholder="Share a bit about yourself, your interests, or your achievements..."
                  className="min-h-[120px] resize-none"
                  value={biography}
                  onChange={(e) => setBiography(e.target.value)}
                  maxLength={600}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-text-muted/60">
                    ({biography.length}/600 characters)
                  </p>
                  <Button
                    onClick={handleSaveBiography}
                    disabled={!hasChanges || isSaving}
                    size="sm"
                    className="bg-text-muted hover:bg-text-muted/80 text-surface"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
