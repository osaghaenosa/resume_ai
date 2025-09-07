
import React from 'react';
import { CheckCircleIcon } from './Icons';
import { PRO_TOKENS } from '../config';

interface PaymentSuccessPageProps {
    onComplete: () => void;
}

export default function PaymentSuccessPage({ onComplete }: PaymentSuccessPageProps) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1120] to-[#111827] p-4 text-white">
             <div className="max-w-md w-full bg-[#111827] bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl p-12 border border-gray-700 text-center">
                <div className="flex justify-center mb-6">
                     <CheckCircleIcon className="h-20 w-20 text-green-400" />
                </div>
                <h1 className="text-3xl font-bold text-white">Upgrade Successful!</h1>
                <p className="text-gray-300 mt-4">
                    Welcome to the Pro plan! You now have access to all premium features, including {PRO_TOKENS} monthly generation tokens.
                </p>
                <button
                    onClick={onComplete}
                    className="mt-8 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
                >
                    Go to Dashboard
                </button>
            </div>
        </div>
    );
}
