
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { BrainIcon } from './Icons';
import { SignupCredentials } from '../types';

interface SignupPageProps {
    onSignupSuccess: () => void;
    onNavigateToLogin: () => void;
}

export default function SignupPage({ onSignupSuccess, onNavigateToLogin }: SignupPageProps) {
    const { signup } = useAuth();
    const [credentials, setCredentials] = useState<SignupCredentials>({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCredentials({ ...credentials, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if(credentials.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        setError('');
        setIsLoading(true);
        try {
            await signup(credentials);
            onSignupSuccess();
        } catch (err: any) {
            setError(err.message || 'Failed to sign up. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B1120] to-[#111827] p-4">
            <div className="max-w-md w-full bg-[#111827] bg-opacity-80 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-gray-700">
                <div className="text-center">
                    <div className="inline-block p-3 bg-cyan-500/10 rounded-full mb-4">
                        <BrainIcon />
                    </div>
                    <h1 className="text-3xl font-bold text-white">Create Your Account</h1>
                    <p className="text-gray-400 mt-2">Join now to start crafting your future.</p>
                </div>
                
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="name" className="sr-only">Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            autoComplete="name"
                            required
                            value={credentials.name}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Full Name"
                        />
                    </div>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={credentials.email}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Email Address"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="sr-only">Password</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={credentials.password}
                            onChange={handleChange}
                            className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            placeholder="Password (min. 6 characters)"
                        />
                    </div>
                    
                    {error && <p className="text-sm text-red-400 text-center">{error}</p>}
                    
                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <p className="mt-6 text-center text-sm text-gray-400">
                    Already have an account?{' '}
                    <button onClick={onNavigateToLogin} className="font-medium text-cyan-400 hover:text-cyan-300">
                        Log in
                    </button>
                </p>
            </div>
        </div>
    );
}