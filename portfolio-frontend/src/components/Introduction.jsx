import React from 'react';
import PortraitField from './visuals/PortraitField';

// Jon picked this one: the second of the three the carousel used to rotate.
// The other two are still in public/images and are simply not referenced.
//
// It is shown in a 210px box on desktop and a 190px box on phones, so it is
// stored at 420px: two device pixels per CSS pixel and not one more. The
// original was 800x800 to fill a square the size of a playing card, which is
// the definition of paying for pixels nobody sees. WebP first with the JPEG
// kept as the fallback, because Safari only learned WebP in 14 and a portrait
// that fails to load is worse than a slightly larger one.
//
// `w`/`h` are the real stored dimensions, so the browser knows the aspect ratio
// before a byte of image arrives and the square never resizes under the reader.
const HERO_PHOTO = {
  webp: '/images/roxyphoto.webp',
  jpg: '/images/roxyphoto.jpg',
  w: 420,
  h: 420,
  alt: 'Jon sitting on the grass with his dog',
};

export default function Introduction({ scrollToSection }) {
  // One photo, no slideshow. The carousel had dots, a play control, a live
  // region and a timer, all to rotate three pictures of the same person, and
  // none of that was information anybody came here for. A single portrait is
  // also the fastest thing the hero can possibly render: nothing fades in from
  // opacity 0, so the browser can count it as the largest paint immediately
  // instead of re-registering a new one on every swap.
  const photo = HERO_PHOTO;

  const portrait = (className) => (
    <div className={className}>
      {/* This wrapper exists so the 3D field is centred on the PHOTO rather than
          on the column, which is what stopped the rings sitting ~20px low. */}
      <div className="relative">
        <PortraitField />
        <div
          data-hero-photos
          className="relative z-10 w-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20"
        >
          <picture>
            <source srcSet={photo.webp} type="image/webp" />
            <img
              src={photo.jpg}
              width={photo.w}
              height={photo.h}
              alt={photo.alt}
              // The only image in the hero, so it is the Largest Contentful
              // Paint candidate: fetched eagerly and at high priority.
              loading="eager"
              fetchpriority="high"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover"
            />
          </picture>
        </div>
      </div>
    </div>
  );

  // Photo column narrowed from 300px to 210px, and the mobile photo from 300px
  // to 190px: at the old size his face filled a large block of the first screen.
  //
  // The bottom padding is deliberately much smaller than the top. The right
  // column ends level with the fourth bullet, so a symmetric 80px underneath
  // left a dead band between the last line of the intro and the panel below it,
  // and the hero read as though something had failed to load there.
  return (
    <section className="pt-8 sm:pt-12 md:pt-20 pb-6 sm:pb-8 md:pb-10 grid lg:grid-cols-[1fr,210px] gap-6 sm:gap-8 md:gap-12 items-start px-4 sm:px-0">
      {/* Photo Section - Shown at top on mobile */}
      {portrait('lg:hidden relative mx-auto w-full max-w-[170px] sm:max-w-[190px]')}

      {/* Text Content */}
      <div className="space-y-6 sm:space-y-8">
        <div className="text-left space-y-4 sm:space-y-6">
          {/* Carries an lg step now so the opening line still lands at the same
              size as every section heading below it. Without it the hero would
              top out one step SMALLER than "Experience", which is backwards. */}
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl lg:text-left text-center font-bold text-slate-900 dark:text-white leading-tight">
            Hi, I'm Jon.
          </h2>
          {/* Nothing decorative goes between this heading and the paragraph
              below it. A diagram lived here briefly and it interrupted the
              sentence someone had started reading. */}
          {/* Long-form copy stops at 16px. It used to keep climbing to 18px on a
              laptop, and 18px is a reading size for an article, not for four
              bullets a recruiter is skimming: it is the single biggest reason
              this page fitted so little on screen. 14px on a phone is still a
              full point above the 13px floor. */}
          <div className="space-y-4 sm:space-y-5 text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto lg:mx-0">
            {/* No employer named here on purpose, and no "looking for a role":
                he has one. That line was the thing making the blurb read oddly.
                The certificate list also came out, because Certifications is now
                its own section further down and saying it twice weakened both. */}
            {/* One step down from 18/20/24. It is still the loudest sentence in
                the paragraph block, just no longer competing with the heading
                three lines above it. */}
            <p className="text-base sm:text-lg md:text-xl font-semibold text-slate-900 dark:text-gray-100 text-left">
              I'm a software engineer. I build full-stack applications, and I'm most
              interested in where AI is taking the field.
            </p>

            <div className="space-y-3 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-blue-700 dark:text-blue-400 text-base sm:text-lg flex-shrink-0 mt-1">•</span>
                <p className="flex-1 min-w-0 text-left">
                  I'm working in the field now, writing production software day to day.
                  The part I like most is that it <span className="font-bold text-slate-900 dark:text-white">never stands still</span>,
                  so there is always something worth learning.
                </p>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-blue-700 dark:text-blue-400 text-base sm:text-lg flex-shrink-0 mt-1">•</span>
                <p className="flex-1 min-w-0 text-left">
                  <span className="font-bold text-slate-900 dark:text-white">AI</span> is
                  moving faster than anything else I've worked with, so a lot of my own time
                  goes into it: building with it, reading about it, and working out what it is
                  genuinely good at and what it isn't.
                </p>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-blue-700 dark:text-blue-400 text-base sm:text-lg flex-shrink-0 mt-1">•</span>
                {/* Deliberately does NOT say his own projects are where he
                    learned the most: his team and employer read this page, and
                    that sentence reads as a slight against the day job. */}
                <p className="flex-1 min-w-0 text-left">
                  I keep building my own projects on the side, which is a good way to try
                  ideas end to end and stay sharp on tools I don't touch every day.
                </p>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-blue-700 dark:text-blue-400 text-base sm:text-lg flex-shrink-0 mt-1">•</span>
                <p className="flex-1 min-w-0 text-left">
                  I care about software that is <span className="text-slate-900 dark:text-white font-bold">practical</span>,{' '}
                  <span className="text-slate-900 dark:text-white font-bold">fast</span>, and still
                  makes sense a year later.
                </p>
              </div>
            </div>

            <p className="text-sm md:text-base text-slate-600 dark:text-gray-400 italic pt-3 sm:pt-4 border-t border-slate-900/10 dark:border-white/10 text-left">
              Thanks for stopping by. If you'd like to get in touch, the{' '}
              {/* Stays on the text baseline. A 44px min-height on an inline
                  element inside a ~24px line makes it a tall box that no longer
                  sits with the words around it, which is what looked crooked.
                  The tap target is grown with an absolutely positioned ::after
                  instead, so the hit area is 44px tall while the link itself
                  still flows as text. */}
              <button
                onClick={() => scrollToSection('contact')}
                className="relative inline align-baseline text-blue-700 dark:text-blue-400 hover:underline rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 after:content-[''] after:absolute after:left-0 after:right-0 after:top-1/2 after:h-11 after:-translate-y-1/2"
              >
                contact section
              </button>{' '}
              is at the bottom of the page.
            </p>
          </div>
        </div>
      </div>

      {/* Photo Section - Shown on right side on desktop.
          lg:self-center rather than the grid's default start: the portrait
          column is ~190px shorter than the copy beside it, and pinning it to the
          top dumped every one of those pixels into a single empty block at the
          bottom of the hero. Centred, the same shortfall becomes ordinary
          margin above and below a picture, which is what a page is supposed to
          look like. */}
      {portrait('hidden lg:block lg:self-center relative mx-auto lg:mx-0 w-full max-w-[210px]')}
    </section>
  );
}
