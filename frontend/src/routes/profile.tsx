import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Share2, Clock, Book, Award, ExternalLink, Eye } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { fetchWithAuth } from "@/lib/api-client";
import { Link } from "@tanstack/react-router";

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

export const Route = createFileRoute("/profile")({
  component: ProfileComponent,
});

function ProfileComponent() {
  const { data: session, isPending: isSessionLoading } =
    authClient.useSession();

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

  if (isSessionLoading) {
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

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        <Card>
          {/* Centered User Info Section */}
          <CardContent className="pt-8 pb-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <Avatar className="h-24 w-24">
                <AvatarImage src={session.user.image || ""} />
                <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--main-text)] text-xl">
                  {getInitials(session.user.name || "")}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-2xl font-bold text-[var(--main-text)]">
                  {session.user.name}
                </h2>
                <p className="text-[var(--main-text)]/80 mt-1">
                  {session.user.email}
                </p>
                {session.user.organization && (
                  <BadgeUI variant="outline" className="mt-3">
                    {session.user.organization}
                  </BadgeUI>
                )}
              </div>
            </div>
          </CardContent>

          <Separator className="bg-[var(--accent-bg)]" />

          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-[var(--main-text)] mb-4">
                Account Information
              </h3>
              <div className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <p className="text-sm font-medium text-[var(--main-text)]/60">
                    Role
                  </p>
                  <p className="text-sm text-[var(--main-text)]">
                    {session.user.role === "administrator"
                      ? "Administrator"
                      : "Student"}
                  </p>
                </div>
                {session.user.organization && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <p className="text-sm font-medium text-[var(--main-text)]/60">
                      Organization
                    </p>
                    <p className="text-sm text-[var(--main-text)]">
                      {session.user.organization}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-xl font-semibold text-[var(--main-text)] mb-4">
              My Badges
            </h3>

            {isBadgesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
                <Skeleton className="h-[300px] w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-[var(--main-text)]/80">
                  Error loading badges
                </p>
              </div>
            ) : badges && badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-[var(--main-bg)] rounded-xl border border-[var(--accent-bg)] overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow"
                  >
                    {/* Badge Image */}
                    <div className="p-6 bg-[var(--accent-bg)]/5 flex items-center justify-center">
                      <div className="w-full aspect-square relative max-w-[180px]">
                        {badge.imageData ? (
                          <img
                            src={badge.imageData}
                            alt={badge.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-[var(--accent-bg)]/10 flex items-center justify-center text-[var(--main-text)]/80">
                            No Image
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Badge Details */}
                    <div className="p-4 flex-1 flex flex-col">
                      <div className="mb-3">
                        <h4 className="text-lg font-semibold text-[var(--main-text)] line-clamp-1">
                          {badge.name}
                        </h4>
                        <p className="text-sm text-[var(--main-text)]/80 flex items-center gap-1 mt-1">
                          <Award className="h-3 w-3 flex-shrink-0" />
                          <span className="line-clamp-1">
                            Issued by {badge.issuedBy}
                          </span>
                        </p>
                      </div>

                      {badge.description && (
                        <p className="text-sm text-[var(--main-text)]/80 line-clamp-2 mb-3">
                          {badge.description}
                        </p>
                      )}

                      {badge.skills && (
                        <div className="mt-auto">
                          <div className="flex flex-wrap gap-1 mt-2">
                            {badge.skills
                              .split(",")
                              .slice(0, 3)
                              .map((skill, index) => (
                                <BadgeUI
                                  key={index}
                                  variant="outline"
                                  className="bg-[var(--accent-bg)]/10 text-xs"
                                >
                                  {skill.trim()}
                                </BadgeUI>
                              ))}
                            {badge.skills.split(",").length > 3 && (
                              <BadgeUI
                                variant="outline"
                                className="bg-[var(--accent-bg)]/10 text-xs"
                              >
                                +{badge.skills.split(",").length - 3} more
                              </BadgeUI>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="mt-3 pt-2 border-t border-[var(--accent-bg)]/20 flex justify-between items-center">
                        <Link
                          to="/badges/$badgeId"
                          params={{ badgeId: badge.id }}
                          className="inline-flex items-center text-xs text-primary hover:underline"
                        >
                          <Button variant="outline" size="sm" className="gap-1">
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
                            Learn more
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[var(--main-text)]/80">No badges found</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
