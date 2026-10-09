import { cronJobs } from "convex/server";

import { internal } from "./_generated/api";

const crons = cronJobs();

crons.hourly("hourly clock", { minuteUTC: 0 }, internal.clock.hourly, {});

export default crons;
