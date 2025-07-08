import React from 'react';
import { Document } from '../types';
import { DocumentTextIcon, TrashIcon } from './Icons';

interface ResumeCardProps {
    doc: Document;
    onView: () => void;
    onDelete: (docId: string) => void;
}

const ResumeCard: React.FC<ResumeCardProps> = ({ doc, onView, onDelete }) => {
    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // prevent triggering onView
        if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
            onDelete(doc.id);
        }
    };

    return (
        <div 
            onClick={onView}
            className="bg-[#111827] p-6 rounded-lg shadow-lg hover:shadow-cyan-500/10 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col justify-between"
        >
            <div>
                <div className="flex items-start justify-between">
                    <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-gray-700 text-cyan-400">
                        <DocumentTextIcon />
                    </div>
                    <button onClick={handleDelete} className="text-gray-500 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-gray-700">
                       <TrashIcon />
                    </button>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white truncate">{doc.title}</h3>
                <p className="text-sm text-gray-400 mt-1">{doc.type}</p>
            </div>
            <p className="text-xs text-gray-500 mt-4">Created: {new Date(doc.createdAt).toLocaleDateString()}</p>
        </div>
    );
};

export default ResumeCard;
