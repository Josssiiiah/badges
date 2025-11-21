import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Award, Linkedin, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { Separator } from "@/components/ui/separator";

// Helper function to truncate text to 40 words
const truncateToWords = (text: string, wordLimit: number = 40): string => {
  const words = text.split(" ");
  if (words.length <= wordLimit) return text;
  return words.slice(0, wordLimit).join(" ") + "...";
};

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
      type: "spring" as const,
      stiffness: 100,
      damping: 15,
    },
  },
};

type Badge = {
  // ID from the badges table (assignment ID)
  id: string;
  // ID from the createdBadges table (badge template ID)
  badgeId: string;
  earnedAt: Date | string | null;
  // Badge details from createdBadges
  issuedBy: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  imageData: string | null;
  courseLink: string | null;
  skills: string | null;
  earningCriteria: string | null;
  sharesCount: number;
  createdAt: Date | null;
  updatedAt: Date | null;
};

// Helper function to generate LinkedIn certification URL
const generateLinkedInURL = (badge: Badge) => {
  // Extract issue date
  const earnedDate = badge.earnedAt ? new Date(badge.earnedAt) : new Date();
  const issueYear = earnedDate.getFullYear();
  const issueMonth = earnedDate.getMonth() + 1; // LinkedIn uses 1-12 for months

  // Generate the certification URL (public badge URL)
  const certUrl = `${window.location.origin}/badges/${badge.id}`;

  const base = "https://www.linkedin.com/profile/add";
  const params = new URLSearchParams({
    startTask: "CERTIFICATION_NAME",
    name: badge.name,
    organizationName: badge.issuedBy,
    issueYear: issueYear.toString(),
    issueMonth: issueMonth.toString(),
    certUrl: certUrl,
    certId: badge.id,
  });

  return `${base}?${params.toString()}`;
};

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: session, isPending } = authClient.useSession();
  const navigate = useNavigate();
  const [showLoading, setShowLoading] = useState(true);
  const [expandedBadges, setExpandedBadges] = useState<Set<string>>(new Set());

  // If session is still loading, show loading indicator
  if (isPending) {
    return (
      <div className="min-h-screen bg-[#ffffff] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!session || !session.user) {
    return <Navigate to="/login" />;
  }

  // If email not verified, block access with a prompt
  if (session.user && session.user.emailVerified === false) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-xl mx-auto bg-surface border border-gray-light rounded-xl p-6 text-center">
          <h2 className="text-2xl font-semibold text-text mb-2">
            Verify your email
          </h2>
          <p className="text-text-muted mb-6">
            Please confirm your email address to access your dashboard. We can
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

  // Fetch badges using React Query
  const {
    data: badges,
    isLoading: isBadgesLoading,
    error,
  } = useQuery({
    queryKey: ["user-badges", session.user.id],
    queryFn: async () => {
      if (!session.user.id) {
        throw new Error("User not authenticated");
      }

      const response = await fetchWithAuth(`badges/user/${session.user.id}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.badges as Badge[];
    },
    enabled: !!session?.user?.id,
    // Add a short timeout to make the query fail faster if it's taking too long
    retry: 1,
    retryDelay: 500,
    staleTime: 60000, // Cache results for 1 minute
  });

  // Format date helper function
  const formatDate = (date: Date | string | null) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    // Check for invalid date or Unix epoch (1970)
    if (isNaN(parsedDate.getTime()) || parsedDate.getFullYear() < 2000) {
      return "N/A";
    }
    return parsedDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // Show content quickly if loading takes too long
  if (isBadgesLoading && showLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col">
          <Skeleton className="h-12 w-[250px] mb-2" />
          <Skeleton className="h-6 w-[350px] mb-6" />
        </div>

        <div className="p-6 bg-primary/5 rounded-lg mb-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
            ))}
          </div>
        </div>

        <Skeleton className="h-8 w-[150px] mb-4" />
        <Skeleton className="h-1 w-full mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // Actual content
  return (
    <motion.div
      className="container mx-auto px-4 py-8 relative bg-[#ffffff]"
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
          className="absolute top-20 right-1/4 w-64 h-64 rounded-full bg-purple-500/10 blur-3xl"
        />
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="absolute bottom-40 left-1/3 w-72 h-72 rounded-full bg-primary/30 blur-3xl"
        />
      </div>

      {/* My Badges Section */}
      <motion.div variants={itemVariants} className="mt-8">
        <h2 className="text-2xl font-semibold text-text">My Badges</h2>
        <Separator className="my-4" />

        {!badges || badges.length === 0 ? (
          <motion.div
            variants={itemVariants}
            className="text-center py-16 bg-surface/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-light/20"
          >
            <Award className="h-16 w-16 mx-auto mb-4 text-primary/30" />
            <h3 className="text-xl font-medium text-text mb-2">
              No badges yet
            </h3>
            <p className="text-text-muted max-w-md mx-auto">
              Search for badges to earn by using the search bar at the top of
              the page.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
            {badges.map((badge, index) => {
              const isExpanded = expandedBadges.has(badge.id);
              const fullDescription = badge.description || "";
              const truncatedDescription = truncateToWords(fullDescription, 40);
              const shouldShowMore = fullDescription.split(" ").length > 40;

              const toggleExpand = (e: React.MouseEvent) => {
                e.preventDefault();
                e.stopPropagation();
                setExpandedBadges((prev) => {
                  const newSet = new Set(prev);
                  if (newSet.has(badge.id)) {
                    newSet.delete(badge.id);
                  } else {
                    newSet.add(badge.id);
                  }
                  return newSet;
                });
              };

              return (
                <motion.div
                  key={badge.id}
                  variants={itemVariants}
                  whileHover={{
                    y: -5,
                    transition: { duration: 0.2 },
                  }}
                  className="group"
                >
                  <Link
                    to="/badges/$badgeId"
                    params={{ badgeId: badge.id }}
                    className="block"
                  >
                    <Card className="overflow-hidden h-full flex flex-col border border-gray-light/30 rounded-xl shadow-sm transition-all duration-300 bg-surface/80 backdrop-blur-sm cursor-pointer hover:border-primary/40 hover:shadow-md">
                      {/* Image on top, left-aligned */}
                      <div className="p-6 flex items-start">
                        <div className="w-48 h-48 relative">
                          {badge.imageUrl || badge.imageData ? (
                            <img
                              src={(badge.imageUrl || badge.imageData) ?? ""}
                              alt={badge.name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-text-muted">
                              <Award className="h-24 w-24" />
                            </div>
                          )}
                        </div>
                      </div>
                      <CardContent className="p-6 flex-1 flex flex-col">
                        <div className="mb-4">
                          <h3 className="text-xl font-semibold text-text mb-2 transition-colors duration-200 line-clamp-1">
                            {badge.name}
                          </h3>
                          <p className="text-base text-text-muted flex items-center gap-2 mb-4">
                            <Award className="h-4 w-4 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {badge.issuedBy}
                            </span>
                          </p>
                        </div>

                        {badge.description && (
                          <div className="mb-4">
                            <p className="text-base text-text-muted">
                              {isExpanded
                                ? fullDescription
                                : truncatedDescription}
                            </p>
                            {shouldShowMore && (
                              <button
                                onClick={toggleExpand}
                                className="text-primary hover:underline mt-2 text-sm font-medium"
                              >
                                {isExpanded ? "Show less" : "Show more"}
                              </button>
                            )}
                          </div>
                        )}

                        {badge.skills && (
                          <div className="mt-auto mb-4">
                            <div className="flex flex-wrap gap-2.5">
                              {badge.skills
                                .split(",")
                                .slice(0, 3)
                                .map((skill, index) => (
                                  <BadgeUI
                                    key={index}
                                    variant="outline"
                                    className="text-sm px-3 py-1 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                                  >
                                    {skill.trim()}
                                  </BadgeUI>
                                ))}
                              {badge.skills.split(",").length > 3 && (
                                <BadgeUI
                                  variant="outline"
                                  className="text-sm px-3 py-1 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                                >
                                  +{badge.skills.split(",").length - 3} more
                                </BadgeUI>
                              )}
                            </div>
                          </div>
                        )}

                        <div className="mt-4 pt-4 border-t border-primary/10">
                          <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                              <a
                                href={generateLinkedInURL(badge)}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <Button
                                  variant="outline"
                                  size="default"
                                  className="gap-1 text-sm px-4 py-2 border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5]/10 transition-all duration-200"
                                >
                                  <Linkedin className="h-4 w-4 mr-1.5" />
                                  Add to LinkedIn
                                </Button>
                              </a>
                            </div>

                            <div className="flex justify-between items-center">
                              {badge.courseLink && (
                                <a
                                  href={badge.courseLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Button
                                    variant="outline"
                                    size="default"
                                    className="gap-1 text-sm px-4 py-2 border-gray-dark text-gray-dark hover:bg-gray-dark/10 transition-all duration-200"
                                  >
                                    <ExternalLink className="h-4 w-4 mr-1.5" />
                                    View Course
                                  </Button>
                                </a>
                              )}

                              <p className="text-sm text-text-muted">
                                {formatDate(badge.earnedAt)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
