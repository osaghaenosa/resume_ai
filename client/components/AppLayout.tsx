import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './Header';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import ResumeAnalyserPage from './ResumeAnalyserPage';

interface AppLayoutProps {
    onUpgradeClick: () => void;
}

export default function AppLayout({ onUpgradeClick }: AppLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-[#0B1120]">
            <Header isApp={true} onUpgradeClick={onUpgradeClick}/>
            <main className="flex-grow max-w-7xl mx-auto w-full">
                <Routes>
                    <Route path="/" element={<HomePage onUpgradeClick={onUpgradeClick} />} />
                    <Route path="/analyser" element={<ResumeAnalyserPage onUpgradeClick={onUpgradeClick} />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage onUpgradeClick={onUpgradeClick} />} />
                    {/* Catch-all route for app pages */}
                    <Route path="*" element={<HomePage onUpgradeClick={onUpgradeClick} />} />
                </Routes>
            </main>
        </div>
    );
}