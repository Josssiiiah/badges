import { useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/logout")({
  component: LogoutComponent,
});

function LogoutComponent() {
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending) return;

    if (!session) {
      navigate({ to: "/login" });
      return;
    }

    const handleLogout = async () => {
      try {
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              navigate({ to: "/" });
            },
          },
        });
      } catch (error) {
        console.error("Logout error:", error);
        navigate({ to: "/" });
      }
    };

    handleLogout();
  }, [navigate, session, isPending]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-oxford">
      <div className="w-8 h-8 border-b-2 border-pure rounded-full animate-spin"></div>
    </div>
  );
}
