import React from 'react';
import { Star, Code } from 'lucide-react';

export default function Skills() {
  const expertSkills = [
    {name: 'Java'},
    {name: 'Python'},
    {name: 'Spring Boot'},
    {name: 'HTML/CSS'},
    {name: 'OOP'},
    {name: 'Git/GitHub'}
  ];

  const proficientSkills = [
    {name: 'React'},
    {name: 'SQL'},
    {name: 'JavaScript'}
  ];

  const familiarSkills = [
    {name: 'AWS'},
    {name: 'C++'},
    {name: 'TypeScript'},
    {name: 'Tailwind CSS'},
    {name: 'Docker'},
    {name: 'REST APIs'}
  ];

  const tools = [
    'C#', 'Kotlin', 'R', 'ASP.NET', 'Microservices', 
    'JUnit', 'Maven/Gradle', 'CI/CD'
  ];

  const SkillCard = ({ name, color }) => (
    <div className={`${color} rounded-lg sm:rounded-xl px-4 py-3 sm:py-3.5 text-center font-semibold text-sm sm:text-base hover:scale-105 transition-transform cursor-default`}>
      {name}
    </div>
  );

  return (
    <section id="skills" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 lg:mb-10 flex items-center gap-3">
          <Code className="text-blue-400 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
          <span>Tech Stack</span>
        </h2>

        <div className="space-y-5 sm:space-y-6">
          {/* Expert Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:bg-white/8 transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Expert</h3>
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-yellow-400" />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5">Core strengths with deep knowledge and extensive hands-on experience</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {expertSkills.map(skill => (
                <SkillCard 
                  key={skill.name} 
                  name={skill.name}
                  color="bg-gradient-to-r from-yellow-500/30 to-orange-500/30 border border-yellow-500/40 text-yellow-300"
                />
              ))}
            </div>
          </div>

          {/* Proficient Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:bg-white/8 transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Proficient</h3>
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(4)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-blue-400" />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5">Strong working knowledge with proven project experience</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {proficientSkills.map(skill => (
                <SkillCard 
                  key={skill.name} 
                  name={skill.name}
                  color="bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border border-blue-500/40 text-blue-300"
                />
              ))}
            </div>
          </div>

          {/* Familiar Section */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:bg-white/8 transition-all">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5">
              <h3 className="text-xl sm:text-2xl font-bold text-white">Familiar</h3>
              <div className="flex gap-0.5 sm:gap-1">
                {[...Array(3)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 sm:w-5 sm:h-5 fill-current text-purple-400" />
                ))}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-400 mb-4 sm:mb-5">Solid foundation with growing practical experience</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {familiarSkills.map(skill => (
                <SkillCard 
                  key={skill.name} 
                  name={skill.name}
                  color="bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-500/40 text-purple-300"
                />
              ))}
            </div>
          </div>

          {/* Additional Tools */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 hover:bg-white/8 transition-all">
            <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-5 text-white">Additional Technologies & Tools</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
              {tools.map(tool => (
                <div 
                  key={tool} 
                  className="px-3 py-2.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs sm:text-sm font-medium text-blue-300 hover:bg-blue-500/30 transition-colors text-center"
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