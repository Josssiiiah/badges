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
          <CardHeader className="bg-space-300 border border-space-300 rounded-xl">
            <CardTitle className="text-pure">Badge Information</CardTitle>
            <CardDescription className="text-pure/80">
              Your badge authorization status
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {student ? (
              <div className="space-y-6">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-pure/80">
                    Student ID
                  </h3>
                  <p className="text-base font-medium text-pure">
                    {student.studentId}
                  </p>
                </div>

                <Separator className="bg-space-300" />

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-pure/80">Name</h3>
                  <p className="text-base font-medium text-pure">
                    {student.name}
                  </p>
                </div>

                <Separator className="bg-space-300" />

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-pure/80">Email</h3>
                  <p className="text-base font-medium text-pure">
                    {student.email}
                  </p>
                </div>

                <Separator className="bg-space-300" />

                <div className="space-y-1">
                  <h3 className="text-sm font-medium text-pure/80">
                    Badge Status
                  </h3>
                  <div className="flex items-center space-x-2">
                    <BadgeUI
                      variant={student.hasBadge ? "default" : "secondary"}
                      className={
                        student.hasBadge
                          ? "bg-slate"
                          : "bg-space-300 text-pure/80"
                      }
                    >
                      {student.hasBadge ? "Authorized" : "Not Authorized"}
                    </BadgeUI>
                  </div>
                </div>

                {student.hasBadge && badges && badges.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-pure/80 mb-2">
                      Your Badge
                    </h3>
                    <div className="bg-space rounded-lg shadow-md p-4 border border-space-300">
                      <div className="flex flex-col items-center">
                        <div className="w-96 h-96 mb-4 overflow-hidden">
                          {badges[0].imageData ? (
                            <img
                              src={badges[0].imageData}
                              alt={badges[0].name}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <div className="w-full h-full bg-space-300 flex items-center justify-center text-pure/80">
                              No Image
                            </div>
                          )}
                        </div>
                        <h4 className="font-semibold text-lg text-center text-pure">
                          {badges[0].name}
                        </h4>
                        {badges[0].description && (
                          <p className="text-pure/80 text-sm text-center mt-1">
                            {badges[0].description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-pure/80">Loading badge information...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
