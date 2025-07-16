import React, { useState, useRef, useEffect } from 'react';
import { Document } from '../types';
import {
    XIcon, ClipboardCopyIcon, CheckIcon,
    TrashIcon, DownloadIcon, LoadingSpinner,
    PencilIcon, ShareIcon
} from './Icons';
import { useAuth } from '../contexts/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import UpgradeModal from './UpgradeModal';

interface DocumentViewerProps {
    doc: Document | null;
    onClose: () => void;
    onEdit: (doc: Document) => void;
}

export default function DocumentViewer({ doc, onClose, onEdit }: DocumentViewerProps) {
    const { currentUser, deleteDocument, updateDocument, publishDocument } = useAuth();

    const [localDoc, setLocalDoc] = useState<Document | null>(doc);
    const [isCopied, setIsCopied] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [shareText, setShareText] = useState('Share');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    const contentRef = useRef<HTMLDivElement>(null);
    const editableContentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsEditing(false);
        setShareText('Share');
        setLocalDoc(doc);
    }, [doc]);

    if (!localDoc) return null;

    const handleCopyText = () => {
        const contentElement = contentRef.current?.firstChild as HTMLElement;
        if (contentElement) {
            navigator.clipboard.writeText(contentElement.innerText);
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 2000);
        }
    };

    const handleDelete = () => {
        if (window.confirm(`Are you sure you want to delete "${localDoc.title}"?`)) {
            deleteDocument(localDoc.id);
            onClose();
        }
    };

    const handleSave = () => {
        if (editableContentRef.current && localDoc.sourceRequest && localDoc.id) {
            const newContent = editableContentRef.current.innerHTML;
            updateDocument(
                { ...localDoc, content: newContent },
                localDoc.sourceRequest
            );
            setLocalDoc({ ...localDoc, content: newContent });
            setIsEditing(false);
        } else {
            console.error("Missing document data for update.");
            alert("Update failed: missing document ID.");
        }
    };

    const handleCancel = () => setIsEditing(false);

    const handleDownloadPdf = async () => {
        const element = contentRef.current?.firstChild as HTMLElement | null;
        if (!element) return;

        setIsDownloadingPdf(true);
        try {
            const isPortfolio = localDoc.docType?.toLowerCase() === 'portfolio';
            const canvas = await html2canvas(element, {
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

            let width = pdfWidth - 20;
            let height = width / aspectRatio;

            if (height > pdfHeight - 20) {
                height = pdfHeight - 20;
                width = height * aspectRatio;
            }

            const x = (pdfWidth - width) / 2;
            const y = (pdfHeight - height) / 2;

            pdf.addImage(imgData, 'PNG', x, y, width, height);
            pdf.save(`${localDoc.title.replace(/ /g, '_')}.pdf`);
        } catch (err) {
            console.error("PDF download error", err);
            alert("Error creating PDF. Try again.");
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleEdit = () => {
        if (!currentUser || currentUser.tokens <= 0) {
            setShowUpgradeModal(true);
            return;
        }

        if (localDoc.docType?.toLowerCase() === 'portfolio') {
            onEdit(localDoc);
        } else {
            setIsEditing(true);
        }
    };

    const handleShare = () => {
        if (localDoc.docType?.toLowerCase() !== 'portfolio') return;

        publishDocument(localDoc.id);
        const shareUrl = `${window.location.origin}/share/${localDoc.id}`;
        navigator.clipboard.writeText(shareUrl);
        setShareText('Link Copied!');
        setTimeout(() => setShareText('Share'), 3000);
    };

    const handleDownloadHtml = () => {
        if (localDoc.docType?.toLowerCase() !== 'portfolio') return;

        const htmlString = `
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8">
                    <title>${localDoc.title}</title>
                    <style>body{font-family:sans-serif;padding:40px;background:#f4f4f4;color:#333;}</style>
                </head>
                <body>
                    ${localDoc.content}
                </body>
            </html>
        `;

        const blob = new Blob([htmlString], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${localDoc.title.replace(/ /g, '_')}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                <div className="bg-[#111827] rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                    <div className="flex justify-between items-center p-4 border-b border-gray-700">
                        <div>
                            <h2 className="text-xl font-bold text-white">{localDoc.title}</h2>
                            <p className="text-sm text-gray-400">{localDoc.docType}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                            {isEditing ? (
                                <>
                                    <button onClick={handleSave} className="flex items-center text-sm p-2 rounded-md text-cyan-400 bg-cyan-900/50 hover:bg-cyan-900/80">
                                        <CheckIcon />
                                        <span className="ml-2 hidden sm:inline">Save</span>
                                    </button>
                                    <button onClick={handleCancel} className="flex items-center text-sm p-2 rounded-md text-gray-400 hover:bg-gray-700">
                                        <XIcon />
                                        <span className="ml-2 hidden sm:inline">Cancel</span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={handleEdit} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700">
                                        <PencilIcon />
                                        <span className="ml-2 hidden sm:inline">Edit</span>
                                    </button>

                                    {localDoc.docType?.toLowerCase() === 'portfolio' && (
                                        <>
                                            <button onClick={handleShare} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700">
                                                {shareText === 'Link Copied!' ? <CheckIcon /> : <ShareIcon />}
                                                <span className="ml-2 hidden sm:inline">{shareText}</span>
                                            </button>
                                            <button onClick={handleDownloadHtml} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700">
                                                <DownloadIcon />
                                                <span className="ml-2 hidden sm:inline">HTML</span>
                                            </button>
                                        </>
                                    )}

                                    <button onClick={handleDownloadPdf} disabled={isDownloadingPdf} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700 disabled:opacity-50">
                                        {isDownloadingPdf ? <LoadingSpinner /> : <DownloadIcon />}
                                        <span className="ml-2 hidden sm:inline">{isDownloadingPdf ? '...' : 'PDF'}</span>
                                    </button>

                                    <button onClick={handleCopyText} className="flex items-center text-sm p-2 rounded-md text-cyan-400 hover:bg-gray-700">
                                        {isCopied ? <CheckIcon /> : <ClipboardCopyIcon />}
                                        <span className="ml-2 hidden sm:inline">{isCopied ? 'Copied!' : 'Copy'}</span>
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
                                key={localDoc.id}
                                ref={editableContentRef}
                                contentEditable
                                suppressContentEditableWarning
                                className="bg-white rounded p-1 outline-none focus:outline-2 focus:outline-cyan-500"
                                dangerouslySetInnerHTML={{ __html: localDoc.content }}
                            />
                        ) : (
                            <div ref={contentRef}>
                                <div dangerouslySetInnerHTML={{ __html: localDoc.content }} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showUpgradeModal && (
                <UpgradeModal
                    onClose={() => setShowUpgradeModal(false)}
                    onUpgrade={() => {
                        setShowUpgradeModal(false);
                        window.location.href = '/pricing';
                    }}
                />
            )}
        </>
    );
}