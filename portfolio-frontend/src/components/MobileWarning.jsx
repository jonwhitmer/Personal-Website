import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

export default function MobileWarning() {
  const [showWarning, setShowWarning] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      const isSmallScreen = window.innerWidth < 1024;
      return isMobileDevice || isSmallScreen;
    };

    const dismissed = localStorage.getItem('mobileWarningDismissed') === 'true';

    if (checkIfMobile()) {
      setIsMobile(true);
      if (!dismissed) {
        setShowWarning(true);
      }
    }

    const handleResize = () => {
      const isMobileNow = checkIfMobile();
      setIsMobile(isMobileNow);
      if (isMobileNow && !dismissed) {
        setShowWarning(true);
      } else if (!isMobileNow) {
        setShowWarning(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleClose = () => {
    setShowWarning(false);
    localStorage.setItem('mobileWarningDismissed', 'true');
  };

  if (!showWarning) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-yellow-600 to-amber-600 border-b-2 border-amber-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <div className="flex items-start gap-3 flex-1">
          <AlertCircle className="text-white flex-shrink-0 mt-0.5" size={24} />
          <div className="flex-1">
            <h3 className="text-white font-bold text-base md:text-lg">
              Website in Beta on Mobile
            </h3>
            <p className="text-amber-50 text-sm md:text-base">
              This website's responsive design is still under development. For the best experience, please view on a desktop monitor or laptop.
            </p>
          </div>
        </div>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-white hover:bg-white/20 rounded-lg p-2 transition-all"
          aria-label="Close warning"
        >
          <X size={24} />
        </button>
      </div>
    </div>
  );
}
