import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { GraduationCap, Shield } from "lucide-react";

const FRONTEND_URL = import.meta.env.VITE_FRONTEND_URL;
if (!FRONTEND_URL) throw new Error("VITE_FRONTEND_URL is not set");

export const Route = createFileRoute("/login")({
  component: Login,
});

export default function Login() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<"student" | "administrator">("student");
  const [organization, setOrganization] = useState("");

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (session) {
      navigate({ to: "/" });
    }
  }, [session]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        if (role === "administrator" && !organization) {
          throw new Error(
            "Organization is required for administrator accounts"
          );
        }

        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name,
          role,
          organization: role === "administrator" ? organization : "",
          organizationId: "",
        });
        if (error) throw error;

        // Log the created account details
        console.log("Created Account Details:", {
          email,
          name,
          role,
          organization: role === "administrator" ? organization : "N/A",
        });

        setSuccessMessage("Account created successfully! Please sign in.");
        setTimeout(() => {
          setIsSignUp(false);
          setSuccessMessage("");
          setPassword("");
        }, 2000);
      } else {
        const { data, error } = await authClient.signIn.email({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[80vh]">
        <div className="w-full max-w-md">
          <Skeleton className="h-12 w-3/4 mx-auto mb-6" />
          <Skeleton className="h-4 w-1/2 mx-auto mb-10" />
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full mt-6" />
            <Skeleton className="h-4 w-40 mx-auto mt-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 flex justify-center items-center min-h-[80vh]">
      <div className="flex flex-row justify-center w-full">
        <div className="w-1/2 p-8 pr-12">
          <h1 className="text-6xl font-bold mb-6 text-[var(--main-text)]">
            Protect Your Resume-worthy Achievements
          </h1>
          <p className="text-xl text-[var(--main-text)]/80">
            Track your earned badges and certifiations. Or issue secure,
            verifiable badges and certification links to showcase and validate
            course completion anywhere online.
          </p>
        </div>
        <Card className="w-1/2">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-[var(--main-text)]">
              {isSignUp ? "Create an account" : "Sign in"}
            </CardTitle>
            <CardDescription className="text-center text-[var(--main-text)]/80">
              {isSignUp
                ? "Enter your details to create a new account"
                : "Enter your credentials to access your account"}
            </CardDescription>
            {error && (
              <div className="text-sm text-center text-red-400 p-2 mt-2 bg-red-400/10 border border-red-400/20 rounded">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="text-sm text-center text-green-400 p-2 mt-2 bg-green-400/10 border border-green-400/20 rounded">
                {successMessage}
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailAuth} className="space-y-4">
              {isSignUp && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-[var(--main-text)]">
                      Full Name
                    </Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      required={isSignUp}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="text-black"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[var(--main-text)]">
                      Account Type
                    </Label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setRole("student")}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          role === "student"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-300"
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <GraduationCap className="w-6 h-6" />
                          <span className="font-medium">Student</span>
                          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                            Track and showcase your achievements
                          </p>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole("administrator")}
                        className={cn(
                          "p-4 border rounded-lg transition-all duration-200",
                          role === "administrator"
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : "border-gray-200 dark:border-gray-800 hover:border-blue-300"
                        )}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Shield className="w-6 h-6" />
                          <span className="font-medium">Administrator</span>
                          <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                            Issue and manage badges
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {role === "administrator" && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <div className="space-y-2">
                          <Label
                            htmlFor="organization"
                            className="text-[var(--main-text)]"
                          >
                            Organization
                          </Label>
                          <Input
                            id="organization"
                            type="text"
                            placeholder="Your organization name"
                            required={role === "administrator"}
                            value={organization}
                            onChange={(e) => setOrganization(e.target.value)}
                            className="text-black"
                          />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[var(--main-text)]">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="text-black"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-[var(--main-text)]">
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="text-black"
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {isSignUp ? "Creating account..." : "Signing in..."}
                  </>
                ) : (
                  <>{isSignUp ? "Create account" : "Sign in"}</>
                )}
              </Button>
            </form>
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-center p-6">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-[var(--main-text)]"
            >
              {isSignUp
                ? "Already have an account? Sign in"
                : "Don't have an account? Create one"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
