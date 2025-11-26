// Utility to initialize a CSS --vh variable based on the real window.innerHeight
// This helps work around mobile browser UI (iOS Safari address bar) so 100% height
// can be calculated reliably.

export function initVh(): () => void {
  const setVh = () => {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  };

  // initialize once
  setVh();

  // attach listeners
  window.addEventListener('resize', setVh);
  window.addEventListener('orientationchange', setVh);

  // return cleanup function to remove listeners
  return () => {
    window.removeEventListener('resize', setVh);
    window.removeEventListener('orientationchange', setVh);
  };
}

// Prevent the whole-page drag/bounce on mobile while allowing inner scrollable elements to scroll.
// Usage: call initPreventBodyDrag() on app init; it returns a cleanup function.
export function initPreventBodyDrag(): () => void {
  let startY = 0;
  let startScroller: HTMLElement | null = null;

  const findScrollable = (el: any): HTMLElement | null => {
    while (el && el !== document.body) {
      if (!(el instanceof HTMLElement)) return null;
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      if ((overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight) {
        return el;
      }
      el = el.parentElement;
    }
    return null;
  };

  const onTouchStart = (e: TouchEvent) => {
    startY = e.touches?.[0]?.clientY ?? 0;
    startScroller = findScrollable(e.target);
  };

  const onTouchMove = (e: TouchEvent) => {
    const curY = e.touches?.[0]?.clientY ?? 0;
    const deltaY = curY - startY;

    if (!startScroller) {
      // Not originating inside a scrollable element -> prevent whole-page drag
      e.preventDefault();
      return;
    }

    const sc = startScroller;
    // If element cannot scroll, prevent default
    if (sc.scrollHeight <= sc.clientHeight) {
      e.preventDefault();
      return;
    }

    // Scrolling down (finger moving down) when at top -> prevent (so body won't pull)
    if (deltaY > 0 && sc.scrollTop === 0) {
      e.preventDefault();
      return;
    }

    // Scrolling up (finger moving up) when at bottom -> prevent
    if (deltaY < 0 && Math.ceil(sc.scrollTop + sc.clientHeight) >= sc.scrollHeight) {
      e.preventDefault();
      return;
    }

    // otherwise allow the scroll inside the element
  };

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    document.removeEventListener('touchstart', onTouchStart as any);
    document.removeEventListener('touchmove', onTouchMove as any);
  };
}
