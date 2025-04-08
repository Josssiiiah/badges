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
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={session.user.image || ""} />
              <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--main-text)]">
                {getInitials(session.user.name || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-[var(--main-text)]">
                {session.user.name}
              </h2>
              <p className="text-[var(--main-text)]/80">{session.user.email}</p>
              {session.user.organization && (
                <BadgeUI variant="outline" className="mt-2">
                  {session.user.organization}
                </BadgeUI>
              )}
            </div>
          </CardHeader>
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
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-[var(--main-text)]/80">
                  Error loading badges
                </p>
              </div>
            ) : badges && badges.length > 0 ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 gap-8">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-[var(--main-bg)] rounded-xl border border-[var(--accent-bg)] overflow-hidden"
                    >
                      <div className="grid md:grid-cols-[300px,1fr] gap-6">
                        {/* Badge Image Section */}
                        <div className="p-8 bg-[var(--accent-bg)]/5 flex flex-col items-center justify-center space-y-4">
                          <div className="w-full aspect-square max-w-[300px] relative">
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

                        {/* Badge Info Section */}
                        <div className="p-8 space-y-6">
                          <div>
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-xl font-semibold text-[var(--main-text)]">
                                {badge.name}
                              </h4>
                            </div>
                            <p className="text-sm text-[var(--main-text)]/80 flex items-center gap-2">
                              <Award className="h-4 w-4" />
                              Issued by {badge.issuedBy}
                            </p>
                          </div>

                          {badge.description && (
                            <p className="text-sm text-[var(--main-text)]/80">
                              {badge.description}
                            </p>
                          )}

                          {badge.skills && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-[var(--main-text)]">
                                Skills
                              </h5>
                              <div className="flex flex-wrap gap-2">
                                {badge.skills.split(",").map((skill, index) => (
                                  <BadgeUI
                                    key={index}
                                    variant="outline"
                                    className="bg-[var(--accent-bg)]/10"
                                  >
                                    {skill.trim()}
                                  </BadgeUI>
                                ))}
                              </div>
                            </div>
                          )}

                          {badge.earningCriteria && (
                            <div className="space-y-2">
                              <h5 className="text-sm font-medium text-[var(--main-text)]">
                                Earning Criteria
                              </h5>
                              <p className="text-sm text-[var(--main-text)]/80">
                                {badge.earningCriteria}
                              </p>
                            </div>
                          )}

                          {badge.courseLink && (
                            <div className="pt-4">
                              <a
                                href={badge.courseLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-primary hover:underline"
                              >
                                Learn more
                                <ExternalLink className="ml-1 h-3 w-3" />
                              </a>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
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
