import * as React from "react";
import { createFileRoute, useParams, Link } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Share2,
  Clock,
  Book,
  Award,
  ExternalLink,
  User,
  Calendar,
  Building,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { fetchWithAuth } from "@/lib/api-client";

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

type BadgeData = {
  badge: Badge;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  earnedAt: Date;
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

function BadgeViewComponent() {
  const { data: session } = authClient.useSession();
  const { badgeId } = useParams({ from: "/badges/$badgeId" });
  const { toast } = useToast();

  // Safer date parsing to handle the database format "2025-04-08 19:51:02"
  const formatEarnedAtDate = (
    dateString: string | Date | number | null | undefined
  ) => {
    if (!dateString) return new Date(); // Fallback to current date if null/undefined

    // If it's already a Date object, use it directly
    if (dateString instanceof Date) return dateString;

    // Handle string format by ensuring proper ISO format
    if (typeof dateString === "string") {
      // Replace space with T to ensure proper ISO format if needed
      const isoFormattedDate = dateString.replace(/\s/, "T");
      return new Date(isoFormattedDate);
    }

    // If it's a number (timestamp), or anything else, just pass to Date constructor
    return new Date(dateString);
  };

  React.useEffect(() => {
    // Show verification reminder toast when redirected from account creation
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("verifyNotice") === "1") {
        toast({
          title: "Check your email",
          description:
            "We sent a confirmation email. Confirm to view or modify your badge.",
        });
      }
    } catch {}
  }, []);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Badge link copied!",
        description: "The badge URL has been copied to your clipboard.",
      });
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Failed to copy",
        description: "There was an error copying the badge URL.",
      });
    }
  };

  const {
    data: badgeData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["badge", badgeId],
    queryFn: async () => {
      const response = await fetchWithAuth(`badges/${badgeId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data as BadgeData;
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-[200px] w-full rounded-xl mb-6" />
          <div className="grid md:grid-cols-[350px_1fr] gap-8">
            <Skeleton className="h-[350px] w-full rounded-xl" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4 rounded-lg" />
              <Skeleton className="h-6 w-1/2 rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-8 w-1/3 rounded-lg" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !badgeData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="max-w-6xl mx-auto text-center p-8 bg-surface rounded-2xl shadow-lg"
        >
          <h2 className="text-2xl font-bold text-text">Badge not found</h2>
          <p className="text-text-muted mt-2">
            The badge you're looking for doesn't seem to exist
          </p>
          <Button className="mt-4" asChild>
            <Link to="/">Return Home</Link>
          </Button>
        </motion.div>
      </div>
    );
  }

  const { badge, user, earnedAt } = badgeData;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(formatEarnedAtDate(earnedAt));

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="container mx-auto px-4 pt-24 pb-12 relative min-h-screen bg-[#ffffff]"
    >
      <motion.div variants={itemVariants} className="max-w-5xl mx-auto">
        {/* Main Badge Content */}
        <div className="grid md:grid-cols-[300px_1fr] gap-12 items-start">
          {/* Badge Image (Left Column) */}
          <motion.div
            variants={itemVariants}
            className="w-full flex flex-col space-y-4"
          >
            <div className="relative w-full aspect-square rounded-lg overflow-hidden shadow-sm">
              {badge.imageData ? (
                <img
                  src={badge.imageData}
                  alt={badge.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                  <Award className="h-20 w-20 text-gray-400" />
                </div>
              )}
            </div>

            {/* Issued By */}
            <div className="flex items-center gap-2 text-gray-600">
              <Building className="h-4 w-4" />
              <span className="text-sm">Issued by</span>
              <span className="text-sm font-medium text-gray-900">
                {badge.issuedBy}
              </span>
            </div>

            {/* Description */}
            {badge.description && (
              <p className="text-gray-700 leading-relaxed text-sm">
                {badge.description}
              </p>
            )}
          </motion.div>

          {/* Badge Info (Right Column) */}
          <motion.div variants={itemVariants} className="space-y-6">
            {/* Title */}
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-6">
                {badge.name}
              </h1>
            </div>

            {/* Skills */}
            {badge.skills && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {badge.skills.split(",").map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-gray-100 text-gray-700 text-sm rounded-md font-medium"
                    >
                      {skill.trim()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Earning Criteria */}
            {badge.earningCriteria && (
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  Earning Criteria
                </h3>
                <p className="text-gray-700 leading-relaxed text-base">
                  {badge.earningCriteria}
                </p>
              </div>
            )}

            {/* Date Obtained */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Date Obtained
              </h3>
              <p className="text-gray-700 text-base">{formattedDate}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
              {badge.courseLink && (
                <Button
                  size="sm"
                  onClick={() =>
                    badge.courseLink && window.open(badge.courseLink, "_blank")
                  }
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Earn this Badge
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>
      <Toaster />
    </motion.div>
  );
}

export const Route = createFileRoute("/badges/$badgeId")({
  component: BadgeViewComponent,
});
