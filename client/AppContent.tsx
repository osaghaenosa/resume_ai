// AppContent.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import AppLayout from './components/AppLayout';
import UpgradeModal from './components/UpgradeModal';
import CheckoutPage from './components/CheckoutPage';
import PaymentSuccessPage from './components/PaymentSuccessPage';
import AdPopup from './components/AdPopup';
import SuccessModal from './components/SuccessModal';
import { useAuth } from './contexts/AuthContext';
import { User } from './types';

const Section: React.FC<{ id: string; children: React.ReactNode; className?: string }> = ({ id, children, className = '' }) => (
  <section id={id} className={`py-16 md:py-24 px-4 sm:px-6 lg:px-8 ${className}`}>
    <div className="max-w-7xl mx-auto">{children}</div>
  </section>
);

const LandingPage: React.FC<{
  onNavigateToLogin: () => void;
  onNavigateToSignup: () => void;
  onStartUpgrade: () => void;
}> = ({ onNavigateToLogin, onNavigateToSignup, onStartUpgrade }) => (
  <>
    <Header
      onNavigate={() => {}}
      isApp={false}
      onNavigateToLogin={onNavigateToLogin}
      onNavigateToSignup={onNavigateToSignup}
      onUpgradeClick={onStartUpgrade}
    />
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const successModalTimerRef = useRef<number | null>(null);

  const closeSuccessAndShowAd = useCallback(() => {
    setShowSuccessModal(false);
    if (currentUser && currentUser.plan === 'Free') {
      setShowAdPopup(true);
    }
    clearGenerationCompleted();
  }, [currentUser, clearGenerationCompleted]);

  useEffect(() => {
    if (generationCompleted) {
      setShowSuccessModal(true);
      if (successModalTimerRef.current) clearTimeout(successModalTimerRef.current);
      successModalTimerRef.current = window.setTimeout(() => {
        closeSuccessAndShowAd();
      }, 5000);

      return () => {
        if (successModalTimerRef.current) clearTimeout(successModalTimerRef.current);
      };
    }
  }, [generationCompleted, closeSuccessAndShowAd]);

  const handleLoginSuccess = (user: User) => {
    setView('landing');
    if (user.plan === 'Free') {
      setTimeout(() => setUpgradeFlowState('modal'), 500);
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
    if (currentUser?.plan !== 'Pro') setUpgradeFlowState('modal');
  };

  const handleProceedToCheckout = () => setUpgradeFlowState('checkout');
  const handleStartUpgradeFromAd = () => {
    setShowAdPopup(false);
    setUpgradeFlowState('modal');
  };
  const handlePaymentConfirm = () => setUpgradeFlowState('success');
  const handleFlowComplete = () => {
    upgradePlan();
    setUpgradeFlowState('none');
  };

  const handleManualSuccessClose = () => {
    if (successModalTimerRef.current) {
      clearTimeout(successModalTimerRef.current);
      successModalTimerRef.current = null;
    }
    closeSuccessAndShowAd();
  };

  if (currentUser?.plan === 'Free' && upgradeFlowState === 'checkout') {
    return <CheckoutPage user={currentUser} onPaymentConfirm={handlePaymentConfirm} />;
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
      {showAdPopup && <AdPopup onClose={() => setShowAdPopup(false)} onUpgrade={handleStartUpgradeFromAd} />}
      {showSuccessModal && <SuccessModal onClose={handleManualSuccessClose} />}
    </>
  );
};

export default AppContent;
