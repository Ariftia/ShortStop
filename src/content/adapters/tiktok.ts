export function initTikTokAdapter(isBlocked: () => boolean, getBlockedUrl: (url: string) => string): () => void {
  function checkTikTok() {
    if (!isBlocked()) return;

    // Immediately stop any video / audio
    document.querySelectorAll('video, audio').forEach((media) => {
      try {
        (media as HTMLMediaElement).pause();
        (media as HTMLMediaElement).currentTime = 0;
        (media as HTMLMediaElement).muted = true;
        (media as HTMLMediaElement).src = '';
      } catch {}
    });

    // Replace current location with calm blocked screen
    const target = getBlockedUrl(window.location.href);
    window.location.replace(target);
  }

  checkTikTok();

  const observer = new MutationObserver(() => {
    checkTikTok();
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  return () => {
    observer.disconnect();
  };
}
