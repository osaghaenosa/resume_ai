
import React, { useState, useCallback } from 'react';
import { DocumentType, DocumentRequest } from '../types';
import { generateDocument } from '../services/geminiService';
import { XIcon, LoadingSpinner } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface GeneratorModalProps {
    onClose: () => void;
}

const FormInput: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, disabled?: boolean }> = ({ label, name, value, onChange, placeholder, disabled }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <input
            type="text"
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            disabled={disabled}
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
    </div>
);

const FormTextarea: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder?: string, rows?: number, disabled?: boolean }> = ({ label, name, value, onChange, placeholder, rows=3, disabled }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        ></textarea>
    </div>
);


export default function GeneratorModal({ onClose }: GeneratorModalProps) {
    const { currentUser, consumeToken, addDocument } = useAuth();
    const [formData, setFormData] = useState<Omit<DocumentRequest, 'docType'>>({
        name: currentUser?.name || 'Alex Doe',
        contact: 'alex.doe@email.com | (555) 123-4567 | linkedin.com/in/alexdoe',
        experience: 'Software Engineer at TechCorp (2020-Present)\n- Developed and maintained web applications using React and Node.js.\n- Collaborated with a team of 10 engineers to deliver new features, increasing user engagement by 15%.',
        education: 'B.S. in Computer Science, University of Technology (2016-2020)',
        skills: 'JavaScript, TypeScript, React, Node.js, Python, SQL, AWS',
        targetJob: 'Senior Software Engineer',
        targetCompany: 'Innovate LLC',
    });
    const [docType, setDocType] = useState<DocumentType>('Resume');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const hasTokens = currentUser ? currentUser.tokens > 0 : false;
    const isFormDisabled = isLoading || !currentUser;
    const isSubmitDisabled = isLoading || !currentUser || !hasTokens;

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!currentUser) {
            setError("Please log in to generate documents.");
            return;
        }
        
        if (currentUser.tokens <= 0) {
            setError("You have no generation tokens left. Please upgrade your plan.");
            return;
        }

        setIsLoading(true);
        setError('');
        try {
            const request: DocumentRequest = { ...formData, docType };
            const result = await generateDocument(request);
            
            const docTitle = `${formData.targetJob} ${docType}`;
            addDocument({
                title: docTitle,
                type: docType,
                content: result,
            });
            consumeToken();
            onClose(); // Close modal on success
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [formData, docType, currentUser, consumeToken, addDocument, onClose]);

    const getButtonText = () => {
        if (!currentUser) return 'Please Log In';
        if (!hasTokens) return 'No Tokens Left';
        return `Generate ${docType}`;
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#111827] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">New Document Generator</h2>
                     {currentUser && (
                        <div className="text-sm text-cyan-400">
                           Tokens: <span className="font-bold">{currentUser.tokens}</span>
                        </div>
                    )}
                    <button onClick={onClose} className="text-gray-400 hover:text-white ml-4">
                        <XIcon />
                    </button>
                </div>

                <div className="flex-grow overflow-y-auto p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <button type="button" onClick={() => setDocType('Resume')} disabled={isFormDisabled} className={`w-full py-2 rounded transition-colors ${docType === 'Resume' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>Resume</button>
                            <button type="button" onClick={() => setDocType('Cover Letter')} disabled={isFormDisabled} className={`w-full py-2 rounded transition-colors ${docType === 'Cover Letter' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'} disabled:opacity-50 disabled:cursor-not-allowed`}>Cover Letter</button>
                        </div>
                        <FormInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} placeholder="e.g., Jane Doe" disabled={isFormDisabled} />
                        <FormInput label="Contact Info" name="contact" value={formData.contact} onChange={handleInputChange} placeholder="Email, Phone, LinkedIn" disabled={isFormDisabled} />
                        <FormInput label="Target Job Title" name="targetJob" value={formData.targetJob} onChange={handleInputChange} placeholder="e.g., Product Manager" disabled={isFormDisabled} />
                        <FormInput label="Target Company" name="targetCompany" value={formData.targetCompany} onChange={handleInputChange} placeholder="e.g., Google" disabled={isFormDisabled} />
                        <FormTextarea label="Work Experience" name="experience" value={formData.experience} onChange={handleInputChange} placeholder="Describe your roles and achievements" rows={5} disabled={isFormDisabled} />
                        <FormTextarea label="Education" name="education" value={formData.education} onChange={handleInputChange} placeholder="Your degrees and institutions" disabled={isFormDisabled} />
                        <FormTextarea label="Skills" name="skills" value={formData.skills} onChange={handleInputChange} placeholder="List relevant skills" disabled={isFormDisabled} />
                        
                        <button type="submit" disabled={isSubmitDisabled} className="w-full bg-cyan-500 text-white font-bold py-3 px-8 rounded-md hover:bg-cyan-400 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center h-12">
                            {isLoading ? <LoadingSpinner /> : getButtonText()}
                        </button>
                        {error && <div className="text-center text-red-400 text-sm mt-2 p-2 bg-red-900/20 rounded-md">{error}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
}
