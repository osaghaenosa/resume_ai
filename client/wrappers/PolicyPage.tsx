import React from "react";

export default function PolicyPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0B1120] text-gray-300"> {/* Dark background */}
      <div className="max-w-3xl w-full bg-gray-800 rounded-lg shadow-lg p-6"> {/* Dark card */}
        <h1 className="text-3xl font-bold mb-4 text-white">Privacy Policy</h1> {/* White title */}
        <p className="mb-4">
          Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your information when you use our services.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">Information We Collect</h2>
        <p className="mb-4">
          We may collect personal information such as your name, email address, and usage data when you interact with our services.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">How We Use Your Information</h2>
        <p className="mb-4">
          We use your information to provide and improve our services, communicate with you, and ensure the security of our platform.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">Data Security</h2>
        <p className="mb-4">
            We implement appropriate security measures to protect your personal information from unauthorized access, alteration, disclosure, or destruction.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">Your Choices</h2>
        <p className="mb-4">
            You have the right to access, update, or delete your personal information. You can also opt-out of receiving promotional communications from us.
        </p>
        <h2 className="text-2xl font-semibold mb-3 text-white">Changes to This Policy</h2>
        <p className="mb-4">
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page.
        </p>
        
      </div>
    </div>
  );
}