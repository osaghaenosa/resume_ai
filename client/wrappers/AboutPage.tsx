// wrappers/AboutPage.tsx
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import aboutImg from "/static/images/about-hero.jpg"; // ✅ replace with relevant illustration in your /public/images
import missionImg from "/static/images/mission.jpg";
import teamImg from "/static/images/team.jpg";
import innovationImg from "/static/images/innovation.jpg";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-200 px-6 py-12">
      {/* SEO Meta Tags */}
      <Helmet>
        <title>About | Job Ready AI Tool</title>
        <meta
          name="description"
          content="Learn more about Job Ready AI Tool – an AI-powered platform designed to help you create resumes, cover letters, and portfolios that stand out."
        />
        <meta
          name="keywords"
          content="Job Ready AI, Resume Builder, AI Career Tools, Cover Letter Generator, Portfolio Builder"
        />
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Job Ready AI Tool" />
        <link rel="canonical" href="https://jobreadyai.xyz/about" />

        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            name: "Job Ready AI Tool",
            url: "https://yourdomain.com",
            logo: "https://yourdomain.com/static/images/jratlogo.png",
            description:
              "Job Ready AI Tool is an AI-powered platform that helps users create professional resumes, cover letters, and portfolios.",
          })}
        </script>
      </Helmet>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            About <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">Job Ready AI Tool</span>
          </h1>
          <p className="mt-4 text-lg text-gray-400 max-w-lg">
            Empowering your career with AI-driven tools and resources to help you get job ready faster — smarter, and more efficiently.
          </p>
        </div>
        <div className="flex justify-center">
          <img
            src={aboutImg}
            alt="AI Career Assistance"
            className="w-4/5 max-w-md rounded-2xl shadow-lg"
          />
        </div>
      </section>

      {/* About Sections */}
      <section className="max-w-6xl mx-auto mt-16 grid md:grid-cols-3 gap-8">
        {/* Who We Are */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src={teamImg} alt="Team" className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Who We Are</h2>
          <p className="text-gray-400">
            At <strong>Job Ready AI Tool</strong>, we bridge the gap between talent and opportunity using AI-powered resume building, cover letter generation, and portfolio tools.
          </p>
        </div>

        {/* Our Mission */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src={missionImg} alt="Mission" className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Our Mission</h2>
          <p className="text-gray-400">
            To simplify the job search process with personalized, AI-powered guidance — whether you're a fresh graduate or a seasoned professional.
          </p>
        </div>

        {/* Why Choose Us */}
        <div className="bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-lg transition-shadow">
          <img src={innovationImg} alt="Innovation" className="w-16 h-16 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">Why Choose Us</h2>
          <p className="text-gray-400">
            We focus on usability, accuracy, and innovation to make your job hunt smarter, faster, and more effective.
          </p>
        </div>
      </section>

      {/* Call To Action */}
      <footer className="mt-16 text-center">
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-3 px-8 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg"
        >
          Back to Home
        </Link>
      </footer>
    </main>
  );
}
