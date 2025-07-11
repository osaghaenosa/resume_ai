
import React, { useState } from 'react';
import { LockClosedIcon, ArrowLeftIcon, LoadingSpinner } from './Icons';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';

interface CheckoutPageProps {
    onPaymentConfirm: () => void;
    onBack: () => void;
}

export default function CheckoutPage({ onPaymentConfirm, onBack }: CheckoutPageProps) {
    const stripe = useStripe();
    const elements = useElements();

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | undefined>('');

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            // Stripe.js has not yet loaded.
            return;
        }

        setIsLoading(true);
        setErrorMessage('');
        
        // This is a simulation. In a real app, you would call stripe.confirmPayment()
        // with the elements instance and a client secret from your server.
        // For this demo, we'll just simulate a delay and then success.

        console.log("Simulating payment processing...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Pretend a payment error occurred randomly for demonstration
        if (Math.random() > 0.8) {
             console.log("Simulating payment failure.");
             setErrorMessage("Your card was declined. Please try a different card.");
             setIsLoading(false);
        } else {
            console.log("Payment simulation successful!");
            onPaymentConfirm();
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1120] to-[#111827] p-4 text-white">
            <div className="w-full max-w-lg relative">
                <button onClick={onBack} className="absolute -top-12 left-0 flex items-center text-gray-400 hover:text-white transition-colors">
                    <ArrowLeftIcon />
                    <span className="ml-2">Back</span>
                </button>
                <form onSubmit={handleSubmit} className="bg-[#111827] bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
                    <h1 className="text-3xl font-bold text-center mb-2">Checkout</h1>
                    <p className="text-gray-400 text-center mb-8">Securely upgrade your account to Pro.</p>

                    <div className="bg-gray-800 rounded-lg p-6 mb-8">
                        <h2 className="text-xl font-semibold">Order Summary</h2>
                        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                            <p>AIResumeGen Pro Plan (Monthly)</p>
                            <p className="font-bold text-xl">$29.00</p>
                        </div>
                    </div>
                    
                    <PaymentElement />
                    
                    {errorMessage && <div className="text-sm text-red-400 mt-4 text-center">{errorMessage}</div>}

                    <button 
                        disabled={isLoading || !stripe || !elements}
                        className="w-full mt-8 flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-wait"
                    >
                       {isLoading ? (
                            <LoadingSpinner />
                        ) : (
                             <span className="flex items-center">
                                <LockClosedIcon className="h-5 w-5 mr-2"/>
                                Confirm Payment
                             </span>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}