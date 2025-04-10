import * as React from "react";
import { Link, Outlet, createRootRoute, useMatchRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toaster } from "@/components/ui/toaster";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;
  const isAdministrator = session?.user?.role === "administrator";
  const matchRoute = useMatchRoute();
  const isIndexRoute = matchRoute({ to: "/" });

  // Dynamic background based on route
  const backgroundClass = isIndexRoute 
    ? "bg-gradient-to-r from-indigo-300 to-indigo-50" 
    : "bg-[var(--main-bg)]";

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass} text-slate-800`}>
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-white/30 border-b border-white/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-xl font-semibold text-slate-900 transition hover:text-slate-700"
              activeProps={{
                className: "text-xl font-semibold text-slate-900 transition",
              }}
              activeOptions={{ exact: true }}
            >
              BadgeSpot
            </Link>

            <nav className="hidden sm:flex items-center space-x-4">
              {isAuthenticated && (
                <>
                  <Link
                    to="/dashboard"
                    className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition"
                    activeProps={{
                      className:
                        "text-slate-900 bg-black/5 px-3 py-2 rounded-md text-sm font-medium",
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition"
                    activeProps={{
                      className:
                        "text-slate-900 bg-black/5 px-3 py-2 rounded-md text-sm font-medium",
                    }}
                  >
                    Profile
                  </Link>
                </>
              )}
              {isAuthenticated && isAdministrator && (
                <Link
                  to="/admin"
                  className="text-slate-700 hover:text-slate-900 px-3 py-2 rounded-md text-sm font-medium transition"
                  activeProps={{
                    className:
                      "text-slate-900 bg-black/5 px-3 py-2 rounded-md text-sm font-medium",
                  }}
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9 border-2 border-slate-500/50">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-slate-300 text-slate-700 text-xs">
                        {getInitials(session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white text-slate-800 border-slate-200 shadow-lg mt-2"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-slate-500">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-slate-100"
                  >
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-slate-100"
                  >
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>

                  {isAdministrator && (
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer hover:bg-slate-100"
                    >
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-slate-200" />
                  <DropdownMenuItem
                    onClick={() => authClient.signOut()}
                    className="text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="bg-white/50 border-slate-700 text-slate-800 hover:bg-white/80 hover:border-slate-900 hover:text-slate-900 rounded-full px-5 py-2 text-sm font-medium transition"
                asChild
              >
                <Link
                  to="/login"
                  activeProps={{
                    className: "",
                  }}
                >
                  Login
                </Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="py-6 bg-transparent">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-slate-600/90">
            © {new Date().getFullYear()} BadgeSpot
          </p>
        </div>
      </footer>

      {/* <TanStackRouterDevtools position="bottom-right" /> */}
      <Toaster />
    </div>
  );
}
