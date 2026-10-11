import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly(
  "hourly clock",
  { minuteUTC: 0 },
  internal.clock.mutations.hourly,
  {}
);

crons.daily(
  "daily refresh",
  { hourUTC: 4, minuteUTC: 0 },
  internal.refresh.actions.daily,
  {}
);

crons.weekly(
  "discover pool",
  { dayOfWeek: "monday", hourUTC: 3, minuteUTC: 0 },
  internal.discover.actions.refreshPool,
  {}
);

export default crons;
