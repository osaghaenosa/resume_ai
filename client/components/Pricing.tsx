import React from 'react';
import { CheckIcon } from './Icons';
import { UserPlan } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { FREE_TOKENS, PRO_TOKENS, PRO_PRICE } from '../config';

export default function Pricing({ onNavigateSignup, onStartUpgrade }: { onNavigateSignup: () => void; onStartUpgrade: () => void; }) {
    const { currentUser } = useAuth();
    
    const tiers = [
        {
            title: "Free Trial",
            price: "0",
            period: "once",
            plan: "Free",
            features: [`${FREE_TOKENS} Resume/Cover Letter Generations`, "Basic Templates", "Standard AI Tone"],
            isFeatured: false,
        },
        {
            title: "Pro",
            price: String(PRO_PRICE),
            period: "month",
            plan: "Pro",
            features: [`${PRO_TOKENS} Generations/Month`, "Unlimited Downloads", "Premium Templates", "Human-Like AI Tone", "AI Detector Bypass", "Priority Support"],
            isFeatured: true,
        },
    ];
    
    const handleButtonClick = (tierPlan: string) => {
        if (currentUser) {
            if (currentUser.plan === 'Free' && tierPlan === 'Pro') {
                onStartUpgrade();
            }
            // If user is Pro and clicks pro, or any user clicks Free, do nothing.
        } else {
            // No user, always go to signup
            onNavigateSignup();
        }
    }
    
    const getButtonText = (tierPlan: string) => {
        if (currentUser) {
            if (currentUser.plan === 'Free' && tierPlan === 'Pro') {
                return 'Upgrade to Pro';
            }
            if (currentUser.plan === tierPlan) {
                return 'Current Plan';
            }
        }
        return 'Sign Up';
    }


    return (
        <>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">Find the Plan That's Right For You</h2>
                <p className="mt-4 text-lg text-gray-400">Flexible options to accelerate your job search.</p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                {tiers.map((tier) => (
                    <div key={tier.title} className={`border rounded-lg p-8 flex flex-col ${tier.isFeatured ? 'border-cyan-500 bg-[#111827] shadow-lg shadow-cyan-500/10' : 'border-gray-700'}`}>
                        <h3 className="text-2xl font-bold text-white">{tier.title}</h3>
                        <p className="mt-4">
                            <span className="text-4xl font-extrabold text-white">${tier.price}</span>
                            <span className="text-gray-400"> / {tier.period}</span>
                        </p>
                        <ul className="mt-6 space-y-4 text-gray-400 flex-grow">
                            {tier.features.map((feature, index) => (
                                <li key={index} className="flex items-start">
                                    <CheckIcon className="flex-shrink-0 h-6 w-6 text-cyan-400 mr-2" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>
                        <button 
                            onClick={() => handleButtonClick(tier.plan)}
                            disabled={currentUser?.plan === tier.plan}
                            className={`mt-8 w-full py-3 px-6 rounded-lg font-semibold transition-colors duration-300 ${tier.isFeatured ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:bg-cyan-400 disabled:bg-cyan-800 disabled:cursor-not-allowed' : 'bg-gray-700 text-white hover:bg-gray-600 disabled:bg-gray-800 disabled:cursor-not-allowed'}`}
                        >
                            {getButtonText(tier.plan)}
                        </button>
                    </div>
                ))}
            </div>
        </>
    );
}
