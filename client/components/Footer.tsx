
import React from 'react';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-[#0B1120] border-t border-gray-800">
            <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center text-gray-500">
                <div className="flex justify-center space-x-6 mb-4">
                    <a href="/policy" className="hover:text-cyan-400">Privacy Policy</a>
                    <a href="/terms" className="hover:text-cyan-400">Terms of Service</a>
                    <a href="/refund" className="hover:text-cyan-400">Refund Policy</a>
                </div>
                <p>&copy; {currentYear} JobReadyAI. All rights reserved.</p>
                <p>© {new Date().getFullYear()} JobReadyAI</p>
            </div>
        </footer>
    );
}