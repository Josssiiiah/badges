import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge as BadgeUI } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

type Student = {
  studentId: string;
  name: string;
  email: string;
  hasBadge: boolean;
  badgeId?: string;
};

type Badge = {
  id: string;
  name: string;
  description: string | null;
  imageUrl?: string;
  imageData: string;
  createdAt: Date | null;
  updatedAt: Date | null;
};

export const Route = createFileRoute("/badges/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = useParams({ from: "/badges/$userId" });

  const {
    data: student,
    isLoading: isStudentLoading,
    error: queryError,
  } = useQuery({
    queryKey: ["student", userId],
    queryFn: async () => {
      if (!userId) {
        throw new Error("Missing user ID");
      }

      const API_URL = `${import.meta.env.VITE_BACKEND_URL}/students`;
      const response = await fetch(`${API_URL}/find/${userId}`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.student) {
        throw new Error("Student not found");
      }

      return data.student as Student;
    },
    enabled: !!userId,
  });

  const { data: badges, isLoading: isBadgesLoading } = useQuery({
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

  const isLoading = isStudentLoading || isBadgesLoading;
  const error = queryError instanceof Error ? queryError.message : null;

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-56 mb-2" />
              <Skeleton className="h-4 w-40" />
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-40" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-72" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-36 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <Card className="border-red-200">
            <CardHeader className="bg-red-50 border-b border-red-200">
              <CardTitle className="text-red-700">Error</CardTitle>
              <CardDescription className="text-red-600">
                There was a problem retrieving your badge information
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-red-600">{error}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="bg-slate-100 border-b">
            <CardTitle>Badge Information</CardTitle>
            <CardDescription>Your badge authorization status</CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {student ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">
                    Student ID
                  </h3>
                  <p className="text-base font-medium">{student.studentId}</p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="text-base font-medium">{student.name}</p>
                </div>

                <Separator />

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="text-base font-medium">{student.email}</p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-500">
                    Badge Status
                  </h3>
                  {student.hasBadge ? (
                    <div className="space-y-4">
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-green-500 text-white font-medium text-base">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 mr-1.5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Badge Authorized
                      </div>

                      {badges && badges.length > 0 && (
                        <div className="mt-4">
                          <h3 className="text-sm font-medium text-gray-500 mb-2">
                            Your Badge
                          </h3>
                          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
                            <div className="flex flex-col items-center">
                              <div className="w-96  h-96 mb-4 overflow-hidden">
                                {badges[0].imageData ? (
                                  <img
                                    src={badges[0].imageData}
                                    alt={badges[0].name}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                                    No Image
                                  </div>
                                )}
                              </div>
                              <h4 className="font-semibold text-lg text-center">
                                {badges[0].name}
                              </h4>
                              {badges[0].description && (
                                <p className="text-gray-600 text-sm text-center mt-1">
                                  {badges[0].description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <BadgeUI
                      variant="outline"
                      className="text-base px-3 py-1 border-amber-300 text-amber-700"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1.5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Not Authorized
                    </BadgeUI>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-12 w-12 mx-auto text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-4 text-gray-600">
                  No student information found. Please contact an administrator.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
