import React, { useEffect, useState } from 'react';

/**
 * A hairline bar showing how far through the story you are. It sits at the
 * bottom edge of the sticky header, so it reads as part of the navbar rather
 * than as a separate widget.
 */
export default function ScrollProgress() {
  const [pct, setPct] = useState(0);
  const [headerH, setHeaderH] = useState(0);
  const [current, setCurrent] = useState(null);

  // Measure the header instead of hard-coding its height. It is 97px today, but
  // a hard-coded offset is exactly the bug that already bit the mobile menu
  // (`top-[73px]` against a 97px header), and the header's size is free to change
  // with its own styling. A ResizeObserver keeps this correct without anyone
  // having to remember to update a number.
  useEffect(() => {
    const header = document.querySelector('header');
    if (!header) return;
    const measure = () => setHeaderH(header.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let frame = null;

    const update = () => {
      frame = null;
      const doc = document.documentElement;
      // How far the page can actually travel. Guard against a zero divide on a
      // page shorter than the window, which would otherwise be NaN and render
      // an empty style attribute.
      const travel = doc.scrollHeight - window.innerHeight;
      setPct(travel > 0 ? Math.min(100, Math.max(0, (window.scrollY / travel) * 100)) : 0);

      // Which chapter are we actually in? The last one whose top has passed
      // just below the header. Reading the DOM keeps this honest: no separate
      // list of chapters to fall out of sync with the page.
      const line = (document.querySelector('header')?.getBoundingClientRect().height || 0) + 8;
      let active = null;
      for (const el of document.querySelectorAll('[data-chapter]')) {
        const r = el.getBoundingClientRect();
        if (r.top <= line && r.bottom > line) {
          const labelEl = el.querySelector('[data-chapter-label]');
          // If the chapter's own eyebrow is on screen, the pill would print the
          // exact same words a few hundred pixels away from it. Two identical
          // labels visible at once reads as a rendering bug, not as a position
          // indicator. The pill exists for when you have scrolled PAST the
          // eyebrow and can no longer see where you are, so that is the only
          // time it should appear.
          const labelBox = labelEl?.getBoundingClientRect();
          const labelVisible =
            !!labelBox && labelBox.bottom > line && labelBox.top < window.innerHeight;
          if (!labelVisible) {
            active = {
              number: el.getAttribute('data-chapter'),
              label: (labelEl?.textContent || '').trim(),
            };
          }
        }
      }
      setCurrent(active);
    };

    // Coalesce to one update per frame; scroll fires far faster than paint.
    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (frame !== null) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      className="fixed left-0 right-0 h-[2px] z-[60] pointer-events-none"
      style={{ top: `${headerH}px` }}
      aria-hidden="true"
    >
      <div
        data-scroll-progress
        className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400"
        style={{ width: `${pct}%` }}
      />

      {/* Where you are in the story, always answerable. Sits just under the
          progress line. Hidden below sm: a phone has too little width to carry
          a second label under the navbar without it fighting the content. */}
      <div className="hidden sm:flex justify-end px-4 sm:px-6 lg:px-8 pt-1.5">
        <span
          data-current-chapter
          className={`inline-flex items-center gap-2 rounded-full border border-slate-900/10 dark:border-white/10 bg-white/70 dark:bg-black/70 backdrop-blur px-3 py-1 text-xs tracking-[0.18em] uppercase transition-opacity duration-300 ${
            current ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <span className="text-blue-700 dark:text-blue-400 font-bold tabular-nums">{current?.number || ''}</span>
          <span className="text-slate-600 dark:text-gray-400 font-semibold">{current?.label || ''}</span>
        </span>
      </div>
    </div>
  );
}
