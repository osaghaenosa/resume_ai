
import React, { useState } from 'react';
import Header from './Header';
import HomePage from './HomePage';
import ProfilePage from './ProfilePage';
import SettingsPage from './SettingsPage';

type Page = 'home' | 'profile' | 'settings';

export default function AppLayout() {
    const [page, setPage] = useState<Page>('home');

    const renderPage = () => {
        switch (page) {
            case 'profile':
                return <ProfilePage />;
            case 'settings':
                return <SettingsPage />;
            case 'home':
            default:
                return <HomePage />;
        }
    };
    
    return (
        <div className="min-h-screen flex flex-col bg-[#0B1120]">
            <Header onNavigate={setPage} isApp={true} />
            <main className="flex-grow max-w-7xl mx-auto w-full">
                {renderPage()}
            </main>
        </div>
    );
}
