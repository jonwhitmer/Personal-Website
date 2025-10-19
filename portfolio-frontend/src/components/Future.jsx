import React, { useState, useEffect } from 'react';
import { Target, Check, Briefcase, GraduationCap, Code, Dumbbell, Gamepad2, Book, Coffee } from 'lucide-react';

function HobbySlideshow({ title, description, images, icon, bgColor, borderColor }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6 lg:p-8 items-center lg:items-start">
      {/* Image Section */}
      <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center">
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:w-[300px]">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20 bg-white/5">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`${title} ${idx + 1}`}
                className={`absolute inset-0 w-full h-full object-contain p-4 transition-opacity duration-1000 ${
                  idx === currentImageIndex ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-4">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentImageIndex ? 'bg-blue-500 w-6' : 'bg-gray-600'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Text Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg ${bgColor} border ${borderColor} flex items-center justify-center flex-shrink-0`}>
            {icon}
          </div>
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-tight">{title}</h3>
        </div>
        <div className="text-sm sm:text-base text-gray-400 leading-relaxed [&>p:first-child]:mt-0">
          {description}
        </div>
      </div>
    </div>
  );
}

export default function FutureSection({ futureTab, setFutureTab }) {
  const walkingpad = '/images/walkingpad.png';
  const podcast = '/images/podcast.png';
  const steelers = '/images/steelers.png';
  const bronjerseys = '/images/bronjerseys.png';
  const bball = '/images/bball.png';
  const steps = '/images/steps.png';
  const weights = '/images/weights.png';
  const patrickbateman = '/images/patrickbateman.png';

  return (
    <section id="future" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 sm:mb-8 lg:mb-10 flex items-center gap-3 leading-tight">
          <Target className="text-green-400 w-8 h-8 sm:w-10 sm:h-10" />
          <span>More About Me</span>
        </h2>
        
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row border-b border-white/10 overflow-x-auto">
            <button
              onClick={() => setFutureTab('next')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                futureTab === 'next' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              What's Next
            </button>
            <button
              onClick={() => setFutureTab('working')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                futureTab === 'working' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              What I'm Working On
            </button>
            <button
              onClick={() => setFutureTab('hobbies')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                futureTab === 'hobbies' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Get to Know Me
            </button>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            {futureTab === 'next' && (
              <div className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2 leading-tight">
                      <Briefcase size={20} className="text-blue-400 flex-shrink-0" />
                      <span>Join a Software Team</span>
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Where I can ship features, own services, and collaborate with talented engineers to build impactful products that solve real problems.</p>
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-white mb-3 flex items-center gap-2 leading-tight">
                      <GraduationCap size={20} className="text-purple-400 flex-shrink-0" />
                      <span>Pursue my Master's Degree</span>
                    </h3>
                    <p className="text-sm sm:text-base text-gray-400 leading-relaxed">Exploring scalable systems and ML with a focus on production-ready solutions and distributed computing.</p>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
                  <h4 className="text-base sm:text-lg font-bold text-white mb-4 leading-tight">12-Month Goals</h4>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm sm:text-base leading-tight">Ship Production Features</p>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-1">Contribute to backend services in a collaborative team environment</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm sm:text-base leading-tight">Expand Cloud Skills</p>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-1">Deploy applications to AWS and master containerization with Kubernetes</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check size={14} className="text-blue-400" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-white font-medium text-sm sm:text-base leading-tight">Deepen ML Knowledge</p>
                        <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mt-1">Build production ML pipelines and explore model optimization techniques</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {futureTab === 'working' && (
              <div className="space-y-5 sm:space-y-6">
                <div className="bg-white/5 border border-white/10 rounded-xl p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-white mb-4 flex items-center gap-2 leading-tight">
                    <Code size={20} className="text-green-400 flex-shrink-0" />
                    <span>What I'm Working On</span>
                  </h3>
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-white font-semibold mb-2 text-sm sm:text-base leading-tight">Portfolio Website with AI Assistant</h4>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3">Building this full-stack portfolio with Spring Boot backend, React frontend, and an AI chatbot powered by RAG and Groq API.</p>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300">Spring Boot</span>
                        <span className="text-xs px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300">React</span>
                        <span className="text-xs px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300">LangChain</span>
                        <span className="text-xs px-2.5 py-1 bg-blue-500/20 border border-blue-500/30 rounded text-blue-300">FastAPI</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2 text-sm sm:text-base leading-tight">Practicing LeetCode & NeetCode</h4>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">Solving algorithmic problems daily to strengthen my data structures and algorithms skills for technical interviews and real-world problem-solving.</p>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2 text-sm sm:text-base leading-tight">Professional Certifications</h4>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-3">Actively working through multiple professional certifications:</p>
                      <ul className="space-y-2 ml-2 sm:ml-4">
                        <li className="flex items-start gap-2 text-gray-400 text-xs sm:text-sm">
                          <span className="text-blue-400 flex-shrink-0">→</span>
                          <span className="leading-relaxed"><strong className="text-gray-300">Meta Front-End Developer Professional Certificate</strong></span>
                        </li>
                        <li className="flex items-start gap-2 text-gray-400 text-xs sm:text-sm">
                          <span className="text-blue-400 flex-shrink-0">→</span>
                          <span className="leading-relaxed"><strong className="text-gray-300">IBM AI Engineering Professional Certificate</strong></span>
                        </li>
                        <li className="flex items-start gap-2 text-gray-400 text-xs sm:text-sm">
                          <span className="text-blue-400 flex-shrink-0">→</span>
                          <span className="leading-relaxed"><strong className="text-gray-300">Google Cybersecurity Professional Certificate</strong></span>
                        </li>
                        <li className="flex items-start gap-2 text-gray-400 text-xs sm:text-sm">
                          <span className="text-blue-400 flex-shrink-0">→</span>
                          <span className="leading-relaxed"><strong className="text-gray-300">AWS Cloud Practitioner</strong></span>
                        </li>
                        <li className="flex items-start gap-2 text-gray-400 text-xs sm:text-sm">
                          <span className="text-blue-400 flex-shrink-0">→</span>
                          <span className="leading-relaxed">YouTube courses, technical books, and hands-on projects</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-white font-semibold mb-2 text-sm sm:text-base leading-tight">Keeping Up with the Tech & AI Space</h4>
                      <p className="text-gray-400 text-xs sm:text-sm leading-relaxed">Staying current with the rapidly evolving tech and AI landscape. Following industry news, trying new tools, and understanding how emerging technologies are shaping the future of software engineering.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {futureTab === 'hobbies' && (
              <div className="space-y-5 sm:space-y-6">
                <HobbySlideshow
                  title="Staying Active"
                  description={
                    <>
                      <p>Like most people in the 21st century, I sit <em>a lot</em>, so I aim for <strong>10,000+ steps daily</strong> to stay balanced. I use a <strong>walking pad with a standing desk</strong> while coding, which honestly feels like a cheat code for staying fit when you're naturally sedentary.</p>
                      <p className="mt-3">Beyond that, I shoot hoops in my driveway or at the gym, play catch with a football with friends, and <strong>lift weights at Planet Fitness</strong> since it's 24/7 and I can go late at night. <em>Treadmills and walking pads</em> might not sound exciting, but they're genuinely game-changers if you spend most of your day at a desk.</p>
                    </>
                  }
                  images={[steps, walkingpad, bball, weights]}
                  icon={<Dumbbell size={24} className="text-blue-400" />}
                  bgColor="bg-blue-500/20"
                  borderColor="border-blue-500/30"
                />
                
                <HobbySlideshow
                  title="Podcasts"
                  description={
                    <>
                      <p className="mt-0">I love podcasts for both <strong>entertainment</strong> and <strong>learning new perspectives</strong>. Here are my favorites:</p>
                      <ul className="space-y-2 ml-4 mt-3">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                          <div>
                            <strong>The Joe Rogan Experience (JRE):</strong> <em>"A long-form conversation hosted by Joe Rogan with friends and guests who have compelling stories and ideas."</em> It's the perfect mix of comedy, curiosity, and deep dives into topics I'd never think to explore.
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                          <div>
                            <strong>This Past Weekend (Theo Von):</strong> <em>"A podcast where Theo Von shares stories of his past, reflects on life, and talks with guests about the human experience."</em> Theo's storytelling is hilarious and surprisingly introspective at the same time.
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-400 mt-1 flex-shrink-0">•</span>
                          <div>
                            <strong>Lex Fridman Podcast:</strong> <em>"Conversations about science, technology, history, philosophy, and the nature of intelligence, consciousness, love, and power."</em> This one's <strong>really for me</strong> because Lex gets super techy. He's had <strong>Sundar Pichai</strong> (Google CEO) and <strong>Sam Altman</strong> (OpenAI CEO) on, and hearing their perspectives on the <em>AI race</em> that's actively going on right now is exactly the kind of content I'm looking for.
                          </div>
                        </li>
                      </ul>
                    </>
                  }
                  images={[podcast]}
                  icon={<Coffee size={24} className="text-purple-400" />}
                  bgColor="bg-purple-500/20"
                  borderColor="border-purple-500/30"
                />
                
                <HobbySlideshow
                  title="Sports"
                  description={
                    <>
                      <p className="mt-0">I like to follow the <strong>NFL</strong> and <strong>NBA</strong>. I've been a <strong>lifelong Steelers fan</strong> growing up about an hour from Pittsburgh. I love following football and playing <em>fantasy football</em> with friends every season.</p>
                      <p className="mt-3"><strong>LeBron James</strong> has been my favorite player for over a decade. I've followed his entire career from Cleveland to Miami to Los Angeles, and watching him play at the highest level for this long has been incredible. His impact on the game speaks for itself.</p>
                    </>
                  }
                  images={[steelers, bronjerseys]}
                  icon={<Gamepad2 size={24} className="text-cyan-400" />}
                  bgColor="bg-cyan-500/20"
                  borderColor="border-cyan-500/30"
                />
                
                <HobbySlideshow
                  title="Music"
                  description={
                    <>
                      <p className="mt-0">I like following <strong>hip hop and rap</strong> because it's a competitive game like sports. I follow my favorite artists, waiting for their albums to drop and being critical of new releases because <em>that's the sport of rap</em>.</p>
                      <p className="mt-3">I'm always anticipating <strong>new music Fridays</strong>, especially from artists like <strong>Drake, Future, Travis Scott, Gunna, and J. Cole</strong>, just to name a few. While hip hop is my main genre, I also enjoy <strong>R&B</strong>, with artists like <strong>The Weeknd</strong> in heavy rotation.</p>
                      <p className="mt-3">There's something about waiting for an album to release and then dissecting it that keeps me engaged with music.</p>
                    </>
                  }
                  images={[patrickbateman]}
                  icon={<Book size={24} className="text-green-400" />}
                  bgColor="bg-green-500/20"
                  borderColor="border-green-500/30"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}