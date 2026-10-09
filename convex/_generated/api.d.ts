/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as clock from "../clock.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_singleAccount from "../lib/singleAccount.js";
import type * as lists from "../lists.js";
import type * as profile from "../profile.js";
import type * as progress from "../progress.js";
import type * as search from "../search.js";
import type * as shows from "../shows.js";
import type * as tvmaze from "../tvmaze.js";
import type * as watching from "../watching.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  clock: typeof clock;
  crons: typeof crons;
  http: typeof http;
  "lib/errors": typeof lib_errors;
  "lib/functions": typeof lib_functions;
  "lib/singleAccount": typeof lib_singleAccount;
  lists: typeof lists;
  profile: typeof profile;
  progress: typeof progress;
  search: typeof search;
  shows: typeof shows;
  tvmaze: typeof tvmaze;
  watching: typeof watching;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
