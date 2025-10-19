import React from 'react';
import { Mail, Check, X, Loader2 } from 'lucide-react';

export default function Contact({ contactForm, setContactForm, formErrors, formSubmitStatus, handleContactSubmit, isSubmitting }) {
  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const containsSwearWord = (message) => {
    const swearWords = [
      'fuck', 'shit', 'bitch', 'ass', 'dick', 'piss', 'cunt', 
      'fag', 'faggot', 'motherfucker', 'cock', 'dong', 'wanker',
      'twat', 'bastard', 'fucker', 'slut', 'arse', 'bollocks', 
      'bugger', 'prick', 'shag', 'fuckoff', 'fuckface', 'fuckwit',
      'fucking', 'spastic', 'moron', 'idiot', 'tard', 'imbecile',
      'twathead', 'jerk', 'dickhead', 'douchebag', 'douche', 
      'penis', 'bloody', 'fanny'
    ];

    // \b ensures it matches a "whole word" only
    const regex = new RegExp(`\\b(${swearWords.join('|')})\\b`, 'i');
    return regex.test(message);
  };

  const messageLength = contactForm.message.length;
  const hasSwearWord = containsSwearWord(contactForm.message);
  const isValidMessage = messageLength >= 10 && messageLength <= 500 && !hasSwearWord;

  const requiredFieldsValid = 
    contactForm.firstName && 
    contactForm.lastName && 
    isValidEmail(contactForm.email) && 
    isValidMessage;
  
  const completionPercent = [
    contactForm.firstName, 
    contactForm.lastName, 
    isValidEmail(contactForm.email), 
    isValidMessage
  ].filter(Boolean).length * 25;

  const getNiceMessage = () => {
    // Nice messages generated using AI models if you're stalking my repo
    const niceMessages = [
      "maybe we shouldn't say that",
      "oh you thought you'd put a swear word in here haha nice try",
      "hey don't you think you're being a little too casual with that email?",
      "whoa slow down with the swearing, we're trying to be professional here",
      "you're not trying to be funny are you?",
      "I hope you didn't just swear in your email, that's not very professional",
      "I bet you're not telling the truth, you're probably just trying to curse me out",
      "you're just trying to be funny, aren't you?",
      "I bet you're trying to confuse me with that swear word",
      "haha, you're trying to put a swear word in there, nice try",
      "you're not being very professional with that swear word",
      "I bet you're trying to make me laugh",
      "you're just trying to get me to laugh, aren't you?",
      "I hope you didn't just swear in your email",
      "you're just trying to confuse me with that swear word"
    ];
    return niceMessages[Math.floor(Math.random() * niceMessages.length)];

  }

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 text-center text-white">Send me an Email</h2>
        <p className="text-center text-gray-400 mb-4 sm:mb-6 text-base sm:text-lg px-4">Please complete the form below to send me an email</p>
        
        <div className="mb-6 sm:mb-8">
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{width: `${completionPercent}%`}}
            ></div>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
          {formSubmitStatus === 'success' && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 sm:p-5 flex items-start sm:items-center gap-3">
              <Check className="text-green-400 flex-shrink-0 mt-0.5 sm:mt-0" size={20} />
              <p className="text-green-400 font-medium text-sm sm:text-base leading-relaxed">Message sent successfully! I will get back to you soon.</p>
            </div>
          )}
          {formSubmitStatus === 'error' && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 sm:p-5 flex items-start gap-3">
              <X className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-red-400 font-medium text-sm sm:text-base leading-relaxed break-words">{formErrors.submit || 'Failed to send message. Please try again.'}</p>
                {Object.keys(formErrors).length > 1 && (
                  <ul className="mt-2 space-y-1 text-xs sm:text-sm text-red-300">
                    {Object.entries(formErrors).map(([field, error]) => 
                      field !== 'submit' && <li key={field} className="break-words">• {error}</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            <div className="relative">
              <input
                type="text"
                placeholder="First Name *"
                value={contactForm.firstName}
                onChange={(e) => setContactForm({...contactForm, firstName: e.target.value})}
                disabled={isSubmitting}
                className={`w-full bg-white/5 border ${formErrors.firstName ? 'border-red-500' : contactForm.firstName ? 'border-green-500' : 'border-white/10'} rounded-lg px-4 py-3.5 sm:py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors`}
              />
              {contactForm.firstName && !formErrors.firstName && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
              {formErrors.firstName && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={20} />}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Last Name *"
                value={contactForm.lastName}
                onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                disabled={isSubmitting}
                className={`w-full bg-white/5 border ${formErrors.lastName ? 'border-red-500' : contactForm.lastName ? 'border-green-500' : 'border-white/10'} rounded-lg px-4 py-3.5 sm:py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors`}
              />
              {contactForm.lastName && !formErrors.lastName && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
              {formErrors.lastName && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={20} />}
            </div>
          </div>
          
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address *"
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              disabled={isSubmitting}
              className={`w-full bg-white/5 border ${formErrors.email ? 'border-red-500' : isValidEmail(contactForm.email) ? 'border-green-500' : 'border-white/10'} rounded-lg px-4 py-3.5 sm:py-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors`}
            />
            {isValidEmail(contactForm.email) && !formErrors.email && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500" size={20} />}
            {formErrors.email && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500" size={20} />}
          </div>
          
          <input
            type="text"
            placeholder="Company or Organization (optional)"
            value={contactForm.company}
            onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
            disabled={isSubmitting}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors"
          />
          
          <div className="relative">
            <textarea
              placeholder="Message *"
              value={contactForm.message}
              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              disabled={isSubmitting}
              rows={5}
              className={`w-full bg-white/5 border ${
                messageLength === 0 
                  ? 'border-white/10'
                  : hasSwearWord
                  ? 'border-red-500'
                  : isValidMessage 
                  ? 'border-green-500' 
                  : 'border-red-500'
              } rounded-lg px-4 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors leading-relaxed`}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-3">
              <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                {messageLength > 0 && (
                  <>
                    {hasSwearWord ? (
                      <>
                        <X className="text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
                        <span className="text-xs sm:text-sm font-medium text-red-400 break-words">
                          {getNiceMessage()}
                        </span>
                      </>
                    ) : isValidMessage ? (
                      <>
                        <Check className="text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
                        <span className="text-xs sm:text-sm font-medium text-green-400">Valid message</span>
                      </>
                    ) : (
                      <>
                        <X className="text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
                        <span className="text-xs sm:text-sm font-medium text-red-400 break-words">
                          {messageLength < 10 ? `${10 - messageLength} more characters needed` : messageLength > 500 ? 'Message too long' : 'Valid message'}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              <span className={`text-xs sm:text-sm flex-shrink-0 ${messageLength > 500 ? 'text-red-400' : 'text-gray-500'} font-medium`}>
                {messageLength} / 500
              </span>
            </div>
          </div>
          
          <button
            onClick={handleContactSubmit}
            disabled={!requiredFieldsValid || isSubmitting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed rounded-lg py-4 sm:py-5 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={22} className="animate-spin" />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Mail size={22} />
                <span>Send Message</span>
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}