export function scrollToSection(id: string): void {
  const element = document.getElementById(id);
  if (!element) return;

  const prefersReducedMotion =
    window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  element.scrollIntoView({
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
    block: 'start',
  });
}
