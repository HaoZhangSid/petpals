import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
// import Header from './Header'; // Remove Header import
import { Toaster, toast } from 'react-hot-toast';
import { useState, useEffect } from 'react';

const MainLayout: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const location = useLocation();

  // Handle window resize
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768; // Tailwind's md breakpoint

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="flex min-h-screen bg-cream overflow-x-hidden">
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} toggleMobileMenu={toggleMobileMenu} />
      
      {/* Adjust main content margin based on sidebar state */}
      <main className={`flex-1 transition-all duration-300 overflow-y-auto ${isMobile ? 'pt-0' : 'ml-64'}`}>
        {/* Mobile header - Placeholder for potential future header */}
        {isMobile && (
           <div className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md p-4 flex justify-between items-center lg:hidden">
             <button onClick={toggleMobileMenu}> {/* Hamburger icon or similar */}
               <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" /></svg>
             </button>
             {/* Optional: Mobile Title/Logo */}
             <span className="font-semibold">MatchMe</span>
           </div>
        )}

        {/* Add padding top for mobile to account for fixed header */} 
        <div className={`${isMobile ? 'pt-16' : 'pt-0'} p-4 sm:p-6`}>
           <Outlet key={location.pathname} />
        </div>
      </main>

      {/* Toaster component added here */}
      <Toaster 
        position="top-center" 
        reverseOrder={false}
        toastOptions={{
          // Default options
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
            fontSize: '14px',
          },
          // Success specific options
          success: {
            duration: 3000,
            style: {
              background: 'rgb(168 85 247)', // Purple-500
              color: 'white',
            },
            iconTheme: {
              primary: 'white',
              secondary: 'rgb(168 85 247)', // Purple-500
            },
          },
          // Error specific options
          error: {
            duration: 4000,
            style: {
              background: 'rgb(239 68 68)', // Red-500
              color: 'white',
            },
             iconTheme: {
              primary: 'white',
              secondary: 'rgb(239 68 68)', // Red-500
            },
          },
        }}
      />
    </div>
  );
};

export default MainLayout;