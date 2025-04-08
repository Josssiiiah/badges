import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Share2,
  Clock,
  Book,
  Award,
  ExternalLink,
  Eye,
  Globe,
  Calendar,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api-client";
import { Link } from "@tanstack/react-router";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";

type Badge = {
  // ID from the badges table (assignment ID)
  id: string;
  // ID from the createdBadges table (badge template ID)
  badgeId: string;
  earnedAt: Date;
  // Badge details from createdBadges
  issuedBy: string;
  name: string;
  description: string | null;
  imageData: string;
  courseLink: string | null;
  skills: string | null;
  earningCriteria: string | null;
  createdAt: Date | null;
  updatedAt: Date | null;
};

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

  const {
    data: badges,
    isLoading: isBadgesLoading,
    error,
  } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const response = await fetchWithAuth("badges/all");
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      console.log("Badges: ", data.badges);

      return data.badges as Badge[];
    },
    enabled: !!session?.user,
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
                <p className="text-[var(--main-text)]/80">
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Card>
          {/* Centered User Info Section with different background */}
          <CardContent className="pt-6 pb-6 bg-[var(--accent-bg)]/10">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Avatar className="h-24 w-24 ring-4 ring-[var(--accent-bg)]/20 shadow-lg">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-bg)]/70 text-white text-xl">
                  {getInitials(user.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[var(--main-text)]">
                  {user.name}
                </h2>
                <p className="text-[var(--main-text)]/80 mt-1">{user.email}</p>

                <div className="flex items-center justify-center gap-1 text-sm text-primary mt-1">
                  <a
                    href={`/users/${user.name}`}
                    className="hover:underline flex items-center"
                  >
                    <Share2 className="h-3 w-3 mr-1" />
                    Public Profile
                    <span className="ml-1 text-[var(--main-text)]/60">
                      ({window.location.origin}/users/{user.name})
                    </span>
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
              <h1 className="text-3xl font-bold text-[var(--main-text)]">
                Profile
              </h1>
              <div className="flex items-center gap-2">
                <Switch
                  id="profile-visibility"
                  checked={isPublic}
                  onCheckedChange={handleToggleVisibility}
                  disabled={isTogglingVisibility}
                />
                <Label
                  htmlFor="profile-visibility"
                  className="text-sm text-[var(--main-text)]"
                >
                  Allow my profile to be publically visible
                </Label>
              </div>
            </div>

            {/* Personal Summary Section in rounded div with background */}
            <div className="bg-[var(--accent-bg)]/5 rounded-lg p-6 mb-6">
              <h3 className="text-xl font-semibold text-[var(--main-text)] mb-4">
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
                  <p className="text-sm text-[var(--main-text)]/60">
                    ({biography.length}/600 characters)
                  </p>
                  <Button
                    onClick={handleSaveBiography}
                    disabled={!hasChanges || isSaving}
                    size="sm"
                    className="bg-[var(--main-text)] hover:bg-[var(--main-text)]/80 text-white"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>

            {/* Badge Wallet Section in rounded div with background */}
            <div className="bg-[var(--accent-bg)]/5 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-[var(--main-text)] mb-4">
                Badge Wallet
              </h3>

              {isBadgesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex flex-col gap-2">
                      <Skeleton className="h-[200px] w-full rounded-xl" />
                      <Skeleton className="h-6 w-3/4 rounded-md" />
                      <Skeleton className="h-4 w-1/2 rounded-md" />
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="text-center py-8 bg-[var(--main-bg)] rounded-xl shadow-sm border border-[var(--accent-bg)]/10">
                  <p className="text-[var(--main-text)]/80">
                    Error loading badges
                  </p>
                </div>
              ) : badges && badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {badges.map((badge, index) => (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.1,
                        ease: "easeOut",
                      }}
                      whileHover={{
                        y: -10,
                        transition: { duration: 0.2 },
                      }}
                      className="group"
                    >
                      <HoverCard>
                        <HoverCardTrigger asChild>
                          <div className="h-full">
                            <Card className="overflow-hidden h-full flex flex-col bg-[var(--main-bg)] border-[var(--accent-bg)]/10 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                              <div className="p-5 bg-gradient-to-br from-[var(--accent-bg)]/5 to-[var(--accent-bg)]/15 flex items-center justify-center">
                                <div className="w-28 h-28 relative">
                                  {badge.imageData ? (
                                    <img
                                      src={badge.imageData}
                                      alt={badge.name}
                                      className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                                    />
                                  ) : (
                                    <div className="w-full h-full bg-[var(--accent-bg)]/10 flex items-center justify-center text-[var(--main-text)]/60 rounded-full">
                                      <Award className="h-12 w-12" />
                                    </div>
                                  )}
                                </div>
                              </div>
                              <CardContent className="p-5 flex-1 flex flex-col">
                                <div className="mb-3">
                                  <h4 className="font-semibold text-[var(--main-text)] mb-1 group-hover:text-primary transition-colors duration-200 line-clamp-1">
                                    {badge.name}
                                  </h4>
                                  <p className="text-xs text-[var(--main-text)]/70 flex items-center gap-1">
                                    <Award className="h-3 w-3 flex-shrink-0" />
                                    <span className="line-clamp-1">
                                      {badge.issuedBy}
                                    </span>
                                  </p>
                                </div>

                                {badge.description && (
                                  <p className="text-xs text-[var(--main-text)]/80 line-clamp-2 mb-4">
                                    {badge.description}
                                  </p>
                                )}

                                {badge.skills && (
                                  <div className="mt-auto">
                                    <div className="flex flex-wrap gap-1.5">
                                      {badge.skills
                                        .split(",")
                                        .slice(0, 3)
                                        .map((skill, index) => (
                                          <BadgeUI
                                            key={index}
                                            variant="outline"
                                            className="text-xs bg-[var(--accent-bg)]/10 hover:bg-[var(--accent-bg)]/20 transition-colors"
                                          >
                                            {skill.trim()}
                                          </BadgeUI>
                                        ))}
                                      {badge.skills.split(",").length > 3 && (
                                        <BadgeUI
                                          variant="outline"
                                          className="text-xs bg-[var(--accent-bg)]/10 hover:bg-[var(--accent-bg)]/20 transition-colors"
                                        >
                                          +{badge.skills.split(",").length - 3}{" "}
                                          more
                                        </BadgeUI>
                                      )}
                                    </div>
                                  </div>
                                )}

                                <div className="mt-4 pt-3 border-t border-[var(--accent-bg)]/10 flex justify-between items-center">
                                  <Link
                                    to="/badges/$badgeId"
                                    params={{ badgeId: badge.id }}
                                  >
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="gap-1 text-xs opacity-90 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                      <Eye className="h-3 w-3" />
                                      View Badge
                                    </Button>
                                  </Link>

                                  {badge.courseLink && (
                                    <a
                                      href={badge.courseLink}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center text-xs text-primary hover:underline"
                                    >
                                      <ExternalLink className="mr-1 h-3 w-3" />
                                      Course
                                    </a>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent className="w-80 p-0 shadow-lg border-0">
                          <div className="p-4 border-b border-[var(--accent-bg)]/10">
                            <h4 className="font-medium text-[var(--main-text)]">
                              {badge.name}
                            </h4>
                            <p className="text-xs text-[var(--main-text)]/70 flex items-center gap-1 mt-1">
                              <Award className="h-3 w-3" />
                              Issued by {badge.issuedBy}
                            </p>
                          </div>
                          <div className="p-4 space-y-3">
                            {badge.description && (
                              <div className="space-y-1">
                                <p className="text-xs text-[var(--main-text)]/70">
                                  {badge.description}
                                </p>
                              </div>
                            )}

                            {badge.earningCriteria && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-[var(--main-text)]">
                                  Earning Criteria
                                </p>
                                <p className="text-xs text-[var(--main-text)]/70">
                                  {badge.earningCriteria}
                                </p>
                              </div>
                            )}

                            {badge.courseLink && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-[var(--main-text)]">
                                  Course
                                </p>
                                <a
                                  href={badge.courseLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary flex items-center gap-1 hover:underline"
                                >
                                  <Globe className="h-3 w-3" />
                                  View Course
                                </a>
                              </div>
                            )}

                            {badge.earnedAt && (
                              <div className="space-y-1">
                                <p className="text-xs font-medium text-[var(--main-text)]">
                                  Earned
                                </p>
                                <p className="text-xs text-[var(--main-text)]/70 flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(badge.earnedAt)}
                                </p>
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[var(--main-bg)] rounded-xl shadow-sm border border-[var(--accent-bg)]/10">
                  <Award className="h-16 w-16 mx-auto mb-4 text-[var(--accent-bg)]/30" />
                  <h3 className="text-xl font-medium text-[var(--main-text)] mb-2">
                    No badges yet
                  </h3>
                  <p className="text-[var(--main-text)]/70 max-w-md mx-auto">
                    Search for badges to earn by using the search bar at the top
                    of the page.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      <Toaster />
    </div>
  );
}
