import React from 'react';
import { Mail, Check, X, Loader2, Copy } from 'lucide-react';

// The direct address is assembled at runtime and only ever reaches the DOM as
// the href of a mailto: link. It is never rendered as text, and never put in a
// title, alt, aria-label, placeholder or tooltip, so the scrapers that harvest
// visible addresses off a page find nothing here. The visible label is words.
const DIRECT_MAIL_HREF = [
  'mailto:',
  ['jonwhitmer23', ['gmail', 'com'].join('.')].join('@'),
  '?subject=',
  encodeURIComponent('Hello from your portfolio'),
].join('');

// The same address the mailto: href is built from, kept out of the markup.
const DIRECT_ADDRESS = ['jonwhitmer23', ['gmail', 'com'].join('.')].join('@');
const DIRECT_SUBJECT = 'Hello from your portfolio';

// A bare mailto: only works if the visitor's machine has a default mail client
// registered. On a Windows box with none set up it opens an empty browser tab
// and looks broken, which is exactly what happened here. So the two webmail
// clients most people actually use get their own buttons, each opening a
// compose window already addressed. None of these render the address as text.
const WEBMAIL = [
  {
    id: 'gmail',
    label: 'Gmail',
    href:
      'https://mail.google.com/mail/?view=cm&fs=1' +
      `&to=${encodeURIComponent(DIRECT_ADDRESS)}` +
      `&su=${encodeURIComponent(DIRECT_SUBJECT)}`,
  },
  {
    id: 'outlook',
    label: 'Outlook',
    // The consumer deeplink. Work/school accounts land on outlook.office.com,
    // but Microsoft redirects this one to the right host once you are signed in.
    href:
      'https://outlook.live.com/mail/0/deeplink/compose' +
      `?to=${encodeURIComponent(DIRECT_ADDRESS)}` +
      `&subject=${encodeURIComponent(DIRECT_SUBJECT)}`,
  },
];

