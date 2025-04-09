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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

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
    <motion.div
      className="min-h-screen relative py-12"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 1 }}
          className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-[var(--violet-light)]/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-40 left-1/3 w-72 h-72 rounded-full bg-[var(--accent-bg)]/30 blur-3xl"
        />
      </div>

      <div className="container mx-auto px-4 max-w-6xl">
        {/* Profile Header */}
        <motion.div variants={itemVariants} className="mb-12">
          <motion.div
            variants={itemVariants}
            className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-[var(--light-gray)]/20 p-8 flex flex-col md:flex-row items-start md:items-center gap-8"
          >
            <Avatar className="h-32 w-32 ring-4 ring-[var(--accent-bg)]/20 shadow-lg">
              <AvatarImage src="" />
              <AvatarFallback className="bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-bg)]/70 text-white text-3xl">
                {getInitials(username)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-4xl font-bold text-[var(--main-text)] mb-2">
                    {username}
                  </h1>
                  {userData?.organization && (
                    <p className="text-lg text-[var(--main-text)]/70 flex items-center gap-2">
                      <MapPin className="h-5 w-5" />
                      {userData.organization}
                    </p>
                  )}
                </div>

                <Button
                  onClick={copyToClipboard}
                  variant="outline"
                  size="default"
                  className="flex items-center gap-2 border-[var(--accent-bg)] text-[var(--main-text)] hover:bg-[var(--accent-bg)]/10 px-5 py-2.5"
                >
                  <Share2 className="h-5 w-5 mr-1" />
                  Share Profile
                </Button>
              </div>
            </div>
          </motion.div>

          {userData?.biography && userData?.isPublic !== false && (
            <motion.div
              variants={itemVariants}
              className="mt-6 bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-sm border border-[var(--light-gray)]/20"
            >
              <h3 className="text-xl font-medium text-[var(--main-text)] mb-4">
                About
              </h3>
              <p className="text-[var(--main-text)]/80 leading-relaxed text-lg">
                {userData.biography}
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Badges Section */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-[300px] w-full rounded-xl" />
                <Skeleton className="h-8 w-3/4 rounded-md" />
                <Skeleton className="h-5 w-1/2 rounded-md" />
              </div>
            ))}
          </div>
        ) : userData && userData.isPublic === false ? (
          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center justify-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-[var(--light-gray)]/20"
          >
            <div className="text-center max-w-md p-6">
              <h3 className="text-2xl font-medium text-[var(--main-text)] mb-4">
                This profile is private
              </h3>
              <p className="text-[var(--main-text)]/70 text-lg">
                The user has chosen to keep their profile private. You cannot
                view their badges or profile information.
              </p>
            </div>
          </motion.div>
        ) : (
          <>
            <motion.div
              variants={itemVariants}
              className="flex items-center justify-between mb-8"
            >
              <h2 className="text-3xl font-bold text-[var(--main-text)]">
                Earned Badges
              </h2>
              {badges && badges.length > 0 && (
                <BadgeUI
                  variant="outline"
                  className="px-4 py-1.5 text-base bg-[var(--accent-bg)]/10 border-[var(--accent-bg)]/30 text-[var(--main-text)]"
                >
                  {badges.length} {badges.length === 1 ? "Badge" : "Badges"}
                </BadgeUI>
              )}
            </motion.div>

            {error ? (
              <motion.div
                variants={itemVariants}
                className="text-center py-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-[var(--light-gray)]/20"
              >
                <p className="text-[var(--main-text)]/80 text-lg">
                  Error loading badges
                </p>
              </motion.div>
            ) : badges && badges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-10">
                {badges.map((badge) => (
                  <motion.div
                    key={badge.id}
                    variants={itemVariants}
                    whileHover={{
                      y: -10,
                      transition: { duration: 0.2 },
                    }}
                    className="group"
                  >
                    <Link
                      to="/badges/$badgeId"
                      params={{ badgeId: badge.id }}
                      className="block h-full"
                    >
                      <Card className="overflow-hidden h-full flex flex-col border-[var(--light-gray)]/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-white/80 backdrop-blur-sm">
                        <div className="p-10 bg-[var(--accent-bg)]/5 flex items-center justify-center">
                          <div className="w-48 h-48 relative">
                            {badge.imageData ? (
                              <img
                                src={badge.imageData}
                                alt={badge.name}
                                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full bg-[var(--accent-bg)]/10 flex items-center justify-center text-[var(--main-text)]/60 rounded-full">
                                <Award className="h-20 w-20" />
                              </div>
                            )}
                          </div>
                        </div>
                        <CardContent className="p-8 flex-1 flex flex-col">
                          <div className="mb-6">
                            <h4 className="text-xl font-semibold text-[var(--main-text)] mb-3">
                              {badge.name}
                            </h4>
                            <p className="text-base text-[var(--main-text)]/70 flex items-center gap-2">
                              <Award className="h-5 w-5" />
                              {badge.issuedBy}
                            </p>
                          </div>

                          {badge.description && (
                            <p className="text-base text-[var(--main-text)]/80 line-clamp-2 mb-8">
                              {badge.description}
                            </p>
                          )}

                          {badge.skills && (
                            <div className="mt-auto mb-6">
                              <div className="flex flex-wrap gap-2.5">
                                {badge.skills
                                  .split(",")
                                  .slice(0, 3)
                                  .map((skill, index) => (
                                    <BadgeUI
                                      key={index}
                                      variant="outline"
                                      className="text-base px-4 py-1.5 bg-[var(--accent-bg)]/10 border-[var(--accent-bg)]/30 text-[var(--main-text)] hover:bg-[var(--accent-bg)]/20 transition-colors"
                                    >
                                      {skill.trim()}
                                    </BadgeUI>
                                  ))}
                                {badge.skills.split(",").length > 3 && (
                                  <BadgeUI
                                    variant="outline"
                                    className="text-base px-4 py-1.5 bg-[var(--accent-bg)]/10 border-[var(--accent-bg)]/30 text-[var(--main-text)] hover:bg-[var(--accent-bg)]/20 transition-colors"
                                  >
                                    +{badge.skills.split(",").length - 3} more
                                  </BadgeUI>
                                )}
                              </div>
                            </div>
                          )}

                          <div className="mt-6 pt-5 border-t border-[var(--accent-bg)]/10">
                            <Button
                              className="w-full text-base h-12 flex items-center justify-center gap-2 border-[var(--accent-bg)] text-[var(--main-text)] hover:bg-[var(--accent-bg)]/10"
                              variant="outline"
                              size="default"
                            >
                              <Eye className="h-5 w-5" />
                              View Details
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                variants={itemVariants}
                className="text-center py-16 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-[var(--light-gray)]/20"
              >
                <Award className="h-20 w-20 mx-auto mb-6 text-[var(--accent-bg)]/30" />
                <h3 className="text-2xl font-medium text-[var(--main-text)] mb-4">
                  No badges yet
                </h3>
                <p className="text-[var(--main-text)]/70 text-lg max-w-md mx-auto">
                  {isOwnProfile
                    ? "You haven't earned any badges yet. Complete courses and achievements to earn badges."
                    : "This user hasn't earned any badges yet."}
                </p>
              </motion.div>
            )}
          </>
        )}
      </div>
      <Toaster />
    </motion.div>
  );
}
