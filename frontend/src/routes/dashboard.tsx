import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Award, Eye, Clock, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { fetchWithAuth } from "@/lib/api-client";
import { Separator } from "@/components/ui/separator";

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

export const Route = createFileRoute("/dashboard")({
  component: Dashboard,
});

function Dashboard() {
  const { data: session } = authClient.useSession();
  const [stats, setStats] = useState({
    totalBadges: 0,
    profileViews: 156, // This would come from a different API
    recentBadge: "",
    issueDate: "",
    badgeShares: 0,
  });

  // Fetch badges using React Query
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
            (total, badge) => total + (badge.sharesCount || 0),
            0
          ),
        });
      }

      return data.badges as Badge[];
    },
    enabled: !!session?.user,
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

  if (isBadgesLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col">
          <Skeleton className="h-12 w-[250px] mb-2" />
          <Skeleton className="h-6 w-[350px] mb-6" />
        </div>

        <div className="p-6 bg-[var(--accent-bg)]/5 rounded-lg mb-10">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
            ))}
          </div>
        </div>

        <Skeleton className="h-8 w-[150px] mb-4" />
        <Skeleton className="h-1 w-full mb-6" />
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[220px] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col">
        <div className="flex items-center">
          <h1 className="text-3xl font-bold text-[var(--main-text)]">
            Welcome back, {session?.user?.name || "User"}!
          </h1>
          {session?.user?.image && (
            <Avatar className="ml-4 h-12 w-12 ring-2 ring-[var(--accent-bg)]/20 shadow-sm">
              <AvatarImage src={session.user.image} />
              <AvatarFallback className="bg-gradient-to-br from-[var(--accent-bg)] to-[var(--accent-bg)]/70 text-white">
                {getInitials(session.user.name)}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
        <h2 className="text-lg text-[var(--main-text)]/70 mt-2">
          Here's an overview of your achievements
        </h2>
      </div>

      {/* Stats cards with consistent background */}
      <div className="p-6 bg-[var(--accent-bg)]/5 rounded-lg mb-10">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-[var(--main-bg)] border-[var(--accent-bg)]/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-[var(--main-text)]">
                  Total Badges
                </CardTitle>
                <Award className="h-6 w-6 text-[var(--primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--main-text)]">
                  {stats.totalBadges}
                </div>
                <p className="text-sm text-[var(--main-text)]/70 mt-1">
                  Earned across all platforms
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-[var(--main-bg)] border-[var(--accent-bg)]/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-[var(--main-text)]">
                  Recent Badge
                </CardTitle>
                <Clock className="h-6 w-6 text-[var(--primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-xl font-medium truncate text-[var(--main-text)]">
                  {stats.recentBadge}
                </div>
                <p className="text-sm text-[var(--main-text)]/70 mt-1">
                  Earned {stats.issueDate}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-[var(--main-bg)] border-[var(--accent-bg)]/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-[var(--main-text)]">
                  Profile Views
                </CardTitle>
                <Eye className="h-6 w-6 text-[var(--primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--main-text)]">
                  {stats.profileViews}
                </div>
                <p className="text-sm text-[var(--main-text)]/70 mt-1">
                  In the last 30 days
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <Card className="shadow-md hover:shadow-lg transition-all duration-300 bg-[var(--main-bg)] border-[var(--accent-bg)]/10 overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-lg font-medium text-[var(--main-text)]">
                  Badge Shares
                </CardTitle>
                <Share2 className="h-6 w-6 text-[var(--primary)]" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-[var(--main-text)]">
                  {stats.badgeShares}
                </div>
                <p className="text-sm text-[var(--main-text)]/70 mt-1">
                  Times your badges were shared
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* My Badges Section */}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold text-[var(--main-text)]">
          My Badges
        </h2>
        <Separator className="my-4" />

        {!badges || badges.length === 0 ? (
          <div className="text-center py-16 bg-[var(--main-bg)] rounded-xl shadow-sm border border-[var(--accent-bg)]/10">
            <Award className="h-16 w-16 mx-auto mb-4 text-[var(--accent-bg)]/30" />
            <h3 className="text-xl font-medium text-[var(--main-text)] mb-2">
              No badges yet
            </h3>
            <p className="text-[var(--main-text)]/70 max-w-md mx-auto">
              Search for badges to earn by using the search bar at the top of
              the page.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
                <Card className="overflow-hidden h-full flex flex-col bg-[var(--main-bg)] border-[var(--accent-bg)]/10 rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                  <div className="p-5 bg-gradient-to-br from-[var(--accent-bg)]/5 to-[var(--accent-bg)]/15 flex items-center justify-center">
                    <div className="w-24 h-24 relative">
                      {badge.imageUrl || badge.imageData ? (
                        <img
                          src={badge.imageUrl || badge.imageData}
                          alt={badge.name}
                          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-[var(--accent-bg)]/10 flex items-center justify-center text-[var(--main-text)]/60 rounded-full">
                          <Award className="h-10 w-10" />
                        </div>
                      )}
                    </div>
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <div className="mb-3">
                      <h3 className="font-semibold text-[var(--main-text)] mb-1 group-hover:text-primary transition-colors duration-200 line-clamp-1">
                        {badge.name}
                      </h3>
                      <p className="text-xs text-[var(--main-text)]/70 flex items-center gap-1">
                        <Award className="h-3 w-3 flex-shrink-0" />
                        <span className="line-clamp-1">{badge.issuedBy}</span>
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
                              +{badge.skills.split(",").length - 3} more
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
                      <p className="text-xs text-[var(--main-text)]/60">
                        {formatDate(badge.earnedAt)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
