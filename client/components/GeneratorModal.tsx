
import React, { useState, useCallback, useEffect } from 'react';
import { DocumentType, DocumentRequest, PortfolioProject, Document, PortfolioTemplate, ResumeTemplate, UserPlan } from '../types';
import { generateDocument } from '../services/geminiService';
import { XIcon, LoadingSpinner, TrashIcon, UploadIcon, LinkIcon, ArrowLeftIcon, ArrowRightIcon, LockClosedIcon, UserIcon as ProfileIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

interface GeneratorModalProps {
    onClose: () => void;
    docToEdit?: Document | null;
}

const FormInput: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, disabled?: boolean, icon?: React.ReactNode }> = ({ label, name, value, onChange, placeholder, disabled, icon }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <input
                type="text" id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className={`w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${icon ? 'pl-10' : ''}`}
            />
            {icon && <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-500">{icon}</div>}
        </div>
    </div>
);

const FormTextarea: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void, placeholder?: string, rows?: number, disabled?: boolean }> = ({ label, name, value, onChange, placeholder, rows=3, disabled }) => (
     <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <textarea
            id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} rows={rows} disabled={disabled}
            className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
        ></textarea>
    </div>
);

const TemplateCard: React.FC<{
    name: string;
    description: string;
    preview: React.ReactNode;
    isSelected: boolean;
    onSelect: () => void;
    isPro: boolean;
    userPlan: UserPlan;
}> = ({ name, description, preview, isSelected, onSelect, isPro, userPlan }) => {
    const isLocked = isPro && userPlan === 'Free';

    return (
        <div
            onClick={!isLocked ? onSelect : () => {}}
            className={`relative border-2 rounded-lg p-3 transition-all duration-200 ${
                isSelected ? 'border-cyan-500 bg-cyan-900/20' : 'border-gray-700 hover:border-gray-600'
            } ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
        >
            {isLocked && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center rounded-lg z-10">
                    <LockClosedIcon className="h-8 w-8 text-yellow-400" />
                    <span className="text-yellow-400 font-bold text-sm mt-1">PRO</span>
                </div>
            )}
            <div className="h-28 w-full bg-gray-900 rounded-md overflow-hidden mb-3 border border-gray-700">
                {preview}
            </div>
            <h4 className="font-bold text-white capitalize">{name}</h4>
            <p className="text-xs text-gray-400">{description}</p>
        </div>
    );
};


const emptyProject: PortfolioProject = { id: `proj_${Date.now()}`, title: '', description: '', link: '', image: '' };

const DEFAULT_FORM_DATA: Omit<DocumentRequest, 'docType'> = {
    name: 'Alex Doe',
    contact: 'alex.doe@email.com | (555) 123-4567 | San Francisco, CA',
    experience: 'Software Engineer at TechCorp (2020-Present)\n- Developed and maintained web applications using React and Node.js.\n- Collaborated with a team of 10 engineers to deliver new features, increasing user engagement by 15%.',
    education: 'B.S. in Computer Science, University of Technology (2016-2020)',
    skills: 'JavaScript, TypeScript, React, Node.js, Python, SQL, AWS',
    targetJob: 'Senior Software Engineer',
    targetCompany: 'Innovate LLC',
    resumeTemplate: 'classic',
    profilePicture: '',
    portfolioBio: `A passionate and creative professional with a knack for building beautiful and functional web experiences. I specialize in frontend development and have a strong eye for design. My goal is to leverage my skills to create products that not only work flawlessly but also delight users.`,
    portfolioProjects: [{ ...emptyProject, title: 'My Awesome App', description: 'A brief description of this cool project.' }],
    portfolioSocialLinks: `https://github.com/me, https://linkedin.com/in/me`,
    portfolioTemplate: 'onyx',
};

// --- Template Definitions ---
const RESUME_TEMPLATES: { name: ResumeTemplate, description: string, isPro: boolean, preview: React.ReactNode }[] = [
    { name: 'classic', description: 'Timeless two-column format.', isPro: false, preview: <div className="h-full w-full bg-white p-3 flex gap-2"><div className="w-2/3 bg-gray-200 rounded-sm"></div><div className="w-1/3 bg-gray-300 rounded-sm"></div></div> },
    { name: 'modern', description: 'Sleek single-column design.', isPro: false, preview: <div className="h-full w-full bg-white p-3 flex flex-col gap-2"><div className="h-4 w-1/3 bg-teal-500 rounded-sm"></div><div className="h-2 w-full bg-gray-200"></div><div className="h-2 w-full bg-gray-200"></div></div> },
    { name: 'simple', description: 'Minimalist and text-focused.', isPro: false, preview: <div className="h-full w-full bg-white p-3 flex flex-col gap-2"><div className="h-3 w-1/2 bg-gray-600"></div><div className="h-2 w-1/3 bg-gray-400 mt-[-4px]"></div><div className="h-2 w-full bg-gray-200 mt-2"></div></div> },
    { name: 'creative', description: 'Asymmetrical with a sidebar.', isPro: true, preview: <div className="h-full w-full bg-white p-0 flex"><div className="w-1/3 h-full bg-slate-700 p-2"><div className="h-6 w-6 rounded-full bg-cyan-400 mx-auto"></div></div><div className="w-2/3 p-2"><div className="h-4 w-full bg-gray-600"></div></div></div> },
    { name: 'technical', description: 'Structured for developers.', isPro: true, preview: <div className="h-full w-full bg-black p-3"><div className="h-3 w-1/2 bg-green-400"></div><div className="h-2 w-full bg-gray-700 mt-2"></div></div> }
];

const PORTFOLIO_TEMPLATES: { name: PortfolioTemplate, description: string, isPro: boolean, preview: React.ReactNode }[] = [
    { name: 'onyx', description: 'Dark, modern, and minimalist.', isPro: false, preview: <div className="h-full w-full bg-[#111827] p-3 flex flex-col gap-2"><div className="h-4 w-2/3 bg-gray-300"></div><div className="h-2 w-1/3 bg-[#5EEAD4]"></div><div className="flex-grow flex gap-2 items-end"><div className="flex-1 h-8 bg-[#1F2937]"></div><div className="flex-1 h-8 bg-[#1F2937]"></div></div></div> },
    { name: 'quartz', description: 'Clean, professional, and light.', isPro: false, preview: <div className="h-full w-full bg-white p-3 flex gap-2"><div className="w-1/3 bg-gray-100"></div><div className="flex-grow flex flex-col gap-2"><div className="h-4 w-full bg-gray-600"></div><div className="h-2 w-2/3 bg-gray-400"></div><div className="h-8 w-full bg-gray-200 mt-2"></div></div></div> },
    { name: 'sapphire', description: 'Creative, bold, and colorful.', isPro: false, preview: <div className="h-full w-full bg-[#F0F4F8] flex flex-col"><div className="h-1/3 bg-[#4F46E5] p-2"><div className="h-4 w-2/3 bg-white"></div></div><div className="flex-grow p-2 flex gap-2"><div className="flex-1 h-full bg-white shadow"></div><div className="flex-1 h-full bg-white shadow"></div></div></div> },
    { name: 'emerald', description: 'Professional, clean, with avatar.', isPro: true, preview: <div className="h-full w-full bg-gray-50 p-2 flex flex-col items-center"><div className="h-8 w-8 rounded-full bg-green-500"></div><div className="h-2 w-2/3 bg-gray-800 mt-1"></div></div> },
    { name: 'ruby', description: 'Bold, elegant, with avatar.', isPro: true, preview: <div className="h-full w-full bg-black p-2 flex flex-col items-center justify-center"><div className="h-8 w-8 rounded-full bg-red-600"></div><div className="h-3 w-1/2 bg-white mt-1"></div></div> },
];


export default function GeneratorModal({ onClose, docToEdit }: GeneratorModalProps) {
    const { currentUser, consumeToken, addDocument, updateDocument, markGenerationCompleted } = useAuth();
    const [formData, setFormData] = useState<Omit<DocumentRequest, 'docType'>>({ ...DEFAULT_FORM_DATA, name: currentUser?.name || 'Alex Doe' });
    const [docType, setDocType] = useState<DocumentType>(docToEdit?.type || 'Resume');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [wizardStep, setWizardStep] = useState(1);

    useEffect(() => {
        if (docToEdit?.sourceRequest) {
            setFormData(docToEdit.sourceRequest);
            setDocType(docToEdit.type);
        }
    }, [docToEdit]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleProjectChange = (projectId: string, field: 'title' | 'description' | 'link', value: string) => {
        setFormData(prev => ({
            ...prev,
            portfolioProjects: (prev.portfolioProjects || []).map(p => 
                p.id === projectId ? { ...p, [field]: value } : p
            )
        }));
    };

    const handleFileChange = (file: File, field: 'profilePicture' | 'projectImage', projectId?: string) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            if (field === 'profilePicture') {
                setFormData(prev => ({...prev, profilePicture: base64String}));
            } else if (field === 'projectImage' && projectId) {
                setFormData(prev => ({
                    ...prev,
                    portfolioProjects: (prev.portfolioProjects || []).map(p => p.id === projectId ? { ...p, image: base64String } : p)
                }));
            }
        };
        reader.readAsDataURL(file);
    };

    const addProject = () => {
        setFormData(prev => ({
            ...prev,
            portfolioProjects: [...(prev.portfolioProjects || []), { ...emptyProject, id: `proj_${Date.now()}` }]
        }));
    };
    
    const removeProject = (id: string) => {
        setFormData(prev => ({
            ...prev,
            portfolioProjects: (prev.portfolioProjects || []).filter(p => p.id !== id)
        }));
    };

    const hasTokens = currentUser ? currentUser.tokens > 0 : false;
    const isFormDisabled = isLoading || !currentUser;
    const isSubmitDisabled = isLoading || !currentUser || !hasTokens && !docToEdit;
    
    const handleGenerate = useCallback(async () => {
        if (!currentUser) { setError("Please log in."); return; }
        if (currentUser.tokens <= 0 && !docToEdit) { setError("You have no generation tokens left."); return; }

        setIsLoading(true);
        setError('');
        try {
            const request: DocumentRequest = { ...formData, docType };
            const result = await generateDocument(request);
            
            const docTitle = docType === 'Portfolio' 
                ? `${formData.name}'s Portfolio` 
                : `${formData.targetJob} ${docType}`;

            if(docToEdit) {
                 updateDocument({ ...docToEdit, title: docTitle, content: result }, request);
            } else {
                addDocument({ title: docTitle, type: docType, content: result }, request);
                consumeToken();
                markGenerationCompleted();
            }
            onClose();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [formData, docType, currentUser, consumeToken, addDocument, updateDocument, docToEdit, onClose, markGenerationCompleted]);

    const getButtonText = () => {
        if (!currentUser) return 'Please Log In';
        if (!hasTokens && !docToEdit) return 'No Tokens Left';
        const action = docToEdit ? 'Update' : 'Generate';
        return `${action} ${docType}`;
    }

    const renderWizardButtons = (maxSteps: number) => (
         <div className="pt-4 mt-4 border-t border-gray-700">
            <div className="flex justify-between items-center">
                <button type="button" onClick={() => setWizardStep(s => s - 1)} disabled={wizardStep === 1 || isFormDisabled} className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <ArrowLeftIcon /> Back
                </button>
                {wizardStep < maxSteps ? (
                    <button type="button" onClick={() => setWizardStep(s => s + 1)} disabled={isFormDisabled} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 disabled:bg-gray-600">
                       Next <ArrowRightIcon />
                    </button>
                ) : (
                     <button type="button" onClick={handleGenerate} disabled={isSubmitDisabled} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]">
                        {isLoading ? <LoadingSpinner /> : getButtonText()}
                    </button>
                )}
            </div>
        </div>
    );

    const renderCoverLetterForm = () => (
        <div>
            <div className="space-y-4">
                <FormInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} disabled={isFormDisabled} />
                <FormInput label="Contact Info" name="contact" value={formData.contact} onChange={handleInputChange} disabled={isFormDisabled} />
                <FormInput label="Target Job Title" name="targetJob" value={formData.targetJob} onChange={handleInputChange} disabled={isFormDisabled} />
                <FormInput label="Target Company" name="targetCompany" value={formData.targetCompany} onChange={handleInputChange} disabled={isFormDisabled} />
                <FormTextarea label="Relevant Experience & Skills" name="experience" value={formData.experience} onChange={handleInputChange} rows={5} disabled={isFormDisabled} />
            </div>
            <div className="pt-4 mt-4 border-t border-gray-700">
                 <button type="button" onClick={handleGenerate} disabled={isSubmitDisabled} className="w-full bg-cyan-500 text-white font-bold py-3 px-8 rounded-md hover:bg-cyan-400 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center h-12">
                    {isLoading ? <LoadingSpinner /> : getButtonText()}
                </button>
            </div>
        </div>
    );
    
    const renderResumeWizard = () => {
        const maxSteps = 2;
        return (<div>
            <div className="flex justify-center items-center mb-4">
                <span className="text-sm text-gray-400">Step {wizardStep} of {maxSteps}</span>
            </div>
            {wizardStep === 1 && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-white text-center">Your Details</h3>
                    <p className="text-center text-gray-400 text-sm mb-4">Provide the core information for your resume.</p>
                    <FormInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} disabled={isFormDisabled} />
                    <FormInput label="Contact Info" name="contact" value={formData.contact} onChange={handleInputChange} disabled={isFormDisabled} />
                    <FormInput label="Target Job Title" name="targetJob" value={formData.targetJob} onChange={handleInputChange} disabled={isFormDisabled} />
                    <FormTextarea label="Work Experience" name="experience" value={formData.experience} onChange={handleInputChange} rows={5} disabled={isFormDisabled} />
                    <FormTextarea label="Education" name="education" value={formData.education} onChange={handleInputChange} disabled={isFormDisabled} />
                    <FormTextarea label="Skills (comma-separated)" name="skills" value={formData.skills} onChange={handleInputChange} disabled={isFormDisabled} />
                </div>
            )}
            {wizardStep === 2 && (
                <div className="animate-fade-in">
                     <h3 className="text-lg font-semibold text-white text-center">Choose a Template</h3>
                     <p className="text-center text-gray-400 text-sm mb-4">Select a style for your resume. Pro templates require an upgrade.</p>
                     <div className="max-h-80 overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {RESUME_TEMPLATES.map(template => (
                            <TemplateCard
                                key={template.name}
                                {...template}
                                isSelected={formData.resumeTemplate === template.name}
                                onSelect={() => setFormData(prev => ({...prev, resumeTemplate: template.name}))}
                                userPlan={currentUser?.plan || 'Free'}
                            />
                        ))}
                        </div>
                     </div>
                </div>
            )}
            {renderWizardButtons(maxSteps)}
        </div>);
    };
    
    const renderPortfolioWizard = () => {
        const maxSteps = 5;
        return (<div>
            <div className="flex justify-center items-center mb-4">
                <span className="text-sm text-gray-400">Step {wizardStep} of {maxSteps}</span>
            </div>
            {wizardStep === 1 && ( // Basics
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-semibold text-white text-center">Basics</h3>
                    <p className="text-center text-gray-400 text-sm mb-4">Let's start with the essentials.</p>
                    <FormInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} disabled={isFormDisabled} />
                    <FormInput label="Professional Title / Tagline" name="targetJob" value={formData.targetJob} onChange={handleInputChange} placeholder="e.g., Creative Developer & Designer" disabled={isFormDisabled} />
                </div>
            )}
            {wizardStep === 2 && ( // Template
                <div className="animate-fade-in">
                     <h3 className="text-lg font-semibold text-white text-center">Choose a Template</h3>
                     <p className="text-center text-gray-400 text-sm mb-4">Select a style that best represents you. Pro templates require an upgrade.</p>
                     <div className="max-h-80 overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         {PORTFOLIO_TEMPLATES.map((template) => (
                             <TemplateCard
                                key={template.name}
                                {...template}
                                isSelected={formData.portfolioTemplate === template.name}
                                onSelect={() => setFormData(prev => ({ ...prev, portfolioTemplate: template.name }))}
                                userPlan={currentUser?.plan || 'Free'}
                             />
                         ))}
                        </div>
                     </div>
                </div>
            )}
            {wizardStep === 3 && ( // About
                <div className="space-y-4 animate-fade-in">
                     <h3 className="text-lg font-semibold text-white text-center">About You</h3>
                     <p className="text-center text-gray-400 text-sm mb-4">Tell your story. What makes you stand out?</p>
                    <FormTextarea label="Bio / About Me" name="portfolioBio" value={formData.portfolioBio || ''} onChange={handleInputChange} rows={6} disabled={isFormDisabled} />
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Profile Picture (for Pro templates)</label>
                        <div className="flex items-center gap-4">
                            <label className="flex-grow w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition-colors">
                                <UploadIcon />
                                <span>{formData.profilePicture ? 'Change Picture' : 'Upload Picture'}</span>
                                <input type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={e => e.target.files && handleFileChange(e.target.files[0], 'profilePicture')} />
                            </label>
                            {formData.profilePicture ? <img src={formData.profilePicture} alt="Preview" className="w-16 h-16 object-cover rounded-full" /> : <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center"><ProfileIcon className="h-8 w-8 text-gray-500" /></div>}
                        </div>
                    </div>
                </div>
            )}
            {wizardStep === 4 && ( // Projects
                <div className="animate-fade-in">
                     <h3 className="text-lg font-semibold text-white text-center">Your Work</h3>
                     <p className="text-center text-gray-400 text-sm mb-4">Showcase your best projects. Add at least one.</p>
                    <div className="space-y-6 max-h-64 overflow-y-auto pr-2">
                    {(formData.portfolioProjects || []).map((proj, index) => (
                        <div key={proj.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-3 relative">
                            <FormInput label={`Project ${index + 1} Title`} name="title" value={proj.title} onChange={e => handleProjectChange(proj.id, 'title', e.target.value)} disabled={isFormDisabled} />
                            <FormTextarea label="Description" name="description" value={proj.description} onChange={e => handleProjectChange(proj.id, 'description', e.target.value)} rows={2} disabled={isFormDisabled} />
                            <FormInput label="Live Link" name="link" value={proj.link} onChange={e => handleProjectChange(proj.id, 'link', e.target.value)} icon={<LinkIcon />} disabled={isFormDisabled} />
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Project Image</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-grow w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition-colors">
                                        <UploadIcon />
                                        <span>{proj.image ? 'Change Image' : 'Upload Image'}</span>
                                        <input type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={e => e.target.files && handleFileChange(e.target.files[0], 'projectImage', proj.id)} />
                                    </label>
                                    {proj.image && <img src={proj.image} alt="Preview" className="w-16 h-12 object-cover rounded-md" />}
                                </div>
                            </div>
                            <button type="button" onClick={() => removeProject(proj.id)} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 hover:bg-gray-700 rounded-full"><TrashIcon /></button>
                        </div>
                    ))}
                    </div>
                    <button type="button" onClick={addProject} className="mt-4 w-full text-cyan-400 font-semibold py-2 px-4 rounded-md border-2 border-dashed border-gray-600 hover:bg-gray-800 transition-colors">
                       + Add Another Project
                    </button>
                </div>
            )}
            {wizardStep === 5 && ( // Socials & Contact
                 <div className="space-y-4 animate-fade-in">
                     <h3 className="text-lg font-semibold text-white text-center">Final Touches</h3>
                     <p className="text-center text-gray-400 text-sm mb-4">How can people reach you?</p>
                    <FormInput label="Contact Info (Email, Phone, Location)" name="contact" value={formData.contact} onChange={handleInputChange} disabled={isFormDisabled} />
                    <FormInput label="Social Links (comma-separated URLs)" name="portfolioSocialLinks" value={formData.portfolioSocialLinks || ''} onChange={handleInputChange} disabled={isFormDisabled} />
                </div>
            )}
            {renderWizardButtons(maxSteps)}
        </div>);
    };
    
    const renderContent = () => {
        switch(docType) {
            case 'Resume': return renderResumeWizard();
            case 'Portfolio': return renderPortfolioWizard();
            case 'Cover Letter': return renderCoverLetterForm();
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#111827] rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{docToEdit ? 'Edit Document' : 'New Document Generator'}</h2>
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
                    <div className="space-y-4">
                        {!docToEdit && (
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <button type="button" onClick={() => { setDocType('Resume'); setWizardStep(1); }} disabled={isFormDisabled} className={`w-full py-2 rounded transition-colors ${docType === 'Resume' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'} disabled:opacity-50`}>Resume</button>
                                <button type="button" onClick={() => { setDocType('Cover Letter'); setWizardStep(1); }} disabled={isFormDisabled} className={`w-full py-2 rounded transition-colors ${docType === 'Cover Letter' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'} disabled:opacity-50`}>Cover Letter</button>
                                <button type="button" onClick={() => { setDocType('Portfolio'); setWizardStep(1); }} disabled={isFormDisabled} className={`w-full py-2 rounded transition-colors ${docType === 'Portfolio' ? 'bg-cyan-500 text-white' : 'bg-gray-700 text-gray-300'} disabled:opacity-50`}>Portfolio</button>
                            </div>
                        )}
                        
                        {renderContent()}
                                                
                        {error && <div className="text-center text-red-400 text-sm mt-2 p-2 bg-red-900/20 rounded-md">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
