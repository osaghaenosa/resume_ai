
// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppContent from './AppContent';
import SharePageWrapper from './wrappers/SharePageWrapper';
import AboutPage from './wrappers/AboutPage.tsx';
import ResetPasswordPage from './components/ResetPasswordPage';
import LoginRouteWrapper from './wrappers/LoginRouteWrapper'; // Import LoginPage
import SignupRouteWrapper from './wrappers/SignupRouteWrapper'; // Import SignupPage
import ForgotPasswordRouteWrapper from './wrappers/ForgotPasswordRouteWrapper'; // Import SignupPage
import AppLayout from './components/AppLayout'; // Import AppLayout

export default function App() {
  return (
    <AuthProvider>
      <div className="bg-[#0B1120] text-gray-300 font-sans">
        <Router>
          <Routes>
            <Route path="/share/:docId" element={<SharePageWrapper />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/reset" element={<ResetPasswordPage />} />
            <Route path="/login" element={<LoginRouteWrapper />} /> {/* Add login route */}
            <Route path="/signup" element={<SignupRouteWrapper />} /> {/* Add signup route */}
            <Route path="/forgotpassword" element={<ForgotPasswordRouteWrapper />} /> {/* Add signup route */}
            
          {/* App routes - these will be handled by AppLayout */}
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}