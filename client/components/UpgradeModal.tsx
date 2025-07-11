
import React from 'react';
import { CheckIcon, XIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface UpgradeModalProps {
    onClose: () => void;
    onUpgrade: () => void;
}

const TierCard: React.FC<{
    title: string,
    price: string,
    period: string,
    features: string[],
    isCurrent: boolean,
    onAction: () => void,
    actionText: string,
}> = ({ title, price, period, features, isCurrent, onAction, actionText }) => (
     <div className={`border rounded-lg p-6 flex flex-col ${isCurrent ? 'border-cyan-500 bg-gray-800' : 'border-gray-700 bg-[#111827]'}`}>
        {isCurrent && <span className="text-xs font-bold text-cyan-400 bg-cyan-900/50 self-start px-2 py-1 rounded-full mb-3">CURRENT PLAN</span>}
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="mt-4">
            <span className="text-4xl font-extrabold text-white">${price}</span>
            <span className="text-gray-400"> / {period}</span>
        </p>
        <ul className="mt-6 space-y-4 text-gray-400 flex-grow">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start">
                    <CheckIcon className="flex-shrink-0 h-6 w-6 text-cyan-400 mr-2" />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
        <button
            onClick={onAction}
            disabled={isCurrent}
            className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300 ${
                isCurrent ? 'bg-gray-600 text-gray-400 cursor-default' : 'bg-cyan-500 text-white hover:bg-cyan-400'
            }`}
        >
            {actionText}
        </button>
    </div>
);

export default function UpgradeModal({ onClose, onUpgrade }: UpgradeModalProps) {
    const { currentUser } = useAuth();

    if (!currentUser || currentUser.plan !== 'Free') return null;

    const tiers = [
        {
            title: "Free Trial",
            price: "0",
            period: "once",
            features: ["3 Resume/Cover Letter Generations", "Basic Templates", "Standard AI Tone"],
            isCurrent: true,
            action: onClose,
            actionText: "Current Plan",
        },
        {
            title: "Pro Monthly",
            price: "29",
            period: "month",
            features: ["100 Generations/Month", "Unlimited Downloads", "Premium Templates", "Human-Like AI Tone", "AI Detector Bypass", "Priority Support"],
            isCurrent: false,
            action: onUpgrade,
            actionText: "Upgrade to Pro",
        },
    ];

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="bg-[#0B1120] border border-gray-700 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col relative">
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-1">
                    <XIcon />
                </button>

                <div className="p-8 text-center">
                    <h2 className="text-3xl font-extrabold text-white">Unlock Your Potential!</h2>
                    <p className="mt-3 text-lg text-gray-400 max-w-2xl mx-auto">You're on the Free plan. Upgrade to Pro to remove limits and get access to our most powerful features.</p>
                </div>

                <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tiers.map((tier) => (
                        <TierCard
                            key={tier.title}
                            title={tier.title}
                            price={tier.price}
                            period={tier.period}
                            features={tier.features}
                            isCurrent={tier.isCurrent}
                            onAction={tier.action}
                            actionText={tier.actionText}
                        />
                    ))}
                </div>
                <div className="p-8 pt-0 text-center">
                    <button onClick={onClose} className="text-gray-400 hover:text-white underline">
                        Maybe Later
                    </button>
                </div>
            </div>
        </div>
    );
}
