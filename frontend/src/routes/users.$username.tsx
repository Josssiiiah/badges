import * as React from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

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
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12">
        <div className=" mx-auto space-y-8">
          {/* Profile Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-black">{username}</h1>
            {isOwnProfile && (
              <Button variant="outline" className="text-sm">
                Share my profile
              </Button>
            )}
          </div>

          <Separator />

          {/* Badges Section */}
          <div className="space-y-4">
            <h2 className="text-sm font-medium text-gray-500">Badges</h2>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Skeleton className="h-24 w-24 rounded" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-4 border rounded-lg bg-red-50 border-red-200 text-red-700">
                Failed to load badges
              </div>
            ) : badges && badges.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {badges.map((badge) => (
                  <div
                    key={badge.id}
                    className="p-6 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-72 h-72 overflow-hidden">
                        {badge.imageData ? (
                          <img
                            src={badge.imageData}
                            alt={badge.name}
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                            No Image
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{badge.name}</h3>
                        <p className="text-sm text-gray-500">
                          {badge.description || "No description available"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 border rounded-lg text-center">
                <p className="text-gray-500">No badges available</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
