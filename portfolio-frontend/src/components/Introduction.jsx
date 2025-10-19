import React, { useState, useEffect } from 'react';

export default function Introduction({ scrollToSection }) {
  const me = '/images/me.jpg';
  const roxyphoto = '/images/roxyphoto.jpg';
  const einsteinphoto = '/images/einsteinphoto.jpg';

  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  const photos = [
    me,
    roxyphoto,
    einsteinphoto
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-8 sm:py-12 md:py-20 grid lg:grid-cols-[1fr,300px] gap-6 sm:gap-8 md:gap-12 items-start px-4 sm:px-0">
      {/* Photo Section - Shown at top on mobile */}
      <div className="lg:hidden relative mx-auto w-full max-w-[280px] sm:max-w-[300px]">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
          {photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt={`Jon ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === currentPhotoIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPhotoIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentPhotoIndex ? 'bg-blue-500 w-6' : 'bg-gray-600'
              }`}
              aria-label={`View photo ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Text Content */}
      <div className="space-y-6 sm:space-y-8">
        <div className="text-left space-y-4 sm:space-y-6">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-left text-center font-bold text-white leading-tight">
            Hi, I'm Jon.
          </h2>
          <div className="space-y-4 sm:space-y-5 text-sm sm:text-base md:text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto lg:mx-0">
            <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-100 text-left">
              I'm a software engineer who loves building full-stack projects, experimenting with AI applications, and learning how to bring real ideas to life.
            </p>
            
            <div className="space-y-3 sm:space-y-3">
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-blue-400 text-lg sm:text-xl flex-shrink-0 mt-1">•</span>
                <p className="flex-1 min-w-0 text-justify lg:text-left">The tech world is constantly evolving and I <span className="font-bold text-white">stay on top of it</span>. I'm always getting familiar with new tools, frameworks, and technologies because at the end of the day, technology is our <span className="font-bold text-white">lives</span> and the <span className="font-bold text-blue-400">future</span>, and I want to be part of that movement</p>
              </div>
              
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-blue-400 text-lg sm:text-xl flex-shrink-0 mt-1">•</span>
                <div className="flex-1 min-w-0">
                  <p className="mb-2 text-justify lg:text-left">I've graduated with my bachelor's and now I'm working on a plethora of courses and learning:</p>
                  <ul className="space-y-2 ml-2 sm:ml-4">
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 mt-1">→</span>
                      <span className="font-semibold text-gray-200 flex-1 min-w-0 break-words text-left">Meta Front-End Developer Professional Certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 mt-1">→</span>
                      <span className="font-semibold text-gray-200 flex-1 min-w-0 break-words text-left">IBM AI Engineering Professional Certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 mt-1">→</span>
                      <span className="font-semibold text-gray-200 flex-1 min-w-0 break-words text-left">Google Cybersecurity Professional Certificate</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 mt-1">→</span>
                      <span className="font-semibold text-gray-200 flex-1 min-w-0 break-words text-left">AWS Cloud Practitioner</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-gray-500 flex-shrink-0 mt-1">→</span>
                      <span className="flex-1 min-w-0 break-words text-left">YouTube courses, technical books, and hands-on projects</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-blue-400 text-lg sm:text-xl flex-shrink-0 mt-1">•</span>
                <p className="flex-1 min-w-0 text-justify lg:text-left">I'm looking for a software engineering role where I can continue to learn, grow, and push the boundaries in this field</p>
              </div>
              
              <div className="flex items-start gap-2 sm:gap-3">
                <span className="text-blue-400 text-lg sm:text-xl flex-shrink-0 mt-1">•</span>
                <p className="flex-1 min-w-0 text-justify lg:text-left">I focus on building software that is <span className="text-blue-400 font-bold">practical</span>, <span className="text-blue-400 font-bold">high-performance</span>, and <span className="text-blue-400 font-bold">future-focused</span></p>
              </div>
            </div>

            <p className="text-xs sm:text-sm md:text-base text-gray-400 italic pt-3 sm:pt-4 border-t border-white/10 text-justify lg:text-left">
              Welcome to my website. Feel free to email me if you have any questions or inquiries. (Refer to the <button onClick={() => scrollToSection('contact')} className="text-blue-400 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-black rounded px-1">Contact</button> section for my email address)
            </p>
          </div>
        </div>
      </div>
      
      {/* Photo Section - Shown on right side on desktop */}
      <div className="hidden lg:block relative mx-auto lg:mx-0 w-full max-w-[300px]">
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20">
          {photos.map((photo, idx) => (
            <img
              key={idx}
              src={photo}
              alt={`Jon ${idx + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${
                idx === currentPhotoIndex ? 'opacity-100' : 'opacity-0'
              }`}
            />
          ))}
        </div>
        <div className="flex justify-center gap-2 mt-4">
          {photos.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentPhotoIndex(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === currentPhotoIndex ? 'bg-blue-500 w-6' : 'bg-gray-600'
              }`}
              aria-label={`View photo ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}