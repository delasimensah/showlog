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
import type * as clock_mutations from "../clock/mutations.js";
import type * as crons from "../crons.js";
import type * as discover_actions from "../discover/actions.js";
import type * as discover_mutations from "../discover/mutations.js";
import type * as discover_queries from "../discover/queries.js";
import type * as history_queries from "../history/queries.js";
import type * as http from "../http.js";
import type * as lib_discoverPool from "../lib/discoverPool.js";
import type * as lib_errors from "../lib/errors.js";
import type * as lib_functions from "../lib/functions.js";
import type * as lib_progress from "../lib/progress.js";
import type * as lib_showModel from "../lib/showModel.js";
import type * as lib_singleAccount from "../lib/singleAccount.js";
import type * as lib_tvmaze from "../lib/tvmaze.js";
import type * as lists_queries from "../lists/queries.js";
import type * as profile_actions from "../profile/actions.js";
import type * as profile_queries from "../profile/queries.js";
import type * as refresh_actions from "../refresh/actions.js";
import type * as refresh_mutations from "../refresh/mutations.js";
import type * as refresh_queries from "../refresh/queries.js";
import type * as search_actions from "../search/actions.js";
import type * as search_queries from "../search/queries.js";
import type * as shows_actions from "../shows/actions.js";
import type * as shows_mutations from "../shows/mutations.js";
import type * as shows_queries from "../shows/queries.js";
import type * as testModules from "../testModules.js";
import type * as watching_mutations from "../watching/mutations.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  "clock/mutations": typeof clock_mutations;
  crons: typeof crons;
  "discover/actions": typeof discover_actions;
  "discover/mutations": typeof discover_mutations;
  "discover/queries": typeof discover_queries;
  "history/queries": typeof history_queries;
  http: typeof http;
  "lib/discoverPool": typeof lib_discoverPool;
  "lib/errors": typeof lib_errors;
  "lib/functions": typeof lib_functions;
  "lib/progress": typeof lib_progress;
  "lib/showModel": typeof lib_showModel;
  "lib/singleAccount": typeof lib_singleAccount;
  "lib/tvmaze": typeof lib_tvmaze;
  "lists/queries": typeof lists_queries;
  "profile/actions": typeof profile_actions;
  "profile/queries": typeof profile_queries;
  "refresh/actions": typeof refresh_actions;
  "refresh/mutations": typeof refresh_mutations;
  "refresh/queries": typeof refresh_queries;
  "search/actions": typeof search_actions;
  "search/queries": typeof search_queries;
  "shows/actions": typeof shows_actions;
  "shows/mutations": typeof shows_mutations;
  "shows/queries": typeof shows_queries;
  testModules: typeof testModules;
  "watching/mutations": typeof watching_mutations;
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
