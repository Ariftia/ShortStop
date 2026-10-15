import { AppState, QuotaEvaluation } from '../../common/types';
import { evaluateGraceQuota } from '../../common/quota';

const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

const params = new URLSearchParams(window.location.search);
const originalUrl = params.get('url') || '';
const reasonParam = params.get('reason') || '';

// DOM Elements
const reasonEl = document.getElementById('block-reason') as HTMLElement;
const sessionBanner = document.getElementById('session-banner') as HTMLElement;
const sessionTimerText = document.getElementById('session-timer-text') as HTMLElement;
const btnBack = document.getElementById('btn-back') as HTMLButtonElement;
const btnNewTab = document.getElementById('btn-newtab') as HTMLButtonElement;
const btnSettings = document.getElementById('btn-settings') as HTMLButtonElement;

const graceQuotaSummary = document.getElementById('grace-quota-summary') as HTMLElement;
const btnRequestGrace = document.getElementById('btn-request-grace') as HTMLButtonElement;

const modal = document.getElementById('grace-modal') as HTMLElement;
const delaySecondsEl = document.getElementById('delay-seconds') as HTMLElement;
const btnCancelDelay = document.getElementById('btn-cancel-delay') as HTMLButtonElement;
const btnConfirmGrace = document.getElementById('btn-confirm-grace') as HTMLButtonElement;

let currentState: AppState | null = null;
let delayTimer: number | null = null;
let delayCount = 30;

if (reasonParam) {
  reasonEl.textContent = reasonParam;
}

btnBack.addEventListener('click', () => {
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = 'https://www.google.com';
  }
});

btnNewTab.addEventListener('click', () => {
  if (api && api.tabs && api.tabs.create) {
    api.tabs.create({ url: 'about:newtab' });
  } else {
    window.open('about:newtab', '_blank');
  }
});

btnSettings.addEventListener('click', () => {
  if (api && api.runtime && api.runtime.openOptionsPage) {
    api.runtime.openOptionsPage();
  } else if (api && api.runtime) {
    window.location.href = api.runtime.getURL('ui/settings.html');
  }
});

function updateView(state: AppState) {
  currentState = state;
  const now = Date.now();

  // Focus Session
  const isFocus = state.focusSession.isActive && !!state.focusSession.expiresAt && now < state.focusSession.expiresAt;
  if (isFocus) {
    sessionBanner.classList.remove('hidden');
    const remMinutes = Math.ceil((state.focusSession.expiresAt! - now) / 60000);
    sessionTimerText.textContent = `Focus session locked: ${remMinutes} min remaining`;
  } else {
    sessionBanner.classList.add('hidden');
  }

  // Grace Quota Evaluation
  const evalRes: QuotaEvaluation = evaluateGraceQuota(state, now);
  if (isFocus) {
    graceQuotaSummary.textContent = 'Locked during Focus Session';
    btnRequestGrace.disabled = true;
  } else if (!evalRes.canActivate) {
    if (evalRes.reason === 'COOLDOWN_ACTIVE') {
      const mins = Math.ceil(evalRes.remainingCooldownSeconds / 60);
      graceQuotaSummary.textContent = `Cooldown active (${mins} min left)`;
    } else if (evalRes.reason === 'DAILY_CAP_REACHED') {
      graceQuotaSummary.textContent = `Daily limit reached (${state.settings.graceQuota.dailyCeilingMinutes}m today)`;
    } else if (evalRes.reason === 'GRACE_DISABLED') {
      graceQuotaSummary.textContent = 'Grace Time disabled in settings';
    } else {
      graceQuotaSummary.textContent = 'Pass currently unavailable';
    }
    btnRequestGrace.disabled = true;
  } else {
    graceQuotaSummary.textContent = `${evalRes.availablePassDurationMinutes} min available (${state.graceState.dailyUsageToday}/${state.settings.graceQuota.dailyCeilingMinutes}m used today)`;
    btnRequestGrace.disabled = false;
    btnRequestGrace.textContent = `Use ${evalRes.availablePassDurationMinutes}-Min Grace Pass`;
  }
}

// Intentional Delay Modal logic
btnRequestGrace.addEventListener('click', () => {
  modal.classList.remove('hidden');
  delayCount = 30;
  delaySecondsEl.textContent = '30';
  btnConfirmGrace.disabled = true;
  btnConfirmGrace.textContent = 'Please wait 30s...';

  if (delayTimer) clearInterval(delayTimer);
  delayTimer = window.setInterval(() => {
    delayCount -= 1;
    delaySecondsEl.textContent = String(delayCount);
    btnConfirmGrace.textContent = `Please wait ${delayCount}s...`;

    if (delayCount <= 0) {
      if (delayTimer) clearInterval(delayTimer);
      delayTimer = null;
      btnConfirmGrace.disabled = false;
      btnConfirmGrace.textContent = 'Unlock Grace Pass Now';
    }
  }, 1000);
});

btnCancelDelay.addEventListener('click', () => {
  if (delayTimer) {
    clearInterval(delayTimer);
    delayTimer = null;
  }
  modal.classList.add('hidden');
});

btnConfirmGrace.addEventListener('click', () => {
  if (delayCount > 0) return;
  modal.classList.add('hidden');

  if (api && api.runtime) {
    api.runtime.sendMessage({ type: 'REQUEST_GRACE_PASS' }, (res: any) => {
      if (res && res.success) {
        if (originalUrl) {
          window.location.replace(originalUrl);
        } else {
          window.history.back();
        }
      } else {
        alert(res?.error || res?.reason || 'Could not activate grace pass.');
      }
    });
  }
});

// Fetch current state
if (api && api.runtime) {
  api.runtime.sendMessage({ type: 'GET_STATE' }, (res: any) => {
    if (res && res.state) {
      updateView(res.state);
    }
  });

  api.runtime.onMessage.addListener((message: any) => {
    if (message && message.type === 'STATE_UPDATED' && message.state) {
      updateView(message.state);
    }
  });
}
