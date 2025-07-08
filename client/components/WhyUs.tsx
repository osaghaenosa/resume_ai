
import React from 'react';
import { ShieldCheckIcon } from './Icons';

export default function WhyUs() {
    return (
        <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
                <div className="relative">
                    <img src="https://picsum.photos/seed/techhuman/600/400" alt="Professional working on a laptop" className="rounded-lg shadow-2xl w-full" />
                    <div className="absolute -bottom-4 -right-4 bg-cyan-500 p-4 rounded-lg shadow-lg">
                        <ShieldCheckIcon className="h-10 w-10 text-white" />
                    </div>
                </div>
            </div>
            <div className="md:w-1/2">
                <span className="text-cyan-400 font-semibold">THE HUMAN ADVANTAGE</span>
                <h2 className="text-3xl md:text-4xl font-extrabold text-white mt-2">Authenticity is Your Superpower</h2>
                <p className="mt-4 text-lg text-gray-400">
                    In today's competitive job market, companies use Applicant Tracking Systems (ATS) and AI screeners to filter candidates. Generic, AI-written resumes often get flagged and discarded before a human ever sees them.
                </p>
                <p className="mt-4 text-lg text-gray-400">
                    Our key differentiator is our focus on generating content that is <strong className="text-white">indistinguishable from human writing</strong>. We don't just fill templates; we create narratives that showcase your unique value, ensuring your application connects, persuades, and gets you noticed by real people.
                </p>
            </div>
        </div>
    );
}
