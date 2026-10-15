import { AppState, SupportedPlatform, UrlBlockDecision } from './types';
import { isGracePassCurrentlyActive } from './quota';

export function parseHostname(urlString: string): string {
  try {
    const url = new URL(urlString);
    return url.hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function isPlatformEnabled(state: AppState, platform: SupportedPlatform): boolean {
  return !!state.settings.enabledPlatforms[platform];
}

export function detectUrlPlatformAndShort(urlString: string): {
  platform: SupportedPlatform | 'custom' | null;
  isDirectShort: boolean;
} {
  try {
    const url = new URL(urlString);
    const host = url.hostname.toLowerCase();
    const pathname = url.pathname.toLowerCase();

    // YouTube
    if (host === 'youtube.com' || host.endsWith('.youtube.com') || host === 'youtu.be') {
      const isShorts = pathname.startsWith('/shorts/') || pathname === '/shorts';
      return { platform: 'youtube', isDirectShort: isShorts };
    }

    // Instagram
    if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
      const isReel = pathname.startsWith('/reel/') || pathname.startsWith('/reels/') || pathname === '/reels';
      return { platform: 'instagram', isDirectShort: isReel };
    }

    // Facebook
    if (host === 'facebook.com' || host.endsWith('.facebook.com')) {
      const isReel = pathname.startsWith('/reel/') || pathname.startsWith('/reels/') || pathname === '/reel';
      return { platform: 'facebook', isDirectShort: isReel };
    }

    // TikTok (whole site blocked)
    if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) {
      return { platform: 'tiktok', isDirectShort: true };
    }

    return { platform: null, isDirectShort: false };
  } catch {
    return { platform: null, isDirectShort: false };
  }
}

export function evaluateUrlBlocking(urlString: string, state: AppState, now: number = Date.now()): UrlBlockDecision {
  const { platform, isDirectShort } = detectUrlPlatformAndShort(urlString);
  const host = parseHostname(urlString);

  // Check custom domains first
  if (state.settings.customBlockedDomains && state.settings.customBlockedDomains.length > 0) {
    const isCustom = state.settings.customBlockedDomains.some((d) => {
      const target = d.trim().toLowerCase();
      return host === target || host.endsWith(`.${target}`);
    });
    if (isCustom) {
      // Focus session lock takes precedence
      const isFocus = state.focusSession.isActive && !!state.focusSession.expiresAt && now < state.focusSession.expiresAt;
      const isGrace = !isFocus && isGracePassCurrentlyActive(state, now);
      if (!isGrace) {
        return {
          shouldBlock: true,
          platform: 'custom',
          isDirectShort: true,
          reason: 'Custom domain blocked by your rules.',
        };
      }
    }
  }

  if (!platform || platform === 'custom') {
    return { shouldBlock: false, isDirectShort: false };
  }

  // Check if platform is enabled
  if (!isPlatformEnabled(state, platform)) {
    return { shouldBlock: false, platform, isDirectShort };
  }

  // If it's not a short format (e.g. regular YouTube watch page or Instagram feed), do not block navigation
  if (!isDirectShort) {
    return { shouldBlock: false, platform, isDirectShort: false };
  }

  // Focus session takes absolute precedence
  const isFocusActive = state.focusSession.isActive && !!state.focusSession.expiresAt && now < state.focusSession.expiresAt;
  const isGraceActive = !isFocusActive && isGracePassCurrentlyActive(state, now);

  if (isGraceActive) {
    return {
      shouldBlock: false,
      platform,
      isDirectShort: true,
      reason: 'Allowed under active Grace Pass.',
    };
  }

  return {
    shouldBlock: true,
    platform,
    isDirectShort: true,
    reason: platform === 'tiktok'
      ? 'TikTok is fully blocked by ShortStop default policy.'
      : `${platform.toUpperCase()} short-video format blocked.`,
  };
}
