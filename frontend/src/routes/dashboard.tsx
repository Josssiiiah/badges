import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import {
  Award,
  Eye,
  Clock,
  Share2,
  Linkedin,
  ExternalLink,
} from "lucide-react";
import { motion } from "framer-motion";
import { Link, Navigate, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { Separator } from "@/components/ui/separator";

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
  // ID from the badges table (assignment ID)
  id: string;
  // ID from the createdBadges table (badge template ID)
  badgeId: string;
  earnedAt: Date;
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
  const [stats, setStats] = useState({
    totalBadges: 0,
    profileViews: 156, // This would come from a different API
    recentBadge: "None",
    issueDate: "N/A",
    badgeShares: 0,
  });

  // If session is still loading, show loading indicator
  if (isPending) {
    return (
      <div className="min-h-screen bg-oxford flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pure"></div>
      </div>
    );
  }

  // If user is not logged in, redirect to login page
  if (!session || !session.user) {
    return <Navigate to="/login" />;
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

      // Update stats based on the badges data
      if (data.badges && data.badges.length > 0) {
        const mostRecentBadge = [...data.badges].sort(
          (a, b) =>
            new Date(b.earnedAt).getTime() - new Date(a.earnedAt).getTime()
        )[0];

        setStats({
          totalBadges: data.badges.length,
          profileViews: 156, // This would come from a different API
          recentBadge: mostRecentBadge?.name || "None",
          issueDate: mostRecentBadge
            ? new Date(mostRecentBadge.earnedAt).toLocaleDateString()
            : "N/A",
          badgeShares: data.badges.reduce(
            (total: number, badge: Badge) => total + (badge.sharesCount || 0),
            0
          ),
        });
      } else {
        // Reset stats if no badges are found
        setStats({
          totalBadges: 0,
          profileViews: 156,
          recentBadge: "None",
          issueDate: "N/A",
          badgeShares: 0,
        });
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
  const formatDate = (date: Date | null) => {
    if (!date) return null;
    return new Date(date).toLocaleDateString("en-US", {
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
      className="container mx-auto px-4 py-8 relative"
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

      <motion.div variants={itemVariants} className="mb-8 flex flex-col">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-text">
            Welcome back, {session?.user?.name || "User"}!
          </h1>
          {session?.user?.image && (
            <Avatar className="ml-4 h-12 w-12 ring-2 ring-primary/20 shadow-sm">
              <AvatarImage src={session.user.image} />
              <AvatarFallback className="bg-gradient-to-br from-primary to-primary/70 text-surface">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <h2 className="text-lg text-text-muted mt-2">
          Here's an overview of your achievements
        </h2>
      </motion.div>

      {/* Stats cards with consistent background */}
      <motion.div
        variants={itemVariants}
        className="p-6 bg-surface/80 backdrop-blur-sm rounded-xl shadow-sm border border-gray-light/20 mb-10"
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-primary/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-text">
                  Total Badges
                </CardTitle>
                <div className="p-2 rounded-full bg-primary/20">
                  <Award className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-text">
                  {stats.totalBadges}
                </div>
                <p className="text-sm text-text-muted mt-1">
                  Earned across all platforms
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-primary/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-text">
                  Recent Badge
                </CardTitle>
                <div className="p-2 rounded-full bg-primary/20">
                  <Clock className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-medium truncate text-text">
                  {stats.recentBadge}
                </div>
                <p className="text-sm text-text-muted mt-1">
                  Earned {stats.issueDate}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-primary/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-text">
                  Profile Views
                </CardTitle>
                <div className="p-2 rounded-full bg-primary/20">
                  <Eye className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-text">
                  {stats.profileViews}
                </div>
                <p className="text-sm text-text-muted mt-1">
                  In the last 30 days
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            variants={itemVariants}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="shadow-sm hover:shadow-md transition-all duration-300 border-primary/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-text">
                  Badge Shares
                </CardTitle>
                <div className="p-2 rounded-full bg-primary/20">
                  <Share2 className="h-5 w-5 text-primary" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-text">
                  {stats.badgeShares}
                </div>
                <p className="text-sm text-text-muted mt-1">
                  Times your badges were shared
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

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
            {badges.map((badge, index) => (
              <motion.div
                key={badge.id}
                variants={itemVariants}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.2 },
                }}
                className="group"
              >
                <Card className="overflow-hidden h-full flex flex-col border-gray-light/20 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 bg-surface/80 backdrop-blur-sm">
                  <div className="p-10 bg-primary/5 flex items-center justify-center">
                    <div className="w-48 h-48 relative">
                      {badge.imageUrl || badge.imageData ? (
                        <img
                          src={(badge.imageUrl || badge.imageData) ?? ""}
                          alt={badge.name}
                          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-primary/10 flex items-center justify-center text-text-muted rounded-full">
                          <Award className="h-20 w-20" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-8 flex-1 flex flex-col">
                    <div className="mb-6">
                      <h3 className="text-xl font-semibold text-text mb-3 transition-colors duration-200 line-clamp-1">
                        {badge.name}
                      </h3>
                      <p className="text-base text-text-muted flex items-center gap-2">
                        <Award className="h-5 w-5 flex-shrink-0" />
                        <span className="line-clamp-1">{badge.issuedBy}</span>
                      </p>
                    </div>

                    {badge.description && (
                      <p className="text-base text-text-muted line-clamp-2 mb-8">
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
                                className="text-base px-4 py-1.5 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                              >
                                {skill.trim()}
                              </BadgeUI>
                            ))}
                          {badge.skills.split(",").length > 3 && (
                            <BadgeUI
                              variant="outline"
                              className="text-base px-4 py-1.5 bg-primary/10 border-primary/30 text-primary hover:bg-primary/20 transition-colors"
                            >
                              +{badge.skills.split(",").length - 3} more
                            </BadgeUI>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="mt-6 pt-5 border-t border-primary/10">
                      <div className="flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                          <Link
                            to="/badges/$badgeId"
                            params={{ badgeId: badge.id }}
                          >
                            <Button
                              variant="outline"
                              size="default"
                              className="gap-1 text-base px-5 py-2.5 border-primary text-primary hover:bg-primary/10 opacity-90 group-hover:opacity-100 transition-all duration-200"
                            >
                              <Eye className="h-5 w-5 mr-1.5" />
                              View Badge
                            </Button>
                          </Link>

                          <a
                            href={generateLinkedInURL(badge)}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button
                              variant="outline"
                              size="default"
                              className="gap-1 text-base px-5 py-2.5 border-[#0077B5] text-[#0077B5] hover:bg-[#0077B5]/10 opacity-90 group-hover:opacity-100 transition-all duration-200"
                            >
                              <Linkedin className="h-5 w-5 mr-1.5" />
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
                            >
                              <Button
                                variant="outline"
                                size="default"
                                className="gap-1 text-base px-5 py-2.5 border-gray-dark text-gray-dark hover:bg-gray-dark/10 opacity-90 group-hover:opacity-100 transition-all duration-200"
                              >
                                <ExternalLink className="h-5 w-5 mr-1.5" />
                                View Course
                              </Button>
                            </a>
                          )}

                          <p className="text-base text-text-muted">
                            {formatDate(badge.earnedAt)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
