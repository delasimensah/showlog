import { showStatus } from "../showStatus";

const base = {
  watchedCount: 0,
  airedCount: 10,
  watchLater: false,
  stopped: false,
  tvmazeStatus: "Running",
};

describe("showStatus", () => {
  it("covers every status", () => {
    expect(showStatus({ ...base, stopped: true, watchLater: true })).toBe(
      "Stopped"
    );
    expect(showStatus({ ...base, watchLater: true })).toBe("Watch later");
    expect(showStatus(base)).toBe("Not started");
    expect(
      showStatus({
        ...base,
        watchedCount: 10,
        airedCount: 10,
        tvmazeStatus: "Ended",
      })
    ).toBe("Finished");
    expect(showStatus({ ...base, watchedCount: 10, airedCount: 10 })).toBe(
      "Up to date"
    );
    expect(showStatus({ ...base, watchedCount: 4 })).toBe("Watching");
  });
});
