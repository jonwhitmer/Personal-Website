import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, FolderGit2, X, ZoomIn } from 'lucide-react';

function ProjectCard({ title, summary, tags, images, bullets, currentImageIndex, setCurrentImageIndex }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Helper function to check if media is a video
  const isVideo = (src) => {
    return typeof src === 'string' && (src.endsWith('.mov') || src.endsWith('.mp4') || src.endsWith('.webm'));
  };

  const currentMedia = images[currentImageIndex];
  const isCurrentVideo = isVideo(currentMedia);

  return (
    <>
      <div className="overflow-hidden">
        {/* Image/Video Slideshow */}
        <div className="relative mb-5 sm:mb-6 rounded-lg overflow-hidden bg-black/20 flex items-center justify-center h-[250px] sm:h-[350px] lg:h-[400px]">
          {isCurrentVideo ? (
            <video 
              src={currentMedia}
              controls
              autoPlay
              loop
              muted
              className="max-w-full max-h-full object-contain"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="relative group h-full w-full flex items-center justify-center">
              <img 
                src={currentMedia}
                alt={`${title} screenshot ${currentImageIndex + 1}`}
                className="h-full w-auto object-cover cursor-pointer"
                onClick={() => setIsModalOpen(true)}
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-3 right-3 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
                aria-label="View full size"
              >
                <ZoomIn className="text-white" size={20} />
              </button>
            </div>
          )}
          
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                aria-label="Previous image"
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all active:scale-95 z-10"
              >
                <ChevronLeft className="text-white" size={18} />
              </button>
              <button
                onClick={nextImage}
                aria-label="Next image"
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center transition-all active:scale-95 z-10"
              >
                <ChevronRight className="text-white" size={18} />
              </button>
              
              {/* Image indicators */}
              <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-10">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    aria-label={`View image ${idx + 1}`}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentImageIndex ? 'bg-blue-500 w-5 sm:w-6' : 'bg-white/50 w-2'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        {/* Project Info */}
        <h3 className="font-bold text-xl sm:text-2xl text-white mb-2 sm:mb-3">{title}</h3>
        <p className="text-gray-400 mb-4 text-sm sm:text-base lg:text-lg leading-relaxed">{summary}</p>
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
          {tags.map(tag => (
            <span key={tag} className="text-xs sm:text-sm px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 font-medium">
              {tag}
            </span>
          ))}
        </div>

        {/* Bullet Points */}
        <ul className="space-y-2.5 sm:space-y-3">
          {bullets.map((bullet, idx) => (
            <li key={idx} className="text-gray-300 flex gap-2 sm:gap-3 text-sm sm:text-base leading-relaxed">
              <span className="text-blue-400 flex-shrink-0 mt-0.5">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Full Screen Image Modal */}
      {isModalOpen && !isCurrentVideo && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <button
            onClick={() => setIsModalOpen(false)}
            className="absolute top-4 right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
            aria-label="Close"
          >
            <X className="text-white" size={24} />
          </button>
          
          <img 
            src={currentMedia}
            alt={`${title} screenshot ${currentImageIndex + 1}`}
            className="max-w-full max-h-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="Previous image"
              >
                <ChevronLeft className="text-white" size={24} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
                aria-label="Next image"
              >
                <ChevronRight className="text-white" size={24} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}

export default function Projects() {

  const robotvid = '/videos/robot.mp4';
  const LunaNoGlasses = '/images/luna_noglasses.png';
  const LunaGlasses = '/images/luna_glasses.png';
  const IA = '/images/IA_Logo.png';
  const IA2 = '/images/adminevaldb.png';
  const IA3 = '/images/companybranding.png';
  const IA4 = '/images/revieweeportal.png';
  const fred1 = '/images/fred1.png';
  const fred2 = '/images/fred2.png';
  const fred3 = '/images/fred3.png';
  const fred4 = '/images/fred4.png';
  const fred5 = '/images/fred5.png';
  const fred6 = '/images/fred6.png';
  const fred7 = '/images/fred7.png';
  const fred8 = '/images/fred8.png';
  const fred9 = '/images/fred9.png';

  const [currentProjectIndex, setCurrentProjectIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const projects = [
    {
      id: 'furhat',
      title: 'Furhat Robot Assistant',
      summary: 'Kotlin dialogue system with custom state management and locally hosted LLM for real-time responses',
      tags: ['Kotlin', 'LLM', 'React', 'Flask', 'Robotics'],
      images: [
        robotvid,
        LunaNoGlasses,
        LunaGlasses
      ],
      bullets: [
        "Developed conversational AI assistant using Furhat Robotics' voice interface",
        "Designed dialogue system with custom state management flows using Kotlin",
        "Scraped and parsed 100+ academic catalog and degree plan pages",
        "Built React.js frontend that visualizes academic pathways interactively"
      ]
    },
    {
      id: 'eval',
      title: 'Intelli-Assess',
      summary: 'Enterprise-ready evaluaticon system streamlining performance reviews, report generation, and feedback management across departments, locations, and organizations.',
      tags: ['Java', 'Spring Boot', 'Maven', 'MySQL', 'JUnit'],
      images: [
        IA,
        IA2,
        IA3,
        IA4
      ],
      bullets: [
        "Built a full-stack Spring Boot application enabling scalable evaluation workflows across teams and departments",
        "Automated report generation aggregating multi-reviewer feedback into unified performance summaries",
        "Designed modular architecture with real-time notifications, RBAC, and secure data persistence in MySQL",
        "Deployed to Apache Tomcat with production-level stability, optimized for enterprise environments"
      ]
    },
    {
      id: 'discord',
      title: 'Discord Bot',
      summary: 'Python bot with custom poker and blackjack games, economy system, and automated moderation',
      tags: ['Python', 'discord.py', 'JSON', 'MySQL', 'GitHub Actions'],
      images: [
        fred9,
        fred1,
        fred2,
        fred3,
        fred4,
        fred5,
        fred6,
        fred7,
        fred8
      ],
      bullets: [
        "Built dynamic Discord bot to boost server engagement",
        "Programmed async mini-games with virtual currency system",
        "Processed 10,000+ transactions with MySQL persistence",
        "Average play time of 12.4 hours per game in Aug 2024"
      ]
    }
  ];

  const nextProject = () => {
    setCurrentProjectIndex((prev) => (prev + 1) % projects.length);
    setCurrentImageIndex(0);
  };

  const prevProject = () => {
    setCurrentProjectIndex((prev) => (prev - 1 + projects.length) % projects.length);
    setCurrentImageIndex(0);
  };

  return (
    <section id="projects" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 lg:mb-10 text-white flex items-center gap-3">
          <FolderGit2 className="text-blue-400 w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12" />
          <span>Featured Projects</span>
        </h2>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-6 lg:p-8">
          {/* Project Display */}
          <ProjectCard 
            {...projects[currentProjectIndex]} 
            currentImageIndex={currentImageIndex}
            setCurrentImageIndex={setCurrentImageIndex}
          />

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mt-6 sm:mt-8">
            <button
              onClick={prevProject}
              disabled={currentProjectIndex === 0}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all font-medium w-full sm:w-32 justify-center text-sm sm:text-base active:scale-95"
            >
              <ChevronLeft size={20} />
              Previous
            </button>

            <div className="text-gray-400 font-medium text-sm sm:text-base order-first sm:order-none">
              Project {currentProjectIndex + 1} of {projects.length}
            </div>

            <button
              onClick={nextProject}
              disabled={currentProjectIndex === projects.length - 1}
              className="flex items-center gap-2 px-5 sm:px-6 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg transition-all font-medium w-full sm:w-32 justify-center text-sm sm:text-base active:scale-95"
            >
              Next
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}