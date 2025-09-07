// App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AppContent from './AppContent';
import SharePageWrapper from './wrappers/SharePageWrapper';
import AboutPage from './wrappers/AboutPage.tsx'

export default function App() {
  return (
    <AuthProvider>
      <div className="bg-[#0B1120] text-gray-300 font-sans">
        <Router>
          <Routes>
            <Route path="/share/:docId" element={<SharePageWrapper />} />
           
            <Route path="/about" element={<AboutPage />} />
             <Route path="*" element={<AppContent />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}
