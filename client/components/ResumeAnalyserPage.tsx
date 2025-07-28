import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { analyseResume } from '../services/geminiService';
import { AnalysisResult, ResumeCorrection } from '../types';
import { LoadingSpinner, SparklesIcon, CheckIcon, XIcon, LockClosedIcon, ExternalLinkIcon, BrainIcon, UploadIcon } from './Icons';

interface ResumeAnalyserPageProps {
    onUpgradeClick: () => void;
}

const ScoreGauge: React.FC<{ score: number }> = ({ score }) => {
    const circumference = 2 * Math.PI * 45; // 2 * pi * r
    const offset = circumference - (score / 100) * circumference;
    const color = score > 80 ? 'text-green-400' : score > 60 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="relative flex items-center justify-center h-48 w-48">
            <svg className="absolute" width="100%" height="100%" viewBox="0 0 100 100">
                <circle className="text-gray-700" strokeWidth="10" stroke="currentColor" fill="transparent" r="45" cx="50" cy="50" />
                <circle
                    className={color}
                    strokeWidth="10"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="transparent"
                    r="45"
                    cx="50"
                    cy="50"
                    style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.8s ease-out' }}
                />
            </svg>
            <span className={`text-4xl font-bold ${color}`}>{score}</span>
        </div>
    );
};

const CorrectionCard: React.FC<{ correction: ResumeCorrection }> = ({ correction }) => (
    <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700">
        <p className="text-sm text-red-400 line-through">"{correction.original}"</p>
        <p className="text-sm text-green-400 mt-1">"{correction.suggestion}"</p>
        <p className="text-xs text-gray-400 mt-2">{correction.explanation}</p>
    </div>
);


