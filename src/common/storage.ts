import { AppState, UserSettings } from './types';
import { INITIAL_APP_STATE } from './defaults';
import { activateGracePass, evaluateGraceQuota, normalizeGraceStateForCurrentDay } from './quota';

// Cross-browser storage access
function getStorage(): chrome.storage.LocalStorageArea | browser.storage.StorageArea {
  if (typeof browser !== 'undefined' && browser.storage && browser.storage.local) {
    return browser.storage.local as any;
  }
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    return chrome.storage.local;
  }
  throw new Error('No compatible WebExtension storage API found.');
}

const STORAGE_KEY = 'shortstop_app_state';

export async function getAppState(): Promise<AppState> {
  const storage = getStorage();
  return new Promise((resolve) => {
    storage.get(STORAGE_KEY, (result: Record<string, any>) => {
      const stored = result && result[STORAGE_KEY];
      if (!stored) {
        resolve(INITIAL_APP_STATE);
        return;
      }

      // Merge defaults to handle schema migrations
      const merged: AppState = {
        settings: {
          ...INITIAL_APP_STATE.settings,
          ...stored.settings,
          enabledPlatforms: {
            ...INITIAL_APP_STATE.settings.enabledPlatforms,
            ...(stored.settings?.enabledPlatforms || {}),
          },
          graceQuota: {
            ...INITIAL_APP_STATE.settings.graceQuota,
            ...(stored.settings?.graceQuota || {}),
          },
        },
        graceState: {
          ...INITIAL_APP_STATE.graceState,
          ...(stored.graceState || {}),
        },
        focusSession: {
          ...INITIAL_APP_STATE.focusSession,
          ...(stored.focusSession || {}),
        },
      };

      const normalized = normalizeGraceStateForCurrentDay(merged);
      resolve(normalized);
    });
  });
}

export async function saveAppState(state: AppState): Promise<void> {
  const storage = getStorage();
  return new Promise((resolve, reject) => {
    storage.set({ [STORAGE_KEY]: state }, () => {
      const err = (chrome.runtime && chrome.runtime.lastError) || (typeof browser !== 'undefined' && (browser.runtime as any)?.lastError);
      if (err) reject(err);
      else resolve();
    });
  });
}

export async function updateSettings(partial: Partial<UserSettings>): Promise<AppState> {
  const current = await getAppState();
  const now = Date.now();

  // Guard against tampering during active focus session
  const isFocusActive = current.focusSession.isActive && !!current.focusSession.expiresAt && now < current.focusSession.expiresAt;
  if (isFocusActive) {
    // If disabling any currently enabled platform -> reject
    if (partial.enabledPlatforms) {
      for (const [key, enabled] of Object.entries(partial.enabledPlatforms)) {
        if (!enabled && current.settings.enabledPlatforms[key as keyof typeof current.settings.enabledPlatforms]) {
          throw new Error('Cannot disable platform protection during an active Focus Session.');
        }
      }
    }
    // If weakening grace quota -> reject
    if (partial.graceQuota) {
      if (partial.graceQuota.dailyCeilingMinutes > current.settings.graceQuota.dailyCeilingMinutes ||
          partial.graceQuota.passDurationMinutes > current.settings.graceQuota.passDurationMinutes ||
          partial.graceQuota.cooldownHours < current.settings.graceQuota.cooldownHours) {
        throw new Error('Cannot weaken Grace Time quotas during an active Focus Session.');
      }
    }
  }

  const updated: AppState = {
    ...current,
    settings: {
      ...current.settings,
      ...partial,
      enabledPlatforms: {
        ...current.settings.enabledPlatforms,
        ...(partial.enabledPlatforms || {}),
      },
      graceQuota: {
        ...current.settings.graceQuota,
        ...(partial.graceQuota || {}),
      },
    },
  };

  await saveAppState(updated);
  return updated;
}

export async function startFocusSession(durationMinutes: number): Promise<AppState> {
  const current = await getAppState();
  const now = Date.now();
  const expiresAt = now + durationMinutes * 60 * 1000;

  const nextState: AppState = {
    ...current,
    focusSession: {
      isActive: true,
      startedAt: now,
      expiresAt,
      durationMinutes,
    },
    // Terminate any active grace pass immediately upon entering focus session
    graceState: {
      ...current.graceState,
      activeUntil: null,
    },
  };

  await saveAppState(nextState);
  return nextState;
}

export async function endFocusSession(force: boolean = false): Promise<AppState> {
  const current = await getAppState();
  const now = Date.now();

  if (!force && current.focusSession.expiresAt && now < current.focusSession.expiresAt) {
    throw new Error('Focus session is strictly locked until its timer expires.');
  }

  const nextState: AppState = {
    ...current,
    focusSession: {
      ...current.focusSession,
      isActive: false,
      startedAt: null,
      expiresAt: null,
    },
  };

  await saveAppState(nextState);
  return nextState;
}

export async function triggerGracePass(): Promise<{ success: boolean; state: AppState; durationMinutes?: number; reason?: string }> {
  const current = await getAppState();
  const now = Date.now();

  const evalRes = evaluateGraceQuota(current, now);
  if (!evalRes.canActivate) {
    return {
      success: false,
      state: current,
      reason: evalRes.reason,
    };
  }

  const { state: nextState, durationMinutes } = activateGracePass(current, now);
  await saveAppState(nextState);
  return {
    success: true,
    state: nextState,
    durationMinutes,
  };
}

export async function cancelGracePass(): Promise<AppState> {
  const current = await getAppState();
  const nextState: AppState = {
    ...current,
    graceState: {
      ...current.graceState,
      activeUntil: null,
    },
  };
  await saveAppState(nextState);
  return nextState;
}
