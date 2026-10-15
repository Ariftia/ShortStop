import { AppState, SupportedPlatform } from '../common/types';
import { detectUrlPlatformAndShort, evaluateUrlBlocking } from '../common/urlMatcher';
import { initYouTubeAdapter } from './adapters/youtube';
import { initInstagramAdapter } from './adapters/instagram';
import { initFacebookAdapter } from './adapters/facebook';
import { initTikTokAdapter } from './adapters/tiktok';

const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

let currentState: AppState | null = null;
let currentTeardown: (() => void) | null = null;

function getBlockedUrl(originalUrl: string): string {
  if (!api || !api.runtime) return '';
  const decision = currentState ? evaluateUrlBlocking(originalUrl, currentState) : { reason: '', platform: '' };
  return api.runtime.getURL(
    `ui/blocked.html?url=${encodeURIComponent(originalUrl)}&reason=${encodeURIComponent(decision.reason || '')}&platform=${encodeURIComponent(decision.platform || '')}`
  );
}

function shouldBlockUrl(url: string = window.location.href): boolean {
  if (!currentState) return false;
  const decision = evaluateUrlBlocking(url, currentState);
  return decision.shouldBlock;
}

function updateDOMState() {
  const isProtected = shouldBlockUrl();
  const root = document.body || document.documentElement;
  if (root) {
    if (isProtected) {
      root.classList.add('shortstop-active');
    } else {
      root.classList.remove('shortstop-active');
    }
  }
}

function setupAdapter(platform: SupportedPlatform | 'custom' | null) {
  if (currentTeardown) {
    currentTeardown();
    currentTeardown = null;
  }

  if (!platform) return;

  switch (platform) {
    case 'youtube':
      currentTeardown = initYouTubeAdapter(shouldBlockUrl, getBlockedUrl);
      break;
    case 'instagram':
      currentTeardown = initInstagramAdapter(shouldBlockUrl, getBlockedUrl);
      break;
    case 'facebook':
      currentTeardown = initFacebookAdapter(shouldBlockUrl, getBlockedUrl);
      break;
    case 'tiktok':
      currentTeardown = initTikTokAdapter(shouldBlockUrl, getBlockedUrl);
      break;
    case 'custom':
      if (shouldBlockUrl()) {
        window.location.replace(getBlockedUrl(window.location.href));
      }
      break;
  }
}

// Check initial URL
const { platform } = detectUrlPlatformAndShort(window.location.href);

// Fetch state and initialize
if (api && api.runtime) {
  api.runtime.sendMessage({ type: 'GET_STATE' }, (response: any) => {
    if (response && response.state) {
      currentState = response.state;
      updateDOMState();
      setupAdapter(platform);
    }
  });

  api.runtime.onMessage.addListener((message: any) => {
    if (message && message.type === 'STATE_UPDATED' && message.state) {
      currentState = message.state;
      updateDOMState();
      setupAdapter(platform);
    }
  });
}

// Monkey-patch history API for instant client-side SPA navigation interception
const originalPushState = history.pushState;
history.pushState = function (...args) {
  const res = originalPushState.apply(this, args);
  updateDOMState();
  if (shouldBlockUrl()) {
    window.location.replace(getBlockedUrl(window.location.href));
  }
  return res;
};

const originalReplaceState = history.replaceState;
history.replaceState = function (...args) {
  const res = originalReplaceState.apply(this, args);
  updateDOMState();
  if (shouldBlockUrl()) {
    window.location.replace(getBlockedUrl(window.location.href));
  }
  return res;
};
