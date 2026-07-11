/** True on phones / small touch viewports (used for upload menu, layout). */
export function isTouchMobile(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(max-width: 720px)').matches) return true;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
