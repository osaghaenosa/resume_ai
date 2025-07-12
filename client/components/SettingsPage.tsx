
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckIcon } from './Icons';

const StatCard: React.FC<{ title: string, value: string | number, className?: string }> = ({ title, value, className }) => (
    <div className={`bg-gray-800 p-4 rounded-lg text-center ${className}`}>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
    </div>
);

export default function SettingsPage({ onUpgradeClick }: { onUpgradeClick: () => void }) {
    const { currentUser } = useAuth();

    if (!currentUser) {
        return null;
    }
    
    const tokenLimit = currentUser.plan === 'Pro' ? 100 : 3;
    const tokensPercentage = (currentUser.tokens / tokenLimit) * 100;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
             <h1 className="text-3xl font-extrabold text-white">Settings</h1>
            <p className="mt-1 text-gray-400">Manage your plan and account settings.</p>

            <div className="mt-8 bg-[#111827] p-8 rounded-lg shadow-xl max-w-2xl">
                <h2 className="text-2xl font-bold text-white mb-6">Account Status</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <StatCard title="Current Plan" value={currentUser.plan} className="border-l-4 border-cyan-500" />
                    <StatCard title="Remaining Tokens" value={currentUser.tokens} className="border-l-4 border-cyan-500" />
                </div>
                
                <div className="mt-6">
                    <p className="text-sm text-gray-400 mb-2">Token Usage ({currentUser.tokens} / {tokenLimit})</p>
                    <div className="w-full bg-gray-700 rounded-full h-4">
                        <div 
                            className="bg-cyan-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${tokensPercentage}%` }}
                        ></div>
                    </div>
                </div>

                {currentUser.plan === 'Free' && (
                    <div className="mt-10 p-6 bg-gray-800 rounded-lg border border-cyan-500/30 text-center">
                        <h3 className="text-xl font-bold text-white">Unlock Your Full Potential</h3>
                        <p className="mt-2 text-gray-400">Upgrade to Pro for 100 monthly tokens, premium features, and priority support.</p>
                        <button
                            onClick={onUpgradeClick}
                            className="mt-4 bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-400 transition-colors duration-300"
                        >
                            Upgrade to Pro Now
                        </button>
                    </div>
                )}

                {currentUser.plan === 'Pro' && (
                     <div className="mt-6 p-4 bg-green-900/50 text-green-300 border border-green-500 rounded-lg flex items-center">
                         <CheckIcon className="h-6 w-6 mr-3"/>
                         <p><strong>You are on the Pro plan.</strong> You have access to all premium features.</p>
                     </div>
                )}
            </div>
        </div>
    );
}