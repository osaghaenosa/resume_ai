import React from "react";
import { Helmet } from 'react-helmet';

export default function ContactPage() {
    
    return (
        <>
        <Helmet>
            <title>Contact Us | Job Ready AI Tool</title>
            <meta
              name="description"
              content="If you have any questions, feedback, or need assistance, please feel free to reach out to us. We are here to help!."
            />
            <meta
              name="keywords"
              content="If you have any questions, feedback, or need assistance, please feel free to reach out to us. We are here to help!."
            />
            <meta name="robots" content="index, follow" />
            <meta name="author" content="Job Ready AI Tool" />
            
        </Helmet>
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0B1120] text-gray-300"> {/* Dark background */}
            <div className="max-w-3xl w-full bg-gray-800 rounded-lg shadow-lg p-6"> {/* Dark card */}
                <h1 className="text-3xl font-bold mb-4 text-white">Contact Us</h1> {/* White title */}
                <p className="mb-4">
                    If you have any questions, feedback, or need assistance, please feel free to reach out to us. We are here to help!
                </p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Email</h2>
                <p className="mb-4">
                    You can contact us via email at: <a href="mailto:nosentix.network@gmail.com" className="text-cyan-400 hover:underline">
                        nosentix.network@gmail.com
                        </a>
                </p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Phone</h2>
                <p className="mb-4"> +2349030275188</p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Address</h2>
                <p className="mb-4"> 123 Main Street, City, Country</p>
                <h2 className="text-2xl font-semibold mb-3 text-white">Business Hours</h2>
                <p className="mb-4"> Monday - Friday: 9:00 AM - 6:00 PM</p>
                <p className="mb-4"> Saturday - Sunday: Closed</p>
                <ContactPage />
                <h2 className="text-2xl font-semibold mb-3 text-white">Follow Us</h2>
                <p className="mb-4">
                    Stay connected with us on social media:
                    <a href="https://twitter.com/yourprofile" className="text-cyan-400 hover:underline ml-2">Twitter</a>, 
                    <a href="https://facebook.com/yourprofile" className="text-cyan-400 hover:underline ml-2">Facebook</a>,
                    <a href="https://linkedin.com/yourprofile" className="text-cyan-400 hover:underline ml-2">LinkedIn</a>
                </p>
            </div>
        </div>
        </>
    );
}