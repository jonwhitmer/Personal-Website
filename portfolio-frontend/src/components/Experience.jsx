import React from 'react';
import { Briefcase } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFedex } from '@fortawesome/free-brands-svg-icons';

const LOWES = '/images/lowes.svg';

function ExperienceCard({ logo, company, title, location, dates, bullets, skills }) {
  return (
    <div className="bg-slate-900/[0.04] dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 dark:border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:bg-slate-900/[0.06] dark:hover:bg-white/8 transition-all">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
          {logo}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">{company}</h3>
          <p className="text-base sm:text-lg text-slate-700 dark:text-gray-300">{title}</p>
          <p className="text-sm text-slate-600 dark:text-gray-400 mb-4">{location} • {dates}</p>
          <ul className="space-y-2 sm:space-y-2.5 mb-4">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="text-slate-700 dark:text-gray-300 text-sm flex gap-2 items-start leading-relaxed">
                <span className="text-blue-700 dark:text-blue-400 flex-shrink-0 mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          {/* The tag row under each role came out: the same handful of chips
              repeated on every card read as filler, and the Skills section
              already states the stack once, properly. */}
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* The icon tracks the heading rather than outgrowing it. At 48px it was
            larger than the 32px word beside it, which is what made the heading
            row read as a banner. 24/28/32 matches the type step for step. */}
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 sm:mb-6 lg:mb-8 flex items-center gap-3">
          <Briefcase className="text-blue-700 dark:text-blue-400 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          <span>Experience</span>
        </h2>
        <div className="space-y-5 sm:space-y-6">
          <ExperienceCard
            logo={
              // The official wordmark (Wikimedia Commons, public domain: the mark
              // is plain lettering and so not copyrightable, though it remains
              // Lowe's trademark). Used here only to identify Jon's actual
              // employer, which is what an Experience card is for.
              // No background tile: the mark already carries its own blue gable
              // box, so it reads cleanly on both the dark and the light card.
              // Verified by rendering it bare on #000 and on #f8fafc.
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center">
                <img
                  src={LOWES}
                  alt="Lowe's Companies, Inc. logo"
                  className="w-full h-full object-contain"
                  loading="lazy"
                />
              </div>
            }
            company="Lowe's Companies, Inc."
            title="Associate Software Engineer"
            location="Charlotte, NC"
            dates="Jan 2026 - Present"
            bullets={[
              "Completed an intensive 8-week software engineering bootcamp focused on full-stack enterprise development, with a strong emphasis on test-driven development and a minimum of 90% test coverage",
              "Designed and built an MVP application from predefined requirements, then presented the final product covering design decisions, functionality, and test coverage",
              "Currently working with the domestic transportation team, contributing to production-level software in an Agile environment",
              "Contributing to the development of a parallel execution architecture, enabling automatic failover during dependent service outages and supporting an initiative projected to save millions of dollars annually"
            ]}
            skills={["Java", "Spring Boot", "TDD", "Agile", "Microservices"]}
          />
          <ExperienceCard
            logo={
              // Jon's own mark, for the work he took on himself. The gradient
              // used to run blue-400 -> cyan-400, which put white lettering on
              // 2.5:1 at the blue end and 1.8:1 at the cyan end - a serious
              // contrast failure at both, and worst exactly where the eye lands.
              // Two stops deeper fixes it without changing what the tile is:
              // blue-600 measures 5.17:1 and cyan-700 5.36:1 against white, so
              // every point along the sweep clears the 4.5:1 minimum. Identical
              // in both themes, as it was before, because the tile sits on its
              // own colour rather than on the card behind it.
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-cyan-700 rounded-lg flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-lg shadow-blue-500/40">
                JW
              </div>
            }
            company="Independent Contractor"
            title="Software Engineer"
            location="Remote"
            dates="Dec 2024 - Sep 2025"
            bullets={[
              "Built a full-stack Spring Boot application to streamline evaluation workflows and report generation that aggregates feedback from 4+ reviewers per employee",
              "Implemented modular subsystems, real-time notifications, custom error handling, and role-based access control",
              "Applied object-oriented design patterns such as Singleton, Strategy, and Factory to improve structure and maintainability",
              "Deployed to Apache Tomcat in a production-like environment and validated stable performance"
            ]}
            skills={["Spring Boot", "Java", "RBAC", "Tomcat", "MySQL"]}
          />
          <ExperienceCard
            logo={<FontAwesomeIcon icon={faFedex} className="text-[#9D4EDD] text-[2rem] sm:text-[2.6rem]" />}
            company="FedEx Ground"
            title="Package Handler"
            location="Evans City, PA"
            dates="Jun 2021 - Aug 2024"
            bullets={[
              "Worked with team members to meet tight deadlines during peak demand periods",
              "Maintained stable trailer walls and ensured safe package handling"
            ]}
            skills={["Teamwork", "Resilience"]}
          />
        </div>
      </div>
    </section>
  );
}