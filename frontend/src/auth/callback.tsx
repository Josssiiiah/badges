import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";

export default function AuthCallback() {
  const { data, error, isPending } = authClient.useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (error) {
      console.error("Auth error:", error);
      navigate({
        to: "/login",
        search: {
          error: error.message,
        },
      });
      return;
    }

    if (data) {
      // Better Auth has already:
      // 1. Exchanged the code for tokens
      // 2. Created the user if needed
      // 3. Created the session
      // 4. Stored the session token
      navigate({ to: "/" });
    }
  }, [data, error, navigate]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return null;
}
