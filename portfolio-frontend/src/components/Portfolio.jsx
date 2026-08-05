import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, FileText, Download, ChevronUp, Mail, Check, Loader2 } from 'lucide-react';
import Header from './Header';
import ChatSoon from './ChatSoon';
import Experience from './Experience';
import Education from './Education';
import Certifications from './Certifications';
import Projects from './Projects';
import Skills from './Skills';  
import Future from './Future';
import Contact from './Contact';
import Footer from './Footer';
import Introduction from './Introduction';
import Chapter from './Chapter';
import ScrollProgress from './ScrollProgress';
import { RESUME_PATH } from '../resume';

export default function Portfolio() {
  const resume = RESUME_PATH;

  const [messages, setMessages] = useState([
    { role: 'assistant', content: "👋 Hi! I'm Jaymik, Jon's AI assistant. Ask me anything about his projects, skills, or experience!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [contactForm, setContactForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [futureTab, setFutureTab] = useState('next');
  const [showResumePreview, setShowResumePreview] = useState(false);
  const [formSubmitStatus, setFormSubmitStatus] = useState(null);
  const [currentLightboxIndex, setCurrentLightboxIndex] = useState(0);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [charCount, setCharCount] = useState(0);
  const [showEmailPrompt, setShowEmailPrompt] = useState(false);
  const [resumeEmail, setResumeEmail] = useState('');
  const [resumeEmailStatus, setResumeEmailStatus] = useState(null);
  const [isEmailSending, setIsEmailSending] = useState(false);
  const [isValidEmail, setIsValidEmail] = useState(false);
  const MAX_CHAR_LIMIT = 200;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const messagesEndRef = useRef(null);
  const API_URL = import.meta.env.VITE_API_URL;


  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const handleLightboxOpen = (e) => {
      setLightboxImages(e.detail.images);
      setCurrentLightboxIndex(e.detail.index);
      setLightboxImage(e.detail.images[e.detail.index]);
    };
  
    window.addEventListener('lightboxOpen', handleLightboxOpen);
    return () => window.removeEventListener('lightboxOpen', handleLightboxOpen);
  }, []);

  useEffect(() => {
    if (showResumePreview) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showResumePreview]);

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setCharCount(0);
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: userMessage })
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      setTimeout(() => {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "I'm currently offline! Connect me to the Spring Boot backend to start chatting. 🚀" 
        }]);
        setIsLoading(false);
      }, 1000);
      return;
    }
    setIsLoading(false);
  };

  const validateForm = () => {
    const errors = {};
    if (!contactForm.firstName.trim()) errors.firstName = 'Required';
    if (!contactForm.lastName.trim()) errors.lastName = 'Required';
    if (!contactForm.email.trim()) errors.email = 'Required';
    else if (!/\S+@\S+\.\S+/.test(contactForm.email)) errors.email = 'Invalid email';
    if (!contactForm.message.trim()) errors.message = 'Required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      console.log("Sending message to contact API", `${API_URL}/api/contact`);
      console.log("Contact form data", contactForm);

      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
    
      console.log("Response from contact API", response);

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        let errorMessage = 'Failed to send message. Please try again or email directly.';
        
        if (response.status === 429) {
          errorMessage = await response.text();
        } else if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          if (errorData.errors) {
            setFormErrors(errorData.errors);
            setFormSubmitStatus('error');
            setIsSubmitting(false);
            return;
          }
        }
        
        setFormSubmitStatus('error');
        setFormErrors({ submit: errorMessage });
        setIsSubmitting(false);
        return;
      }
      
      setFormSubmitStatus('success');
      setContactForm({ firstName: '', lastName: '', email: '', company: '', message: '' });
      setFormErrors({});
      setTimeout(() => setFormSubmitStatus(null), 5000);
    } catch (error) {
      setFormSubmitStatus('error');
      setFormErrors({ submit: 'Failed to send message. Please try again or email directly.' });
      console.error("Error sending message to contact API", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailResume = async (e) => {
    e.preventDefault();
    
    if (!isValidEmail) {
      setResumeEmailStatus('error');
      return;
    }
    
    setIsEmailSending(true);
    setResumeEmailStatus(null);
    
    try {
      const response = await fetch(`${API_URL}/api/resume/email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resumeEmail })
      });
      
      if (!response.ok) {
        setResumeEmailStatus('error');
        setIsEmailSending(false);
        return;
      }
      
      setResumeEmailStatus('success');
      setResumeEmail('');
      setIsValidEmail(false);
      // The panel used to close itself a full minute later, which moved the page
      // under someone who had long since gone back to reading. It now just
      // settles back to its resting state so a second address can be sent.
      setTimeout(() => setResumeEmailStatus(null), 10000);
    } catch (error) {
      setResumeEmailStatus('error');
    } finally {
      setIsEmailSending(false);
    }
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setResumeEmail(email);
    setIsValidEmail(emailRegex.test(email));
    if (resumeEmailStatus === 'error') {
      setResumeEmailStatus(null);
    }
  };

  const closeEmailPrompt = () => {
    setShowEmailPrompt(false);
    setResumeEmailStatus(null);
  };

  // The resume email panel has exactly four states, and each one owns the same
  // single line of copy under the input. Keeping the message in one reserved
  // slot is what stops the panel from growing and shrinking as you type, which
  // is what made the old version feel busy.
  const resumeEmailSent = resumeEmailStatus === 'success';
  const canSendResume = isValidEmail && !isEmailSending && !resumeEmailSent;
  const resumeSendLabel = resumeEmailSent ? 'Sent' : isEmailSending ? 'Sending' : 'Send';
  const resumeEmailNote =
    resumeEmailStatus === 'error'
      ? { text: 'That did not send. Check the address and try again.', tone: 'text-red-700 dark:text-red-400' }
      : resumeEmailSent
      ? { text: 'Sent. Check your inbox, and spam if it is not there.', tone: 'text-green-700 dark:text-green-400' }
      : isEmailSending
      ? { text: 'Sending it now.', tone: 'text-slate-600 dark:text-gray-400' }
      : resumeEmail && !isValidEmail
      ? { text: 'That address is not complete yet.', tone: 'text-amber-700 dark:text-amber-400' }
      : { text: 'One email with the PDF attached, nothing else.', tone: 'text-slate-600 dark:text-gray-400' };

  // The wrapper below uses overflow-x-clip, NOT overflow-hidden. The blurred
  // background blobs are positioned off-screen (-left-1/4, -right-1/4) and would
  // otherwise add a horizontal scrollbar, so something has to contain them.
  //
  // But `overflow: hidden` turns this div into a scroll container, and a
  // `position: sticky` element sticks to its nearest scrolling ancestor — so the
  // sticky header stuck to THIS box and scrolled off the top of the screen with
  // the page. That is why the navbar never stayed put. `overflow: clip` clips
  // identically without creating a scroll container, so the header sticks to the
  // viewport. Proven by qa/site-content.mjs, which scrolls the page and asserts
  // the header is still at top: 0 and still hit-testable.
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white relative overflow-x-clip">
      {/* The three blurred blobs were mixed for a black page: at full strength on
          a near-white one they turn the whole background a muddy lavender-grey
          and drag the text contrast down with it. Halving the layer's opacity in
          light mode keeps the same colour story as a faint wash. */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-100">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      {/* Same story for the grid: the lines are a translucent blue that reads as
          texture on black but as dirt on white, so light mode gets it fainter. */}
      <div className="fixed inset-0 opacity-[0.35] dark:opacity-30 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg1OSwgMTMwLCAyNDYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] pointer-events-none"></div>

      <div className="relative z-10">
        <Header scrollToSection={scrollToSection} setShowResumePreview={setShowResumePreview} />
        {/* Measures the header itself rather than assuming a height, so it stays
            glued to the navbar's bottom edge if the header ever resizes. */}
        <ScrollProgress />

        {/* The page is one guided story rather than a stack of sections. Each
            Chapter adds the number, the label and the rail around a section that
            is otherwise untouched, so every nav anchor and heading still works.
            The order is deliberately unchanged: a recruiter still meets the work
            before the backstory. */}
        <div className="max-w-7xl mx-auto px-4">
          <Chapter number="01" label="Who I Am" first>
            <Introduction scrollToSection={scrollToSection} />
            <ChatSoon />
          </Chapter>

          <Chapter number="02" label="The Work">
            <Experience />
          </Chapter>

          {/* Certifications live here rather than under "What I've Built": they
              are qualifications earned, not things built, and they sit
              chronologically alongside the degree. */}
          <Chapter number="03" label="How I Got Here">
            <Education />
            <Certifications />
          </Chapter>

          {/* "The Move" is no longer a chapter of its own. The map is a small
              detail inside More About Me now, which is where someone goes when
              they actually want the personal background. */}
          <Chapter number="04" label="What I've Built">
            <Projects
              expandedProjects={expandedProjects}
              setExpandedProjects={setExpandedProjects}
              setLightboxImage={setLightboxImage}
            />
            <Skills />
          </Chapter>

          {/* Deliberately NOT `last`. The `last` rail cap draws a small grey dot
              at the very bottom of the rail, which lands in empty space below
              and to the left of the Send Message button and reads as a stray
              speck rather than a full stop. The rail already fades out to
              transparent on its own, which ends the journey quietly. Proven by
              a check that finds no small round element near that button. */}
          <Chapter number="05" label="What's Next">
            <Future futureTab={futureTab} setFutureTab={setFutureTab} />
            <Contact
              contactForm={contactForm}
              setContactForm={setContactForm}
              formErrors={formErrors}
              formSubmitStatus={formSubmitStatus}
              handleContactSubmit={handleContactSubmit}
              isSubmitting={isSubmitting}
            />
          </Chapter>
        </div>

        <Footer scrollToSection={scrollToSection} />
      </div>

      {/* The resume viewer and the image lightbox stay dark in BOTH themes. They
          are full-screen media viewers: a PDF and a screenshot both read better
          against black, and a white chrome around a white PDF page loses the
          page edge entirely. The `dark` class here is not a preference - it
          switches every `dark:` utility INSIDE the overlay back on, so the
          controls stay light-on-dark even when the page behind them is light. */}
      {showResumePreview && (
        <div className="dark fixed inset-0 bg-black/95 text-white backdrop-blur-sm z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-slate-900/20 dark:border-white/20 bg-black/70 z-10">
            {/* The title shrinks on a phone rather than sitting under the
                buttons. Three controls plus a 24px heading do not fit across
                390px, and the buttons are the reason anyone looks up here. */}
            <h3 className="text-lg sm:text-2xl font-bold text-slate-900 dark:text-white min-w-0">Resume</h3>
            <div className="flex gap-2 sm:gap-3 items-center flex-shrink-0">
              <button
                onClick={() => (showEmailPrompt ? closeEmailPrompt() : setShowEmailPrompt(true))}
                aria-expanded={showEmailPrompt}
                className="min-h-[44px] px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">Email it to me</span>
                <span className="sm:hidden">Email</span>
              </button>
              <a
                href={resume}
                download="JonWhitmer_Resume.pdf"
                className="min-h-[44px] px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">PDF</span>
              </a>
              <button
                onClick={() => {
                  setShowResumePreview(false);
                  closeEmailPrompt();
                }}
                aria-label="Close the resume"
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-900 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {/* One input, one action, and one line of copy that every state writes
              into. The line has its own reserved height, so moving from resting
              to sending to sent to failed never resizes the panel and never
              nudges the PDF below it. The old version stacked a coloured banner,
              a hover-only tooltip and two conditional paragraphs, each of which
              appeared and disappeared under the input. */}
          {showEmailPrompt && (
            <div
              data-resume-email-panel
              className="border-b border-slate-900/10 dark:border-white/10 bg-slate-100 dark:bg-white/[0.06] px-4 py-4 sm:py-5"
            >
              <div className="max-w-xl mx-auto">
                <label
                  htmlFor="resume-email"
                  className="block text-sm font-semibold text-slate-700 dark:text-gray-200"
                >
                  Send this resume to your inbox
                </label>

                <div className="mt-2 flex items-stretch gap-2">
                  <input
                    id="resume-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={resumeEmail}
                    onChange={handleEmailChange}
                    onKeyDown={(e) => { if (e.key === 'Enter' && canSendResume) handleEmailResume(e); }}
                    placeholder="your.email@example.com"
                    disabled={isEmailSending}
                    className={`min-h-[44px] w-full min-w-0 flex-1 rounded-lg border px-4 py-2.5 text-base bg-white dark:bg-white/10 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-400 transition-colors focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed ${
                      resumeEmailStatus === 'error'
                        ? 'border-red-500 focus:ring-red-500'
                        : resumeEmail && !isValidEmail
                        ? 'border-amber-500 focus:ring-amber-500'
                        : isValidEmail
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-slate-900/20 dark:border-white/20 focus:ring-purple-500'
                    }`}
                  />
                  {/* A fixed minimum width so the label swapping between Send,
                      Sending and Sent does not shove the input sideways. */}
                  <button
                    onClick={handleEmailResume}
                    disabled={!canSendResume}
                    className="min-h-[44px] min-w-[7.5rem] flex-shrink-0 inline-flex items-center justify-center gap-2 rounded-lg px-4 text-base font-semibold text-white bg-purple-600 hover:bg-purple-700 disabled:bg-slate-400 dark:disabled:bg-gray-700 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-purple-400"
                  >
                    {resumeEmailSent ? (
                      <Check size={18} />
                    ) : isEmailSending ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Mail size={18} />
                    )}
                    <span>{resumeSendLabel}</span>
                  </button>
                </div>

                <p
                  aria-live="polite"
                  className={`mt-2 min-h-[2.5rem] sm:min-h-[1.25rem] text-sm leading-snug ${resumeEmailNote.tone}`}
                >
                  {resumeEmailNote.text}
                </p>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden">
            <embed
              src={`${resume}#toolbar=0&navpanes=0&scrollbar=0`}
              type="application/pdf"
              className="w-full h-full"
            />
          </div>
        </div>
      )}

      {lightboxImage && (
        <div className="dark fixed inset-0 bg-black/95 text-white z-50 flex items-center justify-center p-4" onClick={() => { setLightboxImage(null); setLightboxImages([]); }}>
          <button onClick={() => { setLightboxImage(null); setLightboxImages([]); }} className="absolute top-4 right-4 text-slate-900 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 rounded-lg p-2 transition-colors z-10">
            <X size={32} />
          </button>
          
          {lightboxImages.length > 1 && (
            <>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const newIndex = currentLightboxIndex === 0 ? lightboxImages.length - 1 : currentLightboxIndex - 1;
                  setCurrentLightboxIndex(newIndex);
                  setLightboxImage(lightboxImages[newIndex]);
                }} 
                className="absolute left-4 text-slate-900 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 rounded-full p-3 transition-colors z-10"
              >
                <ChevronUp size={32} className="rotate-[-90deg]" />
              </button>
              <button 
                onClick={(e) => { 
                  e.stopPropagation(); 
                  const newIndex = currentLightboxIndex === lightboxImages.length - 1 ? 0 : currentLightboxIndex + 1;
                  setCurrentLightboxIndex(newIndex);
                  setLightboxImage(lightboxImages[newIndex]);
                }} 
                className="absolute right-4 text-slate-900 dark:text-white hover:bg-slate-900/10 dark:hover:bg-white/20 rounded-full p-3 transition-colors z-10"
              >
                <ChevronUp size={32} className="rotate-90" />
              </button>
            </>
          )}
          
          <img src={lightboxImage} alt="Project" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
          
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-slate-900 dark:text-white bg-black/50 px-4 py-2 rounded-full">
              {currentLightboxIndex + 1} / {lightboxImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}