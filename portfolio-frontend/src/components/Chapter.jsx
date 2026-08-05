import React, { useEffect, useRef, useState } from 'react';

/**
 * One stop on the journey. Wraps an existing section and gives it the numbered
 * eyebrow, the connecting rail, and a fade/slide as it comes into view, so the
 * page reads as a single guided story instead of a stack of unrelated cards.
 *
 * The wrapped section keeps its own `id` and its own `<h2>`, so every nav link,
 * anchor and heading carries on working untouched. This component only adds the
 * connective tissue around it.
 */
export default function Chapter({ number, label, children, first = false, last = false }) {
  const ref = useRef(null);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // The FIRST chapter never fades. It is already on screen when the page
    // loads, so there is nothing to reveal, and fading it in costs something
    // real: an element that paints while still at opacity 0 is disqualified as
    // a Largest Contentful Paint candidate, so the hero portrait could never be
    // the measured paint no matter how fast it downloaded (it arrived in 18ms).
    // A reveal animation on content the visitor is already looking at is pure
    // cost.
    //
    // Anyone who asked for reduced motion also gets the finished state at once,
    // with no transition to sit through.
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (first || reduced || typeof IntersectionObserver === 'undefined') {
      setSeen(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        // One-way latch. Re-hiding a chapter when it scrolls back off screen
        // makes the page flicker on the way up, which reads as a bug.
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 }
    );
    io.observe(el);
    return () => io.disconnect();
    // `first` is read inside, so it belongs here. It never actually changes for
    // a given chapter, but an empty array would be a lie about what this reads.
  }, [first]);

  return (
    <div
      ref={ref}
      data-chapter={number}
      className="relative"
    >
      {/* The rail. Hidden below lg because a phone has no horizontal room to
          spend on it, and the eyebrow already carries the numbering there. */}
      <div
        data-rail
        aria-hidden="true"
        className="hidden lg:block absolute left-0 top-0 bottom-0 w-px"
      >
        {/* The gradient used to end at `to-transparent`, so on a tall chapter the
            line faded out partway down and everything below it looked like it
            had fallen out of the chapter. Chapter 05 holds both More About Me
            and Contact, so the rail simply stopped before Contact. It now keeps
            a floor of colour for its whole height: the line reaches the end of
            whatever it contains. */}
        <div
          className={`absolute inset-0 w-px transition-colors duration-700 ${
            seen
              ? 'bg-gradient-to-b from-blue-500/50 via-blue-500/25 to-blue-500/15'
              : 'bg-slate-900/[0.04] dark:bg-white/5'
          }`}
        />
        {/* The dot that marks this stop */}
        <div
          className={`absolute -left-[5px] top-[3.25rem] w-[11px] h-[11px] rounded-full border-2 transition-all duration-700 ${
            seen
              ? 'bg-blue-400 border-blue-300/60 shadow-[0_0_16px_rgba(96,165,250,0.75)]'
              : 'bg-slate-900/[0.06] dark:bg-white/10 border-slate-900/15 dark:border-white/15'
          }`}
        />
        {last && (
          // The journey stops here rather than trailing into nothing.
          <div className="absolute -left-[3px] bottom-0 w-[7px] h-[7px] rounded-full bg-slate-900/10 dark:bg-white/20" />
        )}
      </div>

      {/* Deliberately NO left padding. The rail lives inside the space the
          sections already reserve with their own `lg:px-8`, so adding the story
          spine does not shift a single pixel of content and the page's side
          gutters stay byte-identical to the deployed site. */}
      <div
        className={`transition-all ease-out ${
          seen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        } motion-reduce:transition-none motion-reduce:opacity-100 motion-reduce:translate-y-0`}
        style={{ transitionDuration: '700ms' }}
      >
        {/* Eyebrow: number, rule, label. Small and tracked out so it frames the
            section's own heading rather than competing with it. */}
        {/* The first chapter opens the page, so it gets a much tighter top:
            there is nothing above it to separate from, and full chapter spacing
            would push the hero a long way below the fold. */}
        <div
          className={`flex items-center gap-3 sm:gap-4 px-4 sm:px-6 lg:px-8 ${
            first ? 'pt-5 sm:pt-6' : 'pt-12 sm:pt-16 lg:pt-20'
          }`}
        >
          <span className="text-blue-700 dark:text-blue-400/90 font-bold tabular-nums text-sm sm:text-base tracking-widest">
            {number}
          </span>
          <span className="h-px w-6 sm:w-10 bg-blue-400/40" aria-hidden="true" />
          <span
            data-chapter-label
            className="text-[0.8125rem] sm:text-sm font-semibold tracking-[0.18em] uppercase text-slate-600 dark:text-gray-400"
          >
            {label}
          </span>
        </div>

        {/* The real section. Its own top padding is what separates it from the
            eyebrow, so nothing here needs to know its internals. */}
        {children}
      </div>
    </div>
  );
}
