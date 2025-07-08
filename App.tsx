
import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import WhyUs from './components/WhyUs';
import Testimonials from './components/Testimonials';
import Pricing from './components/Pricing';
import About from './components/About';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AdBanner from './components/AdBanner';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AppLayout from './components/AppLayout';

const Section: React.FC<{ id: string; children: React.ReactNode; className?: string }> = ({ id, children, className = '' }) => (
    <section
        id={id}
        className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${className}`}
    >
        <div className="max-w-7xl mx-auto">
            {children}
        </div>
    </section>
);

const LandingPage: React.FC<{ onNavigateToLogin: () => void; onNavigateToSignup: () => void; }> = ({ onNavigateToLogin, onNavigateToSignup }) => (
    <>
        <Header onNavigate={() => {}} isApp={false} onNavigateToLogin={onNavigateToLogin} onNavigateToSignup={onNavigateToSignup} />
        <main>
            <Hero onStart={onNavigateToSignup} />
            <div className="relative">
                <div className="w-full lg:w-3/4">
                    <Section id="features">
                        <Features />
                    </Section>
                    <Section id="how-it-works" className="bg-[#111827]">
                        <HowItWorks />
                    </Section>
                    <Section id="why-us">
                        <WhyUs />
                    </Section>
                    <Section id="testimonials" className="bg-[#111827]">
                        <Testimonials />
                    </Section>
                    <Section id="pricing">
                        <Pricing onNavigateSignup={onNavigateToSignup} />
                    </Section>
                    <Section id="about" className="bg-[#111827]">
                        <About />
                    </Section>
                    <Section id="contact">
                        <Contact />
                    </Section>
                </div>
                <div className="hidden lg:block absolute top-0 right-0 w-1/4 h-full pt-16 pr-4">
                    <div className="sticky top-24">
                        <AdBanner />
                    </div>
                </div>
            </div>
        </main>
        <Footer />
    </>
);

const AppContent: React.FC = () => {
    const { currentUser } = useAuth();
    const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');

    const navigateToLogin = () => setView('login');
    const navigateToSignup = () => setView('signup');
    const navigateToLanding = () => setView('landing');
    
    if (currentUser) {
        return <AppLayout />;
    }
    
    if (view === 'login') {
        return <LoginPage onLoginSuccess={navigateToLanding} onNavigateToSignup={navigateToSignup} />;
    }

    if (view === 'signup') {
        return <SignupPage onSignupSuccess={navigateToLanding} onNavigateToLogin={navigateToLogin} />;
    }

    return <LandingPage onNavigateToLogin={navigateToLogin} onNavigateToSignup={navigateToSignup} />;
}


export default function App() {
    return (
        <AuthProvider>
            <div className="bg-[#0B1120] text-gray-300 font-sans">
                <AppContent />
            </div>
        </AuthProvider>
    );
}
