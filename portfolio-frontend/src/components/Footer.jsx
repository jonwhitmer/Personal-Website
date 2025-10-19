import React from 'react';

export default function Footer({ scrollToSection }) {
  return (
    <footer className="border-t border-white/10 bg-black/80 backdrop-blur-xl mt-16 sm:mt-24 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 text-center">
        {/* Desktop: Single row | Mobile: Grid layout */}
        <div className="hidden sm:flex justify-center gap-6 mb-4 text-sm text-gray-400">
          <button onClick={() => scrollToSection('experience')} className="hover:text-blue-400 transition-colors">Experience</button>
          <button onClick={() => scrollToSection('education')} className="hover:text-blue-400 transition-colors">Education</button>
          <button onClick={() => scrollToSection('certifications')} className="hover:text-blue-400 transition-colors">Certifications</button>
          <button onClick={() => scrollToSection('projects')} className="hover:text-blue-400 transition-colors">Projects</button>
          <button onClick={() => scrollToSection('skills')} className="hover:text-blue-400 transition-colors">Skills</button>
          <button onClick={() => scrollToSection('future')} className="hover:text-blue-400 transition-colors">More</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-blue-400 transition-colors">Contact</button>
        </div>

        {/* Mobile: Grid layout for better spacing */}
        <div className="grid grid-cols-2 gap-3 sm:hidden mb-6 text-sm text-gray-400">
          <button onClick={() => scrollToSection('experience')} className="hover:text-blue-400 transition-colors py-2">Experience</button>
          <button onClick={() => scrollToSection('education')} className="hover:text-blue-400 transition-colors py-2">Education</button>
          <button onClick={() => scrollToSection('certifications')} className="hover:text-blue-400 transition-colors py-2">Certifications</button>
          <button onClick={() => scrollToSection('projects')} className="hover:text-blue-400 transition-colors py-2">Projects</button>
          <button onClick={() => scrollToSection('skills')} className="hover:text-blue-400 transition-colors py-2">Skills</button>
          <button onClick={() => scrollToSection('future')} className="hover:text-blue-400 transition-colors py-2">More</button>
          <button onClick={() => scrollToSection('contact')} className="hover:text-blue-400 transition-colors py-2 col-span-2">Contact</button>
        </div>

        <p className="text-gray-500 text-xs sm:text-sm">Built with React, Tailwind, and Spring Boot.</p>
        <p className="text-gray-600 text-xs mt-2">© 2025 Jon Whitmer</p>
      </div>
    </footer>
  );
}