import * as React from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
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
  MapPin,
  Globe,
  Calendar,
} from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api-client";
import { motion } from "framer-motion";

type Badge = {
  id: string;
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
  biography?: string | null;
  organization?: string | null;
  isPublic?: boolean;
};

export const Route = createFileRoute("/users/$username")({
  component: UserProfileComponent,
});

function UserProfileComponent() {
  const { data: session } = authClient.useSession();
  const { username } = useParams({ from: "/users/$username" });
  const isOwnProfile = session?.user?.name === username;
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Profile link copied!",
        description: "The profile URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "There was an error copying the profile URL.",
      });
    }
  };

  const { data: userData, isLoading: isUserLoading } = useQuery({
    queryKey: ["user", username],
    queryFn: async () => {
      const response = await fetchWithAuth(
        `users/by-username?username=${encodeURIComponent(username)}`
      );
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.user as UserData;
    },
    enabled: !!username,
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

      return data.badges as Badge[];
    },
  });

  const isLoading = isUserLoading || isBadgesLoading;

  // Format date helper function
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--main-bg)] to-[var(--accent-bg)]/5 py-12">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Profile Header */}
        <div className="mb-10">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
            <Avatar className="h-24 w-24 ring-4 ring-[var(--accent-bg)]/20 shadow-lg">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-bg)]/70 text-white text-2xl">
                {getInitials(username)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-[var(--main-text)] mb-1">
                    {username}
                  </h1>
                  {userData?.organization && (
                    <p className="text-[var(--main-text)]/70 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5" />
                      {userData.organization}
                    </p>
                  )}
                </div>

                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 shadow-sm hover:shadow-md transition-all"
                >
                  <Share2 className="h-4 w-4" />
                  Share Profile
                </Button>
              </div>
            </div>
          </div>

          {userData?.biography && userData?.isPublic !== false && (
            <div className="mb-8 bg-[var(--main-bg)] rounded-xl p-6 shadow-sm border border-[var(--accent-bg)]/10">
              <h3 className="text-lg font-medium text-[var(--main-text)] mb-3">
                About
              </h3>
              <p className="text-[var(--main-text)]/80 leading-relaxed">
                {userData.biography}
              </p>
            </div>
          )}
        </div>

        {/* Badges Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-[200px] w-full rounded-xl" />
                <Skeleton className="h-6 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : userData && userData.isPublic === false ? (
          <div className="flex flex-col items-center justify-center py-16 bg-[var(--main-bg)] rounded-xl shadow-sm border border-[var(--accent-bg)]/10">
            <div className="text-center max-w-md p-6">
              <h3 className="text-xl font-medium text-[var(--main-text)] mb-3">
                This profile is private
              </h3>
              <p className="text-[var(--main-text)]/70">
                The user has chosen to keep their profile private. You cannot
                view their badges or profile information.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-[var(--main-text)]">
                Earned Badges
              </h2>
              {badges && badges.length > 0 && (
                <BadgeUI
                  variant="outline"
                  className="px-3 py-1 bg-[var(--accent-bg)]/5"
                >
                  {badges.length} {badges.length === 1 ? "Badge" : "Badges"}
                </BadgeUI>
              )}
            </div>

            {error ? (
              <div className="text-center py-8 bg-[var(--main-bg)] rounded-xl shadow-sm border border-[var(--accent-bg)]/10">
                <p className="text-[var(--main-text)]/80">
                  Error loading badges
                </p>
              </div>
            ) : badges && badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                        <Link
                          to="/badges/$badgeId"
                          params={{ badgeId: badge.id }}
                          className="block h-full"
                        >
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
                                <h4 className="font-semibold text-[var(--main-text)] mb-1 group-hover:text-primary transition-colors duration-200">
                                  {badge.name}
                                </h4>
                                <p className="text-xs text-[var(--main-text)]/70 flex items-center gap-1">
                                  <Award className="h-3 w-3" />
                                  {badge.issuedBy}
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

                              <div className="mt-4 pt-3 border-t border-[var(--accent-bg)]/10">
                                <Button
                                  className="w-full text-xs h-8 transition-opacity duration-300"
                                  variant="default"
                                  size="sm"
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
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

                          {badge.createdAt && (
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-[var(--main-text)]">
                                Earned
                              </p>
                              <p className="text-xs text-[var(--main-text)]/70 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(badge.createdAt)}
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
                  {isOwnProfile
                    ? "You haven't earned any badges yet. Complete courses and achievements to earn badges."
                    : "This user hasn't earned any badges yet."}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
}
