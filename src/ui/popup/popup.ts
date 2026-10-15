import { AppState, QuotaEvaluation } from '../../common/types';
import { evaluateGraceQuota, isGracePassCurrentlyActive } from '../../common/quota';

const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

// DOM Elements
const statusBadge = document.getElementById('status-badge') as HTMLElement;
const statusText = document.getElementById('status-text') as HTMLElement;

const pillYouTube = document.getElementById('pill-youtube') as HTMLElement;
const pillInstagram = document.getElementById('pill-instagram') as HTMLElement;
const pillFacebook = document.getElementById('pill-facebook') as HTMLElement;
const pillTikTok = document.getElementById('pill-tiktok') as HTMLElement;

// Focus elements
const focusLockIndicator = document.getElementById('focus-lock-indicator') as HTMLElement;
const focusActiveView = document.getElementById('focus-active-view') as HTMLElement;
const focusCountdown = document.getElementById('focus-countdown') as HTMLElement;
const focusSetupView = document.getElementById('focus-setup-view') as HTMLElement;
const btnStartFocus = document.getElementById('btn-start-focus') as HTMLButtonElement;
const presetButtons = document.querySelectorAll('.btn-preset') as NodeListOf<HTMLButtonElement>;

// Grace elements
const graceUsageBadge = document.getElementById('grace-usage-badge') as HTMLElement;
const graceActiveView = document.getElementById('grace-active-view') as HTMLElement;
const graceCountdown = document.getElementById('grace-countdown') as HTMLElement;
const btnEndGrace = document.getElementById('btn-end-grace') as HTMLButtonElement;
const graceSetupView = document.getElementById('grace-setup-view') as HTMLElement;
const graceStatusDesc = document.getElementById('grace-status-desc') as HTMLElement;
const btnPopupGrace = document.getElementById('btn-popup-grace') as HTMLButtonElement;

// Modal elements
const modal = document.getElementById('popup-delay-modal') as HTMLElement;
const delaySecondsEl = document.getElementById('popup-delay-seconds') as HTMLElement;
const btnCancelDelay = document.getElementById('btn-cancel-popup-delay') as HTMLButtonElement;
const btnConfirmGrace = document.getElementById('btn-confirm-popup-grace') as HTMLButtonElement;

const btnOpenSettings = document.getElementById('btn-open-settings') as HTMLButtonElement;

let currentState: AppState | null = null;
let selectedFocusMins = 25;
let timerInterval: number | null = null;
let modalInterval: number | null = null;
let delayCount = 30;

function formatMMSS(totalSeconds: number): string {
  const mins = Math.floor(Math.max(0, totalSeconds) / 60);
  const secs = Math.floor(Math.max(0, totalSeconds) % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Preset selection
presetButtons.forEach((btn) => {
  btn.addEventListener('click', () => {
    presetButtons.forEach((b) => b.classList.remove('active'));
    btn.classList.add('active');
    selectedFocusMins = parseInt(btn.dataset.mins || '25', 10);
  });
});

btnStartFocus.addEventListener('click', () => {
  if (!api || !api.runtime) return;
  api.runtime.sendMessage({ type: 'START_FOCUS_SESSION', durationMinutes: selectedFocusMins }, (res: any) => {
    if (res && res.state) {
      render(res.state);
    }
  });
});

btnEndGrace.addEventListener('click', () => {
  if (!api || !api.runtime) return;
  api.runtime.sendMessage({ type: 'CANCEL_GRACE_PASS' }, (res: any) => {
    if (res && res.state) {
      render(res.state);
    }
  });
});

btnPopupGrace.addEventListener('click', () => {
  modal.classList.remove('hidden');
  delayCount = 30;
  delaySecondsEl.textContent = '30';
  btnConfirmGrace.disabled = true;
  btnConfirmGrace.textContent = 'Wait 30s...';

  if (modalInterval) clearInterval(modalInterval);
  modalInterval = window.setInterval(() => {
    delayCount -= 1;
    delaySecondsEl.textContent = String(delayCount);
    btnConfirmGrace.textContent = `Wait ${delayCount}s...`;

    if (delayCount <= 0) {
      if (modalInterval) clearInterval(modalInterval);
      modalInterval = null;
      btnConfirmGrace.disabled = false;
      btnConfirmGrace.textContent = 'Unlock Pass';
    }
  }, 1000);
});

btnCancelDelay.addEventListener('click', () => {
  if (modalInterval) {
    clearInterval(modalInterval);
    modalInterval = null;
  }
  modal.classList.add('hidden');
});

window.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    if (modalInterval) {
      clearInterval(modalInterval);
      modalInterval = null;
    }
    modal.classList.add('hidden');
  }
});

