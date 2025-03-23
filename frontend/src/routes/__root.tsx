import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
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
            {/* Mobile menu */}
            <Sheet>
              <SheetTrigger asChild className="sm:hidden mr-2">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[240px] sm:w-[300px]">
                <div className="flex flex-col gap-4 py-4">
                  <Link
                    to="/"
                    className="text-lg font-semibold text-gray-900 hover:text-gray-700 transition"
                    activeProps={{
                      className:
                        "text-lg font-semibold text-blue-600 hover:text-blue-700 transition",
                    }}
                    activeOptions={{ exact: true }}
                  >
                    Badge System
                  </Link>
                  <Separator />
                  {isAuthenticated && session?.user?.id && (
                    <Link
                      to="/badges/$userId"
                      params={{ userId: session.user.id }}
                      className="text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                      activeProps={{
                        className:
                          "text-blue-600 hover:text-blue-700 py-2 text-sm font-medium",
                      }}
                    >
                      My Badges
                    </Link>
                  )}

                  {isAuthenticated && (
                    <Link
                      to="/admin"
                      className="text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                      activeProps={{
                        className:
                          "text-blue-600 hover:text-blue-700 py-2 text-sm font-medium",
                      }}
                    >
                      Admin Dashboard
                    </Link>
                  )}

                  {isAuthenticated ? (
                    <>
                      <Separator />
                      <Button
                        variant="destructive"
                        onClick={() => authClient.signOut()}
                        className="mt-2"
                      >
                        Log out
                      </Button>
                    </>
                  ) : (
                    <Link
                      to="/login"
                      className="text-gray-600 hover:text-gray-900 py-2 text-sm font-medium"
                      activeProps={{
                        className:
                          "text-blue-600 hover:text-blue-700 py-2 text-sm font-medium",
                      }}
                    >
                      Login
                    </Link>
                  )}
                </div>
              </SheetContent>
            </Sheet>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-gray-700 hidden sm:inline-block">
                      {session?.user?.name || "User"}
                    </span>
                    <Avatar className="h-8 w-8">
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
              <Link
                to="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
                activeProps={{
                  className:
                    "text-blue-600 hover:text-blue-700 px-3 py-2 rounded-md text-sm font-medium",
                }}
              >
                Login
              </Link>
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
