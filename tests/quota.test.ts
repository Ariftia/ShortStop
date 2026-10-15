import { describe, it, expect } from 'vitest';
import { evaluateGraceQuota, activateGracePass, normalizeGraceStateForCurrentDay } from '../src/common/quota';
import { INITIAL_APP_STATE } from '../src/common/defaults';
import { AppState } from '../src/common/types';

describe('Grace Quota Logic', () => {
  const baseDate = new Date();
  const baseTime = baseDate.getTime();

  it('allows activating grace pass under default settings', () => {
    const state: AppState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    const evalRes = evaluateGraceQuota(state, baseTime);

    expect(evalRes.canActivate).toBe(true);
    expect(evalRes.availablePassDurationMinutes).toBe(5);
    expect(evalRes.remainingDailyMinutes).toBe(30);
    expect(evalRes.remainingCooldownSeconds).toBe(0);
  });

  it('strictly rejects grace pass during an active focus session', () => {
    const state: AppState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    state.focusSession = {
      isActive: true,
      startedAt: baseTime,
      expiresAt: baseTime + 50 * 60 * 1000,
      durationMinutes: 50,
    };

    const evalRes = evaluateGraceQuota(state, baseTime + 1000);
    expect(evalRes.canActivate).toBe(false);
    expect(evalRes.reason).toBe('IN_FOCUS_SESSION');
  });

  it('activates a pass and enforces cooldown period', () => {
    const state: AppState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    const { state: nextState, durationMinutes } = activateGracePass(state, baseTime);

    expect(durationMinutes).toBe(5);
    expect(nextState.graceState.activeUntil).toBe(baseTime + 5 * 60 * 1000);
    expect(nextState.graceState.dailyUsageToday).toBe(5);

    // During active pass
    const duringPass = evaluateGraceQuota(nextState, baseTime + 2 * 60 * 1000);
    expect(duringPass.canActivate).toBe(false);
    expect(duringPass.reason).toBe('ACTIVE_PASS_RUNNING');

    // 10 minutes after start (pass expired, but 3-hour cooldown still active)
    const afterPass = evaluateGraceQuota(nextState, baseTime + 10 * 60 * 1000);
    expect(afterPass.canActivate).toBe(false);
    expect(afterPass.reason).toBe('COOLDOWN_ACTIVE');
    expect(afterPass.remainingCooldownSeconds).toBeGreaterThan(0);

    // 3 hours and 1 minute later -> cooldown is cleared!
    const cooldownClearedTime = baseTime + (3 * 3600 + 60) * 1000;
    const canActivateAgain = evaluateGraceQuota(nextState, cooldownClearedTime);
    expect(canActivateAgain.canActivate).toBe(true);
    expect(canActivateAgain.remainingDailyMinutes).toBe(25);
  });

  it('respects daily ceiling and blocks when exhausted', () => {
    const state: AppState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    state.graceState.dailyUsageToday = 30; // 30 of 30 used

    const evalRes = evaluateGraceQuota(state, baseTime);
    expect(evalRes.canActivate).toBe(false);
    expect(evalRes.reason).toBe('DAILY_CAP_REACHED');
  });

  it('respects adjustable quota parameters (custom duration, cooldown, and ceiling)', () => {
    const state: AppState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    state.settings.graceQuota = {
      passDurationMinutes: 10,
      cooldownHours: 1,
      dailyCeilingMinutes: 15,
    };
    state.graceState.dailyUsageToday = 10; // 10 used, 5 remaining

    // Should only give remaining 5 minutes even though passDuration is 10
    const evalRes = evaluateGraceQuota(state, baseTime);
    expect(evalRes.canActivate).toBe(true);
    expect(evalRes.availablePassDurationMinutes).toBe(5);
  });

  it('resets daily usage at midnight', () => {
    const state: AppState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    state.graceState.currentDate = '2026-10-14';
    state.graceState.dailyUsageToday = 30;

    // Simulate next day
    const nextDay = new Date(2026, 9, 15, 10, 0, 0).getTime();
    const normalized = normalizeGraceStateForCurrentDay(state, nextDay);

    expect(normalized.graceState.dailyUsageToday).toBe(0);
    expect(normalized.graceState.currentDate).toBe('2026-10-15');
  });
});
