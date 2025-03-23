/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LogoutImport } from './routes/logout'
import { Route as LoginImport } from './routes/login'
import { Route as BadgesImport } from './routes/badges'
import { Route as AdminImport } from './routes/admin'
import { Route as IndexImport } from './routes/index'
import { Route as StudentIdImport } from './routes/student.$id'

// Create/Update Routes

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

const BadgesRoute = BadgesImport.update({
  id: '/badges',
  path: '/badges',
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

const StudentIdRoute = StudentIdImport.update({
  id: '/student/$id',
  path: '/student/$id',
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
    '/badges': {
      id: '/badges'
      path: '/badges'
      fullPath: '/badges'
      preLoaderRoute: typeof BadgesImport
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
    '/student/$id': {
      id: '/student/$id'
      path: '/student/$id'
      fullPath: '/student/$id'
      preLoaderRoute: typeof StudentIdImport
      parentRoute: typeof rootRoute
    }
  }
}

// Create and export the route tree

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/badges': typeof BadgesRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/student/$id': typeof StudentIdRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/badges': typeof BadgesRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/student/$id': typeof StudentIdRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/admin': typeof AdminRoute
  '/badges': typeof BadgesRoute
  '/login': typeof LoginRoute
  '/logout': typeof LogoutRoute
  '/student/$id': typeof StudentIdRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths: '/' | '/admin' | '/badges' | '/login' | '/logout' | '/student/$id'
  fileRoutesByTo: FileRoutesByTo
  to: '/' | '/admin' | '/badges' | '/login' | '/logout' | '/student/$id'
  id:
    | '__root__'
    | '/'
    | '/admin'
    | '/badges'
    | '/login'
    | '/logout'
    | '/student/$id'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AdminRoute: typeof AdminRoute
  BadgesRoute: typeof BadgesRoute
  LoginRoute: typeof LoginRoute
  LogoutRoute: typeof LogoutRoute
  StudentIdRoute: typeof StudentIdRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AdminRoute: AdminRoute,
  BadgesRoute: BadgesRoute,
  LoginRoute: LoginRoute,
  LogoutRoute: LogoutRoute,
  StudentIdRoute: StudentIdRoute,
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
        "/badges",
        "/login",
        "/logout",
        "/student/$id"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/admin": {
      "filePath": "admin.tsx"
    },
    "/badges": {
      "filePath": "badges.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/logout": {
      "filePath": "logout.tsx"
    },
    "/student/$id": {
      "filePath": "student.$id.tsx"
    }
  }
}
ROUTE_MANIFEST_END */
