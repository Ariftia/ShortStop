const api = typeof browser !== 'undefined' ? browser : (typeof chrome !== 'undefined' ? chrome : null);

const btnActivate = document.getElementById('btn-activate') as HTMLButtonElement;
const btnFocus = document.getElementById('btn-focus') as HTMLButtonElement;

btnActivate.addEventListener('click', () => {
  // Close onboarding tab
  window.close();
});

btnFocus.addEventListener('click', () => {
  if (api && api.runtime) {
    api.runtime.sendMessage({ type: 'START_FOCUS_SESSION', durationMinutes: 50 }, () => {
      window.close();
    });
  } else {
    window.close();
  }
});
