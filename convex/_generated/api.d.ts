/* eslint-disable */
/**
 * Generated API types - DO NOT EDIT
 * Run `npx convex dev` or `npx convex codegen` to regenerate
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

import type * as auth from "../auth.js";
import type * as dashboard from "../dashboard.js";
import type * as projects from "../projects.js";
import type * as tasks from "../tasks.js";
import type * as users from "../users.js";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  dashboard: typeof dashboard;
  projects: typeof projects;
  tasks: typeof tasks;
  users: typeof users;
}>;

export declare const api: FilterApi<typeof fullApi, FunctionReference<any, "public">>;
export declare const internal: FilterApi<typeof fullApi, FunctionReference<any, "internal">>;
