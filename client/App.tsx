
import React, { useState, useEffect } from 'react';
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
import { User } from './types';
import UpgradeModal from './components/UpgradeModal';
import CheckoutPage from './components/CheckoutPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import AdPopup from './components/AdPopup';
import SharePage from './components/SharePage';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Using a test public key from Stripe's documentation
const stripePromise = loadStripe('pk_test_51H5a27G4ySg7oB8U4fGj8R7kC2hJ0b5hQ0n2hJ0b5hQ0n2hJ0b5hQ0n2hJ0b5hQ0n2hJ0b5hQ0n2hJ0b5hQ0n2hJ0b5hQ0');


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

const LandingPage: React.FC<{ onNavigateToLogin: () => void; onNavigateToSignup: () => void; onStartUpgrade: () => void; }> = ({ onNavigateToLogin, onNavigateToSignup, onStartUpgrade }) => (
    <>
        <Header onNavigate={() => {}} isApp={false} onNavigateToLogin={onNavigateToLogin} onNavigateToSignup={onNavigateToSignup} onUpgradeClick={onStartUpgrade} />
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
                        <Pricing onNavigateSignup={onNavigateToSignup} onStartUpgrade={onStartUpgrade} />
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
    const { currentUser, upgradePlan, generationCompleted, clearGenerationCompleted } = useAuth();
    const [view, setView] = useState<'landing' | 'login' | 'signup'>('landing');
    const [upgradeFlowState, setUpgradeFlowState] = useState<'none' | 'modal' | 'checkout' | 'success'>('none');
    const [showAdPopup, setShowAdPopup] = useState(false);

    // Simple routing
    const path = window.location.pathname;
    const shareMatch = path.match(/^\/share\/(doc_\d+)$/);

    if (shareMatch) {
        const docId = shareMatch[1];
        return <SharePage docId={docId} />;
    }

    useEffect(() => {
        if (generationCompleted) {
            if (currentUser?.plan === 'Free') {
                setShowAdPopup(true);
            }
            clearGenerationCompleted(); // Reset the trigger
        }
    }, [generationCompleted, currentUser, clearGenerationCompleted]);

    const handleLoginSuccess = (user: User) => {
        setView('landing'); // Triggers a re-render where currentUser is now present
        if (user.plan === 'Free') {
            setTimeout(() => setUpgradeFlowState('modal'), 500); // Delay modal to allow dashboard to render
        }
    };
    
    const handleSignupSuccess = (user: User) => {
        setView('landing');
        if (user.plan === 'Free') {
            setUpgradeFlowState('modal');
        }
    };

    const navigateToLogin = () => setView('login');
    const navigateToSignup = () => setView('signup');
    
    const handleStartUpgrade = () => {
        if (currentUser && currentUser.plan === 'Pro') {
            // Already Pro, do nothing
            return;
        }
        setUpgradeFlowState('modal');
    };
    
    const handleProceedToCheckout = () => {
        setUpgradeFlowState('checkout');
    }

    const handleStartUpgradeFromAd = () => {
        setShowAdPopup(false);
        setUpgradeFlowState('modal');
    };
    
    const handleBackFromCheckout = () => {
        setUpgradeFlowState('modal');
    };

    const handlePaymentConfirm = () => {
        setUpgradeFlowState('success');
    };

    const handleFlowComplete = () => {
        upgradePlan();
        setUpgradeFlowState('none');
    };
    
    // Stripe Elements options
    const options = {
      // In a real app, you'd fetch this from a server endpoint
      clientSecret: 'pi_123_secret_456', 
      appearance: {
        theme: 'night',
        variables: {
          colorPrimary: '#06b6d4',
          colorBackground: '#1f2937',
          colorText: '#ffffff',
          colorDanger: '#ef4444',
          fontFamily: 'Ideal Sans, system-ui, sans-serif',
          spacingUnit: '4px',
          borderRadius: '4px',
        }
      },
    };


    if (currentUser?.plan === 'Free' && upgradeFlowState === 'checkout') {
        return (
            <Elements stripe={stripePromise} options={options}>
                <CheckoutPage onPaymentConfirm={handlePaymentConfirm} onBack={handleBackFromCheckout} />
            </Elements>
        );
    }

    if (upgradeFlowState === 'success') {
        return <PaymentSuccessPage onComplete={handleFlowComplete} />;
    }

    let mainContent;
    if (currentUser) {
        mainContent = <AppLayout onUpgradeClick={handleStartUpgrade} />;
    } else if (view === 'login') {
        mainContent = <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateToSignup={navigateToSignup} />;
    } else if (view === 'signup') {
        mainContent = <SignupPage onSignupSuccess={handleSignupSuccess} onNavigateToLogin={navigateToLogin} />;
    } else {
        mainContent = <LandingPage onNavigateToLogin={navigateToLogin} onNavigateToSignup={navigateToSignup} onStartUpgrade={handleStartUpgrade} />;
    }

    return (
        <>
            {mainContent}
            {currentUser && upgradeFlowState === 'modal' && (
                <UpgradeModal onClose={() => setUpgradeFlowState('none')} onUpgrade={handleProceedToCheckout} />
            )}
            {showAdPopup && (
                <AdPopup onClose={() => setShowAdPopup(false)} onUpgrade={handleStartUpgradeFromAd} />
            )}
        </>
    )
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