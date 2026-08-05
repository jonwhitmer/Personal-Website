import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HelpCircle, ChevronRight, RotateCcw, ArrowDown } from 'lucide-react';

// A call-desk style panel, NOT a chat and NOT a model.
//
// The old version of this file was a mock-up of an "AI portfolio assistant"
// that did not exist: a fake transcript, a dead input box and a COMING SOON
// stamp over the top. It promised something the site could not do.
//
// This replaces it with something honest that still feels responsive: a fixed
// set of questions Jon wrote the answers to himself. There is deliberately no
// text input, no request to a backend and no model anywhere in this file. The
// pause and the character reveal below are pacing, so the answer reads like it
// is being handed to you rather than dumped on the page - they are never the
// only route to the text, which is in the DOM in full from the first frame and
// is revealed instantly when the visitor prefers reduced motion.

const QUESTIONS = [
  {
    // Deliberately NOT "what do you work on day to day". That question can only
    // be answered by describing his employer's work, and the answer that used to
    // be here walked through the services, APIs and database work he touches.
    // Even in generic language that is his team's business, not this page's.
    // This asks about how he works instead, which is his to talk about.
    id: 'how-i-work',
    label: 'How do you approach a problem?',
    answer: [
      'I try to understand the thing before I change it. That usually means reproducing the problem first, so I am fixing what is actually wrong rather than what I assumed was wrong.',
      'After that: the smallest change that works, a test that would have caught it, and names that mean something to whoever reads it next. I would rather leave code simpler than I found it than clever.',
    ],
  },
  {
    id: 'best-at',
    label: 'What are you best at?',
    answer: [
      'Backend and full stack engineering. Java and Python are where I am strongest, with Spring Boot on the server, React and TypeScript on the front end, and SQL underneath. I am comfortable across the whole path, from a table in a database to the button someone actually clicks.',
      'The thing I would really claim as a strength is taking something tangled and leaving it simpler than I found it: smaller pieces, honest names, and tests that prove it still works.',
    ],
  },
  {
    id: 'learning',
    label: 'What are you learning right now?',
    answer: [
      'AI, mostly. It is moving faster than anything else I have worked with, so a lot of my own time goes into building with it and working out what it is genuinely good at and where it just sounds impressive.',
      'Next to that: cloud and deployment, and getting sharper at system design, which is deciding how the pieces of an application fit together before any of it gets written.',
    ],
  },
  {
    id: 'built',
    label: 'What have you built on your own?',
    answer: [
      'Side projects, always end to end, because building every layer teaches me more than polishing one. A dialogue system for a social robot running a language model locally, an evaluation tool for performance reviews and reporting, and a Discord bot with its own card games, economy and moderation.',
      'This site is one of them. Scroll on to the projects section for screenshots and what each one does. They are things I built to learn, not products I am selling.',
    ],
  },
  {
    id: 'opportunities',
    label: 'Are you open to opportunities?',
    answer: [
      'I am working full time and I am not actively looking. That said, I am always happy to hear about interesting work, particularly anything heavy on backend engineering or AI.',
      'If something is a good fit I will say so quickly, and if it is not I will tell you that just as quickly. Either way you get a straight answer.',
    ],
  },
  {
    id: 'contact',
    label: 'How do I get in touch?',
    answer: [
      'The contact form at the bottom of this page is the fastest way, and it comes straight to me. Add a short note about what you are after and I will come back to you.',
      'The button below jumps you straight down to it.',
    ],
    cta: 'Go to the contact form',
  },
];

const THINKING_MS = 550;   // the beat before the answer starts arriving
const REVEAL_TICK_MS = 18; // one reveal frame
const REVEAL_FRAMES = 80;  // every answer finishes in about 1.4s, long or short

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const answerLength = (paragraphs) =>
  paragraphs.reduce((total, p) => total + p.length, 0);

// Renders the full answer every time. The part that has not been "typed" yet is
// present in the DOM and holds its own space, it is just transparent, so the
// bubble never reflows mid-reveal and assistive technology gets the whole
// answer the moment it is inserted.
function RevealedAnswer({ paragraphs, revealed }) {
  let consumed = 0;
  return (
    <div className="space-y-3">
      {paragraphs.map((paragraph, index) => {
        const start = consumed;
        consumed += paragraph.length;
        const shown = Math.max(0, Math.min(paragraph.length, revealed - start));
        return (
          <p key={index} className="text-sm sm:text-base leading-relaxed break-words">
            <span>{paragraph.slice(0, shown)}</span>
            {shown < paragraph.length && (
              <span className="opacity-0">{paragraph.slice(shown)}</span>
            )}
          </p>
        );
      })}
    </div>
  );
}

