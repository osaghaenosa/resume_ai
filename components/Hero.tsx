
import React from 'react';

const sampleResumes = [
    { id: 1, src: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?q=80&w=800&auto=format&fit=crop", alt: "Modern resume template" },
    { id: 2, src: "https://images.unsplash.com/photo-1579567761406-462436e84592?q=80&w=800&auto=format&fit=crop", alt: "Creative resume template" },
    { id: 3, src: "https://images.unsplash.com/photo-1620714223084-8390e8c15ae8?q=80&w=800&auto=format&fit=crop", alt: "Professional resume template" },
];

export default function Hero({ onStart }: { onStart: () => void }) {
    return (
        <div className="relative pt-24 pb-16 md:pt-32 md:pb-24 text-center px-4 overflow-hidden bg-gradient-to-b from-[#0B1120] to-[#111827]">
            <div className="relative z-10 max-w-4xl mx-auto">
                <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight">
                    Craft Resumes That Get You Hired
                </h1>
                <p className="mt-6 text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                    Our AI generates human-like resumes and cover letters designed to impress recruiters and bypass automated screeners.
                </p>
                <div className="mt-10">
                    <button
                        onClick={onStart}
                        className="bg-cyan-500 text-white font-bold py-3 px-8 rounded-full text-lg hover:bg-cyan-400 transition-transform duration-300 transform hover:scale-105 shadow-lg shadow-cyan-500/20"
                    >
                        Sign Up For Free
                    </button>
                </div>
            </div>
            <div className="mt-16 max-w-6xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                    {sampleResumes.map((resume, index) => (
                        <div key={resume.id} className={`p-2 bg-gray-800/50 rounded-lg shadow-xl transform transition-transform duration-500 hover:scale-105 hover:shadow-cyan-500/20 ${index === 1 ? 'md:translate-y-8' : ''}`}>
                            <img src={resume.src} alt={resume.alt} className="rounded-md w-full object-cover h-full" />
                        </div>
                    ))}
                </div>
                <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#111827] to-transparent pointer-events-none"></div>
            </div>
        </div>
    );
}