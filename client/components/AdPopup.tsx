import React from 'react';
import { XIcon } from './Icons';

interface AdPopupProps {
    onClose: () => void;
    onUpgrade: () => void;
}

export default function AdPopup({ onClose, onUpgrade }: AdPopupProps) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex items-center justify-center p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
            <div className="relative bg-[#111827] border border-gray-700 rounded-lg shadow-2xl w-full max-w-md p-8 text-center">
                <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-gray-400 hover:text-white z-10 p-1">
                    <XIcon />
                </button>
                <span className="text-xs font-bold text-cyan-400 bg-cyan-900/50 self-start px-2 py-1 rounded-full">UPGRADE TO PRO</span>
                <div className="mt-4">
                     <img 
                        src="https://images.unsplash.com/photo-1554224155-1696413565d3?q=80&w=800&auto=format&fit=crop" 
                        alt="A person considering an upgrade"
                        className="w-full rounded-lg object-cover h-40"
                    />
                </div>
                <h3 className="mt-6 text-2xl font-bold text-white">Remove Ads &amp; Go Unlimited</h3>
                <p className="mt-2 text-gray-400">Enjoy an ad-free experience and get 100 monthly credits by upgrading to our Pro plan.</p>
                <button
                    onClick={onUpgrade}
                    className="mt-6 w-full bg-cyan-500 text-white font-bold py-3 px-8 rounded-md hover:bg-cyan-400 transition-colors duration-300"
                >
                    Upgrade Now
                </button>
                 <button onClick={onClose} className="mt-4 text-gray-400 hover:text-white text-sm underline">
                    Maybe Later
                </button>
            </div>
        </div>
    );
}
