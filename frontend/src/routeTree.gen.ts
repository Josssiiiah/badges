/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as ProfileImport } from './routes/profile'
import { Route as PricingImport } from './routes/pricing'
import { Route as LogoutImport } from './routes/logout'
import { Route as LoginImport } from './routes/login'
import { Route as AdminImport } from './routes/admin'
import { Route as IndexImport } from './routes/index'
import { Route as UsersUsernameImport } from './routes/users.$username'
import { Route as BadgesBadgeIdImport } from './routes/badges.$badgeId'

// Create/Update Routes

const ProfileRoute = ProfileImport.update({
  id: '/profile',
  path: '/profile',
  getParentRoute: () => rootRoute,
} as any)

const PricingRoute = PricingImport.update({
  id: '/pricing',
  path: '/pricing',
  getParentRoute: () => rootRoute,
} as any)

const LogoutRoute = LogoutImport.update({
  id: '/logout',
  path: '/logout',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const AdminRoute = AdminImport.update({
  id: '/admin',
  path: '/admin',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const UsersUsernameRoute = UsersUsernameImport.update({
  id: '/users/$username',
  path: '/users/$username',
  getParentRoute: () => rootRoute,
} as any)

const BadgesBadgeIdRoute = BadgesBadgeIdImport.update({
  id: '/badges/$badgeId',
  path: '/badges/$badgeId',
  getParentRoute: () => rootRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/admin': {
      id: '/admin'
      path: '/admin'
      fullPath: '/admin'
      preLoaderRoute: typeof AdminImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/logout': {
      id: '/logout'
      path: '/logout'
      fullPath: '/logout'
      preLoaderRoute: typeof LogoutImport
      parentRoute: typeof rootRoute
    }
    '/pricing': {
      id: '/pricing'
      path: '/pricing'
      fullPath: '/pricing'
      preLoaderRoute: typeof PricingImport
      parentRoute: typeof rootRoute
    }
    '/profile': {
      id: '/profile'
      path: '/profile'
      fullPath: '/profile'
      preLoaderRoute: typeof ProfileImport
      parentRoute: typeof rootRoute
    }
    '/badges/$badgeId': {
      id: '/badges/$badgeId'
      path: '/badges/$badgeId'
      fullPath: '/badges/$badgeId'
      preLoaderRoute: typeof BadgesBadgeIdImport
      parentRoute: typeof rootRoute
    }
    '/users/$username': {
      id: '/users/$username'
      path: '/users/$username'
      fullPath: '/users/$username'
      preLoaderRoute: typeof UsersUsernameImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/pricing': typeof PricingRoute
  '/profile': typeof ProfileRoute
  '/badges/$badgeId': typeof BadgesBadgeIdRoute
  '/users/$username': typeof UsersUsernameRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/pricing': typeof PricingRoute
  '/profile': typeof ProfileRoute
  '/badges/$badgeId': typeof BadgesBadgeIdRoute
  '/users/$username': typeof UsersUsernameRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/pricing': typeof PricingRoute
  '/profile': typeof ProfileRoute
  '/badges/$badgeId': typeof BadgesBadgeIdRoute
  '/users/$username': typeof UsersUsernameRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | '/admin'
    | '/login'
    | '/logout'
    | '/pricing'
    | '/profile'
    | '/badges/$badgeId'
    | '/users/$username'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | '/admin'
    | '/login'
    | '/logout'
    | '/pricing'
    | '/profile'
    | '/badges/$badgeId'
    | '/users/$username'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/login'
    | '/logout'
    | '/pricing'
    | '/profile'
    | '/badges/$badgeId'
    | '/users/$username'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  LoginRoute: typeof LoginRoute
  LogoutRoute: typeof LogoutRoute
  PricingRoute: typeof PricingRoute
  ProfileRoute: typeof ProfileRoute
  BadgesBadgeIdRoute: typeof BadgesBadgeIdRoute
  UsersUsernameRoute: typeof UsersUsernameRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRoute,
  LoginRoute: LoginRoute,
  LogoutRoute: LogoutRoute,
  PricingRoute: PricingRoute,
  ProfileRoute: ProfileRoute,
  BadgesBadgeIdRoute: BadgesBadgeIdRoute,
  UsersUsernameRoute: UsersUsernameRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/",
        "/admin",
        "/login",
        "/logout",
        "/pricing",
        "/profile",
        "/badges/$badgeId",
        "/users/$username"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/admin": {
      "filePath": "admin.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/logout": {
      "filePath": "logout.tsx"
    },
    "/pricing": {
      "filePath": "pricing.tsx"
    },
    "/profile": {
      "filePath": "profile.tsx"
    },
    "/badges/$badgeId": {
      "filePath": "badges.$badgeId.tsx"
    },
    "/users/$username": {
      "filePath": "users.$username.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
