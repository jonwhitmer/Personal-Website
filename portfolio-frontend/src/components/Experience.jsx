import React from 'react';
import { Briefcase } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFedex } from '@fortawesome/free-brands-svg-icons';

function ExperienceCard({ logo, company, title, location, dates, bullets, skills }) {
  return (
    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:bg-white/8 transition-all">
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-lg bg-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0 mx-auto sm:mx-0">
          {logo}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl font-bold text-white text-center sm:text-left">{company}</h3>
          <p className="text-base sm:text-lg text-gray-300 text-center sm:text-left">{title}</p>
          <p className="text-xs sm:text-sm text-gray-400 mb-4 text-center sm:text-left">{location} • {dates}</p>
          <ul className="space-y-2 sm:space-y-2.5 mb-4">
            {bullets.map((bullet, idx) => (
              <li key={idx} className="text-gray-300 text-xs sm:text-sm flex gap-2 items-start leading-relaxed">
                <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
            {skills.map(skill => (
              <span key={skill} className="text-xs px-2.5 sm:px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Experience() {
  return (
    <section id="experience" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 lg:mb-10 flex items-center gap-3">
          <Briefcase className="text-blue-400 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
          <span>Experience</span>
        </h2>
        <div className="space-y-5 sm:space-y-6">
          <ExperienceCard
            logo={
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-lg flex items-center justify-center font-bold text-white text-base sm:text-lg shadow-lg shadow-blue-500/50">
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