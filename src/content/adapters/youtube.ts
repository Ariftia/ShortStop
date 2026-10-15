export function initYouTubeAdapter(isBlocked: () => boolean, getBlockedUrl: (url: string) => string): () => void {
  function checkCurrentPage() {
    if (!isBlocked()) return;

    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/shorts/') || path === '/shorts') {
      // Immediately pause playback
      document.querySelectorAll('video').forEach((v) => {
        try {
          v.pause();
          v.currentTime = 0;
          v.muted = true;
          v.src = '';
        } catch {}
      });

      // Redirect to blocked screen
      const target = getBlockedUrl(window.location.href);
      window.location.replace(target);
    }
  }

  function cleanShortsDOM() {
    if (!isBlocked()) return;

    // Remove Shorts shelves and badges
    const selectors = [
      'ytd-reel-shelf-renderer',
      'ytd-rich-shelf-renderer[is-shorts]',
      'ytd-reel-item-renderer',
      'ytm-reel-shelf-renderer',
      'ytd-guide-entry-renderer a[href*="/shorts"]',
      'ytd-mini-guide-entry-renderer a[href*="/shorts"]',
      'yt-chip-cloud-chip-renderer:has(yt-formatted-string[title="Shorts"])',
      'a#thumbnail[href*="/shorts/"]',
    ];

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        const itemContainer = el.closest('ytd-rich-item-renderer, ytd-video-renderer, ytd-grid-video-renderer') || el;
        (itemContainer as HTMLElement).style.display = 'none';
      });
    }
  }

  // Initial checks
  checkCurrentPage();
  cleanShortsDOM();

  // Batched observer
  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      checkCurrentPage();
      cleanShortsDOM();
      scheduled = false;
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Handle SPA navigation events
  window.addEventListener('yt-navigate-start', checkCurrentPage);
  window.addEventListener('yt-navigate-finish', checkCurrentPage);
  window.addEventListener('popstate', checkCurrentPage);

  return () => {
    observer.disconnect();
    window.removeEventListener('yt-navigate-start', checkCurrentPage);
    window.removeEventListener('yt-navigate-finish', checkCurrentPage);
    window.removeEventListener('popstate', checkCurrentPage);
  };
}
