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
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Profile Header */}
          <Card className="border-none shadow-md">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-600 text-white text-2xl">
                    {getInitials(username)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-bold text-slate-900">
                    {username}
                  </h1>
                </div>
                {isOwnProfile && (
                  <Button
                    variant="outline"
                    className="gap-2 border-slate-300 hover:bg-slate-100 hover:border-slate-400"
                    onClick={copyToClipboard}
                  >
                    <Share2 className="h-4 w-4" />
                    Share Profile
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card className="border-none shadow-md">
            <CardHeader className="pb-4">
              <h2 className="text-xl font-semibold text-slate-900">Badges</h2>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="grid grid-cols-1 gap-8">
                  {[1, 2].map((i) => (
                    <Card key={i} className="border-none shadow-sm">
                      <CardContent className="p-8">
                        <div className="flex items-center gap-6">
                          <Skeleton className="h-32 w-32 rounded-lg" />
                          <div className="space-y-3">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-4 w-60" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : error ? (
                <div className="p-4 rounded-lg bg-red-50 border border-red-300 text-red-700">
                  Failed to load badges
                </div>
              ) : badges && badges.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                  {badges.map((badge) => (
                    <Card
                      key={badge.id}
                      className=" border-slate-200 bg-none shadow-sm hover:shadow-lg transition-all duration-200"
                    >
                      <CardContent>
                        <div className="flex gap-8">
                          <div className="max-w-[400px]">
                            {badge.imageData ? (
                              <img
                                src={badge.imageData}
                                alt={badge.name}
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-slate-500">
                                No Image
                              </div>
                            )}
                          </div>
                          <div className="flex-1 pt-12">
                            <h3 className="font-semibold text-2xl text-slate-900 mb-2">
                              {badge.name}
                            </h3>
                            <p className="text-base text-slate-700">
                              {badge.description || "No description available"}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 rounded-lg text-center border border-slate-200">
                  <p className="text-slate-700">No badges available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Toaster />
    </div>
  );
}
