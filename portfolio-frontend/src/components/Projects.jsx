import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
// Maximize2 rather than a magnifier: this button goes FULL SCREEN, and the
// four-arrows glyph is what that means everywhere else on a screen.
import { ChevronLeft, ChevronRight, ExternalLink, FolderGit2, Github, Lock, Maximize2, X } from 'lucide-react';

// Screenshots of the five recent projects. Each frame was chosen and checked so
// that nothing in it exposes work that is not on this page:
//   - Coaster: SINGLE application detail views only (Overview, Logs, Metrics,
//     Services), sidebar cropped away. Its applications grid is never shown,
//     because that list is every other thing being built. The Configuration tab
//     is deliberately absent too: one of its placeholder fields names another
//     project.
//   - Docket: only the one item that is about this website, and only views that
//     cannot pull another project's name in with them - the queue filtered to
//     that single item, and its own page in both themes.
//   - Lectern: lessons whose rendered text contains no application names.
//   - Reeljax: the signed-in workspace running on sample data, cropped to drop
//     an owner-tier badge and an owner console button that together implied a
//     paid product. Nothing here shows a real video.
const reeljax1 = '/images/projects/reeljax-1.png';
const reeljax2 = '/images/projects/reeljax-2.png';
const reeljax3 = '/images/projects/reeljax-3.png';
const reeljax4 = '/images/projects/reeljax-4.png';
const lectern1 = '/images/projects/lectern-1.png';
const lectern2 = '/images/projects/lectern-2.png';
const lectern3 = '/images/projects/lectern-3.png';
const lectern4 = '/images/projects/lectern-4.png';
const docket1 = '/images/projects/docket-1.png';
const docket2 = '/images/projects/docket-2.png';
const docket3 = '/images/projects/docket-3.png';
const docket4 = '/images/projects/docket-4.png';
const coaster1 = '/images/projects/coaster-1.png';
const coaster2 = '/images/projects/coaster-2.png';
const coaster3 = '/images/projects/coaster-3.png';
const coaster4 = '/images/projects/coaster-4.png';
const vesper1 = '/images/projects/vesper-1.png';
const vesper2 = '/images/projects/vesper-2.png';
const vesper3 = '/images/projects/vesper-3.png';
const vesper4 = '/images/projects/vesper-4.png';

// Short silent demo clips, one per current project, recorded off each app while
// it was actually running. They lead the slideshow so the first thing you see is
// the thing moving, and they were held to 5-10s deliberately: past that nobody
// watches, and every extra second is weight on the page.
//
// They are filmed under the SAME rules as the screenshots below, which for two
// of them meant working around the app's own home screen:
//   - Docket: the search box is filled with R197 before recording starts, so
//     the only item ever on screen is the one about this website. Approve is
//     never clicked - approving writes the decision back into the real vault.
//   - Coaster: deep-linked straight to one application's detail view, so the
//     Applications directory is never rendered. Both rails are cropped out in
//     the encode, which also removes the machine's LAN address.
//   - Lectern: one lesson of the GitHub Actions course, checked to contain no
//     application name. Nothing that writes reading state is touched, because
//     this server syncs that state up to the deployed copy every minute.
//   - Reeljax: the public page's own sample data, so no real video and no real
//     account. It stops well above the pricing table.
//   - Vesper: the real interface driven through one full turn. It has no
//     microphone in a recorder, so the turn is scripted rather than spoken.
const reeljaxVid = '/videos/reeljax-demo.mp4';
const lecternVid = '/videos/lectern-demo.mp4';
const docketVid = '/videos/docket-demo.mp4';
const coasterVid = '/videos/coaster-demo.mp4';
const vesperVid = '/videos/vesper-demo.mp4';

