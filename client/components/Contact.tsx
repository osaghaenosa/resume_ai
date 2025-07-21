
import React, { useState } from 'react';

export default function Contact() {
    const [status, setStatus] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('Thank you for your message!');
        // In a real app, you would handle form submission here.
    };

    return (
        <>
            <div className="text-center mb-12">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white">Get In Touch</h2>
                <p className="mt-4 text-lg text-gray-400">Have questions or feedback? We'd love to hear from you.</p>
            </div>
            <div className="max-w-xl mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="sr-only">Name</label>
                        <input type="text" name="name" id="name" required className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Your Name" />
                    </div>
                    <div>
                        <label htmlFor="email" className="sr-only">Email</label>
                        <input type="email" name="email" id="email" required className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Your Email" />
                    </div>
                    <div>
                        <label htmlFor="message" className="sr-only">Message</label>
                        <textarea name="message" id="message" rows={4} required className="w-full bg-gray-800 border border-gray-700 rounded-md py-3 px-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500" placeholder="Your Message"></textarea>
                    </div>
                    <div>
                        <button type="submit" className="w-full bg-cyan-500 text-white font-bold py-3 px-8 rounded-md hover:bg-cyan-400 transition-colors duration-300">
                            Send Message
                        </button>
                    </div>
                </form>
                {status && <p className="mt-6 text-center text-green-400">{status}</p>}
                <div className="mt-8 text-center text-gray-400">
                    <p>Or email us directly at <a href="mailto:airesumegen@gmail.com" className="text-cyan-400 hover:underline">airesumegen@gmail.com</a></p>
                </div>
            </div>
        </>
    );
}