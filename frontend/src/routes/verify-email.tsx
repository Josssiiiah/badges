import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useSearch } from "@tanstack/react-router";

import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";

import { fetchWithAuth } from "@/lib/api-client";

export const Route = createFileRoute("/verify-email")({
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const search = useSearch({ from: "/verify-email" }) as { token?: string };

  useEffect(() => {
    const run = async () => {
      try {
        const token = search?.token;
        if (!token) throw new Error("Missing token");
        const callback = window.location.origin;
        // Use backend base API (VITE_BACKEND_URL already ends with /api), so omit /api prefix here
        const path = `/auth/verify-email?token=${encodeURIComponent(token)}&callbackURL=${encodeURIComponent(callback)}`;
        console.info("[verify-email] Request:", path);
        const res = await fetchWithAuth(path, { method: "GET" });
        const text = await res.text();
        console.info("[verify-email] Response:", res.status, text);
        if (!res.ok) throw new Error(text || "Verification failed");
        toast({ title: "Email verified", description: "Your email has been verified." });
        navigate({ to: "/" });
      } catch (err) {
        console.error("[verify-email] Error:", err);
        toast({ variant: "destructive", title: "Verification failed", description: err instanceof Error ? err.message : String(err) });
        navigate({ to: "/login" });
      }
    };
    run();
  }, [search, navigate]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center text-[var(--main-text)]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-text mx-auto mb-4" />
        Verifying your email...
      </div>
      <Toaster />
    </div>
  );
}
