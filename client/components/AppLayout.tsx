
import React, { useState } from 'react';
import Header from './Header';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';
import ResumeAnalyserPage from './ResumeAnalyserPage';

type Page = 'home' | 'analyser' | 'profile' | 'settings';

interface AppLayoutProps {
    onUpgradeClick: () => void;
}

export default function AppLayout({ onUpgradeClick }: AppLayoutProps) {
    const [page, setPage] = useState<Page>('home');

    const renderPage = () => {
        switch (page) {
            case 'analyser':
                return <ResumeAnalyserPage onUpgradeClick={onUpgradeClick} />;
            case 'profile':
                return <ProfilePage />;
            case 'settings':
                return <SettingsPage onUpgradeClick={onUpgradeClick} />;
            case 'home':
            default:
                return <HomePage onUpgradeClick={onUpgradeClick} />;
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col bg-[#0B1120]">
            <Header onNavigate={setPage} isApp={true} onUpgradeClick={onUpgradeClick}/>
            <main className="flex-grow max-w-7xl mx-auto w-full">
                {renderPage()}
            </main>
        </div>
    );
}
