export function setViewportHeight() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

export function initViewport() {
  setViewportHeight();

  let resizeTimeout: number;
  window.addEventListener('resize', () => {
    if (resizeTimeout) {
      window.cancelAnimationFrame(resizeTimeout);
    }
    resizeTimeout = window.requestAnimationFrame(() => {
      setViewportHeight();
    });
  });
} 