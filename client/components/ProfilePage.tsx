
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon } from './Icons';

export default function ProfilePage() {
    const { currentUser } = useAuth();
    
    if (!currentUser) {
        return null;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-extrabold text-white">Profile</h1>
            <p className="mt-1 text-gray-400">Your personal information.</p>

            <div className="mt-8 bg-[#111827] p-8 rounded-lg shadow-xl max-w-lg flex items-center gap-6">
                <div className="flex-shrink-0 h-24 w-24 bg-gray-700 rounded-full flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-cyan-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white">{currentUser.name}</h2>
                    <p className="text-md text-gray-400">{currentUser.plan} Plan Member</p>
                </div>
            </div>
        </div>
    );
}
