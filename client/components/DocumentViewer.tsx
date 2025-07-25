
import React, { useState, useRef, useEffect } from 'react';
import { Document } from '../types';
import { XIcon, ClipboardCopyIcon, CheckIcon, TrashIcon, DownloadIcon, LoadingSpinner, PencilIcon, ShareIcon, LockClosedIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DocumentViewerProps {
    doc: Document | null;
    onClose: () => void;
    onEdit: (doc: Document) => void;
    onUpgrade: () => void;
}

const PortfolioAnalytics: React.FC<{ doc: Document }> = ({ doc }) => {
    // Mock data for analytics
    const views = Math.floor(Math.random() * 5000) + 100;
    const sales = Math.floor(Math.random() * (views / 20)) + 5;
    const conversionRate = ((sales / views) * 100).toFixed(2);
    const totalBalance = (doc.sourceRequest?.products || []).reduce((acc, p) => acc + p.price, 0) * sales;
    const balance = totalBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

    return (
        <div className="p-4 bg-gray-900 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Portfolio Analytics</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Total Views</p>
                    <p className="text-2xl font-bold text-cyan-400">{views.toLocaleString()}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Total Sales</p>
                    <p className="text-2xl font-bold text-cyan-400">{sales}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Balance</p>
                    <p className="text-2xl font-bold text-green-400">{balance}</p>
                </div>
                <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-sm text-gray-400">Conversion</p>
                    <p className="text-2xl font-bold text-cyan-400">{conversionRate}%</p>
                </div>
            </div>
        </div>
    );
};


export default function DocumentViewer({ doc, onClose, onEdit, onUpgrade }: DocumentViewerProps) {
    const { deleteDocument, publishDocument, currentUser } = useAuth();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [shareText, setShareText] = useState('Share');
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setShareText('Share');
    }, [doc]);

    if (!doc) return null;

    const handleCopyText = () => {
        if (contentRef.current) {
            const contentElement = contentRef.current.firstChild as HTMLElement;
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
        const elementToCapture = contentRef.current?.firstChild as HTMLElement | null;
        if (!elementToCapture) return;
    
        setIsDownloadingPdf(true);
    
        const clone = elementToCapture.cloneNode(true) as HTMLElement;
        if (doc.type !== 'Portfolio') {
            clone.style.width = '800px';
        }
        clone.style.position = 'absolute';
        clone.style.left = '-9999px';
        clone.style.top = '0';
        clone.style.height = 'auto';
        clone.style.margin = '0';
        clone.style.padding = '0';

        document.body.appendChild(clone);
    
        try {
            const canvas = await html2canvas(clone, {
                scale: 2,
                useCORS: true,
                backgroundColor: doc.type === 'Portfolio' ? null : '#ffffff',
            });
    
            document.body.removeChild(clone);
    
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
    
            const canvasAspectRatio = canvas.height / canvas.width;
            const pageHeightForWidth = pdfWidth * canvasAspectRatio;
    
            let currentPosition = 0;
    
            pdf.addImage(imgData, 'PNG', 0, currentPosition, pdfWidth, pageHeightForWidth);
            let heightLeft = pageHeightForWidth - pdfHeight;
    
            while (heightLeft > 0) {
                currentPosition -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, currentPosition, pdfWidth, pageHeightForWidth);
                heightLeft -= pdfHeight;
            }
    
            pdf.save(`${doc.title.replace(/ /g, '_')}.pdf`);
        } catch (err) {
            if (clone.parentNode === document.body) {
                document.body.removeChild(clone);
            }
            console.error("Failed to download PDF", err);
            alert("Sorry, there was an error creating the PDF. Please try again.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };
    
    const handleEdit = () => {
        // Always open the modal for any edit. The modal will handle token logic.
        onEdit(doc);
    };

    const handleShare = () => {
        publishDocument(doc.id);
        const shareUrl = `${window.location.origin}/share/${doc.id}`;
        navigator.clipboard.writeText(shareUrl);
        setShareText('Link Copied!');
        setTimeout(() => setShareText('Share'), 3000);
    };

    const handleDownloadHtml = () => {
        const blob = new Blob([doc.content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${doc.title.replace(/ /g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
    
    const canEdit = currentUser ? currentUser.plan === 'Pro' || currentUser.tokens > 0 : false;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#111827] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">{doc.title}</h2>
                        <p className="text-sm text-gray-400">{doc.type}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        {canEdit ? (
                            <button onClick={handleEdit} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300">
                                <PencilIcon />
                                <span className="hidden sm:inline ml-2">Edit</span>
                            </button>
                        ) : (
                            <button onClick={onUpgrade} className="flex items-center text-sm p-2 rounded-md font-semibold text-yellow-400 bg-yellow-900/50 hover:bg-yellow-900/80">
                                <LockClosedIcon className="h-4 w-4" />
                                <span className="hidden sm:inline ml-2">Upgrade to Edit</span>
                            </button>
                        )}
                        {doc.type === 'Portfolio' && (
                            <>
                                <button onClick={handleShare} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300">
                                    {shareText === 'Link Copied!' ? <CheckIcon/> : <ShareIcon />}
                                    <span className="hidden sm:inline ml-2">{shareText}</span>
                                </button>
                                <button onClick={handleDownloadHtml} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300">
                                    <DownloadIcon />
                                    <span className="hidden sm:inline ml-2">HTML</span>
                                </button>
                            </>
                        )}
                        <button onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300 disabled:opacity-50 disabled:cursor-wait">
                            {isDownloadingPdf ? <LoadingSpinner /> : <DownloadIcon />}
                            <span className="hidden sm:inline ml-2">{isDownloadingPdf ? '...' : 'PDF'}</span>
                        </button>
                        <button onClick={handleCopyText} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300 disabled:opacity-50">
                            {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
                            <span className="hidden sm:inline ml-2">{isCopied ? 'Copied!' : 'Text'}</span>
                        </button>
                        <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-500/10 text-red-500 hover:text-red-400">
                        <TrashIcon />
                        </button>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white ml-2">
                            <XIcon />
                        </button>
                    </div>
                </div>
                {doc.type === 'Portfolio' && doc.sourceRequest?.products && doc.sourceRequest.products.length > 0 && (
                    <PortfolioAnalytics doc={doc} />
                )}
                <div className="flex-grow overflow-y-auto p-6 bg-gray-600">
                    <div ref={contentRef}>
                        <div dangerouslySetInnerHTML={{ __html: doc.content }} />
                    </div>
                </div>
            </div>
        </div>
    );
}
