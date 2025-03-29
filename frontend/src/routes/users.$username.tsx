import * as React from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Share2 } from "lucide-react";
import { getInitials } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

type Badge = {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string;
  imageData: string;
  createdAt: Date | null;
  updatedAt: Date | null;
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

  const {
    data: badges,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      const API_URL = `${import.meta.env.VITE_BACKEND_URL}/badges`;
      const response = await fetch(`${API_URL}/all`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return data.badges as Badge[];
    },
  });

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="flex flex-row items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[var(--accent-bg)] text-[var(--main-text)]">
                {getInitials(username)}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold text-[var(--main-text)]">
                {username}
              </h2>
              <p className="text-[var(--main-text)]/80">User Profile</p>
            </div>
          </CardHeader>
          <Separator className="bg-[var(--accent-bg)]" />
          <CardContent className="pt-6">
            {badges && badges.length > 0 ? (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-[var(--main-text)]">
                  Badges
                </h3>
                <div className="grid grid-cols-1 gap-4">
                  {badges.map((badge) => (
                    <div
                      key={badge.id}
                      className="bg-[var(--main-bg)] rounded-lg p-4 border border-[var(--accent-bg)]"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="w-16 h-16 flex-shrink-0">
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
                        <div>
                          <h4 className="font-medium text-[var(--main-text)]">
                            {badge.name}
                          </h4>
                          {badge.description && (
                            <p className="text-sm text-[var(--main-text)]/80 mt-1">
                              {badge.description}
                            </p>
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
      <Toaster />
    </div>
  );
}
