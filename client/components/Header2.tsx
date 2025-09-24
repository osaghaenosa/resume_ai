import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MenuIcon, XIcon } from './Icons';
import logo from '/favicon.png'; // ✅ safer import for images in Vite/React projects

export default function Header({ children }: { children?: React.ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ Detect scroll position for header background change
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // ✅ Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Auto-close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const appNavLinks = [
    { to: '/', text: 'Home' },
    { to: '/about', text: 'About' },
    { to: '#policy', text: 'Policy' },
    { to: '#help', text: 'Help' },
    { to: '#contact', text: 'Contact Us' },
  ];

  const handleLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    navigate('/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigation = (to: string) => {
    if (to.startsWith('#')) {
      const element = document.querySelector(to);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(to);
    }
  };

  const AppNavButton: React.FC<{ to: string; children: React.ReactNode; isMobile?: boolean }> = React.memo(
    ({ to, children, isMobile }) => {
      const isActive = location.pathname === to;

      return (
        <button
          aria-current={isActive ? 'page' : undefined}
          onClick={() => handleNavigation(to)}
          className={`${
            isMobile
              ? `w-full text-left block px-4 py-3 rounded-md text-base font-medium ${
                  isActive ? 'text-white bg-gray-800' : 'text-gray-300'
                } hover:text-white hover:bg-gray-800 transition-colors duration-300`
              : `text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium relative group ${
                  isActive ? 'text-white' : ''
                }`
          }`}
        >
          {children}
          {!isMobile && (
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>
          )}
        </button>
      );
    }
  );

  return (
    <>
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-gray-900 bg-opacity-95 backdrop-blur-md shadow-xl' : 'bg-transparent'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <div className="flex items-center flex-shrink-0">
            <a
              href="/"
              onClick={handleLogoClick}
              className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-4"
            >
              <img className="w-6 h-6 md:w-7 md:h-7" src={logo} alt="Job Ready AI Tool Logo" />
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Job Ready AI Tool
              </span>
            </a>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center">
            <div className="ml-10 flex items-baseline space-x-2">
              {appNavLinks.map((link) => (
                <AppNavButton key={link.to} to={link.to}>
                  {link.text}
                </AppNavButton>
              ))}
            </div>

            <div className="ml-6 flex items-center space-x-3 ml-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md"
              >
                Sign Up
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {/* CTA Buttons for Mobile */}
            <div className="flex items-center space-x-2 mr-3">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-300 hover:text-white transition-colors duration-300 px-2 py-1 rounded text-sm font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-1.5 px-3 rounded text-xs hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md"
              >
                Sign Up
              </button>
            </div>

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 transition-colors duration-300"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <XIcon className="h-6 w-6 transform transition-transform duration-300 rotate-90" />
              ) : (
                <MenuIcon className="h-6 w-6 transform transition-transform duration-300" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden bg-gray-900 shadow-xl border-t border-gray-800 transition-all duration-300 ease-in-out ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
      >
        <div className="px-2 pt-2 pb-3 space-y-1">
          {appNavLinks.map((link) => (
            <AppNavButton key={link.to} to={link.to} isMobile>
              {link.text}
            </AppNavButton>
          ))}

          <div className="mt-4 pt-4 border-t border-gray-800 px-2 space-y-2">
            <button
              onClick={() => navigate('/login')}
              className="w-full text-left block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-300"
            >
              Login
            </button>
            <button
              onClick={() => navigate('/signup')}
              className="w-full text-center block px-4 py-3 rounded-md text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md"
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </header>
    {children}
    </>
  );
}
