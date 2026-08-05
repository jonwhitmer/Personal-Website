import React, { useState, useEffect } from 'react';
import { Target, Briefcase, GraduationCap, Code, Dumbbell, Gamepad2, Book, Coffee, MapPin } from 'lucide-react';
import JourneyMap from './JourneyMap';

function HobbySlideshow({ title, description, images, icon, bgColor, borderColor }) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 bg-slate-900/[0.04] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl p-5 sm:p-6 lg:p-8 items-center lg:items-start">
      {/* Image Section */}
      <div className="w-full lg:w-auto flex-shrink-0 flex flex-col items-center">
        <div className="relative w-full max-w-[280px] sm:max-w-[320px] lg:w-[300px]">
          <div className="relative w-full aspect-square rounded-2xl overflow-hidden border-2 border-blue-500/30 shadow-2xl shadow-blue-500/20 bg-slate-900/[0.04] dark:bg-white/5">
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
          <div className="flex justify-center items-center mt-0">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImageIndex(idx)}
                aria-label={`View image ${idx + 1}`}
                className={`h-11 flex items-center justify-center flex-shrink-0 ${
                  images.length <= 6 ? 'px-[18px]' : 'px-[13px]'
                }`}
              >
                <span
                  className={`block h-2 rounded-full transition-all ${
                    idx === currentImageIndex ? 'bg-blue-500 w-6' : 'bg-slate-400 dark:bg-gray-600 w-2'
                  }`}
                />
              </button>
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
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 dark:text-white leading-tight">{title}</h3>
        </div>
        <div className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed [&>p:first-child]:mt-0">
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
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-5 sm:mb-6 lg:mb-8 flex items-center gap-3 leading-tight">
          <Target className="text-green-700 dark:text-green-400 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8" />
          <span>More About Me</span>
        </h2>
        
        <div className="bg-slate-900/[0.04] dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 dark:border-white/10 rounded-xl sm:rounded-2xl overflow-hidden">
          <div className="flex flex-col sm:flex-row border-b border-slate-900/10 dark:border-white/10 overflow-x-auto">
            <button
              onClick={() => setFutureTab('next')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                futureTab === 'next' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.04] dark:hover:bg-white/5'
              }`}
            >
              What's Next
            </button>
            <button
              onClick={() => setFutureTab('working')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                futureTab === 'working' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.04] dark:hover:bg-white/5'
              }`}
            >
              What I'm Working On
            </button>
            <button
              onClick={() => setFutureTab('hobbies')}
              className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 font-semibold transition-colors text-sm sm:text-base whitespace-nowrap ${
                futureTab === 'hobbies' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-900/[0.04] dark:hover:bg-white/5'
              }`}
            >
              Get to Know Me
            </button>
          </div>

          <div className="p-5 sm:p-6 lg:p-8">
            {futureTab === 'next' && (
              <div className="space-y-5 sm:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                  {/* "Join a software team" came out: he has done that. This is
                      what is actually ahead, and the master's is written as the
                      open question it really is rather than a stated plan. */}
                  <div className="bg-slate-900/[0.04] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 leading-tight">
                      <Briefcase size={20} className="text-blue-700 dark:text-blue-400 flex-shrink-0" />
                      <span>Go deeper on AI engineering</span>
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed">Not just calling a model, but building things around one: retrieval, evaluation, and knowing where it genuinely helps and where a normal function is the better answer.</p>
                  </div>
                  <div className="bg-slate-900/[0.04] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl p-5 sm:p-6">
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2 leading-tight">
                      <GraduationCap size={20} className="text-purple-700 dark:text-purple-400 flex-shrink-0" />
                      <span>Potentially a Master's in AI</span>
                    </h3>
                    <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed">Something I'm seriously considering, focused on artificial intelligence and machine learning. The deciding factor is whether it teaches me the theory behind the systems I'm already building rather than repeating what the work itself will.</p>
                  </div>
                </div>
                {/* The "12-Month Goals" checklist came out. Dated, generic and
                    written as if promising a manager something. */}
              </div>
            )}

            {futureTab === 'working' && (
              <div className="space-y-5 sm:space-y-6">
                <div className="bg-slate-900/[0.04] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 leading-tight">
                    <Code size={20} className="text-green-700 dark:text-green-400 flex-shrink-0" />
                    <span>What I'm Working On</span>
                  </h3>
                  <div className="space-y-5">
                    {/* Kept current on purpose: this tab is the first thing that
                        looks stale on a portfolio when it stops being true. */}
                    {/* Nothing here describes a work stack. An earlier draft said
                        "tools I use every day", which reads as the employer's
                        toolchain even when it isn't. Everything below is framed
                        explicitly as personal. The LeetCode item and the
                        in-progress certificate list are gone: the certificates
                        have their own section, and grinding practice problems is
                        an interview activity, not something to advertise. */}
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-semibold mb-2 text-sm sm:text-base leading-tight">My own side projects</h4>
                      <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">Almost everything I build in my own time is something I then actually use: a reader for my own notes, a board for planning and reviewing work, a video clipping tool, and a small dashboard that runs the lot on my machine. Depending on your own software daily is a blunt and very useful kind of feedback.</p>
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-semibold mb-2 text-sm sm:text-base leading-tight">Working out what AI is actually good for</h4>
                      <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">Less prompt trivia, more of the engineering around a model: retrieval, evaluating whether the output is any good, and being willing to conclude that a plain function would have done the job better.</p>
                    </div>
                    <div>
                      <h4 className="text-slate-900 dark:text-white font-semibold mb-2 text-sm sm:text-base leading-tight">Reading and listening</h4>
                      <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">Long-form conversations about technology and how it is changing things, technical books, and enough industry noise to tell a genuine shift from a hype cycle.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {futureTab === 'hobbies' && (
              <div className="space-y-5 sm:space-y-6">
                {/* Where he is from and where he is now, as a small picture in
                    the "get to know me" tab rather than a chapter of its own.
                    The map is the whole point, so there is no prose beside it. */}
                <div className="bg-slate-900/[0.04] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-xl p-5 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 leading-tight">
                    <MapPin size={20} className="text-cyan-700 dark:text-cyan-400 flex-shrink-0" />
                    <span>Where I'm From</span>
                  </h3>
                  <p className="text-sm sm:text-base text-slate-600 dark:text-gray-400 leading-relaxed mb-5">
                    I grew up in western Pennsylvania, about an hour north of Pittsburgh, and stayed
                    close by for university. I moved down to Charlotte, North Carolina for work, and
                    that is where I am now.
                  </p>
                  <div className="max-w-[260px] sm:max-w-[300px] mx-auto">
                    <JourneyMap />
                  </div>
                </div>
                <HobbySlideshow
                  title="Staying Active"
                  description={
                    <>
                      <p>Like most people in the 21st century, I sit <em>a lot</em>, so I aim for <strong>10,000+ steps daily</strong> to stay balanced. I use a <strong>walking pad with a standing desk</strong> while coding, which honestly feels like a cheat code for staying fit when you're naturally sedentary.</p>
                      <p className="mt-3">Beyond that, I shoot hoops in my driveway or at the gym, play catch with a football with friends, and <strong>lift weights at Planet Fitness</strong> since it's 24/7 and I can go late at night. <em>Treadmills and walking pads</em> might not sound exciting, but they're genuinely game-changers if you spend most of your day at a desk.</p>
                    </>
                  }
                  images={[steps, walkingpad, bball, weights]}
                  icon={<Dumbbell size={24} className="text-blue-700 dark:text-blue-400" />}
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
                          <span className="text-blue-700 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                          <div>
                            <strong>The Joe Rogan Experience (JRE):</strong> <em>"A long-form conversation hosted by Joe Rogan with friends and guests who have compelling stories and ideas."</em> It's the perfect mix of comedy, curiosity, and deep dives into topics I'd never think to explore.
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-700 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                          <div>
                            <strong>This Past Weekend (Theo Von):</strong> <em>"A podcast where Theo Von shares stories of his past, reflects on life, and talks with guests about the human experience."</em> Theo's storytelling is hilarious and surprisingly introspective at the same time.
                          </div>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-700 dark:text-blue-400 mt-1 flex-shrink-0">•</span>
                          <div>
                            <strong>Lex Fridman Podcast:</strong> <em>"Conversations about science, technology, history, philosophy, and the nature of intelligence, consciousness, love, and power."</em> This one's <strong>really for me</strong> because Lex gets super techy. He's had <strong>Sundar Pichai</strong> (Google CEO) and <strong>Sam Altman</strong> (OpenAI CEO) on, and hearing their perspectives on the <em>AI race</em> that's actively going on right now is exactly the kind of content I'm looking for.
                          </div>
                        </li>
                      </ul>
                    </>
                  }
                  images={[podcast]}
                  icon={<Coffee size={24} className="text-purple-700 dark:text-purple-400" />}
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
                  icon={<Gamepad2 size={24} className="text-cyan-700 dark:text-cyan-400" />}
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
                  icon={<Book size={24} className="text-green-700 dark:text-green-400" />}
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