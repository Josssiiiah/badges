import * as React from "react";
import { createFileRoute, useLoaderData, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-12 w-[250px] mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-4/5 mb-6" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Skeleton className="h-[180px] w-full rounded-lg" />
            <Skeleton className="h-[180px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl mb-4">
            Badge Management System
          </h1>
          <p className="text-lg text-black max-w-2xl mx-auto">
            Streamlined badge authorization and management for students and
            administrators.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {session ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">My Badges</CardTitle>
                  <CardDescription>
                    View your badge authorization status.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-black mb-4">
                    Check whether your badge has been authorized by an
                    administrator.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link
                    to="/badges/$userId"
                    params={{ userId: session.user?.id || "" }}
                    className="w-full"
                  >
                    <Button className="w-full">View My Badge</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">Admin Dashboard</CardTitle>
                  <CardDescription>
                    Manage student badge authorizations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-black mb-4">
                    Administrators can manage student records and badge
                    authorizations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/admin" className="w-full">
                    <Button variant="outline" className="w-full">
                      Go to Admin
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">Student Access</CardTitle>
                  <CardDescription>View your badge status.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-black mb-4">
                    Students can log in to check their badge authorization
                    status.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/login" className="w-full">
                    <Button className="w-full">Student Login</Button>
                  </Link>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-gray-800">
                    Administrator Access
                  </CardTitle>
                  <CardDescription>
                    Manage badge authorizations.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-black mb-4">
                    Administrators can log in to manage student records and
                    authorizations.
                  </p>
                </CardContent>
                <CardFooter>
                  <Link to="/login" className="w-full">
                    <Button variant="outline" className="w-full">
                      Admin Login
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
