import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useNavigate } from "@tanstack/react-router";
import { createFileRoute } from "@tanstack/react-router";

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

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
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

    try {
      if (isSignUp) {
        const { data, error } = await authClient.signUp.email({
          email,
          password,
          name,
        });
        if (error) throw error;

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
    }
  };


  if (isPending) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="w-8 h-8 rounded-full border-b-2 border-gray-900 animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="p-8 space-y-8 w-full max-w-md bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {isSignUp ? "Create an account" : "Sign in to your account"}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isSignUp
              ? "Create a new account to continue"
              : "Sign in to access your account"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="mt-8 space-y-6">
          {error && (
            <div className="text-sm text-center text-red-500">{error}</div>
          )}
          {successMessage && (
            <div className="text-sm text-center text-green-500">
              {successMessage}
            </div>
          )}
          <div className="-space-y-px rounded-md shadow-sm">
            {isSignUp && (
              <div>
                <label htmlFor="name" className="sr-only">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required={isSignUp}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block relative px-3 py-2 w-full placeholder-gray-500 text-gray-900 rounded-none rounded-t-md border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                  placeholder="Full Name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${
                  !isSignUp ? "rounded-t-md" : ""
                } focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block relative px-3 py-2 w-full placeholder-gray-500 text-gray-900 rounded-none rounded-b-md border border-gray-300 appearance-none focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex relative justify-center px-4 py-2 w-full text-sm font-medium text-white bg-indigo-600 rounded-md border border-transparent group hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSignUp ? "Sign up" : "Sign in"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            {isSignUp
              ? "Already have an account? Sign in"
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  );
}
