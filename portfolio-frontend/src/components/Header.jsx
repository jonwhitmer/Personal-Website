import React, { useState } from 'react';
import { Linkedin, Github, FileText, Download, Menu, X } from 'lucide-react';

export default function Header({ scrollToSection, setShowResumePreview }) {
  const jaydub = '/images/jdub.png';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      link.href = '/path-to-your-resume.pdf'; // Update this path
      link.download = 'Jon_Whitmer_Resume.pdf';
      link.click();
    } else {
      // Preview modal for desktop
      setShowResumePreview(true);
    }
  };

  return (
    <>
      <header className="border-b border-blue-500/20 bg-black/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-16 h-16 sm:w-12 sm:h-12 rounded-lg bg-transparent flex items-center justify-center overflow-hidden">
              <img src={jaydub} alt="Logo" className="w-full h-full object-contain p-0" />  
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg sm:text-2xl font-bold text-white leading-tight">Jon Whitmer</h1>
              <p className="text-gray-400 text-xs leading-tight">Software Engineer</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all whitespace-nowrap"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Desktop Icons + Mobile Menu Button */}
          <div className="flex gap-2 sm:gap-3 items-center">
            {/* Social Icons - Hidden on smallest screens, visible on sm+ */}
            <a 
              href="https://linkedin.com/in/jonwhitmer"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex relative w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 items-center justify-center transition-all hover:scale-110 group"
              aria-label="LinkedIn"
            >
              <Linkedin size={18} />
              <span className="absolute top-full mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                LinkedIn
              </span>
            </a>
            <a 
              href="https://github.com/jonwhitmer"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex relative w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 items-center justify-center transition-all hover:scale-110 group"
              aria-label="GitHub"
            >
              <Github size={18} />
              <span className="absolute top-full mt-2 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                GitHub
              </span>
            </a>

            {/* Resume Button */}
            <button
              onClick={handleResumeClick}
              className="px-3 py-2 sm:px-4 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all flex items-center gap-2 text-xs sm:text-sm"
            >
              <FileText size={14} className="sm:w-4 sm:h-4 lg:inline hidden" />
              <Download size={14} className="sm:w-4 sm:h-4 lg:hidden" />
              <span className="hidden xs:inline">Resume</span>
            </button>

            {/* Mobile Menu Button - Only visible on lg and below */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all"
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div 
            className="absolute top-[73px] right-0 left-0 bg-black/95 border-b border-blue-500/20 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className="w-full text-left px-4 py-3 text-sm font-medium text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                >
                  {item.label}
                </button>
              ))}

              {/* Social Links in Mobile Menu (only on smallest screens) */}
              <div className="sm:hidden flex gap-3 pt-4 mt-4 border-t border-white/10">
                <a 
                  href="https://linkedin.com/in/jonwhitmer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Linkedin size={18} />
                  LinkedIn
                </a>
                <a 
                  href="https://github.com/jonwhitmer"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-all text-sm font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Github size={18} />
                  GitHub
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}