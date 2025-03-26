import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
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

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-xl font-semibold text-gray-900 hover:text-gray-700 transition"
              activeProps={{
                className:
                  "text-xl font-semibold text-blue-600 hover:text-blue-700 transition",
              }}
              activeOptions={{ exact: true }}
            >
              Badge System
            </Link>

            <nav className="hidden sm:flex items-center space-x-4">
              {isAuthenticated && session?.user?.id && (
                <Link
                  to="/badges/$userId"
                  params={{ userId: session.user.id }}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  activeProps={{
                    className:
                      "text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium",
                  }}
                >
                  My Badges
                </Link>
              )}

              {isAuthenticated && (
                <Link
                  to="/admin"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                  activeProps={{
                    className:
                      "text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium",
                  }}
                >
                  Admin
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
                      {session?.user?.name || "User"}
                    </span>
                    <Avatar className="h-12 w-12">
                      <AvatarImage src="" />
                      <AvatarFallback className="bg-blue-600 text-white">
                        {getInitials(session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator /> 
                  <DropdownMenuItem asChild>
                    <Link
                      to="/users/$username"
                      params={{ username: session?.user?.name || "" }}
                      className="cursor-pointer"
                    >
                      View Profile
                    </Link>
                  </DropdownMenuItem>
                  {isAuthenticated && session?.user?.id && (
                    <DropdownMenuItem asChild>
                      <Link
                        to="/badges/$userId"
                        params={{ userId: session.user.id }}
                        className="cursor-pointer"
                      >
                        My Badges
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="cursor-pointer">
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>
                 
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => authClient.signOut()}
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="default" className="border" asChild>
                <Link
                  to="/login"
                  activeProps={{
                    className: "text-blue-600 hover:text-blue-700",
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

      <footer className="bg-white border-t py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Badge Management System
          </p>
        </div>
      </footer>

      <TanStackRouterDevtools position="bottom-right" />
    </div>
  );
}
