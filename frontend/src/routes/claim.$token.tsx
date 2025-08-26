import { createFileRoute, Navigate, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { fetchWithAuth } from "@/lib/api-client";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

export const Route = createFileRoute("/claim/$token")({
  component: ClaimPage,
});

function ClaimPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { token } = Route.useParams();
  const { data: session, isPending } = authClient.useSession();
  const [status, setStatus] = useState<"idle" | "processing" | "done">("idle");

  useEffect(() => {
    if (!token) return;
    if (isPending) return;

    if (!session) {
      // Bounce to sign up with redirect back
      navigate({ to: `/login?signup=1&next=/claim/${token}` });
      return;
    }

    const consume = async () => {
      try {
        setStatus("processing");
        const res = await fetchWithAuth("claims/consume", {
          method: "POST",
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (!res.ok || data.error) throw new Error(data.error || "Failed to claim");
        // Redirect to the assigned badge if available
        if (data.assignmentId) {
          navigate({ to: `/badges/${data.assignmentId}` });
        } else {
          navigate({ to: "/dashboard" });
        }
      } catch (err) {
        toast({
          variant: "destructive",
          title: "Claim failed",
          description: err instanceof Error ? err.message : String(err),
        });
      } finally {
        setStatus("done");
      }
    };

    consume();
  }, [token, session, isPending, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-[var(--main-text)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text mx-auto mb-4" />
        Processing your claim...
      </div>
      <Toaster />
    </div>
  );
}

