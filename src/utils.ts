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
    // Only prevent default if the event is cancelable
    // If the event is not cancelable, it means scrolling has already started
    // and we should allow it to continue
    if (!e.cancelable) {
      return;
    }

    const curY = e.touches?.[0]?.clientY ?? 0;
    const deltaY = curY - startY;

    if (!startScroller) {
      // Not originating inside a scrollable element -> prevent whole-page drag
      e.preventDefault();
      return;
    }

    const sc = startScroller;

    // Check if element can actually scroll
    const canScroll = sc.scrollHeight > sc.clientHeight;
    if (!canScroll) {
      // Element cannot scroll, prevent default to avoid body scroll
      e.preventDefault();
      return;
    }

    const isAtTop = sc.scrollTop === 0;
    const isAtBottom = Math.ceil(sc.scrollTop + sc.clientHeight) >= sc.scrollHeight;

    // Scrolling down (finger moving down) when at top -> prevent (so body won't pull)
    if (deltaY > 0 && isAtTop) {
      e.preventDefault();
      return;
    }

    // Scrolling up (finger moving up) when at bottom -> prevent
    if (deltaY < 0 && isAtBottom) {
      e.preventDefault();
      return;
    }

    // Otherwise allow the scroll inside the element
    // Don't call preventDefault() here to allow natural scrolling
  };

  document.addEventListener('touchstart', onTouchStart, { passive: true });
  document.addEventListener('touchmove', onTouchMove, { passive: false });

  return () => {
    document.removeEventListener('touchstart', onTouchStart as any);
    document.removeEventListener('touchmove', onTouchMove as any);
  };
}
