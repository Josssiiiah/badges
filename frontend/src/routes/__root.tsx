import * as React from "react";
import { Link, Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import { authClient } from "@/lib/auth-client";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session;

  return (
    <>
      <div className="p-2 flex gap-2 text-lg">
        <Link
          to="/"
          activeProps={{
            className: "font-bold",
          }}
          activeOptions={{ exact: true }}
        >
          Home
        </Link>{" "}
        {isAuthenticated && session?.user?.id ? (
          <Link
            to="/badges/$userId"
            params={{ userId: session.user.id }}
            activeProps={{
              className: "font-bold",
            }}
          >
            Badges
          </Link>
        ) : (
          <></>
        )}
        {isAuthenticated ? (
          <>
            <Link
              to="/admin"
              activeProps={{
                className: "font-bold",
              }}
            >
              Admin
            </Link>
            <button
              onClick={() => authClient.signOut()}
              className="ml-auto text-red-600 hover:text-red-800"
            >
              Logout
            </button>
          </>
        ) : (
          <Link
            to="/login"
            activeProps={{
              className: "font-bold",
            }}
          >
            Login
          </Link>
        )}
      </div>
      <hr />
      <Outlet />
      <TanStackRouterDevtools position="bottom-right" />
    </>
  );
}
