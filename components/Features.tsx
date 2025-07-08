
import React from 'react';
import { BrainIcon, ShieldCheckIcon, ZapIcon, SparklesIcon, FeatherIcon } from './Icons';

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
    <div className="bg-[#111827] p-6 rounded-lg shadow-lg hover:shadow-cyan-500/10 transition-shadow duration-300 transform hover:-translate-y-1">
        <div className="flex items-center justify-center h-12 w-12 rounded-md bg-cyan-500 text-white mb-4">
            {icon}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
        <p className="text-gray-400">{description}</p>
    </div>
);

const features = [
    {
        icon: <BrainIcon />,
        title: "AI-Powered Generation",
        description: "Leverage cutting-edge AI to draft compelling resumes and cover letters tailored to your profile and target job.",
    },
    {
        icon: <FeatherIcon />,
        title: "Human-Like Tone",
        description: "Our AI is trained to avoid robotic language, producing natural, persuasive text that truly reflects your voice.",
    },
    {
        icon: <ShieldCheckIcon />,
        title: "AI Detector Bypass",
        description: "Proprietary technology ensures your documents are flagged as human-written, avoiding automated screening filters.",
    },
    {
        icon: <ZapIcon />,
        title: "Blazing Speed",
        description: "Go from scattered notes to a polished, professional document in minutes, not hours. Perfect for tight deadlines.",
    },
    {
        icon: <SparklesIcon />,
        title: "Intuitive & Easy to Use",
        description: "A simple, clean interface guides you through the process, making professional document creation accessible to everyone.",
    },
];


export default function Features() {
    return (
        <>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">Why You'll Love It</h2>
                <p className="mt-4 text-lg text-gray-400">Everything you need to land your dream job.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {features.map((feature, index) => (
                    <FeatureCard key={index} {...feature} />
                ))}
            </div>
        </>
    );
}
