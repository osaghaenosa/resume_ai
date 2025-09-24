import React from "react";

export default function HelpPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0B1120] text-gray-300"> {/* Dark background */}
            <div className="max-w-3xl w-full bg-gray-800 rounded-lg shadow-lg p-6"> {/* Dark card */}
                <h1 className="text-3xl font-bold mb-4 text-white">Help & Support</h1> {/* White title */}
                <p className="mb-4">
                    If you need assistance or have any questions, we're here to help! Below are some common topics and resources to get you started.
                </p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Getting Started</h2>
                <p className="mb-4">
                    To get started with our application, please refer to the <a href="/about" className="text-cyan-400 hover:underline">About Page</a> for an overview of features and functionalities.
                </p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Account Management</h2>
                <p className="mb-4">
                    For issues related to account creation, login, or password reset, please visit the <a href="/login" className="text-cyan-400 hover:underline">Login Page</a> or <a href="/signup" className="text-cyan-400 hover:underline">Signup Page</a>.
                </p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Technical Support</h2>
                <p className="mb-4">
                    If you encounter any technical issues while using our application, please contact our support team at <a href="mailto:osaghaenosa2001@gmail.com" className="text-cyan-400 hover:underline">osaghaenosa2001@gmaiol.com</a>.
                </p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Feedback & Suggestions</h2>
                <p className="mb-4">
                    We value your feedback! If you have any suggestions for improving our application, please reach out to us via the <a href="/contact" className="text-cyan-400 hover:underline">Contact Page</a>.
                </p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Frequently Asked Questions (FAQs)</h2>
                <p className="mb-4">
                    Check out our FAQ section on the <a href="/about" className="text-cyan-400 hover:underline">About Page</a> for answers to common questions.
                </p>
            </div>
        </div>
    );
}