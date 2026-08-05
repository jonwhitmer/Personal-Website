import React from 'react';

export default function Footer({ scrollToSection }) {
  return (
    <footer className="border-t border-slate-900/10 dark:border-white/10 bg-white/80 dark:bg-black/80 backdrop-blur-xl mt-10 sm:mt-16 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Desktop: Single row | Mobile: Grid layout */}
        <div className="hidden sm:flex justify-center gap-6 mb-4 text-sm text-slate-600 dark:text-gray-400">
          <button onClick={() => scrollToSection('experience')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors px-2 py-3">Experience</button>
          <button onClick={() => scrollToSection('education')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors px-2 py-3">Education</button>
          <button onClick={() => scrollToSection('certifications')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors px-2 py-3">Certifications</button>
          <button onClick={() => scrollToSection('projects')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors px-2 py-3">Projects</button>
          <button onClick={() => scrollToSection('skills')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors px-2 py-3">Skills</button>
          <button onClick={() => scrollToSection('future')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors px-2 py-3">More</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors px-2 py-3">Contact</button>
        </div>

        {/* Mobile: Grid layout for better spacing */}
        <div className="grid grid-cols-2 gap-3 sm:hidden mb-6 text-sm text-slate-600 dark:text-gray-400">
          <button onClick={() => scrollToSection('experience')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors py-3">Experience</button>
          <button onClick={() => scrollToSection('education')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors py-3">Education</button>
          <button onClick={() => scrollToSection('certifications')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors py-3">Certifications</button>
          <button onClick={() => scrollToSection('projects')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors py-3">Projects</button>
          <button onClick={() => scrollToSection('skills')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors py-3">Skills</button>
          <button onClick={() => scrollToSection('future')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors py-3">More</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-blue-800 dark:hover:text-blue-400 transition-colors py-3 col-span-2">Contact</button>
        </div>

        {/* The "Built with React, Tailwind and Spring Boot" line is gone on
            purpose: naming table-stakes tools reads as a beginner's badge, and
            the Skills section already lists the stack in full.

            The year is computed rather than typed, because a hard-coded one is
            wrong every January and quietly dates the whole site. */}
        {/* gray-600 on the black footer measured 2.77:1, which is the one
            serious contrast failure axe reports on the whole site in dark mode.
            gray-400 measures 8.27:1 and still reads as quiet secondary text. */}
        <p className="text-slate-600 dark:text-gray-400 text-[13px] sm:text-xs">
          © {new Date().getFullYear()} Jon Whitmer
        </p>
      </div>
    </footer>
  );
}