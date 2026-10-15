import { describe, it, expect } from 'vitest';
import { detectUrlPlatformAndShort, evaluateUrlBlocking } from '../src/common/urlMatcher';
import { INITIAL_APP_STATE } from '../src/common/defaults';
import { AppState } from '../src/common/types';

describe('URL Matcher and Blocking Decisions', () => {
  it('correctly identifies YouTube Shorts vs regular watch pages', () => {
    expect(detectUrlPlatformAndShort('https://www.youtube.com/shorts/abcdef123')).toEqual({
      platform: 'youtube',
      isDirectShort: true,
    });
    expect(detectUrlPlatformAndShort('https://youtube.com/watch?v=abcdef123')).toEqual({
      platform: 'youtube',
      isDirectShort: false,
    });
    expect(detectUrlPlatformAndShort('https://m.youtube.com/shorts/xyz789')).toEqual({
      platform: 'youtube',
      isDirectShort: true,
    });
  });

  it('correctly identifies Instagram Reels vs standard posts', () => {
    expect(detectUrlPlatformAndShort('https://www.instagram.com/reel/C123456/')).toEqual({
      platform: 'instagram',
      isDirectShort: true,
    });
    expect(detectUrlPlatformAndShort('https://www.instagram.com/reels/')).toEqual({
      platform: 'instagram',
      isDirectShort: true,
    });
    expect(detectUrlPlatformAndShort('https://www.instagram.com/p/C123456/')).toEqual({
      platform: 'instagram',
      isDirectShort: false,
    });
    expect(detectUrlPlatformAndShort('https://www.instagram.com/direct/inbox/')).toEqual({
      platform: 'instagram',
      isDirectShort: false,
    });
  });

  it('correctly identifies Facebook Reels', () => {
    expect(detectUrlPlatformAndShort('https://www.facebook.com/reel/123456789/')).toEqual({
      platform: 'facebook',
      isDirectShort: true,
    });
    expect(detectUrlPlatformAndShort('https://www.facebook.com/groups/123456789/')).toEqual({
      platform: 'facebook',
      isDirectShort: false,
    });
  });

  it('blocks all of TikTok by default', () => {
    expect(detectUrlPlatformAndShort('https://www.tiktok.com/@creator/video/123456')).toEqual({
      platform: 'tiktok',
      isDirectShort: true,
    });
    expect(detectUrlPlatformAndShort('https://tiktok.com/')).toEqual({
      platform: 'tiktok',
      isDirectShort: true,
    });
  });

  it('evaluates URL blocking based on app state', () => {
    const state: AppState = JSON.parse(JSON.stringify(INITIAL_APP_STATE));
    const now = 1770000000000;

    // Normal watch page -> should not block
    expect(evaluateUrlBlocking('https://www.youtube.com/watch?v=123', state, now).shouldBlock).toBe(false);

    // Shorts -> should block by default
    expect(evaluateUrlBlocking('https://www.youtube.com/shorts/123', state, now).shouldBlock).toBe(true);

    // Custom domain -> should block
    state.settings.customBlockedDomains = ['distracting-site.com'];
    expect(evaluateUrlBlocking('https://distracting-site.com/feed', state, now).shouldBlock).toBe(true);

    // If grace pass is active -> shorts allowed!
    state.graceState.activeUntil = now + 5 * 60 * 1000;
    expect(evaluateUrlBlocking('https://www.youtube.com/shorts/123', state, now).shouldBlock).toBe(false);

    // BUT if Focus session is active -> grace pass CANNOT override focus session!
    state.focusSession = {
      isActive: true,
      startedAt: now - 1000,
      expiresAt: now + 50 * 60 * 1000,
      durationMinutes: 50,
    };
    expect(evaluateUrlBlocking('https://www.youtube.com/shorts/123', state, now).shouldBlock).toBe(true);
  });
});
