
import React from 'react';

// Using a lot of confetti pieces for a dense effect
const CONFETTI_COUNT = 150;

// Reusable ConfettiPiece component
const ConfettiPiece: React.FC<{ style: React.CSSProperties }> = ({ style }) => (
    <div className="confetti-piece" style={style}></div>
);

interface SuccessModalProps {
    onClose: () => void;
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
    // Generate styles for each confetti piece
    const confetti = Array.from({ length: CONFETTI_COUNT }).map((_, i) => {
        const style: React.CSSProperties = {
            left: `${Math.random() * 100}%`,
            // Stagger animation delays for a more natural fall
            animationDelay: `${Math.random() * 5}s`,
            // Randomly select a color from a vibrant palette
            backgroundColor: ['#f94144', '#f3722c', '#f8961e', '#f9c74f', '#90be6d', '#43aa8b', '#577590', '#277da1'][Math.floor(Math.random() * 8)],
            // Vary the dimensions for more visual interest
            width: `${Math.floor(Math.random() * 6) + 6}px`,
            height: `${Math.floor(Math.random() * 10) + 10}px`,
        };
        return <ConfettiPiece key={i} style={style} />;
    });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="success-heading">
            <div className="relative bg-[#111827] border border-cyan-500/20 rounded-lg shadow-2xl w-full max-w-sm p-8 text-center overflow-hidden animate-zoom-in-fade">
                <div className="absolute inset-0 pointer-events-none">
                    {confetti}
                </div>
                <div className="relative z-10">
                    <div className="text-7xl mb-4 animate-emoji-pop">🥳</div>
                    <h2 id="success-heading" className="text-2xl font-bold text-white">Success!</h2>
                    <p className="mt-2 text-gray-300">Your document has been generated!</p>
                    <button
                        onClick={onClose}
                        className="mt-6 text-sm text-gray-400 hover:text-white underline font-semibold transition-colors"
                        aria-label="Close success message"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
