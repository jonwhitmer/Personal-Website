import React from 'react';
import { GraduationCap, ChevronRight } from 'lucide-react';

export default function Education() {
  const SRU = '/images/SRU.png';

  const courses = [
    "Data Structures & Algorithms",
    "Software Engineering",
    "Artificial Intelligence (AI)",
    "Fundamentals of Database Systems",
    "Computer Organization & Architecture",
    "Advanced Programming Principles",
    "Administration & Security",
    "Shell Commands & Scripting",
    "Advanced Web Programming",
    "Computer Networks",
    "Practical Computer Security"
  ];

  return (
    <section id="education" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 sm:mb-6 lg:mb-8 flex items-center gap-3">
          <GraduationCap className="text-purple-700 dark:text-purple-400 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          <span>Education</span>
        </h2>
        <div className="bg-slate-900/[0.04] dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 dark:border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:bg-slate-900/[0.06] dark:hover:bg-white/8 transition-all">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-green-900/40 to-green-700/40 border border-green-500/30 flex items-center justify-center flex-shrink-0 p-2">
              <img 
                src={SRU} 
                alt="Slippery Rock University of Pennsylvania"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Slippery Rock University of Pennsylvania</h3>
              <p className="text-base sm:text-lg text-slate-700 dark:text-gray-300">B.S. in Computer Science</p>
              <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">Aug 2021 - May 2025</p>
              {/* `list-none` kills the browser's default triangle so the chevron
                  below is the only marker, and it can be styled and animated.
                  Without a marker at all this read as a dead heading: there was
                  no sign the coursework was there to be opened. */}
              <details className="group text-slate-600 dark:text-gray-400 mb-4">
                <summary className="inline-flex items-center gap-2 min-h-[44px] py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden hover:text-purple-700 dark:hover:text-purple-400 transition-colors text-sm sm:text-base font-semibold">
                  <ChevronRight
                    size={16}
                    aria-hidden="true"
                    className="flex-shrink-0 text-purple-700 dark:text-purple-400 transition-transform group-open:rotate-90 motion-reduce:transition-none"
                  />
                  <span>Relevant Coursework</span>
                </summary>
                <ul className="mt-3 space-y-2">
                  {courses.map((course, idx) => (
                    <li key={idx} className="text-slate-700 dark:text-gray-300 text-sm flex gap-2 items-start">
                      <span className="text-purple-700 dark:text-purple-400 flex-shrink-0">•</span>
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </details>
              <div className="flex flex-wrap gap-2 justify-start">
                <span className="text-[13px] sm:text-xs px-2.5 sm:px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-800 dark:text-green-300">
                  4.0 GPA
                </span>
                <span className="text-[13px] sm:text-xs px-2.5 sm:px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-800 dark:text-green-300">
                  Summa Cum Laude
                </span>
                <span className="text-[13px] sm:text-xs px-2.5 sm:px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-800 dark:text-green-300">
                  Student Marshal
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}