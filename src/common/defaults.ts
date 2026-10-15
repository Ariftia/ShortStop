import { AppState, GraceQuotaConfig, GraceState, FocusSessionState, UserSettings } from './types';

export const DEFAULT_GRACE_QUOTA: GraceQuotaConfig = {
  passDurationMinutes: 5,
  cooldownHours: 3,
  dailyCeilingMinutes: 30,
};

export function getTodayDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const INITIAL_GRACE_STATE: GraceState = {
  activeUntil: null,
  lastActivatedAt: null,
  dailyUsageToday: 0,
  currentDate: getTodayDateString(),
};

export const INITIAL_FOCUS_SESSION: FocusSessionState = {
  isActive: false,
  startedAt: null,
  expiresAt: null,
  durationMinutes: 50,
};

export const DEFAULT_SETTINGS: UserSettings = {
  enabledPlatforms: {
    youtube: true,
    instagram: true,
    facebook: true,
    tiktok: true,
  },
  customBlockedDomains: [],
  graceQuota: DEFAULT_GRACE_QUOTA,
  defaultFocusDuration: 50,
};

export const INITIAL_APP_STATE: AppState = {
  settings: DEFAULT_SETTINGS,
  graceState: INITIAL_GRACE_STATE,
  focusSession: INITIAL_FOCUS_SESSION,
};
