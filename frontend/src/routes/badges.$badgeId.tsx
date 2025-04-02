import * as React from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
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
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Badge as BadgeUI } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

type BadgeData = {
  badge: Badge;
  user: {
    name: string;
    email: string;
    image: string | null;
  };
  earnedAt: Date;
};

function BadgeViewComponent() {
  const { data: session } = authClient.useSession();
  const { badgeId } = useParams({ from: "/badges/$badgeId" });
  const { toast } = useToast();
  const [isVerified, setIsVerified] = React.useState(false);
  const [verificationStep, setVerificationStep] = React.useState(0);

  React.useEffect(() => {
    if (isVerified) {
      const interval = setInterval(() => {
        setVerificationStep((prev) => {
          if (prev < verificationSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isVerified]);

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
      const API_URL = `${import.meta.env.VITE_BACKEND_URL}/badges`;
      const response = await fetch(`${API_URL}/${badgeId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data as BadgeData;
    },
  });

  const verificationSteps = [
    {
      title: "Issued on April 1, 2025",
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    },
    {
      title: `Issued by ${badgeData?.badge.issuedBy}`,
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    },
    {
      title: "Issued using Certilo",
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    },
    {
      title: `Issued to ${badgeData?.user.name}`,
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    },
    {
      title: "VERIFIED",
      icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
    },
  ];

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !badgeData) {
    return (
      <div className="container mx-auto px-4 py-12">
        <p className="text-[var(--dark-gray)]/80">Badge not found</p>
      </div>
    );
  }

  const { badge, user, earnedAt } = badgeData;

  return (
    <div className="container mx-auto px-4 py-4">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Earned By Section */}
        <div className="bg-[var(--accent-bg)]/10 rounded-lg p-6 flex flex-col sm:mx-14 sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <p className="font-medium text-sm text-[var(--dark-gray)]">
            This badge was issued to{" "}
            <span className="text-[var(--main-text)]">{user.name}</span> on
            April 1, 2025
          </p>
          <div className="flex items-center gap-2">
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsVerified(true)}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Verify
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px">
                <DialogHeader>
                  <DialogTitle className="flex text-2xl items-center gap-2 text-black">
                    Badge Verification
                  </DialogTitle>
                </DialogHeader>
                <div className="py-6 space-y-4">
                  <div className="space-y-4">
                    {verificationSteps.map((step, index) => (
                      <motion.div
                        key={step.title}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{
                          opacity: index <= verificationStep ? 1 : 0.5,
                          x: 0,
                        }}
                        transition={{
                          duration: 0.3,
                          delay: index * 0.4,
                        }}
                        className="flex items-start gap-4"
                      >
                        <div
                          className={`flex-shrink-0 ${index <= verificationStep ? "text-green-500" : "text-white/30"}`}
                        >
                          {step.icon}
                        </div>
                        <div>
                          <h3
                            className={`text-lg ${index === verificationSteps.length - 1 ? "font-semibold" : "font-normal"} ${index <= verificationStep ? "text-black" : "text-black/50"}`}
                          >
                            {step.title}
                          </h3>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {verificationStep === verificationSteps.length - 1 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.1 }}
                      className="mt-4 text-center"
                    ></motion.div>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Button variant="default" size="sm" onClick={copyToClipboard}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main Badge Content */}
        <div className="grid md:grid-cols-[350px_1fr] gap-4 items-start">
          {/* Badge Image (Left Column) */}
          <div className="w-full flex flex-col items-center gap-4">
            {badge.imageData ? (
              <img
                src={badge.imageData}
                alt={badge.name}
                className="w-full max-w-[300px] sm:max-w-[350px] h-auto object-contain"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-[var(--accent-bg)] flex items-center justify-center text-[var(--dark-gray)]/80">
                No Image
              </div>
            )}
            <div>
              {badge.courseLink && (
                <Button
                  size="lg"
                  className="w-full text-md py-6 hidden md:flex"
                  onClick={() =>
                    badge.courseLink && window.open(badge.courseLink, "_blank")
                  }
                >
                  Earn this Badge
                  <ExternalLink className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>

          {/* Badge Info (Right Column) */}
          <div className="space-y-4 md:pt-12 sm:pr-14">
            <h2 className="text-xl sm:text-2xl font-bold text-[var(--dark-gray)]">
              {badge.name}
            </h2>
            <p className="text-[var(--dark-gray)]/80 mt-2 flex items-center gap-2 text-md">
              <Award className="h-5 w-5" />
              Issued by{" "}
              <span className="text-[var(--main-text)]">{badge.issuedBy}</span>
            </p>
            {/* Badge Description */}
            {badge.description && (
              <div className="space-y-2">
                <p className="text-[var(--dark-gray)]/80 text-md">
                  {badge.description}
                </p>
              </div>
            )}
            {/* Skills */}
            {badge.skills && (
              <div className="space-y-2 pt-10">
                <h3 className="text-md font-semibold text-[var(--dark-gray)]">
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {badge.skills.split(",").map((skill, index) => (
                    <BadgeUI
                      key={index}
                      variant="outline"
                      className="bg-[var(--accent-bg)]/10 text-sm font-light"
                    >
                      {skill.trim()}
                    </BadgeUI>
                  ))}
                </div>
              </div>
            )}
            {/* Earning Criteria */}
            {badge.earningCriteria && (
              <div className="space-y-2 pt-4">
                <h3 className="text-md font-semibold text-[var(--dark-gray)]">
                  Earning Criteria
                </h3>
                <p className="text-[var(--dark-gray)]/80 text-md">
                  {badge.earningCriteria}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Earn Badge Button */}
        {badge.courseLink && (
          <div className="md:hidden">
            <Button
              size="lg"
              className="w-full text-md py-6"
              onClick={() =>
                badge.courseLink && window.open(badge.courseLink, "_blank")
              }
            >
              Earn this Badge
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export const Route = createFileRoute("/badges/$badgeId")({
  component: BadgeViewComponent,
});
