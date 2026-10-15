export function initFacebookAdapter(isBlocked: () => boolean, getBlockedUrl: (url: string) => string): () => void {
  function checkCurrentPage() {
    if (!isBlocked()) return;

    const path = window.location.pathname.toLowerCase();
    if (path.startsWith('/reel/') || path.startsWith('/reels/') || path === '/reel') {
      document.querySelectorAll('video').forEach((v) => {
        try {
          v.pause();
          v.currentTime = 0;
          v.muted = true;
          v.src = '';
        } catch {}
      });

      const target = getBlockedUrl(window.location.href);
      window.location.replace(target);
    }
  }

  function cleanReelsDOM() {
    if (!isBlocked()) return;

    const selectors = [
      'div[data-pagelet*="Reels"]',
      'div[aria-label*="Reels"]',
      'a[href*="/reel/"]',
      'a[href*="/reels/"]',
    ];

    for (const sel of selectors) {
      document.querySelectorAll(sel).forEach((el) => {
        const container = el.closest('div[role="feed"] > div, div[role="article"]') || el;
        (container as HTMLElement).style.display = 'none';
      });
    }
  }

  checkCurrentPage();
  cleanReelsDOM();

  let scheduled = false;
  const observer = new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      checkCurrentPage();
      cleanReelsDOM();
      scheduled = false;
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  window.addEventListener('popstate', checkCurrentPage);

  return () => {
    observer.disconnect();
    window.removeEventListener('popstate', checkCurrentPage);
  };
}