export default function ResumeAnalyserPage({ onUpgradeClick }: ResumeAnalyserPageProps) {
    const { currentUser, consumeToken } = useAuth();
    const [resumeText, setResumeText] = useState('');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isParsing, setIsParsing] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'analysis' | 'corrections' | 'fit'>('analysis');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        setError('');
        setResumeText('');

        try {
            let text = '';
            const fileName = file.name.toLowerCase();

            if (fileName.endsWith('.pdf')) {
                 try {
                    const pdfjs = await import('pdfjs-dist');
                    // The worker is crucial. We point to the same CDN for the worker.
                    pdfjs.GlobalWorkerOptions.workerSrc = './public/pdf.worker.mjs';

                    const arrayBuffer = await file.arrayBuffer();
                    const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                    
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        fullText += textContent.items.map((item: any) => ('str' in item ? item.str : '')).join(' ') + '\n';
                    }
                    text = fullText;
                } catch (e: any) {
                    console.error("PDF.js dynamic import or parsing failed:", e);
                    throw new Error("Failed to process PDF file. This can happen due to network issues or if the document is corrupted. Please try again.");
                }
            } else if (fileName.endsWith('.docx')) {
                const mammoth = await import('mammoth');
                const arrayBuffer = await file.arrayBuffer();
                const result = await mammoth.extractRawText({ arrayBuffer });
                text = result.value;
            } else if (fileName.endsWith('.txt')) {
                text = await file.text();
            } else if (fileName.endsWith('.doc')) {
                 throw new Error("Legacy .doc files are not supported. Please save your resume as a .docx or .pdf file and try again.");
            } else {
                throw new Error(`Unsupported file type. Please upload a PDF, DOCX, or TXT file.`);
            }
            setResumeText(text);
        } catch (err: any) {
            setError(err.message || 'Failed to parse the document.');
        } finally {
            setIsParsing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleAnalyse = async () => {
        if (!currentUser || !resumeText.trim()) return;
        if (currentUser.plan === 'Free' && currentUser.tokens <= 0) {
            onUpgradeClick();
            return;
        }

        setIsLoading(true);
        setError('');
        setAnalysisResult(null);

        try {
            const result = await analyseResume(resumeText);
            setAnalysisResult(result);
            consumeToken();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred during analysis.');
        } finally {
            setIsLoading(false);
        }
    };
    
    const canPerformAction = currentUser ? currentUser.plan === 'Pro' || (currentUser.tokens > 0) : false;

    const renderResults = () => {
        if (!analysisResult) return null;
        
        const { analysis, jobs, sources } = analysisResult;

        return (
            <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8 animate-fade-in-up">
                {/* Left Column */}
                <div className="lg:col-span-3 bg-[#111827] p-6 rounded-lg shadow-xl">
                    <div className="text-center border-b border-gray-700 pb-6 mb-6">
                        <h2 className="text-2xl font-bold text-white">Analysis Report</h2>
                        <div className="flex justify-center my-4">
                            <ScoreGauge score={analysis.overallFeedback.score} />
                        </div>
                        <p className="text-gray-400 max-w-xl mx-auto">{analysis.overallFeedback.summary}</p>
                    </div>
                    
                    <div className="mb-4 border-b border-gray-700">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setActiveTab('analysis')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'analysis' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Detailed Analysis</button>
                            <button onClick={() => setActiveTab('corrections')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'corrections' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Corrections ({analysis.corrections.length})</button>
                             <button onClick={() => setActiveTab('fit')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'fit' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Job Fit</button>
                        </nav>
                    </div>

                    {activeTab === 'analysis' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="font-semibold text-lg text-green-400 mb-3">Strengths</h3>
                                <ul className="space-y-2">
                                    {analysis.strengths.map((s, i) => <li key={i} className="flex items-start"><CheckIcon className="h-5 w-5 text-green-400 mr-2 mt-0.5 flex-shrink-0"/> <span className="text-gray-300">{s}</span></li>)}
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-semibold text-lg text-red-400 mb-3">Weaknesses</h3>
                                <ul className="space-y-2">
                                    {analysis.weaknesses.map((w, i) => <li key={i} className="flex items-start"><XIcon className="h-5 w-5 text-red-400 mr-2 mt-0.5 flex-shrink-0"/> <span className="text-gray-300">{w}</span></li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                     {activeTab === 'corrections' && (
                        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                            {analysis.corrections.length > 0 ? (
                                analysis.corrections.map((c, i) => <CorrectionCard key={i} correction={c} />)
                            ) : (
                                <p className="text-gray-400 text-center py-8">No specific grammar or typo corrections found. Great job!</p>
                            )}
                        </div>
                    )}
                    {activeTab === 'fit' && (
                        <div>
                             <h3 className="font-semibold text-lg text-cyan-400 mb-3">Recommended Job Roles</h3>
                             <div className="flex flex-wrap gap-2 mb-6">
                                {analysis.recommendedRoles.map((role, i) => <span key={i} className="bg-gray-700 text-cyan-300 text-sm font-medium px-3 py-1 rounded-full">{role}</span>)}
                             </div>
                             <h3 className="font-semibold text-lg text-cyan-400 mb-3">AI Content Score</h3>
                             <div className="flex items-center gap-4 bg-gray-900/50 p-4 rounded-lg">
                                <p className="text-4xl font-bold">{analysis.aiContentScore.probability}%</p>
                                <div>
                                    <p className="font-semibold text-white">Likely AI-written</p>
                                    <p className="text-sm text-gray-400">{analysis.aiContentScore.explanation}</p>
                                </div>
                             </div>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="lg:col-span-2">
                    <h2 className="text-2xl font-bold text-white mb-4">Live Job Opportunities</h2>
                    <div className="space-y-4 max-h-[80vh] overflow-y-auto pr-2">
                        {jobs.length > 0 ? jobs.map((job, i) => (
                             <a href={job.url} target="_blank" rel="noopener noreferrer" key={i} className="block bg-[#111827] p-4 rounded-lg shadow-lg hover:shadow-cyan-500/10 transition-shadow duration-300 hover:ring-2 hover:ring-cyan-600">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-bold text-white">{job.title}</h4>
                                        <p className="text-sm text-gray-400">{job.company}</p>
                                    </div>
                                    <ExternalLinkIcon className="h-5 w-5 text-gray-500 flex-shrink-0 ml-2" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{job.datePosted}</p>
                                <p className="text-sm text-gray-300 mt-3 border-t border-gray-700 pt-3">{job.description}</p>
                            </a>
                        )) : <p className="text-gray-400 text-center py-8">Could not find live job postings at this time.</p>}
                    </div>
                     {sources.length > 0 && (
                        <div className="mt-6">
                            <h3 className="text-sm font-semibold text-gray-500 mb-2">Job sources provided by Google Search:</h3>
                            <ul className="space-y-1">
                                {sources.map((source, i) => (
                                    <li key={i}>
                                        <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-500 hover:underline truncate block">
                                            {source.title || source.uri}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-white">AI Resume Analyser</h1>
                    <p className="mt-1 text-gray-400">Get instant feedback, find hidden issues, and discover jobs tailored to your profile.</p>
                </div>
                 {analysisResult && <button onClick={() => { setAnalysisResult(null); setResumeText(''); }} className="bg-gray-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors self-start sm:self-center">Start New Analysis</button>}
            </div>

            {isLoading ? (
                <div className="text-center py-20 flex flex-col items-center">
                    <LoadingSpinner />
                    <p className="mt-4 text-lg text-gray-300">Our AI is working its magic...</p>
                    <p className="text-gray-400">This may take a moment.</p>
                </div>
            ) : analysisResult ? (
                renderResults()
            ) : (
                <div className="mt-8 max-w-4xl mx-auto">
                    <div className="bg-[#111827] p-6 rounded-lg shadow-xl">
                        <div className="flex justify-between items-center mb-2">
                             <label htmlFor="resumeText" className="block text-sm font-medium text-gray-300">
                                Paste your full resume text below
                            </label>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".pdf,.docx,.txt,.doc"
                                onChange={handleFileChange}
                                disabled={isParsing}
                            />
                             <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isParsing}
                                className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300 disabled:opacity-50 transition-colors"
                            >
                                <UploadIcon />
                                <span>Or upload a document</span>
                            </button>
                        </div>

                        <div className="relative">
                            <textarea
                                id="resumeText"
                                value={resumeText}
                                onChange={(e) => setResumeText(e.target.value)}
                                placeholder="Paste resume here, or upload a file above..."
                                className="w-full h-64 bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                                disabled={isParsing}
                            />
                            {isParsing && (
                                <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center rounded-md backdrop-blur-sm">
                                    <LoadingSpinner />
                                    <p className="mt-2 text-gray-300">Parsing your document...</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-1 text-xs text-gray-500">
                            Supported formats: PDF, DOCX, TXT.
                        </div>

                         <div className="mt-4 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <p className="text-sm text-gray-400">Analysis costs 1 Generation Token.</p>
                             {canPerformAction ? (
                                <button
                                    onClick={handleAnalyse}
                                    disabled={!resumeText.trim() || isParsing}
                                    className="w-full sm:w-auto bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-cyan-400 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <SparklesIcon />
                                    Analyse Resume
                                </button>
                             ) : (
                                <button
                                    onClick={onUpgradeClick}
                                    className="w-full sm:w-auto bg-yellow-500 text-black font-bold py-3 px-6 rounded-lg hover:bg-yellow-400 transition-colors flex items-center justify-center gap-2"
                                >
                                    <LockClosedIcon className="h-5 w-5"/>
                                    Upgrade to Analyse
                                </button>
                             )}
                        </div>
                    </div>
                </div>
            )}

            {error && <p className="mt-4 text-center text-red-400 bg-red-900/20 p-3 rounded-md">{error}</p>}
        </div>
    );
}