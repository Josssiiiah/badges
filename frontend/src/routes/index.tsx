import * as React from "react";
import { createFileRoute, useLoaderData } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/")({
  component: HomeComponent,
  loader: async () => {
    return {
      // Empty loader that can be expanded later
      emptyLoader: queryOptions({
        queryKey: ["empty"],
        queryFn: async () => {
          return {
            message: "Hello world",
          };
        },
      }),
    };
  },
});

function HomeComponent() {
  const { emptyLoader } = useLoaderData({ from: "/" });
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-4 border border-red-500 rounded-lg max-w-md mx-auto mt-10">
      <h1>Welcome, {session?.user?.name || "Guest"}</h1>
    </div>
  );
}
