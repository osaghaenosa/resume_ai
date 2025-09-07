import React from 'react';
import { BrainIcon, ShieldCheckIcon, ZapIcon, SparklesIcon, FeatherIcon, BriefcaseIcon } from './Icons';

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
    <p className="text-gray-400 leading-relaxed">{description}</p>
  </div>
);

const features = [
  {
    icon: <BrainIcon />,
    title: "AI-Powered Generation",
    description:
      "Our system uses advanced natural language processing to create resumes and cover letters that highlight your strengths, match job descriptions, and adapt to industry-specific language. Unlike generic templates, every document is built uniquely for your career path.",
  },
  {
    icon: <FeatherIcon />,
    title: "Human-Like Tone",
    description:
      "We design documents that sound authentic, professional, and natural. Instead of robotic, generic phrases, our AI tailors the writing style to reflect your voice, making your application stand out during recruiter reviews.",
  },
  {
    icon: <BriefcaseIcon />,
    title: "Stunning Portfolios",
    description:
      "Go beyond resumes with a sleek, single-page portfolio website to display your projects, skills, and achievements. This feature is perfect for creatives, freelancers, and job seekers who want to share their work visually without needing coding skills.",
  },
  {
    icon: <ShieldCheckIcon />,
    title: "ATS-Friendly Formatting",
    description:
      "Many resumes fail because they cannot be read by Applicant Tracking Systems (ATS). Our formatting ensures that recruiters and automated systems alike can parse your information correctly, giving you a higher chance of landing interviews.",
  },
  {
    icon: <ZapIcon />,
    title: "Blazing Speed",
    description:
      "Whether you’re updating your CV before an urgent deadline or crafting a cover letter for a last-minute opportunity, JobReadyAI gets you from draft to polished document in minutes, saving hours of frustration.",
  },
  {
    icon: <SparklesIcon />,
    title: "Intuitive & Easy to Use",
    description:
      "No steep learning curves. Our clean, step-by-step interface ensures anyone can build professional documents with ease. Each tool is designed for simplicity while still delivering professional-grade results.",
  },
];

export default function Features() {
  return (
    <>
      <div className="text-center mb-12 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          The Future of Your Career Starts Here
        </h2>
        <p className="mt-4 text-lg text-gray-400 leading-relaxed">
          JobReadyAI is more than just a resume builder—it’s your complete career toolkit. 
          From AI-enhanced resumes to portfolio websites, we help you present yourself with confidence and professionalism. 
          Every feature is designed to make your job search faster, smarter, and more effective.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <FeatureCard key={index} {...feature} />
        ))}
      </div>
    </>
  );
}