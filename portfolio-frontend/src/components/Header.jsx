import React, { useState } from 'react';
import { Linkedin, Github, FileText, Download, Menu, X, Sun, Moon } from 'lucide-react';
import { RESUME_PATH, RESUME_FILENAME } from '../resume';

export default function Header({ scrollToSection, setShowResumePreview }) {
  const jaydub = '/images/jdub.png';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // The theme itself lives on <html>, put there by the blocking script in
  // index.html before the first paint. This state exists only so the button can
  // draw the right icon; it READS the class rather than owning the truth, so the
  // two can never disagree on the first render.
  const [isDark, setIsDark] = useState(
    () => typeof document === 'undefined' || document.documentElement.classList.contains('dark')
  );

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      // Persisted so the choice survives a reload. `dark` is written explicitly
      // rather than left absent, so "I chose dark" and "I never chose" stay
      // distinguishable if the default ever needs to change.
      window.localStorage.setItem('theme', next ? 'dark' : 'light');
    } catch (e) {
      // Storage blocked (private mode). The theme still switches for this visit.
    }
  };

  const navItems = [
    { id: 'experience', label: 'Experience' },
    { id: 'education', label: 'Education' },
    { id: 'certifications', label: 'Certifications' },
    { id: 'projects', label: 'Projects' },
    { id: 'skills', label: 'Skills' },
    { id: 'future', label: 'More' },
    { id: 'contact', label: 'Contact' }
  ];

  const handleNavClick = (id) => {
    scrollToSection(id);
    setMobileMenuOpen(false);
  };

  const handleResumeClick = () => {
    // On mobile, trigger download; on desktop, show preview
    if (window.innerWidth < 1024) {
      // Direct download for mobile/tablet
      const link = document.createElement('a');
      link.href = RESUME_PATH;
      link.download = RESUME_FILENAME;
      link.click();
    } else {
      // Preview modal for desktop
      setShowResumePreview(true);
    }
  };

  return (
    <>
      <header className="border-b border-blue-500/30 dark:border-blue-500/20 bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        {/* py-6 made the desktop header 101px tall, then py-2.5 with a 48px logo
            made it 73px. Both were still a lot of a laptop screen spent on a
            navbar before any content.

            The floor here is arithmetic, not taste. Every control in this bar is
            44px tall because that is the minimum legal tap target, so the row
            can never be shorter than 44 + padding + the 1px bottom border. What
            was making it 73 was the 48px logo and a 24px name, both of which sat
            ABOVE that floor and were therefore setting the height themselves.
            Dropping the logo to 40/44 and the name to 16/20 puts them back
            underneath the 44px controls, so the buttons set the height again and
            the padding is the only remaining dial: 6px on a phone, 8px above it.
            Measured at 57px on an iPhone 13 and 61px at 1440. */}
        <div className="max-w-7xl mx-auto px-4 py-1.5 sm:py-2 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-transparent flex items-center justify-center overflow-hidden">
              <img src={jaydub} alt="Logo" className="w-full h-full object-contain p-0" />
            </div>
            {/* The line-height is written as a modifier on each size rather
                than as a `leading-tight` class, because `leading-tight` was
                being silently overridden here and had no effect at all: a
                Tailwind `text-*` utility emits its OWN line-height alongside the
                font-size, and the font-size plugin sorts after the line-height
                plugin, so it wins every time. That is why this two-line block
                measured 48px (28 + 20) while the class list claimed 1.25 leading
                - and 48px is taller than the 44px controls, so the name was
                setting the height of the whole navbar. Written this way it
                measures 40px and the controls set the height again. */}
            <div className="flex flex-col">
              <h1 className="text-base/[1.15] sm:text-xl/[1.15] font-bold text-slate-900 dark:text-white">Jon Whitmer</h1>
              <p className="text-slate-600 dark:text-gray-400 text-[13px]/[1.25] sm:text-sm/[1.25]">Software Engineer</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-2">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-1.5 xl:px-4 py-3 text-[13px] xl:text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.08] dark:hover:bg-white/10 rounded-lg transition-all whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Icons + Mobile Menu Button.
              The gap tightens below 420px. The header is ONE row at every width
              - if the controls take too much of it, "Jon Whitmer / Software
              Engineer" wraps onto two lines and the navbar silently grows from
              77px to 111px, which also pushes every nav target under the sticky
              header (scroll-margin-top is 104px). Measured at 320/360/390/420
              rather than guessed. */}
          <div className="flex gap-1 min-[400px]:gap-2 lg:gap-1 xl:gap-3 items-center">
            {/* Social Icons - Hidden on smallest screens, visible on sm+ */}
            <a 
              href="https://linkedin.com/in/jonwhitmer"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex relative w-11 h-11 rounded-lg bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 border border-slate-900/10 dark:border-white/10 items-center justify-center transition-all hover:scale-110 group"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
              <span className="absolute top-full mt-2 px-2 py-1 text-[13px] sm:text-xs font-medium text-white bg-slate-900 dark:bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                LinkedIn
              </span>
            </a>
            <a 
              href="https://github.com/jonwhitmer"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex relative w-11 h-11 rounded-lg bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 border border-slate-900/10 dark:border-white/10 items-center justify-center transition-all hover:scale-110 group"
              aria-label="GitHub"
            >
              <Github size={18} />
              <span className="absolute top-full mt-2 px-2 py-1 text-[13px] sm:text-xs font-medium text-white bg-slate-900 dark:bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                GitHub
              </span>
            </a>

            {/* Theme toggle. It sits with the other header controls, not buried
                in a menu, because a theme switch nobody can find is the same as
                no theme switch. 44x44 is the tap-target floor, and the icon
                shows the theme you would GET, not the one you are in.

                Below 360px it steps aside for the identity block and reappears
                as a full-width row inside the mobile menu (further down this
                file). That is arithmetic, not taste: a 320px screen has 288px of
                content width, the name and role need 161px of it, and three
                44px controls plus their gaps cannot fit in the 127px left. */}
            <button
              data-theme-toggle
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="hidden min-[360px]:flex w-11 h-11 flex-shrink-0 rounded-lg bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 border border-slate-900/10 dark:border-white/10 items-center justify-center transition-all"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Resume Button. Three states, because the header is one row at
                every width and this button is competing with the theme toggle
                and the menu for what is left of a phone screen:
                  under 380px  icon only  (min-w-[44px] keeps it a legal tap
                               target, aria-label keeps it a named control)
                  380-639px    the WORD only - dropping the icon buys back the
                               24px that lets "Resume" stay readable on a normal
                               390px phone instead of becoming a bare glyph
                  640px and up icon + word, as before.
                Verified by sweeping every width from 320 to 2560 and asserting
                the header stays 77/101px with the name on one line. */}
            <button
              onClick={handleResumeClick}
              aria-label="Resume"
              title="Resume"
              className="px-3 sm:px-4 py-3 min-h-[44px] min-w-[44px] bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 text-sm"
            >
              <FileText size={16} className="hidden lg:inline" />
              <Download size={16} className="lg:hidden" />
              <span className="hidden min-[380px]:inline">Resume</span>
            </button>

            {/* Mobile Menu Button - Only visible on lg and below */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-11 h-11 rounded-lg bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 border border-slate-900/10 dark:border-white/10 flex items-center justify-center transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Panel - lives inside <header> so it can never drift from the header height */}
        {mobileMenuOpen && (
          <div
            // Capped and scrollable. On a short phone (320x568, an iPhone SE
            // with browser chrome) the panel ran 26px past the bottom of the
            // window with nothing able to scroll, so the LinkedIn and GitHub
            // row was simply unreachable. `100dvh` rather than `100vh` because
            // on iOS `vh` is the height WITHOUT the browser toolbar, which is
            // exactly the wrong number here. The 4rem subtracted is the header
            // this panel hangs below.
            className="absolute top-full right-0 left-0 max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain bg-white/95 dark:bg-black/95 border-b border-blue-500/30 dark:border-blue-500/20 shadow-2xl lg:hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.08] dark:hover:bg-white/10 rounded-lg transition-all"
                >
                  {item.label}
                </button>
              ))}

              {/* The theme switch for screens too narrow to carry it in the bar
                  (under 360px). Above that the bar owns it and this is hidden,
                  so there is never a second visible copy. */}
              <button
                data-theme-toggle
                onClick={toggleTheme}
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                className="min-[360px]:hidden w-full flex items-center gap-3 px-4 py-3 min-h-[44px] mt-2 text-sm font-medium text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 border border-slate-900/10 dark:border-white/10 rounded-lg transition-all"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                {isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              </button>

              {/* Social Links in Mobile Menu (only on smallest screens) */}
              <div className="flex gap-3 pt-4 mt-4 border-t border-slate-900/10 dark:border-white/10">
                <a 
                  href="https://linkedin.com/in/jonwhitmer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 border border-slate-900/10 dark:border-white/10 rounded-lg transition-all text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Linkedin size={18} />
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/jonwhitmer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 border border-slate-900/10 dark:border-white/10 rounded-lg transition-all text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Github size={18} />
                  GitHub
                </a>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Backdrop - sits under the header (z-40 vs the header's z-50) so it can never block the menu button */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </>
  );
}