import { getAppState, saveAppState, startFocusSession, triggerGracePass, updateSettings, cancelGracePass } from '../common/storage';
import { evaluateUrlBlocking } from '../common/urlMatcher';
import { AppState, ExtensionMessage } from '../common/types';

const FOCUS_ALARM_NAME = 'shortstop_focus_alarm';
const GRACE_ALARM_NAME = 'shortstop_grace_alarm';

// Cross-browser browser/chrome compatibility helper
const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

async function broadcastStateChange(state: AppState): Promise<void> {
  if (!api || !api.tabs) return;
  try {
    const tabs = await (api.tabs.query ? api.tabs.query({}) : new Promise<any[]>((res) => chrome.tabs.query({}, res)));
    for (const tab of tabs) {
      if (tab.id) {
        api.tabs.sendMessage(tab.id, { type: 'STATE_UPDATED', state }).catch(() => {
          // Tab might not have content script injected, ignore
        });
      }
    }
  } catch (err) {
    console.error('Failed to broadcast state:', err);
  }
}

async function syncAlarms(state: AppState): Promise<void> {
  if (!api || !api.alarms) return;
  const now = Date.now();

  // 1. Focus session alarm
  if (state.focusSession.isActive && state.focusSession.expiresAt && state.focusSession.expiresAt > now) {
    const delayMinutes = Math.max(0.1, (state.focusSession.expiresAt - now) / 60000);
    api.alarms.create(FOCUS_ALARM_NAME, { delayInMinutes: delayMinutes });
  } else {
    api.alarms.clear(FOCUS_ALARM_NAME);
  }

  // 2. Grace pass alarm
  if (state.graceState.activeUntil && state.graceState.activeUntil > now) {
    const delayMinutes = Math.max(0.1, (state.graceState.activeUntil - now) / 60000);
    api.alarms.create(GRACE_ALARM_NAME, { delayInMinutes: delayMinutes });
  } else {
    api.alarms.clear(GRACE_ALARM_NAME);
  }
}

// Check and handle alarm triggers
if (api && api.alarms) {
  api.alarms.onAlarm.addListener(async (alarm: any) => {
    const state = await getAppState();
    const now = Date.now();

    if (alarm.name === FOCUS_ALARM_NAME) {
      if (state.focusSession.expiresAt && now >= state.focusSession.expiresAt) {
        const nextState: AppState = {
          ...state,
          focusSession: {
            ...state.focusSession,
            isActive: false,
            startedAt: null,
            expiresAt: null,
          },
        };
        await saveAppState(nextState);
        await broadcastStateChange(nextState);
      }
    } else if (alarm.name === GRACE_ALARM_NAME) {
      if (state.graceState.activeUntil && now >= state.graceState.activeUntil) {
        const nextState: AppState = {
          ...state,
          graceState: {
            ...state.graceState,
            activeUntil: null,
          },
        };
        await saveAppState(nextState);
        await broadcastStateChange(nextState);
      }
    }
  });
}

// Navigation interception for direct hits
if (api && api.webNavigation && api.webNavigation.onBeforeNavigate) {
  api.webNavigation.onBeforeNavigate.addListener(async (details: any) => {
    // Only intercept top-level frame navigation
    if (details.frameId !== 0) return;

    const state = await getAppState();
    const decision = evaluateUrlBlocking(details.url, state);

    if (decision.shouldBlock) {
      const blockedPageUrl = api.runtime.getURL(
        `ui/blocked.html?url=${encodeURIComponent(details.url)}&reason=${encodeURIComponent(decision.reason || '')}&platform=${encodeURIComponent(decision.platform || '')}`
      );
      if (api.tabs && api.tabs.update) {
        api.tabs.update(details.tabId, { url: blockedPageUrl });
      }
    }
  });
}

// Runtime message listener
if (api && api.runtime) {
  api.runtime.onMessage.addListener((message: ExtensionMessage, _sender: any, sendResponse: (res: any) => void) => {
    (async () => {
      try {
        switch (message.type) {
          case 'GET_STATE': {
            const state = await getAppState();
            await syncAlarms(state);
            sendResponse({ success: true, state });
            break;
          }

          case 'START_FOCUS_SESSION': {
            const nextState = await startFocusSession(message.durationMinutes);
            await syncAlarms(nextState);
            await broadcastStateChange(nextState);
            sendResponse({ success: true, state: nextState });
            break;
          }

          case 'REQUEST_GRACE_PASS': {
            const result = await triggerGracePass();
            if (result.success) {
              await syncAlarms(result.state);
              await broadcastStateChange(result.state);
            }
            sendResponse(result);
            break;
          }

          case 'CANCEL_GRACE_PASS': {
            const nextState = await cancelGracePass();
            await syncAlarms(nextState);
            await broadcastStateChange(nextState);
            sendResponse({ success: true, state: nextState });
            break;
          }

          case 'UPDATE_SETTINGS': {
            const nextState = await updateSettings(message.settings);
            await syncAlarms(nextState);
            await broadcastStateChange(nextState);
            sendResponse({ success: true, state: nextState });
            break;
          }

          case 'CHECK_URL': {
            const state = await getAppState();
            const decision = evaluateUrlBlocking(message.url, state);
            sendResponse({ success: true, decision });
            break;
          }

          default:
            sendResponse({ success: false, error: 'Unknown message type' });
        }
      } catch (err: any) {
        sendResponse({ success: false, error: err.message || 'Operation failed' });
      }
    })();
    return true; // Keep message channel open for async response
  });
}

// Initialize on install or startup
if (api && api.runtime && api.runtime.onInstalled) {
  api.runtime.onInstalled.addListener(async (details: any) => {
    const state = await getAppState();
    await syncAlarms(state);

    if (details.reason === 'install') {
      // Open onboarding on first install
      if (api.tabs && api.tabs.create) {
        api.tabs.create({ url: api.runtime.getURL('ui/onboarding.html') });
      }
    }
  });
}
