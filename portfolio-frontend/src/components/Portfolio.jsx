import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, X, FileText, Download, ChevronUp, Mail, Check } from 'lucide-react';
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

export default function Portfolio() {
  const resume = '/doc/JonWhitmer_Resume.pdf';

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
      const response = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });
      
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
      setTimeout(() => {
        setShowEmailPrompt(false);
        setResumeEmailStatus(null);
      }, 60000);
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

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
      </div>

      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSg1OSwgMTMwLCAyNDYsIDAuMSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30 pointer-events-none"></div>

      <div className="relative z-10">
        <Header scrollToSection={scrollToSection} setShowResumePreview={setShowResumePreview} />

        <div className="max-w-7xl mx-auto px-4">
          <Introduction scrollToSection={scrollToSection} />
          <ChatSoon />
          <Experience />
          <Education />
          <Certifications />
          <Projects
            expandedProjects={expandedProjects}
            setExpandedProjects={setExpandedProjects}
            setLightboxImage={setLightboxImage}
          />
          <Skills />
          <Future futureTab={futureTab} setFutureTab={setFutureTab} />
          <Contact 
            contactForm={contactForm}
            setContactForm={setContactForm}
            formErrors={formErrors}
            formSubmitStatus={formSubmitStatus}
            handleContactSubmit={handleContactSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        <Footer scrollToSection={scrollToSection} />
      </div>

      {showResumePreview && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-white/20 bg-black/70 z-10">
            <h3 className="text-2xl font-bold text-white">Resume</h3>
            <div className="flex gap-3 items-center">
              <button
                onClick={() => setShowEmailPrompt(!showEmailPrompt)}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
              >
                <Mail size={16} />
                <span className="hidden sm:inline">Email Me This</span>
                <span className="sm:hidden">Email</span>
              </button>
              <a
                href={resume}
                download="JonWhitmer_Resume.pdf"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-all flex items-center gap-2 text-sm"
              >
                <Download size={16} />
                <span className="hidden sm:inline">Download PDF</span>
                <span className="sm:hidden">Download</span>
              </a>
              <button
                onClick={() => {
                  setShowResumePreview(false);
                  setShowEmailPrompt(false);
                  setResumeEmailStatus(null);
                }}
                className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
          </div>

          {showEmailPrompt && (
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-4">
              <div className="max-w-2xl mx-auto">
                <h4 className="text-lg font-semibold text-white mb-3">📧 Get Resume Sent to Your Email</h4>
                <div className="flex gap-2 relative">
                  <div className="flex-1 relative">
                    <input
                      type="email"
                      value={resumeEmail}
                      onChange={handleEmailChange}
                      onKeyDown={(e) => e.key === 'Enter' && isValidEmail && handleEmailResume(e)}
                      placeholder="your.email@example.com"
                      className={`w-full px-4 py-2 pr-10 bg-white/10 border rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all ${
                        resumeEmail && !isValidEmail 
                          ? 'border-red-500/50 focus:ring-red-500' 
                          : isValidEmail 
                          ? 'border-green-500/50 focus:ring-green-500' 
                          : 'border-white/20 focus:ring-purple-500'
                      }`}
                      disabled={isEmailSending}
                    />
                    {resumeEmail && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidEmail ? (
                          <Check size={18} className="text-green-400" />
                        ) : (
                          <X size={18} className="text-red-400" />
                        )}
                      </div>
                    )}
                  </div>
                  <div className="relative group">
                    <button
                      onClick={handleEmailResume}
                      disabled={!isValidEmail || isEmailSending || resumeEmailStatus === 'success'}
                      className="px-6 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg font-medium transition-all flex items-center gap-2"
                    >
                      {resumeEmailStatus === 'success' ? (
                        <>
                          <Check size={16} />
                          Sent!
                        </>
                      ) : (
                        <>
                          <Mail size={16} />
                          {isEmailSending ? 'Sending...' : 'Send'}
                        </>
                      )}
                    </button>
                    {!isValidEmail && resumeEmail && !isEmailSending && resumeEmailStatus !== 'success' && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Please enter a valid email
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    )}
                  </div>
                </div>
                {resumeEmailStatus === 'error' && (
                  <p className="text-red-400 text-sm mt-2">Failed to send. Please check your email and try again.</p>
                )}
                {resumeEmailStatus === 'success' && (
                  <p className="text-green-400 text-sm mt-2">
                    ✓ Resume sent — check your inbox (and your Spam/Junk folder if you don’t see it).
                  </p>                
                )}
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
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={() => { setLightboxImage(null); setLightboxImages([]); }}>
          <button onClick={() => { setLightboxImage(null); setLightboxImages([]); }} className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors z-10">
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
                className="absolute left-4 text-white hover:bg-white/20 rounded-full p-3 transition-colors z-10"
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
                className="absolute right-4 text-white hover:bg-white/20 rounded-full p-3 transition-colors z-10"
              >
                <ChevronUp size={32} className="rotate-90" />
              </button>
            </>
          )}
          
          <img src={lightboxImage} alt="Project" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
          
          {lightboxImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black/50 px-4 py-2 rounded-full">
              {currentLightboxIndex + 1} / {lightboxImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}