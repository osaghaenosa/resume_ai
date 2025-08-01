
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Document } from '../types';
import { LoadingSpinner, BrainIcon, ShieldCheckIcon } from './Icons';

interface SharePageProps {
    docId: string;
}

export default function SharePage({ docId }: SharePageProps) {
    const { getPublicDocument } = useAuth();
    const [doc, setDoc] = useState<Document | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
    const fetchDoc = async () => {
       
        setLoading(true);
        try {
            const publicDoc = await getPublicDocument(docId);
            

            if (publicDoc) {
                setDoc(publicDoc);
                
            } else {
                alert('⚠️ Document not found or is not public.');
                setError("This document could not be found or is not public.");
            }
        } catch (e) {
            alert('❌ Error fetching document from server.');
            setError("An error occurred while trying to load this document.");
        } finally {
            setLoading(false);
        }
    };

    fetchDoc();
}, [docId, getPublicDocument]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
                <LoadingSpinner />
                <p className="mt-4">Loading Document...</p>
            </div>
        );
    }
    
    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-white p-4">
                 <ShieldCheckIcon className="h-16 w-16 text-red-500" />
                <h1 className="text-3xl font-bold mt-4">Document Not Found</h1>
                <p className="text-gray-400 mt-2 text-center">{error}</p>
                 <a href="/" className="mt-8 bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-400 transition-colors">
                    Go to Homepage
                </a>
            </div>
        );
    }
    
    if (!doc) {
        // This case should ideally be covered by the error state, but it's a good fallback.
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
                 <p>Could not load document.</p>
            </div>
        );
    }


    return (
        <div className="bg-gray-800">
             <iframe 
                            srcDoc={doc.content}
                            sandbox="allow-scripts allow-same-origin"
                            style={{ width: '100%', height: '100vh', border: 'none' }}
                            title="Portfolio"
                          />
             <footer className="text-center p-4 bg-gray-900 text-gray-500 text-sm">
                 <p>
                    This portfolio was created with 
                    <a href="/" className="text-cyan-400 hover:underline mx-1 font-semibold flex items-center justify-center">
                        <BrainIcon /> <span className="ml-1">AIResumeGen</span>
                    </a>
                </p>
             </footer>
        </div>
    );
}
