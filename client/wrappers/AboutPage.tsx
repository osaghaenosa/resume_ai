// wrappers/AboutPage.tsx
import React from "react";
import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0B1120] text-gray-200 flex flex-col items-center px-6 py-12">
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
        <link rel="canonical" href="https://yourdomain.com/about" />

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

      {/* Logo and Title */}
      <header className="flex flex-col items-center text-center mb-12">
        <img
          src="./static/images/jratlogo.png"
          alt="Job Ready AI Tool Logo"
          className="w-20 h-20 mb-4"
        />
        <h1 className="text-3xl sm:text-4xl font-bold text-white">
          About Job Ready AI Tool
        </h1>
        <p className="mt-2 text-gray-400 max-w-2xl">
          Empowering your career with AI-driven tools and resources to help you
          get job ready faster.
        </p>
      </header>

      {/* About Content */}
      <section className="max-w-3xl space-y-6 leading-relaxed text-gray-300">
        <h2 className="text-xl font-semibold text-white">Who We Are</h2>
        <p>
          At <strong>Job Ready AI Tool</strong>, we believe that technology can
          bridge the gap between talent and opportunity. Our platform provides
          intelligent resume building, cover letter generation, and portfolio
          enhancement to help you stand out in the job market.
        </p>

        <h2 className="text-xl font-semibold text-white">Our Mission</h2>
        <p>
          We aim to simplify the job search process, giving you personalized
          insights and guidance powered by cutting-edge AI. Whether you’re a
          fresh graduate or an experienced professional, our tools adapt to your
          unique career goals.
        </p>

        <h2 className="text-xl font-semibold text-white">Why Choose Us</h2>
        <p>
          With a focus on usability, accuracy, and innovation,{" "}
          <strong>Job Ready AI Tool</strong> is designed to make your job hunt
          smarter, faster, and more effective. Our user-first approach ensures
          that every feature adds value to your career journey.
        </p>
      </section>

      {/* Footer / Back Home */}
      <footer className="mt-12 text-center">
        <Link
          to="/"
          className="inline-block bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold py-2 px-6 rounded-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-md"
        >
          Back to Home
        </Link>
      </footer>
    </main>
  );
}