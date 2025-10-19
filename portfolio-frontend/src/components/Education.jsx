import React from 'react';
import { GraduationCap } from 'lucide-react';

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
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 lg:mb-10 flex items-center gap-3">
          <GraduationCap className="text-purple-400 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
          <span>Education</span>
        </h2>
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:bg-white/8 transition-all">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-gradient-to-br from-green-900/40 to-green-700/40 border border-green-500/30 flex items-center justify-center flex-shrink-0 p-2 mx-auto sm:mx-0">
              <img 
                src={SRU} 
                alt="Slippery Rock University"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-xl font-bold text-white text-center sm:text-left">Slippery Rock University</h3>
              <p className="text-base sm:text-lg text-gray-300 text-center sm:text-left">B.S. in Computer Science</p>
              <p className="text-xs sm:text-sm text-gray-400 mb-4 text-center sm:text-left">Aug 2021 - May 2025</p>
              <details className="text-gray-400 mb-4">
                <summary className="cursor-pointer hover:text-purple-400 transition-colors text-sm sm:text-base font-semibold">Relevant Coursework</summary>
                <ul className="mt-3 space-y-2">
                  {courses.map((course, idx) => (
                    <li key={idx} className="text-gray-300 text-xs sm:text-sm flex gap-2 items-start">
                      <span className="text-purple-400 flex-shrink-0">•</span>
                      <span>{course}</span>
                    </li>
                  ))}
                </ul>
              </details>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                <span className="text-xs px-2.5 sm:px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
                  4.0 GPA
                </span>
                <span className="text-xs px-2.5 sm:px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
                  Summa Cum Laude
                </span>
                <span className="text-xs px-2.5 sm:px-3 py-1 bg-green-500/20 border border-green-500/30 rounded-lg text-green-300">
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