function TypingDots() {
  return (
    <span data-qa-typing className="inline-flex items-center gap-1.5 py-1">
      <span className="sr-only">Finding that answer</span>
      {[0, 150, 300].map((delay) => (
        <span
          key={delay}
          aria-hidden="true"
          className="w-2 h-2 rounded-full bg-slate-500 dark:bg-gray-400 motion-safe:animate-bounce"
          style={{ animationDelay: `${delay}ms` }}
        />
      ))}
    </span>
  );
}

export default function ChatSoon() {
  const [thread, setThread] = useState([]);
  const [pending, setPending] = useState(null);
  const [revealed, setRevealed] = useState(0);

  const timers = useRef([]);
  const transcriptRef = useRef(null);

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => {
      clearTimeout(id);
      clearInterval(id);
    });
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  // Park the newest exchange at the TOP of the transcript, so a long answer is
  // read from its first word rather than its last. Scrolling the container by
  // hand rather than calling scrollIntoView matters: scrollIntoView would drag
  // the whole page up under the reader.
  useEffect(() => {
    const el = transcriptRef.current;
    if (!el) return;
    const exchanges = el.querySelectorAll('[data-qa-exchange]');
    const last = exchanges[exchanges.length - 1];
    if (!last) { el.scrollTop = 0; return; }
    el.scrollTop += last.getBoundingClientRect().top - el.getBoundingClientRect().top - 8;
  }, [thread, pending]);

  const ask = useCallback((question) => {
    clearTimers();
    setPending(question);

    const total = answerLength(question.answer);
    const reduced = prefersReducedMotion();

    const start = () => {
      setPending(null);
      setThread((previous) => [...previous, question]);

      if (reduced) {
        setRevealed(total);
        return;
      }

      setRevealed(0);
      const step = Math.max(1, Math.ceil(total / REVEAL_FRAMES));
      const interval = setInterval(() => {
        setRevealed((seen) => {
          const next = seen + step;
          if (next >= total) clearInterval(interval);
          return Math.min(next, total);
        });
      }, REVEAL_TICK_MS);
      timers.current.push(interval);
    };

    if (reduced) start();
    else timers.current.push(setTimeout(start, THINKING_MS));
  }, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setThread([]);
    setPending(null);
    setRevealed(0);
  }, [clearTimers]);

  const goToContact = useCallback(() => {
    const target = document.getElementById('contact');
    if (!target) return;
    target.scrollIntoView({
      behavior: prefersReducedMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }, []);

  const started = thread.length > 0 || pending !== null;
  const answered = new Set(thread.map((entry) => entry.id));

  return (
    <section className="mb-12 md:mb-16">
      <div
        data-qa-panel
        className="max-w-5xl mx-auto rounded-2xl border border-slate-900/10 dark:border-white/10 bg-slate-900/[0.04] dark:bg-white/5 backdrop-blur-sm overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 sm:gap-4 p-4 sm:p-6 border-b border-slate-900/10 dark:border-white/10">
          <div className="flex items-start gap-3 min-w-0">
            <span className="hidden sm:flex w-11 h-11 rounded-xl bg-blue-600/10 dark:bg-blue-500/15 border border-blue-600/20 dark:border-blue-400/20 items-center justify-center flex-shrink-0">
              <HelpCircle size={22} className="text-blue-700 dark:text-blue-400" />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-tight">
                What can I help you with?
              </h3>
              <p className="mt-1 text-[13px] sm:text-sm text-slate-600 dark:text-gray-400 leading-relaxed break-words">
                These answers were written ahead of time, by me. Nothing here is generated,
                and there is nothing for you to type.
              </p>
            </div>
          </div>

          {started && (
            <button
              type="button"
              data-qa-reset
              onClick={reset}
              className="flex-shrink-0 inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 sm:px-4 rounded-xl text-sm font-medium border border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/5 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 motion-safe:transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-black"
            >
              <RotateCcw size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Start over</span>
              <span className="sr-only sm:hidden">Start over</span>
            </button>
          )}
        </div>

        {/* Transcript. Its height is FIXED, not elastic: the question list sits
            below it, and a box that grows when an answer lands would shove the
            list out from under whoever is reading it. */}
        <div
          ref={transcriptRef}
          aria-live="polite"
          className="min-h-[180px] overflow-x-hidden p-4 sm:p-6 bg-white dark:bg-black/20 space-y-5"
        >
          {!started && (
            <div className="h-full flex flex-col items-center justify-center text-center gap-3 px-2">
              <HelpCircle size={28} className="text-blue-700 dark:text-blue-400" aria-hidden="true" />
              <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed max-w-sm break-words">
                Pick one of the questions below and the answer shows up right here.
              </p>
            </div>
          )}

          {thread.map((entry, index) => {
            const isLatest = index === thread.length - 1;
            const total = answerLength(entry.answer);
            const shown = isLatest ? revealed : total;
            return (
              <div key={`${entry.id}-${index}`} data-qa-exchange className="space-y-3">
                <div className="flex justify-end">
                  <p className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 bg-blue-700 dark:bg-blue-600 text-white text-sm sm:text-base leading-relaxed break-words">
                    {entry.label}
                  </p>
                </div>
                <div className="flex justify-start">
                  <div
                    data-qa-answer
                    {...(shown < total ? { 'data-qa-revealing': 'true' } : {})}
                    className="max-w-[92%] sm:max-w-[85%] min-w-0 rounded-2xl rounded-bl-md px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-900/10 dark:border-white/10 text-slate-700 dark:text-gray-300"
                  >
                    <RevealedAnswer paragraphs={entry.answer} revealed={shown} />
                    {entry.cta && (
                      <button
                        type="button"
                        onClick={goToContact}
                        className="mt-3 inline-flex items-center gap-2 min-h-[44px] px-4 rounded-xl text-sm font-semibold text-white bg-blue-700 dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-500 motion-safe:transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-black"
                      >
                        <ArrowDown size={16} aria-hidden="true" />
                        <span>{entry.cta}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {pending && (
            <div data-qa-exchange className="space-y-3">
              <div className="flex justify-end">
                <p className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-3 bg-blue-700 dark:bg-blue-600 text-white text-sm sm:text-base leading-relaxed break-words">
                  {pending.label}
                </p>
              </div>
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-slate-100 dark:bg-white/5 border border-slate-900/10 dark:border-white/10">
                  <TypingDots />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* The menu. Every question stays on the list so the panel keeps the same
            height all the way through, and so nothing a visitor already read
            becomes unreachable. Ones already answered are simply marked. */}
        <div className="p-4 sm:p-6 border-t border-slate-900/10 dark:border-white/10">
          <p className="text-[13px] sm:text-sm font-semibold uppercase tracking-wide text-slate-600 dark:text-gray-400 mb-3">
            {started ? 'Ask something else' : 'Common questions'}
          </p>
          <ul className="grid grid-cols-1 lg:grid-cols-2 gap-2 sm:gap-3">
            {QUESTIONS.map((question) => {
              const seen = answered.has(question.id);
              return (
                <li key={question.id} className="min-w-0">
                  <button
                    type="button"
                    data-qa-question
                    onClick={() => ask(question)}
                    className={`w-full min-h-[44px] flex items-center gap-3 text-left px-4 py-3 rounded-xl border motion-safe:transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-black ${
                      seen
                        ? 'border-slate-900/10 dark:border-white/10 bg-transparent text-slate-600 dark:text-gray-400 hover:bg-slate-900/[0.04] dark:hover:bg-white/5'
                        : 'border-slate-900/10 dark:border-white/10 bg-white dark:bg-white/5 text-slate-800 dark:text-gray-200 hover:bg-slate-100 dark:hover:bg-white/10'
                    }`}
                  >
                    <span className="flex-1 min-w-0 text-sm sm:text-base leading-snug break-words">
                      {question.label}
                    </span>
                    {seen && (
                      <span className="flex-shrink-0 text-[13px] font-medium text-slate-500 dark:text-gray-500">
                        Read
                      </span>
                    )}
                    <ChevronRight
                      size={18}
                      aria-hidden="true"
                      className="flex-shrink-0 text-blue-700 dark:text-blue-400"
                    />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
