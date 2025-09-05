import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-16 relative">
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <div className="h-64 w-64 bg-indigo-500 rounded-full blur-3xl"></div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 relative">
            About Our AI Career Platform
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto relative">
            We're revolutionizing job applications with AI-powered tools that create interview-winning documents in minutes.
          </p>
        </header>

        {/* Mission Statement */}
        <section className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-16 border border-gray-700">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Our Mission</h2>
            <p className="text-lg text-gray-300 max-w-4xl mx-auto">
              To empower job seekers with cutting-edge AI tools that transform their career stories into compelling, professional documents that get noticed by recruiters and hiring managers.
            </p>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">More Than a Resume Builder</h2>
            <p className="text-xl text-gray-300 max-w-4xl mx-auto">
              A complete toolkit for your job search that understands what recruiters want and helps you stand out in a competitive market.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-indigo-500">
              <div className="w-14 h-14 bg-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI-Powered Generation</h3>
              <p className="text-gray-400">Leverage cutting-edge AI to draft compelling resumes and cover letters tailored to your profile and target job.</p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-green-500">
              <div className="w-14 h-14 bg-green-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Human-Like Tone</h3>
              <p className="text-gray-400">Our AI is trained to avoid robotic language, producing natural, persuasive text that truly reflects your voice.</p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-purple-500">
              <div className="w-14 h-14 bg-purple-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Stunning Portfolios</h3>
              <p className="text-gray-400">Generate a professional, single-page portfolio website to showcase your work and even sell products. No coding required.</p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-red-500">
              <div className="w-14 h-14 bg-red-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Detector Bypass</h3>
              <p className="text-gray-400">Proprietary technology ensures your documents are flagged as human-written, avoiding automated screening filters.</p>
            </div>
            
            {/* Feature 5 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-yellow-500">
              <div className="w-14 h-14 bg-yellow-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Blazing Speed</h3>
              <p className="text-gray-400">Go from scattered notes to a polished, professional document in minutes, not hours. Perfect for tight deadlines.</p>
            </div>
            
            {/* Feature 6 */}
            <div className="bg-gray-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 border border-gray-700 hover:border-blue-500">
              <div className="w-14 h-14 bg-blue-600 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Intuitive & Easy to Use</h3>
              <p className="text-gray-400">A simple, clean interface guides you through the process, making professional document creation accessible to everyone.</p>
            </div>
          </div>
        </section>

        {/* Process Section */}
        <section className="bg-gray-800 rounded-2xl shadow-2xl p-8 mb-16 border border-gray-700">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Get Started in 4 Simple Steps</h2>
            <p className="text-xl text-gray-300">From blank page to job-ready in minutes.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-700 transition-colors duration-300">
                <span className="text-2xl font-bold text-white">1</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Input Your Details</h3>
              <p className="text-gray-400">Provide your career history, skills, education, and the job you're targeting.</p>
            </div>
            
            {/* Step 2 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-700 transition-colors duration-300">
                <span className="text-2xl font-bold text-white">2</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">AI Generates Draft</h3>
              <p className="text-gray-400">Our advanced AI analyzes your information and crafts a first draft in seconds.</p>
            </div>
            
            {/* Step 3 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-700 transition-colors duration-300">
                <span className="text-2xl font-bold text-white">3</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Review & Customize</h3>
              <p className="text-gray-400">Easily edit, refine, and tailor the generated text to match your personal style.</p>
            </div>
            
            {/* Step 4 */}
            <div className="text-center group">
              <div className="w-16 h-16 bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-700 transition-colors duration-300">
                <span className="text-2xl font-bold text-white">4</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Download & Apply</h3>
              <p className="text-gray-400">Export your finished document in a professional format, ready to send to recruiters.</p>
            </div>
          </div>
        </section>

        {/* Unique Value Proposition */}
        <section className="bg-gradient-to-r from-indigo-700 to-purple-800 rounded-2xl shadow-2xl p-8 mb-16 text-white border border-indigo-500">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">THE HUMAN ADVANTAGE</h2>
            <p className="text-xl mb-4 text-center font-semibold">
              Authenticity is Your Superpower
            </p>
            <div className="bg-white bg-opacity-10 p-6 rounded-xl backdrop-blur-sm">
              <p className="mb-4 text-gray-100">
                In today's competitive job market, companies use Applicant Tracking Systems (ATS) and AI screeners to filter candidates. Generic, AI-written resumes often get flagged and discarded before a human ever sees them.
              </p>
              <p className="text-gray-100">
                Our key differentiator is our focus on generating content that is indistinguishable from human writing. We don't just fill templates; we create narratives that showcase your unique value, ensuring your application connects, persuades, and gets you noticed by real people.
              </p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Job Search?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of successful job seekers who have landed their dream roles with our AI-powered tools.
          </p>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
            Get Started Today
          </button>
        </section>

        {/* Footer */}
        <footer className="text-center mt-16 text-gray-500">
          <p>© {new Date().getFullYear()} AI Career Documents. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}