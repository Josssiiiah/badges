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
    <div className="min-h-screen flex flex-col bg-[var(--main-bg)]">
      <header>
        <div className="container pt-4 mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-xl font-semibold text-[var(--main-text)] transition"
              activeProps={{
                className:
                  "text-xl font-semibold text-[var(--main-text)] hover:text-[var(--main-text)]/80 transition",
              }}
              activeOptions={{ exact: true }}
            >
              Certilo
            </Link>

            <nav className="hidden sm:flex items-center space-x-4">
              {/* {isAuthenticated && (
                <Link
                  to="/admin"
                  className="text-[var(--main-text)]/80 hover:px-3 py-2 rounded-md text-sm font-medium"
                  activeProps={{
                    className:
                      "text-[var(--main-text)] hover:text-[var(--main-text)]/80 px-3 py-2 rounded-md text-sm font-medium",
                  }}
                >
                  Admin
                </Link>
              )} */}
            </nav>
          </div>

          <div className="flex items-center">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-[var(--light-gray)] text-[var(--main-text)]">
                        {getInitials(session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-white border-space-300"
                >
                  <DropdownMenuLabel className="text-[var(--main-text)]">
                    My Account
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="" />
                  <DropdownMenuItem
                    asChild
                    className="text-[var(--main-text)]/80 hover:text-[var(--main-text)]"
                  >
                    <Link
                      to="/users/$username"
                      params={{ username: session?.user?.name || "" }}
                      className="cursor-pointer"
                    >
                      Badges
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="text-[var(--main-text)]/80 hover:text-[var(--main-text)]"
                  >
                    <Link to="/admin" className="cursor-pointer">
                      Admin Dashboard
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="" />
                  <DropdownMenuItem
                    onClick={() => authClient.signOut()}
                    className="text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant="default"
                className=" text-[var(--main-text)]"
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

      <footer className="py-6">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-[var(--main-text)]">
            © {new Date().getFullYear()} Certilo
          </p>
        </div>
      </footer>

      {/* <TanStackRouterDevtools position="bottom-right" /> */}
    </div>
  );
}
