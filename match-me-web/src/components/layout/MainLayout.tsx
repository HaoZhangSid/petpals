import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useState, useEffect } from 'react';

const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  // Track window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      // Auto-close mobile menu when resizing to desktop
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const isMobile = windowWidth < 768;

  return (
    <div className="flex min-h-screen bg-cream overflow-x-hidden">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
      
      <main className={`flex-1 transition-all duration-300 overflow-x-hidden ${isMobile ? 'ml-0 pt-14' : 'ml-64'}`}>
        {/* Mobile header - Fixed position */}
        {isMobile && (
          <div className="fixed top-0 left-0 right-0 h-14 bg-white z-20 shadow-sm flex items-center px-4">
            <button 
              onClick={toggleMobileMenu}
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
            {/* <h1 className="text-lg font-semibold text-center flex-1">Match Me</h1> */}
          </div>
        )}
        <Outlet key={location.pathname} />
      </main>
    </div>
  );
};

export default MainLayout;