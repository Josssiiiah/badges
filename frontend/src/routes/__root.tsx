import * as React from "react";
import {
  Link,
  Outlet,
  createRootRoute,
  useMatchRoute,
} from "@tanstack/react-router";
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
  const isVerified = !!session?.user?.emailVerified;
  const isAdministrator = session?.user?.role === "administrator";
  const matchRoute = useMatchRoute();
  const isIndexRoute = matchRoute({ to: "/" });

  // Dynamic background based on route
  const backgroundClass = "bg-[#ffffff]";

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass}`}>
      <header className="sticky top-0 z-50 bg-surface border-b border-gray-light">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-xl font-semibold text-text transition-colors hover:text-primary"
              activeProps={{
                className: "text-xl font-semibold text-text",
              }}
              activeOptions={{ exact: true }}
            >
              BadgeSpot
            </Link>

            <nav className="hidden sm:flex items-center space-x-4">
              {isAuthenticated && isVerified && (
                <>
                  {isAdministrator ? (
                    <Link
                      to="/admin"
                      className="text-text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      activeProps={{
                        className:
                          "text-text bg-surface-accent px-3 py-2 rounded-md text-sm font-medium",
                      }}
                    >
                      Dashboard
                    </Link>
                  ) : (
                    <Link
                      to="/dashboard"
                      className="text-text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors"
                      activeProps={{
                        className:
                          "text-text bg-surface-accent px-3 py-2 rounded-md text-sm font-medium",
                      }}
                    >
                      Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    className="text-text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    activeProps={{
                      className:
                        "text-text bg-surface-accent px-3 py-2 rounded-md text-sm font-medium",
                    }}
                  >
                    Profile
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9 border border-gray-light">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-surface-accent text-text text-xs">
                        {getInitials(session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-surface border-gray-light mt-2"
                >
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session?.user?.name}
                      </p>
                      <p className="text-xs leading-none text-text-muted">
                        {session?.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-surface-accent focus:bg-surface-accent"
                  >
                    {isAdministrator ? (
                      <Link to="/admin">Dashboard</Link>
                    ) : (
                      <Link to="/dashboard">Dashboard</Link>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-surface-accent focus:bg-surface-accent"
                  >
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={async () => {
                      try {
                        await authClient.signOut();
                        // Force a hard refresh to clear any cached state
                        window.location.href = "/";
                      } catch (error) {
                        console.error("Logout error:", error);
                        // Still redirect even if there's an error
                        window.location.href = "/";
                      }
                    }}
                    className="text-red-500 hover:bg-red-500/10 focus:bg-red-500/10 cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="outline"
                className="border-gray-light hover:bg-surface-accent rounded-full px-5 py-2 text-sm font-medium transition-colors"
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

      <footer className="py-6 border-t border-gray-light">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-text-muted">
            © {new Date().getFullYear()} BadgeSpot
          </p>
        </div>
      </footer>

      {/* <TanStackRouterDevtools position="bottom-right" /> */}
      <Toaster />
    </div>
  );
}
