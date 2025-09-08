import React, { useState, useEffect, useRef } from 'react';  
import { MenuIcon, XIcon, UserIcon } from './Icons';  
import { useAuth } from '../contexts/AuthContext';  

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (  
    <a href={href} onClick={onClick} className="text-gray-300 hover:text-white transition-colors duration-300 px-4 py-3 rounded-md text-base font-medium block relative group">  
        {children}  
        <span className="absolute bottom-0 left-4 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-[calc(100%-2rem)]"></span>  
    </a>  
);  

interface HeaderProps {  
    onNavigate: (page: 'home' | 'analyser' | 'profile' | 'settings') => void;  
    isApp: boolean;  
    onNavigateToLogin?: () => void;  
    onNavigateToSignup?: () => void;  
    onUpgradeClick?: () => void;  
}  

export default function Header({ onNavigate, isApp, onNavigateToLogin, onNavigateToSignup, onUpgradeClick }: HeaderProps) {  
    const [isScrolled, setIsScrolled] = useState(false);  
    const [isMenuOpen, setIsMenuOpen] = useState(false);  
    const { currentUser, logout } = useAuth();  
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);  
    const userMenuRef = useRef<HTMLDivElement>(null);  

    useEffect(() => {  
        const handleScroll = () => {  
            setIsScrolled(window.scrollY > 10);  
        };  
        window.addEventListener('scroll', handleScroll);  
        return () => window.removeEventListener('scroll', handleScroll);  
    }, []);  
      
    useEffect(() => {  
        const handleClickOutside = (event: MouseEvent) => {  
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {  
                setIsUserMenuOpen(false);  
            }  
        };  
          
        document.addEventListener("mousedown", handleClickOutside);  
        return () => {  
            document.removeEventListener("mousedown", handleClickOutside);  
        };  
    }, []);  

    const landingNavLinks = [  
        { href: "#features", text: "Features" },  
        { href: "#how-it-works", text: "How It Works" },  
        { href: "#why-us", text: "Why Us" },  
        { href: "#pricing", text: "Pricing" },  
        { href: "#contact", text: "Contact" },  
        { href: "/about", text: "About" },  
    ];  

    const appNavLinks: { text: string; page: 'home' | 'analyser' | 'profile' | 'settings' }[] = [  
        { text: "Home", page: "home" },  
        { text: "Analyser", page: "analyser" },  
        { text: "Profile", page: "profile" },  
        { text: "Settings", page: "settings" },  
    ];  
      
    const handleLogoClick = (e: React.MouseEvent) => {  
        e.preventDefault();  
        if (isApp) {  
            onNavigate('home');  
        } else {  
            window.scrollTo({ top: 0, behavior: 'smooth' });  
        }  
    }  

    const AppNavButton: React.FC<{ page: 'home' | 'analyser' | 'profile' | 'settings', children: React.ReactNode, isMobile?: boolean }> = ({ page, children, isMobile }) => (  
        <button   
            onClick={() => { onNavigate(page); if(isMobile) setIsMenuOpen(false); }}  
            className={`${isMobile ?   
                "w-full text-left block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-300" :   
                "text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium relative group"  
            }`}  
        >  
            {children}  
            {!isMobile && (  
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-cyan-400 transition-all duration-300 group-hover:w-full"></span>  
            )}  
        </button>  
    );  

    return (  
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-gray-900 bg-opacity-95 backdrop-blur-md shadow-xl' : 'bg-transparent'}`}>  
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">  
                <div className="flex items-center justify-between h-16">  
                    {/* Logo section with improved mobile styling */}
                    <div className="flex items-center flex-shrink-0">  
                        <a href="#" onClick={handleLogoClick} className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 md:gap-4">  
                          <img className="w-6 h-6 md:w-7 md:h-7" src="./favicon.png" alt="Job Ready AI Tool Logo" />  
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Job ready AI Tool</span>  
                            <span className="ml-1 hidden sm:inline">Genius</span>  
                        </a>  
                    </div>  
                      
                    {/* Desktop Navigation - unchanged */}  
                    <div className="hidden md:flex items-center">  
                        <div className="ml-10 flex items-baseline space-x-2">  
                           {isApp ? (  
                               appNavLinks.map(link => <AppNavButton key={link.page} page={link.page}>{link.text}</AppNavButton>)  
                           ) : (  
                               landingNavLinks.map(link => <NavLink key={link.href} href={link.href}>{link.text}</NavLink>)  
                           )}  
                        </div>  
                          
                        <div className="ml-6 flex items-center">  
                            {currentUser ? (  
                                <div className="flex items-center gap-4">  
                                    {currentUser.plan === 'Free' && isApp && onUpgradeClick && (  
                                        <button   
                                            onClick={onUpgradeClick}  
                                            className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-xs py-1.5 px-4 rounded-full hover:from-yellow-400 hover:to-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-md"  
                                        >  
                                            Upgrade  
                                        </button>  
                                    )}  
                                    <div className="relative" ref={userMenuRef}>  
                                        <button  
                                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}  
                                            className="flex items-center space-x-2 bg-gray-800 p-1 pr-3 rounded-full hover:bg-gray-700 transition-colors duration-300 border border-gray-700"  
                                        >  
                                            <div className="h-8 w-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">  
                                                <UserIcon className="h-5 w-5 text-white" />  
                                            </div>  
                                            <span className="text-sm font-medium text-white">{currentUser.name}</span>  
                                            <span className="text-xs bg-cyan-600 text-white font-bold px-2 py-1 rounded-full shadow-sm">{currentUser.tokens}</span>  
                                        </button>  
                                        {isUserMenuOpen && isApp && (  
                                            <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50 border border-gray-700">  
                                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">Profile</a>  
                                                <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('settings'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">Settings</a>  
                                                <div className="border-t border-gray-700 my-1"></div>  
                                                <a href="#" onClick={(e) => { e.preventDefault(); logout(); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors">Logout</a>  
                                            </div>  
                                        )}  
                                    </div>  
                                </div>  
                            ) : (  
                                <div className="flex items-center space-x-3 ml-4">  
                                    <button onClick={onNavigateToLogin} className="text-gray-300 hover:text-white transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium">Login</button>  
                                    <button onClick={onNavigateToSignup} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-2 px-4 rounded-md text-sm hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md">Sign Up</button>  
                                </div>  
                            )}  
                        </div>  
                    </div>  
                      
                    {/* Mobile menu section - completely redesigned */}  
                    <div className="md:hidden flex items-center">  
                        {/* Show CTA buttons on mobile for landing page when not logged in */}  
                        {!isApp && !currentUser && (  
                            <div className="flex items-center space-x-2 mr-3">  
                                <button onClick={onNavigateToLogin} className="text-gray-300 hover:text-white transition-colors duration-300 px-2 py-1 rounded text-sm font-medium">  
                                    Login  
                                </button>  
                                <button onClick={onNavigateToSignup} className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold py-1.5 px-3 rounded text-xs hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md">  
                                    Sign Up  
                                </button>  
                            </div>  
                        )}  
                          
                        {currentUser && isApp && onUpgradeClick && currentUser.plan === 'Free' && (  
                            <button   
                                onClick={onUpgradeClick}  
                                className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold text-xs py-1.5 px-3 rounded-full mr-3 shadow-md"  
                            >  
                                Upgrade  
                            </button>  
                        )}  
                          
                        {/* Mobile menu button with improved styling */}  
                        <button   
                            onClick={() => setIsMenuOpen(!isMenuOpen)}   
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-cyan-500 transition-colors duration-300"  
                            aria-expanded="false"  
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
              
            {/* Mobile menu - redesigned with better animations */}  
            <div className={`md:hidden bg-gray-900 shadow-xl border-t border-gray-800 transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>  
                <div className="px-2 pt-2 pb-3 space-y-1">  
                    {isApp ? (  
                        appNavLinks.map(link => <AppNavButton key={link.page} page={link.page} isMobile>{link.text}</AppNavButton>)  
                    ) : (  
                        landingNavLinks.map(link => <NavLink key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>{link.text}</NavLink>)  
                    )}  
                       
                    {currentUser ? (  
                        <div className="mt-4 pt-4 border-t border-gray-800 px-2 space-y-2">  
                            <div className="flex items-center px-4 py-3">  
                                <div className="h-10 w-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center shadow-md mr-3">  
                                    <UserIcon className="h-6 w-6 text-white" />  
                                </div>  
                                <div className="text-sm">  
                                    <p className="font-medium text-white">{currentUser.name}</p>  
                                    <p className="text-cyan-400 font-bold">{currentUser.tokens} Tokens</p>  
                                </div>  
                            </div>  
                            { isApp && <AppNavButton page="profile" isMobile>Profile</AppNavButton> }  
                            { isApp && <AppNavButton page="settings" isMobile>Settings</AppNavButton> }  
                            <button   
                                onClick={() => { logout(); setIsMenuOpen(false); }}   
                                className="w-full text-left block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-300"  
                            >  
                                Logout  
                            </button>  
                        </div>  
                    ) : (  
                         <div className="mt-4 pt-4 border-t border-gray-800 px-2 space-y-2">  
                            <button   
                                onClick={() => { if(onNavigateToLogin) onNavigateToLogin(); setIsMenuOpen(false); }}   
                                className="w-full text-left block px-4 py-3 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors duration-300"  
                            >  
                                Login  
                            </button>  
                            <button   
                                onClick={() => { if(onNavigateToSignup) onNavigateToSignup(); setIsMenuOpen(false); }}   
                                className="w-full text-center block px-4 py-3 rounded-md text-base font-medium text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md"  
                            >  
                                Sign Up  
                            </button>  
                        </div>  
                    )}  
                </div>  
            </div>  
        </header>  
    );  
}