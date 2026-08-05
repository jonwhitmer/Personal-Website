import { useEffect, useState } from 'react';

/**
 * Decides whether this visitor gets real WebGL, and which palette the visuals
 * should paint with.
 *
 * The 3D core is a nice-to-have. It is never worth a dropped frame on someone's
 * phone, a flat battery, or a blank rectangle where a browser could not make a
 * GPU context. So it is opt-IN, behind four gates, and every "no" lands on the
 * same still fallback rather than on nothing.
 */

const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';

// Only the lg breakpoint and up - the same 1024px Tailwind uses, and the same
// width at which the hero grows its second column. Below that the phone gets a
// static motif that costs nothing. This is deliberate: a 390px phone is exactly
// the device where a WebGL loop is most expensive and least visible.
const WIDE_ENOUGH = '(min-width: 1024px)';

// Probed once per page load. Creating a context is not free, and the answer
// cannot change without a reload.
let webglSupport = null;

function probeWebgl() {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (!gl) return false;
    // Hand the context straight back. Browsers cap how many live WebGL contexts
    // a page may hold, and a leaked probe context counts against that cap.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

const hasWebgl = () => (webglSupport ??= probeWebgl());

// deviceMemory is Chromium-only and hardwareConcurrency is near-universal;
// absent values are treated as "fine", because refusing to render whenever a
// browser declines to tell us would switch 3D off in Firefox and Safari.
function isLowPoweredDevice() {
  if (typeof navigator === 'undefined') return true;
  const memory = navigator.deviceMemory;
  const cores = navigator.hardwareConcurrency;
  if (typeof memory === 'number' && memory > 0 && memory <= 2) return true;
  if (typeof cores === 'number' && cores > 0 && cores <= 2) return true;
  return false;
}

function readEnvironment() {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return { reducedMotion: true, allow3D: false };
  }
  const reducedMotion = window.matchMedia(REDUCED_MOTION).matches;
  const wideEnough = window.matchMedia(WIDE_ENOUGH).matches;
  return {
    reducedMotion,
    allow3D: !reducedMotion && wideEnough && !isLowPoweredDevice() && hasWebgl(),
  };
}

export function useVisualEnvironment() {
  const [environment, setEnvironment] = useState(readEnvironment);

  useEffect(() => {
    const queries = [window.matchMedia(REDUCED_MOTION), window.matchMedia(WIDE_ENOUGH)];
    const sync = () => setEnvironment(readEnvironment());
    sync();
    queries.forEach((q) => q.addEventListener('change', sync));
    return () => queries.forEach((q) => q.removeEventListener('change', sync));
  }, []);

  return environment;
}

/**
 * Which theme the page is in right now. The toggle in Header writes `dark` onto
 * <html>, so that class is the single source of truth and a MutationObserver is
 * how a canvas hears about it - a WebGL scene cannot inherit a CSS class.
 */
export function useThemeTone() {
  const [tone, setTone] = useState(() =>
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  );

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setTone(root.classList.contains('dark') ? 'dark' : 'light');
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  return tone;
}

/**
 * True only while `element` is on screen AND the tab is in the foreground.
 * Drives the render loop: a canvas nobody is looking at should not be costing
 * anyone a frame, and a backgrounded tab should cost nothing at all.
 */
export function useIsRenderable(ref) {
  const [renderable, setRenderable] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    let onScreen = false;
    const apply = () => setRenderable(onScreen && document.visibilityState === 'visible');

    // No IntersectionObserver (very old browser): assume on screen rather than
    // never rendering. The visibility listener still pauses a hidden tab.
    if (typeof IntersectionObserver === 'undefined') {
      onScreen = true;
      apply();
    } else {
      const observer = new IntersectionObserver(
        ([entry]) => { onScreen = entry.isIntersecting; apply(); },
        { rootMargin: '80px' }
      );
      observer.observe(node);
      document.addEventListener('visibilitychange', apply);
      return () => { observer.disconnect(); document.removeEventListener('visibilitychange', apply); };
    }

    document.addEventListener('visibilitychange', apply);
    return () => document.removeEventListener('visibilitychange', apply);
  }, [ref]);

  return renderable;
}
