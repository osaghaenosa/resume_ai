
import React, { useState } from 'react';
import { LockClosedIcon, ArrowLeftIcon, LoadingSpinner } from './Icons';
import { User } from '../types';
import { PRO_PRICE } from '../config';

// This function is loaded from the Flutterwave script in index.html
declare const FlutterwaveCheckout: any;

interface CheckoutPageProps {
    user: User;
    onPaymentConfirm: () => void;
}

// Using a test public key from Flutterwave's documentation
const FLUTTERWAVE_PUBLIC_KEY = 'FLWPUBK_TEST-xxxxxxxxxxxxxxxx-X';

export default function CheckoutPage({ user, onPaymentConfirm }: CheckoutPageProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>('');

    const handleCheckout = () => {
        if (typeof FlutterwaveCheckout !== 'function') {
            setErrorMessage("Payment service is not available. Please refresh the page and try again.");
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        
        try {
            FlutterwaveCheckout({
                public_key: FLUTTERWAVE_PUBLIC_KEY,
                tx_ref: `airesumegen-pro-${Date.now()}`,
                amount: PRO_PRICE,
                currency: "USD",
                payment_options: "card,mobilemoney,ussd",
                customer: {
                    email: user.email,
                    name: user.name,
                },
                customizations: {
                    title: "AI Resume Gen Pro",
                    description: "Upgrade to the Pro Monthly Plan",
                },
                callback: function (data: any) {
                    console.log("Flutterwave callback data:", data);
                    setIsLoading(false);
                    // Verify transaction status and amount
                    if (data.status === "successful" && data.amount === PRO_PRICE && data.currency === "USD") {
                        onPaymentConfirm();
                    } else {
                        setErrorMessage("Payment was not successful. Please try again.");
                    }
                },
                onclose: function() {
                    // This is called when the user closes the modal
                    if (!isLoading) return; // Only update state if a payment wasn't already processed
                    setIsLoading(false);
                    console.log("Payment modal closed by user.");
                },
            });
        } catch (error) {
            console.error("Flutterwave checkout error:", error);
            setIsLoading(false);
            setErrorMessage("Could not initiate payment. Please try again later.");
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1120] to-[#111827] p-4 text-white">
            <div className="w-full max-w-lg relative">
                <button onClick={() => window.history.back()} className="absolute -top-12 left-0 flex items-center text-gray-400 hover:text-white transition-colors">
                    <ArrowLeftIcon />
                    <span className="ml-2">Back</span>
                </button>
                <div className="bg-[#111827] bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
                    <h1 className="text-3xl font-bold text-center mb-2">Checkout</h1>
                    <p className="text-gray-400 text-center mb-8">Securely upgrade your account to Pro.</p>

                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold">Order Summary</h2>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                            <p>AIResumeGen Pro Plan (Monthly)</p>
                            <p className="font-bold text-xl">${PRO_PRICE.toFixed(2)}</p>
                        </div>
                    </div>
                    
                    {errorMessage && <div className="text-sm text-red-400 mt-4 text-center p-3 bg-red-900/20 rounded-md">{errorMessage}</div>}

                    <button 
                        onClick={handleCheckout}
                        disabled={isLoading}
                        className="w-full mt-8 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-wait"
                    >
                       {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                             <span className="flex items-center">
                                <LockClosedIcon className="h-5 w-5 mr-2"/>
                                Pay with Flutterwave
                             </span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
