
import React, { useState, useEffect } from 'react';
import { MenuIcon, XIcon, UserIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

const NavLink: React.FC<{ href: string; children: React.ReactNode; onClick?: () => void }> = ({ href, children, onClick }) => (
    <a href={href} onClick={onClick} className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium">
        {children}
    </a>
);

interface HeaderProps {
    onNavigate: (page: 'home' | 'profile' | 'settings') => void;
    isApp: boolean;
    onNavigateToLogin?: () => void;
    onNavigateToSignup?: () => void;
}

export default function Header({ onNavigate, isApp, onNavigateToLogin, onNavigateToSignup }: HeaderProps) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { currentUser, logout } = useAuth();
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isUserMenuOpen && !(event.target as HTMLElement).closest('#user-menu-button-container')) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const landingNavLinks = [
        { href: "#features", text: "Features" },
        { href: "#how-it-works", text: "How It Works" },
        { href: "#why-us", text: "Why Us" },
        { href: "#pricing", text: "Pricing" },
        { href: "#contact", text: "Contact" },
    ];

    const appNavLinks: { text: string; page: 'home' | 'profile' | 'settings' }[] = [
        { text: "Home", page: "home" },
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

    const AppNavButton: React.FC<{ page: 'home' | 'profile' | 'settings', children: React.ReactNode, isMobile?: boolean }> = ({ page, children, isMobile }) => (
        <button 
            onClick={() => { onNavigate(page); if(isMobile) setIsMenuOpen(false); }}
            className={isMobile ? "w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700" : "text-gray-300 hover:text-cyan-400 transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium"}
        >
            {children}
        </button>
    );

    return (
        <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-opacity-90 bg-[#0B1120] backdrop-blur-lg shadow-lg' : 'bg-transparent'}`}>
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <a href="#" onClick={handleLogoClick} className="text-xl font-bold text-white flex items-center">
                           <span className="text-cyan-400">AI</span>ResumeGen
                        </a>
                    </div>
                    <div className="hidden md:flex items-center">
                        <div className="ml-10 flex items-baseline space-x-4">
                           {isApp ? (
                               appNavLinks.map(link => <AppNavButton key={link.page} page={link.page}>{link.text}</AppNavButton>)
                           ) : (
                               landingNavLinks.map(link => <NavLink key={link.href} href={link.href}>{link.text}</NavLink>)
                           )}
                        </div>
                        
                        <div className="ml-6 flex items-center">
                            {currentUser ? (
                                <div className="relative" id="user-menu-button-container">
                                    <button
                                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                                        className="flex items-center space-x-2 bg-gray-800 p-1 pr-3 rounded-full hover:bg-gray-700 transition-colors"
                                    >
                                        <div className="h-7 w-7 bg-gray-600 rounded-full flex items-center justify-center">
                                            <UserIcon className="h-5 w-5 text-white" />
                                        </div>
                                        <span className="text-sm font-semibold">{currentUser.name}</span>
                                        <span className="text-xs bg-cyan-500 text-white font-bold px-2 py-0.5 rounded-full">{currentUser.tokens}</span>
                                    </button>
                                    {isUserMenuOpen && isApp && (
                                        <div className="absolute right-0 mt-2 w-48 bg-[#111827] rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 z-50">
                                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('profile'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Profile</a>
                                            <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('settings'); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700">Settings</a>
                                            <a href="#" onClick={(e) => { e.preventDefault(); logout(); setIsUserMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 w-full text-left">Logout</a>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="flex items-center space-x-2">
                                    <button onClick={onNavigateToLogin} className="text-gray-300 hover:text-cyan-400 transition-colors duration-300 px-3 py-2 rounded-md text-sm font-medium">Login</button>
                                    <button onClick={onNavigateToSignup} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-md text-sm hover:bg-cyan-400 transition-colors duration-300">Sign Up</button>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white">
                            <span className="sr-only">Open main menu</span>
                            {isMenuOpen ? <XIcon /> : <MenuIcon />}
                        </button>
                    </div>
                </div>
            </nav>
            {isMenuOpen && (
                <div className="md:hidden">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-[#111827]">
                        {isApp ? (
                            appNavLinks.map(link => <AppNavButton key={link.page} page={link.page} isMobile>{link.text}</AppNavButton>)
                        ) : (
                            landingNavLinks.map(link => <NavLink key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>{link.text}</NavLink>)
                        )}
                         
                        {currentUser ? (
                            <div className="mt-4 pt-4 border-t border-gray-700 px-2 space-y-2">
                                <div className="text-sm text-gray-300 text-center mb-2">
                                    <p><span className="font-semibold">{currentUser.name}</span></p>
                                    <p><span className="text-cyan-400 font-bold">{currentUser.tokens}</span> Tokens Left</p>
                                </div>
                                { isApp && <AppNavButton page="profile" isMobile>Profile</AppNavButton> }
                                { isApp && <AppNavButton page="settings" isMobile>Settings</AppNavButton> }
                                <button onClick={() => { logout(); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Logout</button>
                            </div>
                        ) : (
                             <div className="mt-4 pt-4 border-t border-gray-700 px-2 space-y-2">
                                <button onClick={() => { if(onNavigateToLogin) onNavigateToLogin(); setIsMenuOpen(false); }} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700">Login</button>
                                <button onClick={() => { if(onNavigateToSignup) onNavigateToSignup(); setIsMenuOpen(false); }} className="w-full text-center block px-3 py-2 rounded-md text-base font-medium text-white bg-cyan-500 hover:bg-cyan-400">Sign Up</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
