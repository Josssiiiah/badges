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
import { Sun, Moon } from "lucide-react";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;
  const isAdministrator = session?.user?.role === "administrator";
  const matchRoute = useMatchRoute();
  const isIndexRoute = matchRoute({ to: "/" });
  const [theme, setTheme] = React.useState<"light" | "dark">(
    (localStorage.getItem("theme") as "light" | "dark") || "light",
  );

  // Update theme state when it changes
  React.useEffect(() => {
    const updateThemeState = () => {
      const currentTheme = document.documentElement.dataset.theme as
        | "light"
        | "dark";
      setTheme(currentTheme || "light");
    };

    // Initial update
    updateThemeState();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "data-theme") {
          updateThemeState();
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });

    return () => observer.disconnect();
  }, []);

  // Toggle theme function
  const handleToggleTheme = () => {
    window.toggleTheme();
    setTheme(theme === "light" ? "dark" : "light");
  };

  // Dynamic background based on route
  const backgroundClass = "bg-surface-secondary";

  return (
    <div className={`min-h-screen flex flex-col ${backgroundClass} text-text`}>
      <header className="sticky top-0 z-50 backdrop-blur-sm bg-surface/30 border-b border-surface/50">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link
              to="/"
              className="text-xl font-semibold text-text transition hover:text-text-muted"
              activeProps={{
                className: "text-xl font-semibold text-text transition",
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
                    className="text-text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition"
                    activeProps={{
                      className:
                        "text-text bg-text/5 px-3 py-2 rounded-md text-sm font-medium",
                    }}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/profile"
                    className="text-text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition"
                    activeProps={{
                      className:
                        "text-text bg-text/5 px-3 py-2 rounded-md text-sm font-medium",
                    }}
                  >
                    Profile
                  </Link>
                </>
              )}
              {isAuthenticated && isAdministrator && (
                <Link
                  to="/admin"
                  className="text-text-muted hover:text-text px-3 py-2 rounded-md text-sm font-medium transition"
                  activeProps={{
                    className:
                      "text-text bg-text/5 px-3 py-2 rounded-md text-sm font-medium",
                  }}
                >
                  Admin Dashboard
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleTheme}
              className="rounded-full w-9 h-9"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-9 w-9 border-2 border-gray/50">
                      <AvatarImage src={session?.user?.image || undefined} />
                      <AvatarFallback className="bg-gray-light text-text text-xs">
                        {getInitials(session?.user?.name)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-56 bg-surface text-text border-gray-light shadow-shadow mt-2"
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
                  <DropdownMenuSeparator className="bg-gray-light" />
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-surface-accent"
                  >
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:bg-surface-accent"
                  >
                    <Link to="/profile">Profile</Link>
                  </DropdownMenuItem>

                  {isAdministrator && (
                    <DropdownMenuItem
                      asChild
                      className="cursor-pointer hover:bg-surface-accent"
                    >
                      <Link to="/admin">Admin Dashboard</Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuSeparator className="bg-gray-light" />
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
                className="bg-surface/50 border-gray-dark text-text hover:bg-surface/80 hover:border-text hover:text-text rounded-full px-5 py-2 text-sm font-medium transition"
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
          <p className="text-center text-sm text-text-muted/90">
            © {new Date().getFullYear()} BadgeSpot
          </p>
        </div>
      </footer>

      {/* <TanStackRouterDevtools position="bottom-right" /> */}
      <Toaster />
    </div>
  );
}