const robotvid = '/videos/robot.mp4';
const LunaNoGlasses = '/images/luna_noglasses.png';
const LunaGlasses = '/images/luna_glasses.png';
const IA = '/images/IA_Logo.png';
const IA2 = '/images/adminevaldb.png';
const IA3 = '/images/companybranding.png';
const IA4 = '/images/revieweeportal.png';
const fred1 = '/images/fred1.png';
const fred2 = '/images/fred2.png';
const fred3 = '/images/fred3.png';
const fred4 = '/images/fred4.png';
const fred5 = '/images/fred5.png';
const fred6 = '/images/fred6.png';
const fred7 = '/images/fred7.png';
const fred8 = '/images/fred8.png';
const fred9 = '/images/fred9.png';

const isVideo = (src) =>
  typeof src === 'string' && (src.endsWith('.mov') || src.endsWith('.mp4') || src.endsWith('.webm'));

// Newest first. The five current projects lead, the older ones follow.
//
// Every frame in the five current projects was picked to avoid exposing work
// that is not on this page. What that ruled out, and what was used instead:
//   - Vesper: the only one with nothing to hide, because it renders no list of
//     anything - just its own interface. The one thing kept off screen is its
//     session panel, which prints the live Claude Code session id.
//   - Coaster: its dashboard is a grid of every application it manages, so
//     that screen can never be shown. Single-application views only (Overview,
//     Logs, Metrics, Services), sidebar cropped. The Configuration tab is out
//     too: a placeholder field there renders another project's name.
//   - Docket: it reads personal notes, so only ONE item is usable, the one
//     about this website. Different views of that item, never a board.
//   - Lectern: also reads personal notes, so only lessons whose rendered text
//     contains no application names.
//   - Reeljax: no real source video (it is not mine to republish) and no
//     pricing. Shots come from the sample-data workspace, cropped to remove an
//     owner tier badge and an owner console button that read as a paid product.
//
// `period` and `links` are the only fields added in the grid rebuild. The
// periods come from the 2026 resume (Furhat Jan-May 2025; Discord bot May-Aug
// 2024; Intelli-Assess is the Independent Contractor build, Dec 2024 - Sep
// 2025). The four current apps are 2026.
//
// Links are deliberately conservative. Only URLs that were verified to exist
// are here: the deployed Lectern site, and the one public repo that matches a
// project on this page by name. Everything else says so in plain words rather
// than pointing at a URL that might 404 in front of a recruiter.
const projects = [
  {
    id: 'vesper',
    title: 'Vesper',
    period: '2026',
    summary: 'A voice assistant I talk to instead of typing. I hold the button, say what I want done, and it hands the request to a Claude Code session that goes and does it - editing files, running commands - while the screen shows what it is working on.',
    images: [vesperVid, vesper1, vesper2, vesper3, vesper4],
    links: [],
    codeNote: 'Private repo',
    bullets: [
      "Speech is transcribed on this machine by a local Whisper model, so what I say is never sent anywhere to be turned into text",
      "The request goes to a warm Claude Code session that can actually act - read a file, make an edit, run a command - rather than only answer",
      "The screen is the point: it shows the state it is in, the words it heard, and the real code it is writing, so the work is never happening somewhere I cannot see",
      "It answers out loud through a local speech model, so the whole loop - hearing, thinking, speaking - runs without a paid speech service",
      "Nothing is sent until I press the button, and the button locks while it is working, so I cannot talk over it mid-answer"
    ]
  },
  {
    id: 'reeljax',
    title: 'Reeljax',
    period: '2026',
    // Captured from the app's own signed-in workspace. The marketing page was
    // unusable here: it carries a full pricing table. This frame was also
    // cropped to remove an owner-tier badge and an owner console button, which
    // together read as 'this is a paid product'.
    summary: 'Takes a long video, a podcast or a talk, and produces short vertical clips from it. The transcript decides where each clip starts and ends, and the cutting and encoding all happen on my own machine.',
    images: [reeljaxVid, reeljax1, reeljax2, reeljax3, reeljax4],
    links: [],
    codeNote: 'Private repo',
    bullets: [
      "Chooses clip boundaries from the transcript, so a clip opens and closes on a complete thought instead of mid-sentence",
      "Cuts and encodes locally with ffmpeg (a command line tool for editing video), so nothing is uploaded to a third party to be processed",
      "Downloads a source video once and cuts every clip out of that single copy, rather than fetching the video again per clip",
      "Batch mode works through a queue of videos in one unattended run and reports what it produced"
    ]
  },
  {
    id: 'lectern',
    title: 'Lectern',
    period: '2026',
    summary: 'Turns my own markdown notes into a reading app that is actually pleasant to read in. Deployed, so the notes are readable on my phone and not just on the machine that wrote them.',
    images: [lecternVid, lectern1, lectern2, lectern3, lectern4],
    links: [
      { kind: 'live', label: 'Live site', href: 'https://lectern-omega.vercel.app' }
    ],
    codeNote: 'Private repo',
    bullets: [
      "Typesets plain markdown into a serif reading surface built for long reading rather than skimming",
      "Light and dark themes, plus a focus mode that strips the page back to the passage in front of you",
      "Builds recall checks automatically from the definitions already written in the notes",
      "Spaced repetition brings each term back on a schedule, so it resurfaces before I forget it"
    ]
  },
  {
    id: 'docket',
    title: 'Docket',
    period: '2026',
    summary: 'Where I review work that AI coding agents have done for me. Each agent finishes a task and writes its result back in a fixed format, and Docket turns those reports into something I can actually read, question and sign off on.',
    images: [docketVid, docket3, docket1, docket4, docket2],
    links: [],
    codeNote: 'Private repo',
    bullets: [
      "Every agent reports in the same structure: what it changed, why, what it verified, and what it deliberately left alone",
      "That structure is the point. A consistent shape means I can review a whole day of work in one sitting instead of reading terminal output",
      "Approving or rejecting an item writes my decision straight back into the underlying file, so the app and the record can never disagree",
      "A file watcher picks up anything an agent writes while I have the page open and updates it as it happens, so I am never reading a stale report"
    ]
  },
  {
    id: 'coaster',
    title: 'Coaster',
    period: '2026',
    summary: 'A local control panel for the projects above. It starts and stops each one, checks whether it is genuinely up, and keeps the logs and metrics together in one place.',
    images: [coasterVid, coaster1, coaster2, coaster3, coaster4],
    links: [],
    codeNote: 'Private repo',
    bullets: [
      "Starts, stops and restarts each application from one screen instead of a spread of terminal windows",
      "Health checks report whether a service is actually answering requests, not just that a process is still alive",
      "Streams logs live, so a start that fails is readable immediately instead of after hunting for a log file",
      "Keeps run metrics next to those logs, so a struggling service and its output are on the same screen"
    ]
  },
  {
    id: 'furhat',
    title: 'Furhat Robot Assistant',
    period: '2025',
    summary: 'Kotlin dialogue system with custom state management and locally hosted LLM for real-time responses',
    tags: ['Kotlin', 'LLM', 'React', 'Flask', 'Robotics'],
    images: [
      robotvid,
      LunaNoGlasses,
      LunaGlasses
    ],
    links: [],
    codeNote: 'Code not public',
    bullets: [
      "Developed conversational AI assistant using Furhat Robotics' voice interface",
      "Designed dialogue system with custom state management flows using Kotlin",
      "Scraped and parsed 100+ academic catalog and degree plan pages",
      "Built React.js frontend that visualizes academic pathways interactively"
    ]
  },
  {
    id: 'eval',
    title: 'Intelli-Assess',
    period: '2024 to 2025',
    summary: 'Enterprise-ready evaluation system streamlining performance reviews, report generation, and feedback management across departments, locations, and organizations.',
    tags: ['Java', 'Spring Boot', 'Maven', 'MySQL', 'JUnit'],
    images: [
      IA,
      IA2,
      IA3,
      IA4
    ],
    links: [],
    codeNote: 'Code not public',
    bullets: [
      "Built a full-stack Spring Boot application enabling scalable evaluation workflows across teams and departments",
      "Automated report generation aggregating multi-reviewer feedback into unified performance summaries",
      "Designed modular architecture with real-time notifications, RBAC, and secure data persistence in MySQL",
      "Deployed to Apache Tomcat with production-level stability, optimized for enterprise environments"
    ]
  },
  {
    id: 'discord',
    title: 'Discord Bot',
    period: '2024',
    summary: 'Python bot with custom poker and blackjack games, economy system, and automated moderation',
    tags: ['Python', 'discord.py', 'JSON', 'MySQL', 'GitHub Actions'],
    images: [
      fred9,
      fred1,
      fred2,
      fred3,
      fred4,
      fred5,
      fred6,
      fred7,
      fred8
    ],
    links: [
      { kind: 'repo', label: 'View code', href: 'https://github.com/jonwhitmer/DiscordBot' }
    ],
    codeNote: null,
    bullets: [
      "Built dynamic Discord bot to boost server engagement",
      "Programmed async mini-games with virtual currency system",
      "Processed 10,000+ transactions with MySQL persistence",
      "Average play time of 12.4 hours per game in Aug 2024"
    ]
  }
];

