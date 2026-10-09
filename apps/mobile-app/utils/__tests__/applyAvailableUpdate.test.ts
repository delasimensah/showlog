import { applyAvailableUpdate } from "../applyAvailableUpdate";

describe("applyAvailableUpdate", () => {
  it("downloads and reloads when a JS update is on the channel", async () => {
    const updates = {
      isEnabled: true,
      checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: true }),
      fetchUpdateAsync: jest.fn().mockResolvedValue(undefined),
      reloadAsync: jest.fn().mockResolvedValue(undefined),
    };

    await expect(applyAvailableUpdate(updates)).resolves.toBe(true);
    expect(updates.fetchUpdateAsync).toHaveBeenCalled();
    expect(updates.reloadAsync).toHaveBeenCalled();
  });

  it("leaves the app alone when updates are off or nothing is waiting", async () => {
    const off = {
      isEnabled: false,
      checkForUpdateAsync: jest.fn(),
      fetchUpdateAsync: jest.fn(),
      reloadAsync: jest.fn(),
    };
    const none = {
      isEnabled: true,
      checkForUpdateAsync: jest.fn().mockResolvedValue({ isAvailable: false }),
      fetchUpdateAsync: jest.fn(),
      reloadAsync: jest.fn(),
    };

    await expect(applyAvailableUpdate(off)).resolves.toBe(false);
    await expect(applyAvailableUpdate(none)).resolves.toBe(false);
    expect(off.checkForUpdateAsync).not.toHaveBeenCalled();
    expect(none.fetchUpdateAsync).not.toHaveBeenCalled();
  });

  it("opens the current app when the check fails", async () => {
    const updates = {
      isEnabled: true,
      checkForUpdateAsync: jest.fn().mockRejectedValue(new Error("offline")),
      fetchUpdateAsync: jest.fn(),
      reloadAsync: jest.fn(),
    };

    await expect(applyAvailableUpdate(updates)).resolves.toBe(false);
    expect(updates.reloadAsync).not.toHaveBeenCalled();
  });
});
