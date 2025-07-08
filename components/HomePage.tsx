
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Document } from '../types';
import GeneratorModal from './GeneratorModal';
import ResumeCard from './ResumeCard';
import ResumeViewer from './ResumeViewer';
import { DocumentTextIcon } from './Icons';

export default function HomePage() {
    const { currentUser, deleteDocument } = useAuth();
    const [isGeneratorOpen, setIsGeneratorOpen] = useState(false);
    const [viewingDoc, setViewingDoc] = useState<Document | null>(null);

    const documents = currentUser?.documents ?? [];

    const handleViewDoc = (doc: Document) => {
        setViewingDoc(doc);
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">Home Dashboard</h1>
                    <p className="mt-1 text-gray-400">Welcome back, {currentUser?.name}. Here are your documents.</p>
                </div>
                <button
                    onClick={() => setIsGeneratorOpen(true)}
                    className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-400 transition-colors self-start sm:self-center"
                >
                    + Create New
                </button>
            </div>
            
            <div className="mt-8">
                {documents.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {documents.map(doc => (
                            <ResumeCard 
                                key={doc.id}
                                doc={doc}
                                onView={() => handleViewDoc(doc)}
                                onDelete={deleteDocument}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 px-6 border-2 border-dashed border-gray-700 rounded-lg mt-12 flex flex-col items-center">
                        <DocumentTextIcon />
                        <h3 className="text-xl font-semibold text-white mt-4">No documents yet</h3>
                        <p className="text-gray-400 mt-2">Click the "Create New" button to generate your first resume or cover letter.</p>
                    </div>
                )}
            </div>

            {isGeneratorOpen && <GeneratorModal onClose={() => setIsGeneratorOpen(false)} />}
            {viewingDoc && <ResumeViewer doc={viewingDoc} onClose={() => setViewingDoc(null)} />}
        </div>
    );
}
