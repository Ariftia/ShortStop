export type SupportedPlatform = 'youtube' | 'instagram' | 'facebook' | 'tiktok';

export interface GraceQuotaConfig {
  passDurationMinutes: number; // default: 5
  cooldownHours: number;       // default: 3
  dailyCeilingMinutes: number; // default: 30
}

export interface GraceState {
  activeUntil: number | null;        // timestamp ms when current pass expires
  lastActivatedAt: number | null;    // timestamp ms when last pass was started
  dailyUsageToday: number;           // total minutes consumed today
  currentDate: string;               // YYYY-MM-DD
}

export interface FocusSessionState {
  isActive: boolean;
  startedAt: number | null;
  expiresAt: number | null;
  durationMinutes: number;
}

export interface UserSettings {
  enabledPlatforms: Record<SupportedPlatform, boolean>;
  customBlockedDomains: string[];
  graceQuota: GraceQuotaConfig;
  defaultFocusDuration: number;
}

export interface AppState {
  settings: UserSettings;
  graceState: GraceState;
  focusSession: FocusSessionState;
}

export interface QuotaEvaluation {
  canActivate: boolean;
  reason?: 'IN_FOCUS_SESSION' | 'ACTIVE_PASS_RUNNING' | 'COOLDOWN_ACTIVE' | 'DAILY_CAP_REACHED' | 'GRACE_DISABLED';
  remainingCooldownSeconds: number;
  remainingDailyMinutes: number;
  availablePassDurationMinutes: number;
}

export type ExtensionMessage =
  | { type: 'GET_STATE' }
  | { type: 'STATE_UPDATED'; state: AppState }
  | { type: 'REQUEST_GRACE_PASS' }
  | { type: 'CANCEL_GRACE_PASS' }
  | { type: 'START_FOCUS_SESSION'; durationMinutes: number }
  | { type: 'END_FOCUS_SESSION' }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<UserSettings> }
  | { type: 'CHECK_URL'; url: string };

export type UrlBlockDecision = {
  shouldBlock: boolean;
  platform?: SupportedPlatform | 'custom';
  isDirectShort: boolean;
  reason?: string;
};
