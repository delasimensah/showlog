export async function applyAvailableUpdate(updates: {
  isEnabled: boolean;
  checkForUpdateAsync: () => Promise<{ isAvailable: boolean }>;
  fetchUpdateAsync: () => Promise<unknown>;
  reloadAsync: () => Promise<unknown>;
}): Promise<boolean> {
  try {
    if (!updates.isEnabled) {
      return false;
    }
    const check = await updates.checkForUpdateAsync();
    if (!check.isAvailable) {
      return false;
    }
    await updates.fetchUpdateAsync();
    await updates.reloadAsync();
    return true;
  } catch {
    return false;
  }
}
