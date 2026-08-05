import React from 'react';
import { Code } from 'lucide-react';

export default function Skills() {
  // Each tier is a multiple of three so no row ever ends half empty in the
  // three-column grid below. React and REST APIs moved up to the top tier;
  // everything here is drawn from the 2026 resume rather than invented.
  //
  // Three tier names and the skills under them. Nothing else.
  //
  // No star ratings: a self-assigned "Expert *****" invites an argument instead
  // of telling anyone anything, and a row of gold stars reads as a bootcamp
  // badge next to the work described in the rest of the page. No cadence
  // eyebrow and no explanatory sentence either: Expert, Proficient and Familiar
  // are words people already understand, and a paragraph defending each one
  // just draws attention to the ranking.
  //
  // The chips grade from the site's accent (top tier) to neutral to muted, so
  // the three groups still read apart at a glance without a numeric scale.
  const TIERS = [
    {
      id: 'expert',
      label: 'Expert',
      chip:
        'bg-blue-600/10 dark:bg-blue-400/10 border border-blue-700/25 dark:border-blue-400/25 ' +
        'text-blue-900 dark:text-blue-100',
      skills: [
        'Java',
        'Python',
        'Spring Boot',
        'React',
        'JavaScript',
        'REST APIs',
        'HTML/CSS',
        'OOP',
        'Git/GitHub',
      ],
    },
    {
      id: 'proficient',
      label: 'Proficient',
      chip:
        'bg-slate-900/[0.05] dark:bg-white/[0.07] border border-slate-900/15 dark:border-white/15 ' +
        'text-slate-900 dark:text-gray-100',
      skills: ['TypeScript', 'SQL', 'Docker', 'Tailwind CSS', 'TDD', 'Agile/Scrum'],
    },
    {
      id: 'familiar',
      label: 'Familiar',
      chip:
        'bg-slate-900/[0.03] dark:bg-white/[0.04] border border-slate-900/10 dark:border-white/10 ' +
        'text-slate-700 dark:text-gray-300',
      skills: ['AWS', 'C++', 'Kotlin'],
    },
  ];

  const tools = [
    'C#', 'R', 'ASP.NET', 'Microservices',
    'JUnit', 'Maven/Gradle', 'CI/CD', 'PostgreSQL', 'Linux'
  ];

  const CARD =
    'bg-slate-900/[0.04] dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 ' +
    'dark:border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 ' +
    'hover:bg-slate-900/[0.06] dark:hover:bg-white/8 transition-all';

  return (
    <section id="skills" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 sm:mb-6 lg:mb-8 flex items-center gap-3">
          <Code className="text-blue-700 dark:text-blue-400 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          <span>Tech Stack</span>
        </h2>

        <div className="space-y-5 sm:space-y-6">
          {TIERS.map(tier => (
            <div key={tier.id} data-tier={tier.id} className={CARD}>
              {/* Just the tier name. The cadence eyebrow ("DAILY", "MOST WEEKS")
                  and the sentence under it were explaining a label that already
                  explains itself. Expert, Proficient and Familiar are understood
                  words; a paragraph defending each one only invites an argument
                  about the ranking. */}
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4 sm:mb-5">
                {tier.label}
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                {tier.skills.map(name => (
                  <div
                    key={name}
                    className={`${tier.chip} rounded-lg sm:rounded-xl px-4 py-3 sm:py-3.5 text-center font-semibold text-sm sm:text-base hover:scale-105 transition-transform cursor-default`}
                  >
                    {name}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Additional Tools */}
          <div className={CARD}>
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-slate-900 dark:text-white">Additional Technologies &amp; Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {tools.map(tool => (
                <div
                  key={tool}
                  className="px-3 py-2.5 bg-slate-900/[0.04] dark:bg-white/[0.06] border border-slate-900/10 dark:border-white/10 rounded-lg text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-900/[0.07] dark:hover:bg-white/10 transition-colors text-center"
                >
                  {tool}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
