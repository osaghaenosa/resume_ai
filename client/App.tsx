// App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthProvider } from "./contexts/AuthContext";
import AppContent from "./AppContent";
import SharePageWrapper from "./wrappers/SharePageWrapper";
import AboutPage from "./wrappers/AboutPage.tsx";
import ResetPasswordPage from "./components/ResetPasswordPage";
import LoginRouteWrapper from "./wrappers/LoginRouteWrapper";
import SignupRouteWrapper from "./wrappers/SignupRouteWrapper";
import ForgotPasswordRouteWrapper from "./wrappers/ForgotPasswordRouteWrapper";
import * as serviceWorkerRegistration from "./serviceWorkerRegistration";
import Header from "./components/Header2.tsx";
import HelpPage from "./wrappers/HelpPage.tsx";
import ContactPage from "./wrappers/ContactPage.tsx";
import PolicyPage from "./wrappers/PolicyPage.tsx";
import Refund from "./wrappers/Refund.jsx";
import Terms from "./wrappers/Terms.jsx";
import Pricing from "./components/Pricing.tsx";
import PricingPage from "./wrappers/PricingPage.jsx";


export default function App() {
  const [waitingSW, setWaitingSW] = useState<ServiceWorkerRegistration | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    serviceWorkerRegistration.register({
      onUpdate: (registration) => {
        setWaitingSW(registration);
      },
    });
  }, []);

  const handleUpdate = () => {
    setIsUpdating(true);
    serviceWorkerRegistration.updateServiceWorker(waitingSW!);
  };

  return (
    <AuthProvider>
      <div className="bg-[#0B1120] text-gray-300 font-sans relative">
        <Router>
          <Routes>
            <Route path="/share/:docId" element={<SharePageWrapper />} />
            <Route path="/about" element={
                  <Header>
                    <AboutPage />
                  </Header>

              } />
              <Route path="/help" element={
                  <Header>
                    <HelpPage />
                  </Header>

              } />
              <Route path="/contact" element={
                  <Header>
                    <ContactPage />
                  </Header>

              } />
              <Route path="/refund" element={
                  <Header>
                    <Refund />
                  </Header>

              } />
              <Route path="/pricing" element={
                  <Header>
                    <PricingPage  />
                  </Header>

              } />
              <Route path="/terms" element={
                  <Header>
                    <Terms />
                  </Header>

              } />
              <Route path="/policy" element={
                  <Header>
                    <PolicyPage />
                  </Header>

              } />
            <Route path="/reset" element={<ResetPasswordPage />} />
            <Route path="/login" element={<LoginRouteWrapper />} />
            <Route path="/signup" element={<SignupRouteWrapper />} />
            <Route path="/forgotpassword" element={<ForgotPasswordRouteWrapper />} />
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>

        {/* Update Modal with Animation */}
        <AnimatePresence>
          {waitingSW && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-2xl max-w-sm w-[90%] text-center"
              >
                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                  🔄 New Update Available
                </h2>
                <p className="text-gray-700 dark:text-gray-300 mb-5">
                  A new version of this app is ready. Please update to get the latest features.
                </p>

                {!isUpdating ? (
                  <button
                    onClick={handleUpdate}
                    className="bg-[#0D47A1] hover:bg-blue-900 text-white px-5 py-2 rounded-xl transition-colors"
                  >
                    Update Now
                  </button>
                ) : (
                  <div className="flex flex-col items-center">
                    <motion.div
                      className="border-4 border-[#0D47A1] border-t-transparent rounded-full h-8 w-8 mb-3"
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    />
                    <p className="text-[#0D47A1] font-medium">Updating...</p>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthProvider>
  );
}