// The tile's picture. Some projects lead with a video (Furhat), which has no
// still frame to show at this size, so the first real image is used instead.
const thumbnailFor = (project) => project.images.find((src) => !isVideo(src)) || null;

/**
 * One card in the grid. The whole card is clickable: the "View details" button
 * carries an absolutely positioned ::after that covers the card, which keeps the
 * markup valid (no headings or paragraphs nested inside a <button>) while still
 * giving a big target. The link row sits above that layer on its own z-index, so
 * a tap on "Live site" goes to the live site and not into the detail panel.
 */
function ProjectTile({ project, onOpen }) {
  const thumb = thumbnailFor(project);

  return (
    <article
      data-project-tile={project.id}
      className="group relative flex flex-col h-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-900/[0.04] dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 dark:border-white/10 transition-colors hover:border-blue-600/40 dark:hover:border-blue-400/40 hover:bg-slate-900/[0.07] dark:hover:bg-white/[0.08] focus-within:border-blue-600/60 dark:focus-within:border-blue-400/60"
    >
      {thumb && (
        <div className="h-44 sm:h-48 w-full flex items-center justify-center bg-slate-900/[0.06] dark:bg-black/30 border-b border-slate-900/10 dark:border-white/10 overflow-hidden">
          <img
            src={thumb}
            alt={`${project.title} screenshot`}
            loading="lazy"
            className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
          />
        </div>
      )}

      <div className="p-5 sm:p-6 flex flex-col gap-2 sm:gap-3 flex-1">
        <div className="flex items-baseline gap-3">
          <span
            data-project-date
            className="text-sm font-semibold tabular-nums tracking-wide text-blue-700 dark:text-blue-400"
          >
            {project.period}
          </span>
        </div>
        <h3 className="font-bold text-xl sm:text-2xl text-slate-900 dark:text-white leading-snug">
          {project.title}
        </h3>
        <p className="text-sm sm:text-base text-slate-700 dark:text-gray-300 leading-relaxed">
          {project.summary}
        </p>
      </div>

      <div className="mt-auto border-t border-slate-900/10 dark:border-white/10 px-3 sm:px-4 py-2 flex flex-wrap items-center gap-x-1 gap-y-1">
        <button
          type="button"
          data-project-open
          onClick={onOpen}
          aria-label={`Open details for ${project.title}`}
          className="inline-flex items-center gap-1.5 min-h-[44px] px-2 sm:px-2.5 rounded-lg text-sm font-semibold text-slate-900 dark:text-white hover:bg-slate-900/[0.06] dark:hover:bg-white/10 transition-colors after:content-[''] after:absolute after:inset-0 after:rounded-xl sm:after:rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-50 dark:focus-visible:ring-offset-black"
        >
          View details
          <ChevronRight size={16} className="transition-transform group-hover:translate-x-0.5" />
        </button>

        {project.links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="relative z-10 inline-flex items-center gap-1.5 min-h-[44px] px-2 sm:px-2.5 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
          >
            {link.kind === 'live' ? <ExternalLink size={16} /> : <Github size={16} />}
            {link.label}
          </a>
        ))}

        {project.codeNote && (
          <span className="relative z-10 inline-flex items-center gap-1.5 min-h-[44px] px-2 sm:px-2.5 text-sm text-slate-600 dark:text-gray-400">
            <Lock size={14} aria-hidden="true" />
            {project.codeNote}
          </span>
        )}
      </div>
    </article>
  );
}

