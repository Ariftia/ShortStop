import { AppState, UserSettings } from '../../common/types';
import { DEFAULT_SETTINGS } from '../../common/defaults';

const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

// DOM Elements
const lockBanner = document.getElementById('lock-banner') as HTMLElement;
const inputPassDuration = document.getElementById('input-pass-duration') as HTMLInputElement;
const inputCooldown = document.getElementById('input-cooldown') as HTMLInputElement;
const inputDailyCeiling = document.getElementById('input-daily-ceiling') as HTMLInputElement;
const quotaSummaryText = document.getElementById('quota-summary-text') as HTMLElement;

const toggleYouTube = document.getElementById('toggle-youtube') as HTMLInputElement;
const toggleInstagram = document.getElementById('toggle-instagram') as HTMLInputElement;
const toggleFacebook = document.getElementById('toggle-facebook') as HTMLInputElement;
const toggleTikTok = document.getElementById('toggle-tiktok') as HTMLInputElement;

const inputCustomDomain = document.getElementById('input-custom-domain') as HTMLInputElement;
const btnAddDomain = document.getElementById('btn-add-domain') as HTMLButtonElement;
const customDomainList = document.getElementById('custom-domain-list') as HTMLUListElement;

const btnSave = document.getElementById('btn-save') as HTMLButtonElement;
const btnExport = document.getElementById('btn-export') as HTMLButtonElement;
const btnReset = document.getElementById('btn-reset') as HTMLButtonElement;
const saveStatus = document.getElementById('save-status') as HTMLElement;

let currentState: AppState | null = null;
let currentCustomDomains: string[] = [];

function updateQuotaSummary() {
  const duration = parseInt(inputPassDuration.value, 10) || 5;
  const cooldown = parseInt(inputCooldown.value, 10) || 3;
  const ceiling = parseInt(inputDailyCeiling.value, 10) || 0;

  if (ceiling <= 0) {
    quotaSummaryText.textContent = 'Grace time is disabled entirely (0m daily limit).';
  } else {
    quotaSummaryText.textContent = `${duration} minutes every ${cooldown} hour${cooldown > 1 ? 's' : ''}, up to ${ceiling} minutes daily.`;
  }
}

inputPassDuration.addEventListener('input', updateQuotaSummary);
inputCooldown.addEventListener('input', updateQuotaSummary);
inputDailyCeiling.addEventListener('input', updateQuotaSummary);

function renderDomainList() {
  customDomainList.innerHTML = '';
  currentCustomDomains.forEach((domain, idx) => {
    const li = document.createElement('li');
    li.className = 'domain-item';
    li.innerHTML = `
      <span>${domain}</span>
      <button class="btn-remove-domain" data-idx="${idx}" title="Remove domain">&times;</button>
    `;
    customDomainList.appendChild(li);
  });

  customDomainList.querySelectorAll('.btn-remove-domain').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt((e.target as HTMLElement).dataset.idx || '0', 10);
      currentCustomDomains.splice(idx, 1);
      renderDomainList();
    });
  });
}

btnAddDomain.addEventListener('click', () => {
  let val = inputCustomDomain.value.trim().toLowerCase();
  val = val.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!val) return;

  if (!currentCustomDomains.includes(val)) {
    currentCustomDomains.push(val);
    renderDomainList();
  }
  inputCustomDomain.value = '';
});

function loadSettings(state: AppState) {
  currentState = state;
  const now = Date.now();
  const isFocus = state.focusSession.isActive && !!state.focusSession.expiresAt && now < state.focusSession.expiresAt;

  if (isFocus) {
    lockBanner.classList.remove('hidden');
    // Disable loosening inputs during active session
    toggleYouTube.disabled = true;
    toggleInstagram.disabled = true;
    toggleFacebook.disabled = true;
    toggleTikTok.disabled = true;
    btnReset.disabled = true;
  } else {
    lockBanner.classList.add('hidden');
    toggleYouTube.disabled = false;
    toggleInstagram.disabled = false;
    toggleFacebook.disabled = false;
    toggleTikTok.disabled = false;
    btnReset.disabled = false;
  }

  // Quota fields
  inputPassDuration.value = String(state.settings.graceQuota.passDurationMinutes);
  inputCooldown.value = String(state.settings.graceQuota.cooldownHours);
  inputDailyCeiling.value = String(state.settings.graceQuota.dailyCeilingMinutes);
  updateQuotaSummary();

  // Platforms
  toggleYouTube.checked = !!state.settings.enabledPlatforms.youtube;
  toggleInstagram.checked = !!state.settings.enabledPlatforms.instagram;
  toggleFacebook.checked = !!state.settings.enabledPlatforms.facebook;
  toggleTikTok.checked = !!state.settings.enabledPlatforms.tiktok;

  // Custom Domains
  currentCustomDomains = [...(state.settings.customBlockedDomains || [])];
  renderDomainList();
}

btnSave.addEventListener('click', () => {
  if (!api || !api.runtime) return;

  const duration = Math.max(1, Math.min(15, parseInt(inputPassDuration.value, 10) || 5));
  const cooldown = Math.max(1, Math.min(8, parseInt(inputCooldown.value, 10) || 3));
  const ceiling = Math.max(0, Math.min(120, parseInt(inputDailyCeiling.value, 10) || 0));

  const updatedSettings: Partial<UserSettings> = {
    graceQuota: {
      passDurationMinutes: duration,
      cooldownHours: cooldown,
      dailyCeilingMinutes: ceiling,
    },
    enabledPlatforms: {
      youtube: toggleYouTube.checked,
      instagram: toggleInstagram.checked,
      facebook: toggleFacebook.checked,
      tiktok: toggleTikTok.checked,
    },
    customBlockedDomains: currentCustomDomains,
  };

  api.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: updatedSettings }, (res: any) => {
    if (res && res.success) {
      saveStatus.textContent = 'Settings saved successfully!';
      saveStatus.classList.remove('hidden');
      setTimeout(() => saveStatus.classList.add('hidden'), 3000);
      loadSettings(res.state);
    } else {
      alert(res?.error || 'Failed to save settings.');
    }
  });
});

btnReset.addEventListener('click', () => {
  if (!confirm('Reset all settings to default values?')) return;
  if (!api || !api.runtime) return;

  api.runtime.sendMessage({ type: 'UPDATE_SETTINGS', settings: DEFAULT_SETTINGS }, (res: any) => {
    if (res && res.success) {
      loadSettings(res.state);
      saveStatus.textContent = 'Settings reset to defaults!';
      saveStatus.classList.remove('hidden');
      setTimeout(() => saveStatus.classList.add('hidden'), 3000);
    }
  });
});

btnExport.addEventListener('click', () => {
  if (!currentState) return;
  const jsonStr = JSON.stringify(currentState, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shortstop-config-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
});

// Initialize
if (api && api.runtime) {
  api.runtime.sendMessage({ type: 'GET_STATE' }, (res: any) => {
    if (res && res.state) {
      loadSettings(res.state);
    }
  });
}