export default function Contact({ contactForm, setContactForm, formErrors, formSubmitStatus, handleContactSubmit, isSubmitting }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(DIRECT_ADDRESS);
    } catch {
      // Clipboard access can be refused (an insecure origin, or a browser that
      // wants a permission first). Fall back to the old execCommand route via a
      // throwaway offscreen input so the button still does something useful
      // rather than silently failing.
      const scratch = document.createElement('input');
      scratch.value = DIRECT_ADDRESS;
      scratch.setAttribute('aria-hidden', 'true');
      scratch.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
      document.body.appendChild(scratch);
      scratch.select();
      try { document.execCommand('copy'); } catch { /* nothing more to try */ }
      document.body.removeChild(scratch);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 4000);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // This list used to include `dong`, `fanny`, `bloody`, `idiot`, `moron`,
  // `jerk`, `prick`, `bugger` and `shag`, and a match DISABLED the send button.
  //
  // That is a real hole, not a hypothetical one. "Dong" and "Fanny" are ordinary
  // surnames and given names, and `bloody` is everyday British English. A
  // recruiter writing "Hi Jon, this is Amy Dong from talent acquisition" had her
  // message silently blocked and was told "you're not trying to be funny are
  // you?" with no explanation and no way to send. A portfolio contact form that
  // refuses mail from someone because of their name is worse than having no
  // filter at all.
  //
  // What is left is unambiguous obscenity only, and it no longer BLOCKS: it
  // warns, and the message still sends. Jon can decide what to do with it when
  // it arrives; the form's job is to deliver it.
  const containsSwearWord = (message) => {
    const swearWords = [
      'fuck', 'fucking', 'fucker', 'motherfucker', 'fuckoff', 'fuckface', 'fuckwit',
      'shit', 'bitch', 'cunt', 'twat', 'wanker', 'faggot', 'slut',
    ];
    // \b ensures it matches a "whole word" only
    const regex = new RegExp(`\\b(${swearWords.join('|')})\\b`, 'i');
    return regex.test(message);
  };

  const messageLength = contactForm.message.length;
  const hasSwearWord = containsSwearWord(contactForm.message);
  // `hasSwearWord` deliberately does NOT gate validity any more. A message can
  // be rude and still be a message Jon wants delivered.
  const isValidMessage = messageLength >= 10 && messageLength <= 500;

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

  // Picked ONCE, the first time a flagged word appears, and held until it goes
  // away. It used to call Math.random() during render, so React re-rolled it on
  // every keystroke: typing five characters produced five different messages,
  // which reads as the page malfunctioning rather than as a joke.
  const [quipSeed, setQuipSeed] = React.useState(null);
  React.useEffect(() => {
    if (hasSwearWord) setQuipSeed((prev) => (prev === null ? Math.random() : prev));
    else setQuipSeed(null);
  }, [hasSwearWord]);

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
    if (quipSeed === null) return niceMessages[0];
    return niceMessages[Math.floor(quipSeed * niceMessages.length)];
  }

  return (
    <section id="contact" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
      {/* max-w-6xl, not max-w-3xl. Every other section on the page opens on the
          same left edge with the same icon-plus-heading pair; this one used to
          be a narrower centred column, so scrolling into it broke the rhythm.
          The heading now lines up with Experience, Education, Projects and the
          rest, and only the form itself keeps a narrower measure, because full
          1152px-wide text inputs are horrible to fill in. */}
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 flex items-center gap-3 text-slate-900 dark:text-white">
          <Mail className="text-blue-700 dark:text-blue-400 w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 flex-shrink-0" />
          <span>Send me an Email</span>
        </h2>
        {/* Settles at 16px rather than growing to 18. This is a sentence of
            running copy, and 18px running copy is the thing that made the page
            feel zoomed in. */}
        <p className="text-slate-600 dark:text-gray-400 mb-5 sm:mb-6 lg:mb-8 text-base">Fill in the form below and your message lands straight in my inbox.</p>

        {/* Full width, like every other section's card. Capping this at
            max-w-3xl left it ending 384px short of the right edge that
            Experience, Education, Projects and Skills all share, so scrolling
            into Contact looked like the layout had broken. The fields inside
            keep their own comfortable measure instead. */}
        <div className="mb-6 sm:mb-8">
          <div className="h-2 bg-slate-900/[0.06] dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 transition-all duration-300"
              style={{width: `${completionPercent}%`}}
            ></div>
          </div>
        </div>

        <div className="bg-slate-900/[0.04] dark:bg-white/5 backdrop-blur-sm border border-slate-900/10 dark:border-white/10 rounded-xl sm:rounded-2xl p-5 sm:p-8 lg:p-10 space-y-5 sm:space-y-6">
          {formSubmitStatus === 'success' && (
            <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 sm:p-5 flex items-start sm:items-center gap-3">
              <Check className="text-green-700 dark:text-green-400 flex-shrink-0 mt-0.5 sm:mt-0" size={20} />
              <p className="text-green-700 dark:text-green-400 font-medium text-sm sm:text-base leading-relaxed">Message sent successfully! I will get back to you soon.</p>
            </div>
          )}
          {formSubmitStatus === 'error' && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4 sm:p-5 flex items-start gap-3">
              <X className="text-red-700 dark:text-red-400 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1 min-w-0">
                <p className="text-red-700 dark:text-red-400 font-medium text-sm sm:text-base leading-relaxed break-words">{formErrors.submit || 'Failed to send message. Please try again.'}</p>
                {Object.keys(formErrors).length > 1 && (
                  <ul className="mt-2 space-y-1 text-sm text-red-700 dark:text-red-300">
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
                className={`w-full bg-slate-900/[0.04] dark:bg-white/5 border ${formErrors.firstName ? 'border-red-500' : contactForm.firstName ? 'border-green-500' : 'border-slate-900/10 dark:border-white/10'} rounded-lg px-4 py-3.5 sm:py-4 pr-[3rem] focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors`}
              />
              {contactForm.firstName && !formErrors.firstName && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-500" size={20} />}
              {formErrors.firstName && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-500" size={20} />}
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Last Name *"
                value={contactForm.lastName}
                onChange={(e) => setContactForm({...contactForm, lastName: e.target.value})}
                disabled={isSubmitting}
                className={`w-full bg-slate-900/[0.04] dark:bg-white/5 border ${formErrors.lastName ? 'border-red-500' : contactForm.lastName ? 'border-green-500' : 'border-slate-900/10 dark:border-white/10'} rounded-lg px-4 py-3.5 sm:py-4 pr-[3rem] focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors`}
              />
              {contactForm.lastName && !formErrors.lastName && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-500" size={20} />}
              {formErrors.lastName && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-500" size={20} />}
            </div>
          </div>
          
          <div className="relative">
            <input
              type="email"
              placeholder="Email Address *"
              value={contactForm.email}
              onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
              disabled={isSubmitting}
              className={`w-full bg-slate-900/[0.04] dark:bg-white/5 border ${formErrors.email ? 'border-red-500' : isValidEmail(contactForm.email) ? 'border-green-500' : 'border-slate-900/10 dark:border-white/10'} rounded-lg px-4 py-3.5 sm:py-4 pr-[3rem] focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors`}
            />
            {isValidEmail(contactForm.email) && !formErrors.email && <Check className="absolute right-3 top-1/2 -translate-y-1/2 text-green-600 dark:text-green-500" size={20} />}
            {formErrors.email && <X className="absolute right-3 top-1/2 -translate-y-1/2 text-red-600 dark:text-red-500" size={20} />}
          </div>
          
          {/* The placeholder is short on purpose. "Company or Organization
              (optional)" is wider than the field at 390px, so the browser
              clipped it mid-word and the hint stopped being a hint. */}
          <input
            type="text"
            placeholder="Company (optional)"
            value={contactForm.company}
            onChange={(e) => setContactForm({...contactForm, company: e.target.value})}
            disabled={isSubmitting}
            className="w-full bg-slate-900/[0.04] dark:bg-white/5 border border-slate-900/10 dark:border-white/10 rounded-lg px-4 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors"
          />
          
          <div className="relative">
            <textarea
              placeholder="Message *"
              value={contactForm.message}
              onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
              disabled={isSubmitting}
              rows={5}
              className={`w-full bg-slate-900/[0.04] dark:bg-white/5 border ${
                messageLength === 0 
                  ? 'border-slate-900/10 dark:border-white/10'
                  : hasSwearWord
                  ? 'border-red-500'
                  : isValidMessage 
                  ? 'border-green-500' 
                  : 'border-red-500'
              } rounded-lg px-4 py-3.5 sm:py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 resize-none disabled:opacity-50 disabled:cursor-not-allowed text-base transition-colors leading-relaxed`}
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mt-3">
              <div className="flex items-start sm:items-center gap-2 min-w-0 flex-1">
                {messageLength > 0 && (
                  <>
                    {hasSwearWord ? (
                      <>
                        <X className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400 break-words">
                          {getNiceMessage()}
                        </span>
                      </>
                    ) : isValidMessage ? (
                      <>
                        <Check className="text-green-600 dark:text-green-500 flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
                        <span className="text-sm font-medium text-green-700 dark:text-green-400">Valid message</span>
                      </>
                    ) : (
                      <>
                        <X className="text-red-600 dark:text-red-500 flex-shrink-0 mt-0.5 sm:mt-0" size={18} />
                        <span className="text-sm font-medium text-red-700 dark:text-red-400 break-words">
                          {messageLength < 10 ? `${10 - messageLength} more characters needed` : messageLength > 500 ? 'Message too long' : 'Valid message'}
                        </span>
                      </>
                    )}
                  </>
                )}
              </div>
              <span className={`text-sm flex-shrink-0 ${messageLength > 500 ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-gray-500'} font-medium`}>
                {messageLength} / 500
              </span>
            </div>
          </div>
          
          <button
            onClick={handleContactSubmit}
            disabled={!requiredFieldsValid || isSubmitting}
            className="w-full text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:from-slate-500 dark:disabled:from-gray-700 disabled:to-slate-600 dark:disabled:to-gray-800 disabled:cursor-not-allowed rounded-lg py-4 sm:py-5 font-semibold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-base sm:text-lg active:scale-[0.98]"
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

          {/* The way out for anyone who would rather use their own mail app than
              fill in a form. */}
          <div>
            <div className="flex items-center gap-3" aria-hidden="true">
              <span className="h-px flex-1 bg-slate-900/10 dark:bg-white/10"></span>
              <span className="text-sm font-medium text-slate-500 dark:text-gray-500">or</span>
              <span className="h-px flex-1 bg-slate-900/10 dark:bg-white/10"></span>
            </div>

            {/* TWO ways out, not one. A bare mailto: link is only useful if the
                visitor's machine has a default mail application registered, and
                plenty do not: on Windows with no mail client set up, clicking it
                opens an empty browser tab and looks broken. That is exactly what
                happened here. Copying the address always works, and it still
                never renders the address as text on the page. */}
            <div className="mt-4 sm:mt-5 grid sm:grid-cols-3 gap-3">
              {WEBMAIL.map(({ id, label, href }) => (
                <a
                  key={id}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-h-[44px] rounded-lg border border-slate-900/15 dark:border-white/15 bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 py-4 px-4 font-semibold text-slate-800 dark:text-gray-100 transition-colors flex items-center justify-center gap-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.99]"
                >
                  <Mail size={20} className="flex-shrink-0" />
                  <span>{label}</span>
                </a>
              ))}

              <button
                type="button"
                data-copy-email
                onClick={handleCopyEmail}
                className="min-h-[44px] rounded-lg border border-slate-900/15 dark:border-white/15 bg-slate-900/[0.04] dark:bg-white/5 hover:bg-slate-900/[0.08] dark:hover:bg-white/10 py-4 px-4 font-semibold text-slate-800 dark:text-gray-100 transition-colors flex items-center justify-center gap-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 active:scale-[0.99]"
              >
                {copied ? (
                  <>
                    <Check size={20} className="flex-shrink-0 text-green-600 dark:text-green-400" />
                    <span>Address copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={20} className="flex-shrink-0" />
                    <span>Copy my address</span>
                  </>
                )}
              </button>
            </div>

            {/* One reserved line so confirming the copy never shifts the page. */}
            <p className="mt-3 text-center text-sm text-slate-600 dark:text-gray-400 leading-relaxed min-h-[1.25rem]" aria-live="polite">
              {/* The mailto: fallback is gone entirely. It only works if the
                  visitor has a desktop mail client registered, and when they do
                  not it opens a blank tab and looks broken. Gmail, Outlook and
                  copy cover everyone without that failure mode. */}
              {copied
                ? 'Copied. Paste it into whichever mail app you use.'
                : 'Opens a new message already addressed to me.'}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}