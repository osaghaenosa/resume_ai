
import React from 'react';
import { DocumentTextIcon, CogIcon, PencilAltIcon, DownloadIcon } from './Icons';

interface StepProps {
  number: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const Step: React.FC<StepProps> = ({ number, title, description, icon }) => (
  <div className="flex">
    <div className="flex-shrink-0">
      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gray-700 text-cyan-400 font-bold text-xl">
        {number}
      </div>
    </div>
    <div className="ml-6">
      <h3 className="text-lg font-semibold text-white flex items-center">
        <span className="mr-3 text-cyan-400">{icon}</span> {title}
      </h3>
      <p className="mt-2 text-gray-400">{description}</p>
    </div>
  </div>
);

const steps = [
    { number: "1", title: "Input Your Details", description: "Provide your career history, skills, education, and the job you're targeting. The more detail, the better the result.", icon: <DocumentTextIcon /> },
    { number: "2", title: "AI Generates Draft", description: "Our advanced AI analyzes your information and crafts a first draft of your resume or cover letter in seconds.", icon: <CogIcon /> },
    { number: "3", title: "Review & Customize", description: "You have full control. Easily edit, refine, and tailor the generated text to perfectly match your personal style and story.", icon: <PencilAltIcon /> },
    { number: "4", title: "Download & Apply", description: "Export your finished document in a professional format, ready to be sent out to recruiters and hiring managers.", icon: <DownloadIcon /> },
];


export default function HowItWorks() {
    return (
        <>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">Get Started in 4 Simple Steps</h2>
                <p className="mt-4 text-lg text-gray-400">From blank page to job-ready in minutes.</p>
            </div>
            <div className="max-w-3xl mx-auto space-y-12">
                {steps.map((step) => <Step key={step.number} {...step} />)}
            </div>
        </>
    );
}
