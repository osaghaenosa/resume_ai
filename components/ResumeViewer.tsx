import React, { useState, useRef } from 'react';
import { Document } from '../types';
import { XIcon, ClipboardCopyIcon, CheckIcon, TrashIcon, DownloadIcon, LoadingSpinner } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';


interface ResumeViewerProps {
    doc: Document | null;
    onClose: () => void;
}

export default function ResumeViewer({ doc, onClose }: ResumeViewerProps) {
    const { deleteDocument } = useAuth();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const resumeContentRef = useRef<HTMLDivElement>(null);

    if (!doc) return null;

    const handleCopy = () => {
        if (resumeContentRef.current) {
            // To get a better text representation, we use the innerText of the actual content element.
            const contentElement = resumeContentRef.current.firstChild as HTMLElement;
            if (contentElement) {
                navigator.clipboard.writeText(contentElement.innerText);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            }
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${doc.title}"?`)) {
            deleteDocument(doc.id);
            onClose();
        }
    };

    const handleDownloadPdf = async () => {
        if (!resumeContentRef.current || !doc) return;
        
        const elementToCapture = resumeContentRef.current.firstChild as HTMLElement;
        if (!elementToCapture) return;

        setIsDownloading(true);

        try {
            const canvas = await html2canvas(elementToCapture, {
                scale: 2, // Higher scale for better quality
                useCORS: true,
                backgroundColor: '#ffffff',
            });
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'p',
                unit: 'mm',
                format: 'a4',
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const imgWidth = imgProps.width;
            const imgHeight = imgProps.height;
    
            // Calculate the aspect ratio
            const aspectRatio = imgWidth / imgHeight;

            // Define margins
            const margin = 10;
            const usableWidth = pdfWidth - (margin * 2);
            const usableHeight = pdfHeight - (margin * 2);

            // Calculate the dimensions of the image in the PDF to fit the page
            let pdfImgWidth = usableWidth;
            let pdfImgHeight = pdfImgWidth / aspectRatio;

            // If the calculated height is greater than the usable height,
            // recalculate based on the height to ensure it fits.
            if (pdfImgHeight > usableHeight) {
                pdfImgHeight = usableHeight;
                pdfImgWidth = pdfImgHeight * aspectRatio;
            }

            // Center the image on the page
            const x = (pdfWidth - pdfImgWidth) / 2;
            const y = (pdfHeight - pdfImgHeight) / 2;
    
            pdf.addImage(imgData, 'PNG', x, y, pdfImgWidth, pdfImgHeight);
            pdf.save(`${doc.title.replace(/ /g, '_')}.pdf`);

        } catch(err) {
            console.error("Failed to download PDF", err);
            alert("Sorry, there was an error creating the PDF. Please try again.");
        } finally {
            setIsDownloading(false);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#111827] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">{doc.title}</h2>
                        <p className="text-sm text-gray-400">{doc.type}</p>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <button onClick={handleDownloadPdf} disabled={isDownloading} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-wait">
                            {isDownloading ? <LoadingSpinner /> : <DownloadIcon />}
                            <span className="hidden sm:inline ml-2">{isDownloading ? 'Downloading...' : 'Download PDF'}</span>
                        </button>
                         <button onClick={handleCopy} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300 disabled:opacity-50">
                            {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
                            <span className="hidden sm:inline ml-2">{isCopied ? 'Copied!' : 'Copy Text'}</span>
                        </button>
                         <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-500/10 text-red-500 hover:text-red-400">
                           <TrashIcon />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white">
                            <XIcon />
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-6 bg-gray-600">
                    <div ref={resumeContentRef}>
                        <div dangerouslySetInnerHTML={{ __html: doc.content }} />
                    </div>
                </div>
            </div>
        </div>
    );
}