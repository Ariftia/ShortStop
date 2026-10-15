import { describe, it, expect, beforeEach, vi } from 'vitest';

// Mock WebExtension storage
let mockStorageData: Record<string, any> = {};

(globalThis as any).chrome = {
  runtime: {},
  storage: {
    local: {
      get: vi.fn((key: string, callback: (res: any) => void) => {
        callback({ [key]: mockStorageData[key] });
      }),
      set: vi.fn((items: Record<string, any>, callback: () => void) => {
        Object.assign(mockStorageData, items);
        callback();
      }),
    },
  },
};

import { getAppState, saveAppState, startFocusSession, endFocusSession, updateSettings, triggerGracePass } from '../src/common/storage';

describe('Storage & Anti-Tamper Policy Layer', () => {
  beforeEach(() => {
    mockStorageData = {};
    vi.clearAllMocks();
  });

  it('loads default app state when storage is empty', async () => {
    const state = await getAppState();
    expect(state.settings.enabledPlatforms.youtube).toBe(true);
    expect(state.settings.graceQuota.passDurationMinutes).toBe(5);
    expect(state.focusSession.isActive).toBe(false);
  });

  it('starts a focus session and terminates any active grace pass', async () => {
    const state = await getAppState();
    state.graceState.activeUntil = Date.now() + 300000;
    await saveAppState(state);

    const updated = await startFocusSession(50);
    expect(updated.focusSession.isActive).toBe(true);
    expect(updated.focusSession.durationMinutes).toBe(50);
    expect(updated.graceState.activeUntil).toBeNull();
  });

  it('strictly locks ending focus session early', async () => {
    await startFocusSession(50);
    await expect(endFocusSession(false)).rejects.toThrow('strictly locked');
  });

  it('prevents weakening platform protections during active focus session', async () => {
    await startFocusSession(50);
    await expect(
      updateSettings({
        enabledPlatforms: { youtube: false, instagram: true, facebook: true, tiktok: true },
      })
    ).rejects.toThrow('Cannot disable platform protection during an active Focus Session');
  });

  it('prevents loosening grace time quotas during active focus session', async () => {
    await startFocusSession(50);
    await expect(
      updateSettings({
        graceQuota: { passDurationMinutes: 10, cooldownHours: 3, dailyCeilingMinutes: 30 },
      })
    ).rejects.toThrow('Cannot weaken Grace Time quotas');
  });

  it('allows safe settings updates when outside focus sessions', async () => {
    const updated = await updateSettings({
      customBlockedDomains: ['reddit.com', 'x.com'],
      graceQuota: { passDurationMinutes: 8, cooldownHours: 2, dailyCeilingMinutes: 40 },
    });

    expect(updated.settings.customBlockedDomains).toContain('reddit.com');
    expect(updated.settings.graceQuota.passDurationMinutes).toBe(8);
  });
});