btnConfirmGrace.addEventListener('click', () => {
  if (delayCount > 0) return;
  modal.classList.add('hidden');

  if (api && api.runtime) {
    api.runtime.sendMessage({ type: 'REQUEST_GRACE_PASS' }, (res: any) => {
      if (res && res.state) {
        render(res.state);
      } else {
        alert(res?.error || res?.reason || 'Failed to activate grace pass');
      }
    });
  }
});

btnOpenSettings.addEventListener('click', () => {
  if (api && api.runtime && api.runtime.openOptionsPage) {
    api.runtime.openOptionsPage();
  } else if (api && api.runtime) {
    window.open(api.runtime.getURL('ui/settings.html'), '_blank');
  }
});

function render(state: AppState) {
  currentState = state;
  const now = Date.now();

  // Platform pills
  pillYouTube.classList.toggle('active', !!state.settings.enabledPlatforms.youtube);
  pillInstagram.classList.toggle('active', !!state.settings.enabledPlatforms.instagram);
  pillFacebook.classList.toggle('active', !!state.settings.enabledPlatforms.facebook);
  pillTikTok.classList.toggle('active', !!state.settings.enabledPlatforms.tiktok);

  const isFocus = state.focusSession.isActive && !!state.focusSession.expiresAt && now < state.focusSession.expiresAt;
  const isGrace = !isFocus && isGracePassCurrentlyActive(state, now);

  // Status Badge
  statusBadge.className = 'badge';
  if (isFocus) {
    statusBadge.classList.add('badge-focus');
    statusText.textContent = 'Focus Session';
  } else if (isGrace) {
    statusBadge.classList.add('badge-grace');
    statusText.textContent = 'Grace Pass Active';
  } else {
    statusBadge.classList.add('badge-success');
    statusText.textContent = 'Protected';
  }

  // Focus Card
  if (isFocus) {
    focusLockIndicator.classList.remove('hidden');
    focusSetupView.classList.add('hidden');
    focusActiveView.classList.remove('hidden');
    const remSecs = Math.max(0, Math.floor((state.focusSession.expiresAt! - now) / 1000));
    focusCountdown.textContent = formatMMSS(remSecs);
  } else {
    focusLockIndicator.classList.add('hidden');
    focusSetupView.classList.remove('hidden');
    focusActiveView.classList.add('hidden');
  }

  // Grace Card
  graceUsageBadge.textContent = `${state.graceState.dailyUsageToday}/${state.settings.graceQuota.dailyCeilingMinutes}m today`;

  if (isGrace) {
    graceActiveView.classList.remove('hidden');
    graceSetupView.classList.add('hidden');
    const remSecs = Math.max(0, Math.floor((state.graceState.activeUntil! - now) / 1000));
    graceCountdown.textContent = formatMMSS(remSecs);
  } else {
    graceActiveView.classList.add('hidden');
    graceSetupView.classList.remove('hidden');

    const evalRes: QuotaEvaluation = evaluateGraceQuota(state, now);
    if (isFocus) {
      graceStatusDesc.textContent = 'Grace passes strictly locked during focus sessions.';
      btnPopupGrace.disabled = true;
    } else if (!evalRes.canActivate) {
      if (evalRes.reason === 'COOLDOWN_ACTIVE') {
        const mins = Math.ceil(evalRes.remainingCooldownSeconds / 60);
        graceStatusDesc.textContent = `Cooldown active (${mins}m remaining).`;
      } else if (evalRes.reason === 'DAILY_CAP_REACHED') {
        graceStatusDesc.textContent = `Daily limit reached (${state.settings.graceQuota.dailyCeilingMinutes}m).`;
      } else if (evalRes.reason === 'GRACE_DISABLED') {
        graceStatusDesc.textContent = 'Grace time is disabled in settings.';
      } else {
        graceStatusDesc.textContent = 'Grace pass currently unavailable.';
      }
      btnPopupGrace.disabled = true;
    } else {
      graceStatusDesc.textContent = `${evalRes.availablePassDurationMinutes}m pass ready (${state.settings.graceQuota.cooldownHours}h cooldown).`;
      btnPopupGrace.disabled = false;
      btnPopupGrace.textContent = `Use ${evalRes.availablePassDurationMinutes}-Min Grace Pass`;
    }
  }
}

// Tick timers every second
if (timerInterval) clearInterval(timerInterval);
timerInterval = window.setInterval(() => {
  if (currentState) {
    render(currentState);
  }
}, 1000);

// Initialize
if (api && api.runtime) {
  api.runtime.sendMessage({ type: 'GET_STATE' }, (res: any) => {
    if (res && res.state) {
      render(res.state);
    }
  });

  api.runtime.onMessage.addListener((message: any) => {
    if (message && message.type === 'STATE_UPDATED' && message.state) {
      render(message.state);
    }
  });
}