/**
 * The slideshow. Lifted out of the old one-project-at-a-time card unchanged in
 * behaviour: same arrows, same dots, same zoom affordance, same object-contain
 * so a wide screenshot is never cropped.
 */
function ProjectMedia({ title, images, currentImageIndex, setCurrentImageIndex, onZoom }) {
  if (images.length === 0) return null;

  const next = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prev = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const currentMedia = images[currentImageIndex];
  const isCurrentVideo = isVideo(currentMedia);

  return (
    <div className="relative rounded-lg overflow-hidden bg-slate-900/[0.06] dark:bg-black/20 flex items-center justify-center h-[260px] sm:h-[340px] lg:h-[420px]">
      {isCurrentVideo ? (
        <video
          src={currentMedia}
          controls
          autoPlay
          loop
          muted
          className="max-w-full max-h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      ) : (
        // Going full screen is something you ASK for, via the button in the
        // corner. The picture itself is deliberately inert: it used to carry
        // onClick={onZoom}, which meant clicking the thing you were already
        // looking at threw a black overlay over the entire screen, and there
        // was no way to click a screenshot WITHOUT that happening.
        //
        // Because the picture no longer responds, the button can never be
        // hover-only - it was `sm:opacity-0 sm:group-hover:opacity-100`, which
        // on a desktop left no visible way in at all once the image stopped
        // being clickable. It is always on screen now.
        <div className="relative h-full w-full flex items-center justify-center">
          <img
            src={currentMedia}
            alt={`${title} screenshot ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={onZoom}
            className="absolute top-3 right-3 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="View full size"
            title="View full size"
          >
            <Maximize2 className="text-white" size={18} />
          </button>
        </div>
      )}

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            aria-label="Previous image"
            className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all active:scale-95 z-10"
          >
            <ChevronLeft className="text-white" size={18} />
          </button>
          <button
            onClick={next}
            aria-label="Next image"
            className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all active:scale-95 z-10"
          >
            <ChevronRight className="text-white" size={18} />
          </button>

          {/* Image indicators - small dot, tall padded hit area.
              Hit areas must never overlap or a tap selects the neighbouring image,
              so the horizontal padding shrinks once there are too many dots to fit
              44px each inside a 320px phone card. */}
          <div className="absolute bottom-0 sm:bottom-1 left-1/2 -translate-x-1/2 flex items-center z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`h-11 flex items-center justify-center flex-shrink-0 ${
                  images.length <= 4 ? 'px-[18px]' : 'px-1.5 sm:px-[18px]'
                }`}
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-blue-500 w-5 sm:w-6' : 'bg-slate-900/30 dark:bg-white/50 w-2'
                  }`}
                />
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/**
 * The opened project. A modal rather than an expanding card: an expanding card
 * pushes every tile below it down the page, so the thing you just clicked jumps
 * away from your cursor and the grid you were scanning reflows underneath you.
 *
 * Escape is layered - the first press closes the full screen image viewer if it
 * is up, the second closes the project. Closing the viewer should never also
 * throw away the project you were reading.
 */
function ProjectDetail({ project, onClose }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  const currentMedia = project.images[currentImageIndex];
  const isCurrentVideo = isVideo(currentMedia);

  // The page behind a modal must not scroll under it, and whatever was focused
  // before it opened gets the focus back when it closes.
  //
  // `overflow: hidden` on <body> alone is not enough: on iOS it does not stop a
  // touch drag from scrolling the page behind the panel. Pinning the body at its
  // current offset does, and it is also what makes the scroll position survive -
  // the browser resets scrollY to 0 the moment the body stops being scrollable,
  // so it has to be recorded first and put back by hand on close.
  useEffect(() => {
    returnFocusRef.current = document.activeElement;
    const scrollY = window.scrollY;
    const previous = {
      overflow: document.body.style.overflow,
      position: document.body.style.position,
      top: document.body.style.top,
      width: document.body.style.width,
    };
    document.body.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previous.overflow;
      document.body.style.position = previous.position;
      document.body.style.top = previous.top;
      document.body.style.width = previous.width;
      window.scrollTo(0, scrollY);
      const el = returnFocusRef.current;
      if (el && typeof el.focus === 'function') el.focus();
    };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (isViewerOpen) setIsViewerOpen(false);
      else onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isViewerOpen, onClose]);

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % project.images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length);

  const titleId = `project-${project.id}-title`;

  // Rendered into <body>, not into the section. Every chapter on this page sits
  // inside a div carrying a `translate-y` utility, and any non-none transform
  // makes that div the containing block for `position: fixed` descendants - so
  // a modal left in place would size itself to the chapter instead of the
  // screen. A portal steps out of that entirely, and also keeps the modal out of
  // the chapter's own layout, where the story rail is measured.
  return createPortal(
    <>
      {/* The wrapper carries the height cap, not the panel, so the two rules can
          never fight over which one wins in the stylesheet: `height` and
          `max-height` are different properties. `dvh` is the DYNAMIC viewport
          height - on a phone `100vh` is the height WITHOUT the browser toolbar,
          so a 100vh panel is taller than the screen you can actually see and its
          bottom is unreachable. Any browser too old for `dvh` drops both rules
          and falls back to `inset-0`, which is already the visible box there. */}
      <div className="fixed inset-0 z-50 h-[100dvh] max-h-[100dvh] flex items-center justify-center p-0 sm:p-6 overflow-hidden">
        {/* The backdrop is its own element rather than a click handler on the
            wrapper, so a click anywhere inside the panel can never bubble into
            "close the project". */}
        <div
          className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />

        {/* max-h-full pins the panel to the wrapper, and the three rows below
            split it: header and footer hold their size, only the middle scrolls.
            That is what keeps the close button and the links on screen no matter
            how long the write-up is. */}
        <div
          data-project-detail={project.id}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="relative flex flex-col w-full max-w-5xl max-h-full overflow-hidden bg-slate-50 dark:bg-[#0a0a0c] border border-slate-900/10 dark:border-white/10 rounded-none sm:rounded-2xl shadow-2xl"
        >
        <div className="flex-shrink-0 flex items-start justify-between gap-4 p-5 sm:p-6 border-b border-slate-900/10 dark:border-white/10">
          <div className="min-w-0">
            <span className="block text-sm font-semibold tabular-nums tracking-wide text-blue-700 dark:text-blue-400">
              {project.period}
            </span>
            <h3 id={titleId} className="font-bold text-2xl sm:text-3xl text-slate-900 dark:text-white leading-snug">
              {project.title}
            </h3>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Close project"
            className="flex-shrink-0 w-11 h-11 rounded-full bg-slate-900/[0.06] dark:bg-white/10 hover:bg-slate-900/[0.12] dark:hover:bg-white/20 flex items-center justify-center transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
          >
            <X className="text-slate-900 dark:text-white" size={22} />
          </button>
        </div>

        {/* The only scrolling region. min-h-0 is required: a flex child will not
            shrink below its content height without it, which is exactly how the
            panel grew taller than the screen on a phone. */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 lg:gap-8 content-start">
          <ProjectMedia
            title={project.title}
            images={project.images}
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
            onZoom={() => setIsViewerOpen(true)}
          />

          <div>
            <p className="text-slate-700 dark:text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed mb-5">
              {project.summary}
            </p>
            <ul className="space-y-2.5 sm:space-y-3">
              {project.bullets.map((bullet, idx) => (
                <li
                  key={idx}
                  className="text-slate-700 dark:text-gray-300 flex gap-2 sm:gap-3 text-sm sm:text-base leading-relaxed"
                >
                  <span className="text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5">&bull;</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex-shrink-0 px-3 sm:px-4 py-2 border-t border-slate-900/10 dark:border-white/10 flex flex-wrap items-center gap-x-1 gap-y-1">
          {project.links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-[44px] px-2 sm:px-2.5 rounded-lg text-sm font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-600/10 dark:hover:bg-blue-400/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 dark:focus-visible:ring-blue-400"
            >
              {link.kind === 'live' ? <ExternalLink size={16} /> : <Github size={16} />}
              {link.label}
            </a>
          ))}
          {project.codeNote && (
            <span className="inline-flex items-center gap-1.5 min-h-[44px] px-2 sm:px-2.5 text-sm text-slate-600 dark:text-gray-400">
              <Lock size={14} aria-hidden="true" />
              {project.codeNote}
            </span>
          )}
        </div>
        </div>
      </div>

      {/* Full Screen Image Viewer. A SIBLING of the panel, not a child: the
          panel clips its own overflow to keep the rounded corners clean, and a
          viewer nested inside it would be clipped with everything else.
          Deliberately dark in BOTH themes - see the same decision in
          Portfolio.jsx. The `dark` class on the overlay re-enables every `dark:`
          utility inside it, so the close/prev/next controls stay light-on-dark
          even when the page behind them is light. */}
      {isViewerOpen && !isCurrentVideo && (
        <div
          data-image-viewer
          className="dark fixed inset-0 z-[60] h-[100dvh] max-h-[100dvh] bg-black/95 text-white flex items-center justify-center p-4"
          onClick={() => setIsViewerOpen(false)}
        >
          <button
            onClick={() => setIsViewerOpen(false)}
            className="absolute top-4 right-4 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900/[0.06] dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 flex items-center justify-center transition-all z-10"
            aria-label="Close"
          >
            <X className="text-slate-900 dark:text-white" size={24} />
          </button>

          <img
            src={currentMedia}
            alt={`${project.title} screenshot ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {project.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/[0.06] dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="text-slate-900 dark:text-white" size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900/[0.06] dark:bg-white/10 hover:bg-slate-900/10 dark:hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="text-slate-900 dark:text-white" size={24} />
              </button>
            </>
          )}
        </div>
      )}
    </>,
    document.body
  );
}

/**
 * The Projects section.
 *
 * This used to be a carousel: one project on screen at a time with Previous and
 * Next underneath, so six of the seven builds were behind clicks nobody makes.
 * It is now a grid - every project visible at once, each one openable for the
 * full write-up and its screenshots.
 */
export default function Projects() {
  const [openId, setOpenId] = useState(null);
  const openProject = projects.find((p) => p.id === openId) || null;

  return (
    <section id="projects" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Icon and bottom margin match the other six section headings. The
            heading TEXT came down automatically when the type scale moved in
            tailwind.config.cjs, but the icon is sized in explicit w/h utilities,
            so it stayed at 48px and ended up taller than the word beside it. */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 sm:mb-6 lg:mb-8 text-slate-900 dark:text-white flex items-center gap-3">
          <FolderGit2 className="text-blue-700 dark:text-blue-400 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          <span>Featured Projects</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 items-stretch">
          {projects.map((project) => (
            <ProjectTile
              key={project.id}
              project={project}
              onOpen={() => setOpenId(project.id)}
            />
          ))}
        </div>
      </div>

      {openProject && (
        <ProjectDetail
          key={openProject.id}
          project={openProject}
          onClose={() => setOpenId(null)}
        />
      )}
    </section>
  );
}
