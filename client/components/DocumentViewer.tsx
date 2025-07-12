import React, { useState, useRef, useEffect } from 'react';
import { Document } from '../types';
import { XIcon, ClipboardCopyIcon, CheckIcon, TrashIcon, DownloadIcon, LoadingSpinner, PencilIcon, ShareIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface DocumentViewerProps {
    doc: Document | null;
    onClose: () => void;
    onEdit: (doc: Document) => void;
}

export default function DocumentViewer({ doc, onClose, onEdit }: DocumentViewerProps) {
    const { deleteDocument, updateDocument, publishDocument } = useAuth();
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [shareText, setShareText] = useState('Share');
    const contentRef = useRef<HTMLDivElement>(null);
    const editableContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        console.log("Opened document viewer for:", doc); // ✅ Debug
        setIsEditing(false);
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

    const handleSave = () => {
    if (editableContentRef.current && doc.sourceRequest && doc.id) {
        const newContent = editableContentRef.current.innerHTML;
        updateDocument(
        { ...doc, id: doc.id, content: newContent }, // explicitly include `id`
        doc.sourceRequest
        );
        setIsEditing(false);
    } else {
        console.error("Missing document data for update.");
        alert("Update failed: missing document ID.");
    }
    };


    const handleCancel = () => {
        setIsEditing(false);
    };

    const handleDownloadPdf = async () => {
        const elementToCapture = contentRef.current?.firstChild as HTMLElement | null;
        if (!elementToCapture || !doc) return;

        setIsDownloadingPdf(true);

        try {
            const isPortfolio = doc.type === 'Portfolio';
            const canvas = await html2canvas(elementToCapture, {
                scale: 2,
                useCORS: isPortfolio,
                backgroundColor: isPortfolio ? null : '#ffffff',
                allowTaint: isPortfolio,
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgProps = pdf.getImageProperties(imgData);
            const aspectRatio = imgProps.width / imgProps.height;
            let margin = isPortfolio ? 0 : 10;

            let pdfImgWidth = pdfWidth - (margin * 2);
            let pdfImgHeight = pdfImgWidth / aspectRatio;

            if (pdfImgHeight > pdfHeight - (margin * 2)) {
                pdfImgHeight = pdfHeight - (margin * 2);
                pdfImgWidth = pdfImgHeight * aspectRatio;
            }

            const x = (pdfWidth - pdfImgWidth) / 2;
            const y = (pdfHeight - pdfImgHeight) / 2;

            pdf.addImage(imgData, 'PNG', x, y, pdfImgWidth, pdfImgHeight);
            pdf.save(`${doc.title.replace(/ /g, '_')}.pdf`);

        } catch (err) {
            console.error("Failed to download PDF", err);
            alert("Sorry, there was an error creating the PDF. Please try again.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleEdit = () => {
        if (doc.type === 'Portfolio') {
            onEdit(doc);
        } else {
            setIsEditing(true);
        }
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

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#111827] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700 flex-shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">{doc.title}</h2>
                        <p className="text-sm text-gray-400">{doc.type}</p>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                        {isEditing ? (
                            <>
                                <button onClick={handleSave} className="flex items-center text-sm p-2 rounded-md text-cyan-400 bg-cyan-900/50 hover:bg-cyan-900/80">
                                    <CheckIcon />
                                    <span className="hidden sm:inline ml-2">Save</span>
                                </button>
                                <button onClick={handleCancel} className="flex items-center text-sm p-2 rounded-md text-gray-400 hover:bg-gray-700">
                                    <XIcon />
                                    <span className="hidden sm:inline ml-2">Cancel</span>
                                </button>
                            </>
                        ) : (
                            <>
                                <button onClick={handleEdit} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300">
                                    <PencilIcon />
                                    <span className="hidden sm:inline ml-2">Edit</span>
                                </button>
                                {doc.type === 'Portfolio' && (
                                    <>
                                        <button onClick={handleShare} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 hover:text-cyan-300">
                                            {shareText === 'Link Copied!' ? <CheckIcon /> : <ShareIcon />}
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
                                    <span className="hidden sm:inline ml-2">{isCopied ? 'Copied!' : 'Copy'}</span>
                                </button>
                                <button onClick={handleDelete} className="p-2 rounded-full hover:bg-red-500/10 text-red-500 hover:text-red-400">
                                    <TrashIcon />
                                </button>
                            </>
                        )}
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-700 text-gray-400 hover:text-white ml-2">
                            <XIcon />
                        </button>
                    </div>
                </div>
                <div className="flex-grow overflow-y-auto p-6 bg-gray-600">
                    {isEditing ? (
                        <div
                            key={doc.id}
                            ref={editableContentRef}
                            contentEditable={true}
                            suppressContentEditableWarning={true}
                            className="bg-white rounded p-1 outline-none focus:outline-2 focus:outline-cyan-500 focus:outline-offset-2"
                            dangerouslySetInnerHTML={{ __html: doc.content }}
                        />
                    ) : (
                        <div ref={contentRef}>
                            <div dangerouslySetInnerHTML={{ __html: doc.content }} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
