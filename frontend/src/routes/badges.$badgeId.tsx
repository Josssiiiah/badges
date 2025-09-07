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
  CheckCircle2,
  User,
  Calendar,
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
      type: "spring",
      stiffness: 100,
      damping: 15,
    },
  },
};

const floatAnimation = {
  initial: { y: 0 },
  animate: {
    y: [-5, 5, -5],
    transition: {
      duration: 4,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

function BadgeViewComponent() {
  const { data: session } = authClient.useSession();
  const { badgeId } = useParams({ from: "/badges/$badgeId" });
  const { toast } = useToast();
  const [isVerified, setIsVerified] = React.useState(false);
  const [verificationStep, setVerificationStep] = React.useState(0);

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

    if (isVerified) {
      const interval = setInterval(() => {
        setVerificationStep((prev) => {
          if (prev < verificationSteps.length - 1) {
            return prev + 1;
          }
          clearInterval(interval);
          return prev;
        });
      }, 500); // Faster interval for smoother animation
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
      const response = await fetchWithAuth(`badges/${badgeId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data as BadgeData;
    },
  });

  const verificationSteps = React.useMemo(() => {
    if (!badgeData) return [];

    const { badge, user, earnedAt } = badgeData;
    const formattedDate = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(formatEarnedAtDate(earnedAt));

    return [
      {
        title: `Issued on ${formattedDate}`,
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      },
      {
        title: `Issued by ${badge.issuedBy}`,
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      },
      {
        title: "Issued using BadgeSpot",
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      },
      {
        title: `Issued to ${user.name}`,
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      },
      {
        title: "VERIFIED",
        icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
      },
    ];
  }, [badgeData]);

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
      className="container mx-auto px-4 py-8 relative min-h-screen"
    >
      <motion.div
        variants={itemVariants}
        className="max-w-6xl mx-auto space-y-8"
      >
        {/* Top Info Bar */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
          className="bg-surface/80 backdrop-blur-lg rounded-2xl p-6 shadow-md border border-gray-light/20 transition-all"
        >
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-text-muted text-sm">Issued on</p>
                <p className="font-medium text-text">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/20">
                <User className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-text-muted text-sm">Issued to</p>
                <Link
                  to="/users/$username"
                  params={{ username: user.name }}
                  className="font-medium text-text hover:underline"
                >
                  {user.name}
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-2 sm:ml-auto">
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsVerified(true)}
                    className="rounded-full px-4 border-primary text-primary hover:bg-primary/10"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Verify
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-xl border-0 shadow-lg bg-surface/95 backdrop-blur-md">
                  <div className="py-6 space-y-6">
                    <div className="space-y-4 relative">
                      {verificationSteps.map((step, index) => (
                        <motion.div
                          key={step.title}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{
                            opacity: index <= verificationStep ? 1 : 0.4,
                            x: 0,
                          }}
                          transition={{
                            duration: 0.2,
                            delay: index * 0.15,
                          }}
                          className="flex items-start gap-4 relative z-10"
                        >
                          <motion.div
                            initial={{ scale: 0.8 }}
                            animate={{
                              scale: index <= verificationStep ? 1 : 0.9,
                              backgroundColor:
                                index <= verificationStep
                                  ? "rgba(var(--primary-rgb), 0.1)"
                                  : "transparent",
                            }}
                            className="flex-shrink-0 p-1 rounded-full"
                          >
                            <div
                              className={`${
                                index <= verificationStep
                                  ? "text-green-500"
                                  : "text-gray-300"
                              }`}
                            >
                              {step.icon}
                            </div>
                          </motion.div>
                          <div className="pt-1">
                            <h3
                              className={`text-base ${
                                index === verificationSteps.length - 1
                                  ? "font-semibold"
                                  : "font-medium"
                              } ${
                                index <= verificationStep
                                  ? "text-gray-800"
                                  : "text-gray-400"
                              }`}
                            >
                              {step.title}
                            </h3>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    {verificationStep === verificationSteps.length - 1 && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          delay: 0.2,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="mt-6 text-center"
                      >
                        <motion.div
                          initial={{
                            boxShadow: "0 0 0 0 rgba(var(--primary-rgb), 0)",
                          }}
                          animate={{
                            boxShadow: [
                              "0 0 0 0 rgba(var(--primary-rgb), 0)",
                              "0 0 0 10px rgba(var(--primary-rgb), 0.2)",
                              "0 0 0 20px rgba(var(--primary-rgb), 0)",
                            ],
                          }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            repeatDelay: 1,
                          }}
                          className="p-3 rounded-full bg-gradient-to-br from-green-100 to-green-50 inline-flex"
                        >
                          <CheckCircle2 className="h-12 w-12 text-green-500" />
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                          className="mt-4 font-medium text-gray-700"
                        >
                          This badge has been verified as authentic
                        </motion.p>
                      </motion.div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="rounded-full px-4 border-primary text-primary hover:bg-primary/10"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Main Badge Content */}
        <div className="grid md:grid-cols-[350px_1fr] gap-10 items-start md:pt-4">
          {/* Badge Image (Left Column) */}
          <motion.div
            variants={itemVariants}
            className="w-full flex flex-col items-center gap-6"
          >
            <motion.div
              variants={floatAnimation}
              animate="animate"
              initial="initial"
              className="relative"
            >
              <div className="relative w-[250px] h-[250px] rounded-full overflow-hidden shadow-lg border-4 border-surface p-1">
                {badge.imageData ? (
                  <img
                    src={badge.imageData}
                    alt={badge.name}
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-text-muted">
                    <Award className="h-20 w-20 text-surface/70" />
                  </div>
                )}
              </div>
            </motion.div>

            <div className="w-full">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                {badge.courseLink && (
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full text-md py-6 hidden md:flex shadow-sm rounded-xl border-primary text-primary bg-surface hover:bg-primary/10 transition-all"
                    onClick={() =>
                      badge.courseLink &&
                      window.open(badge.courseLink, "_blank")
                    }
                  >
                    Earn this Badge
                    <ExternalLink className="ml-2 h-5 w-5" />
                  </Button>
                )}
              </motion.div>
            </div>
          </motion.div>

          {/* Badge Info (Right Column) */}
          <motion.div variants={itemVariants} className="space-y-6 sm:pr-14">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold text-text mb-2">
                {badge.name}
              </h2>
              <p className="text-text-muted flex items-center gap-2 text-md mb-6">
                <Award className="h-5 w-5 text-primary" />
                Issued by{" "}
                <span className="text-primary font-medium">
                  {badge.issuedBy}
                </span>
              </p>

              {/* Badge Description */}
              {badge.description && (
                <motion.div
                  className="space-y-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <h3 className="text-lg font-semibold text-text">
                    Description
                  </h3>
                  <p className="text-text-muted leading-relaxed">
                    {badge.description}
                  </p>
                </motion.div>
              )}
            </motion.div>

            {/* Skills */}
            {badge.skills && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
              >
                <h3 className="text-lg font-semibold text-text">Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {badge.skills.split(",").map((skill, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 + index * 0.05 }}
                      whileHover={{
                        scale: 1.05,
                        transition: { duration: 0.2 },
                      }}
                    >
                      <BadgeUI
                        variant="outline"
                        className="bg-primary/20 border-primary/30 text-primary py-1.5 px-3 text-sm font-medium rounded-full"
                      >
                        {skill.trim()}
                      </BadgeUI>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Earning Criteria */}
            {badge.earningCriteria && (
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-lg font-semibold text-text">
                  Earning Criteria
                </h3>
                <p className="text-text-muted leading-relaxed">
                  {badge.earningCriteria}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* Earn Badge Button (Mobile) */}
        {badge.courseLink && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Button
              size="lg"
              variant="outline"
              className="w-full text-md py-6 rounded-xl shadow-sm border-primary text-primary bg-surface hover:bg-primary/10 transition-all"
              onClick={() =>
                badge.courseLink && window.open(badge.courseLink, "_blank")
              }
            >
              Earn this Badge
              <ExternalLink className="ml-2 h-5 w-5" />
            </Button>
          </motion.div>
        )}
      </motion.div>
      <Toaster />
    </motion.div>
  );
}

export const Route = createFileRoute("/badges/$badgeId")({
  component: BadgeViewComponent,
});
