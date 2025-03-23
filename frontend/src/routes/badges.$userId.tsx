import { createFileRoute, useParams } from "@tanstack/react-router";
import { authClient } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

type Student = {
  studentId: string;
  name: string;
  email: string;
  hasBadge: boolean;
};

export const Route = createFileRoute("/badges/$userId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { userId } = useParams({ from: "/badges/$userId" });
  const { data: session } = authClient.useSession();

  const {
    data: student,
    isLoading,
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

  const error = queryError instanceof Error ? queryError.message : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-4">
            You need to be logged in to view your badge.
          </p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="text-gray-600 mb-4">
            There was an error loading your badge information.
          </p>
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-2">Your Badge Status</h2>
        <p className="text-gray-600 mb-4">View your badge information below.</p>

        {student ? (
          <div className="space-y-4">
            <div>
              <p className="font-semibold">Student ID:</p>
              <p>{student.studentId}</p>
            </div>
            <div>
              <p className="font-semibold">Name:</p>
              <p>{student.name}</p>
            </div>
            <div>
              <p className="font-semibold">Email:</p>
              <p>{student.email}</p>
            </div>
            <div>
              <p className="font-semibold">Badge Status:</p>
              <p>
                {student.hasBadge ? (
                  <span className="text-green-600 font-medium">
                    Badge Authorized ✓
                  </span>
                ) : (
                  <span className="text-amber-600 font-medium">
                    No Badge Authorized
                  </span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p>No student information found. Please contact an administrator.</p>
        )}
      </div>
    </div>
  );
}
