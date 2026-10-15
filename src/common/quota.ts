import { AppState, QuotaEvaluation } from './types';
import { getTodayDateString } from './defaults';

export function normalizeGraceStateForCurrentDay(appState: AppState, now: number = Date.now()): AppState {
  const todayStr = getTodayDateString(new Date(now));
  if (appState.graceState.currentDate !== todayStr) {
    return {
      ...appState,
      graceState: {
        ...appState.graceState,
        dailyUsageToday: 0,
        currentDate: todayStr,
      },
    };
  }
  return appState;
}

export function evaluateGraceQuota(rawState: AppState, now: number = Date.now()): QuotaEvaluation {
  const state = normalizeGraceStateForCurrentDay(rawState, now);
  const { settings, graceState, focusSession } = state;
  const { graceQuota } = settings;

  // 1. Focus session lock
  const isFocusActive = focusSession.isActive && !!focusSession.expiresAt && now < focusSession.expiresAt;
  if (isFocusActive) {
    return {
      canActivate: false,
      reason: 'IN_FOCUS_SESSION',
      remainingCooldownSeconds: 0,
      remainingDailyMinutes: Math.max(0, graceQuota.dailyCeilingMinutes - graceState.dailyUsageToday),
      availablePassDurationMinutes: 0,
    };
  }

  // 2. Disabled quota (ceiling set to 0)
  if (graceQuota.dailyCeilingMinutes <= 0 || graceQuota.passDurationMinutes <= 0) {
    return {
      canActivate: false,
      reason: 'GRACE_DISABLED',
      remainingCooldownSeconds: 0,
      remainingDailyMinutes: 0,
      availablePassDurationMinutes: 0,
    };
  }

  // 3. Active pass already running
  if (graceState.activeUntil && now < graceState.activeUntil) {
    return {
      canActivate: false,
      reason: 'ACTIVE_PASS_RUNNING',
      remainingCooldownSeconds: 0,
      remainingDailyMinutes: Math.max(0, graceQuota.dailyCeilingMinutes - graceState.dailyUsageToday),
      availablePassDurationMinutes: 0,
    };
  }

  // 4. Daily ceiling reached
  const remainingDaily = Math.max(0, graceQuota.dailyCeilingMinutes - graceState.dailyUsageToday);
  if (remainingDaily <= 0) {
    return {
      canActivate: false,
      reason: 'DAILY_CAP_REACHED',
      remainingCooldownSeconds: 0,
      remainingDailyMinutes: 0,
      availablePassDurationMinutes: 0,
    };
  }

  // 5. Cooldown interval check
  const cooldownMs = graceQuota.cooldownHours * 3600 * 1000;
  if (graceState.lastActivatedAt) {
    const elapsed = now - graceState.lastActivatedAt;
    const remainingCooldownMs = cooldownMs - elapsed;
    if (remainingCooldownMs > 0) {
      return {
        canActivate: false,
        reason: 'COOLDOWN_ACTIVE',
        remainingCooldownSeconds: Math.ceil(remainingCooldownMs / 1000),
        remainingDailyMinutes: remainingDaily,
        availablePassDurationMinutes: Math.min(graceQuota.passDurationMinutes, remainingDaily),
      };
    }
  }

  // 6. Eligible to activate
  const passDuration = Math.min(graceQuota.passDurationMinutes, remainingDaily);
  return {
    canActivate: true,
    remainingCooldownSeconds: 0,
    remainingDailyMinutes: remainingDaily,
    availablePassDurationMinutes: passDuration,
  };
}

export function activateGracePass(rawState: AppState, now: number = Date.now()): { state: AppState; durationMinutes: number } {
  const evalResult = evaluateGraceQuota(rawState, now);
  if (!evalResult.canActivate) {
    throw new Error(`Cannot activate grace pass: ${evalResult.reason}`);
  }

  const normalized = normalizeGraceStateForCurrentDay(rawState, now);
  const durationMinutes = evalResult.availablePassDurationMinutes;
  const durationMs = durationMinutes * 60 * 1000;

  const nextState: AppState = {
    ...normalized,
    graceState: {
      ...normalized.graceState,
      activeUntil: now + durationMs,
      lastActivatedAt: now,
      dailyUsageToday: normalized.graceState.dailyUsageToday + durationMinutes,
    },
  };

  return { state: nextState, durationMinutes };
}

export function isGracePassCurrentlyActive(state: AppState, now: number = Date.now()): boolean {
  return typeof state.graceState.activeUntil === 'number' && now < state.graceState.activeUntil;
}
