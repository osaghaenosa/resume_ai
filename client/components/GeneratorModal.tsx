import React, { useState, useCallback, useEffect } from 'react';
import { DocumentType, DocumentRequest, PortfolioProject, Document, PortfolioTemplate, ResumeTemplate, UserPlan, Product } from '../types';
import { generateDocument } from '../services/geminiService';
import { XIcon, LoadingSpinner, TrashIcon, UploadIcon, LinkIcon, ArrowLeftIcon, ArrowRightIcon, LockClosedIcon, UserIcon as ProfileIcon } from './Icons';
import { useAuth } from '../contexts/AuthContext';

const VITE_LOCAL_API_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000';

interface GeneratorModalProps {
    onClose: () => void;
    docToEdit?: Document | null;
    onUpgrade: () => void;
}

const useImageUrl = (imageId: string | null | undefined): string | null => {
    const { getImage } = useAuth();
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    useEffect(() => {
        if (imageId && imageId.startsWith('img_')) {
            const data = getImage(imageId);
            setImageUrl(data);
        } else if (imageId) {
            setImageUrl(imageId);
        } else {
            setImageUrl(null);
        }
    }, [imageId, getImage]);

    return imageUrl;
};

const FormInput: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, placeholder?: string, disabled?: boolean, icon?: React.ReactNode, type?: string }> = ({ label, name, value, onChange, placeholder, disabled, icon, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-300 mb-1">{label}</label>
        <div className="relative">
            <input
                type={type} id={name} name={name} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
                className={`w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${icon ? 'pl-10' : ''}`}
                 step={type === 'number' ? '0.01' : undefined}
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
const emptyProduct: Product = { 
    id: `prod_${Date.now()}`, 
    title: '', 
    description: '', 
    price: 0, 
    image: '',
    paymentMethod: 'link',
    checkoutLink: '',
    bankDetails: '',
    flutterwaveKey: '',
};

// Define types for Projects and Certifications
interface Project {
    id: string;
    title: string;
    description: string;
    technologies?: string;
    link?: string;
}

interface Certification {
    id: string;
    name: string;
    issuer: string;
    date: string;
}

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
    portfolioSocialLinks: `https://github.com/alex, https://linkedin.com/in/alex`,
    portfolioTemplate: 'onyx',
    products: [],
    // Add projects and certifications
    projects: [
        {
            id: `proj_${Date.now()}`,
            title: 'E-commerce Website',
            description: 'Built a full-featured online store with payment integration',
            technologies: 'React, Node.js, MongoDB',
            link: 'https://example.com'
        }
    ],
    certifications: [
        {
            id: `cert_${Date.now()}`,
            name: 'AWS Certified Solutions Architect',
            issuer: 'Amazon Web Services',
            date: '2023-05-15'
        }
    ],
};

const mapToBackendType = (frontendType: DocumentType): string => {
  const mapping: Record<DocumentType, string> = {
    'Resume': 'resume',
    'Cover Letter': 'cover_letter',
    'Portfolio': 'portfolio'
  };
  return mapping[frontendType] || frontendType.toLowerCase();
};

// --- Template Definitions ---
const resumeTemplateNames: ResumeTemplate[] = [
    'classic', 'modern', 'simple', 'creative', 'technical',
    'classic-2', 'classic-3', 'classic-4', 'classic-5', 'classic-6', 'classic-7', 'classic-8', 'classic-9', 'classic-10', 'classic-11',
    'modern-2', 'modern-3', 'modern-4', 'modern-5', 'modern-6', 'modern-7', 'modern-8', 'modern-9', 'modern-10', 'modern-11',
    'simple-2', 'simple-3', 'simple-4', 'simple-5', 'simple-6', 'simple-7', 'simple-8', 'simple-9', 'simple-10', 'simple-11',
    'creative-2', 'creative-3', 'creative-4', 'creative-5', 'creative-6', 'creative-7', 'creative-8', 'creative-9', 'creative-10', 'creative-11',
    'technical-2', 'technical-3', 'technical-4', 'technical-5', 'technical-6', 'technical-7', 'technical-8', 'technical-9', 'technical-10', 'technical-11'
];
const portfolioTemplateNames: PortfolioTemplate[] = [
    'onyx', 'quartz', 'sapphire', 'emerald', 'ruby',
    'onyx-2', 'onyx-3', 'onyx-4', 'onyx-5', 'onyx-6', 'onyx-7', 'onyx-8', 'onyx-9', 'onyx-10', 'onyx-11',
    'quartz-2', 'quartz-3', 'quartz-4', 'quartz-5', 'quartz-6', 'quartz-7', 'quartz-8', 'quartz-9', 'quartz-10', 'quartz-11',
    'sapphire-2', 'sapphire-3', 'sapphire-4', 'sapphire-5', 'sapphire-6', 'sapphire-7', 'sapphire-8', 'sapphire-9', 'sapphire-10', 'sapphire-11',
    'emerald-2', 'emerald-3', 'emerald-4', 'emerald-5', 'emerald-6', 'emerald-7', 'emerald-8', 'emerald-9', 'emerald-10', 'emerald-11',
    'ruby-2', 'ruby-3', 'ruby-4', 'ruby-5', 'ruby-6', 'ruby-7', 'ruby-8', 'ruby-9', 'ruby-10', 'ruby-11'
];

const RESUME_TEMPLATES: { name: ResumeTemplate, description: string, isPro: boolean, preview: React.ReactNode }[] = [
    { name: 'classic', description: 'Timeless two-column format.', isPro: false, preview: <div className="h-full w-full bg-white p-2 flex flex-col text-black text-[5px] leading-tight font-serif"><div className="text-center"><div className="font-bold text-[8px]">NAME</div><div className="text-gray-600">Contact</div><div className="w-full h-[1px] bg-black my-1"></div></div><div className="flex gap-2 mt-1 flex-grow"><div className="w-2/3 space-y-1"><div className="font-bold text-gray-800">Summary</div><div className="h-4 w-full bg-gray-200 rounded-sm"></div><div className="font-bold text-gray-800 mt-1">Experience</div><div className="h-8 w-full bg-gray-200 rounded-sm"></div></div><div className="w-1/3 space-y-1"><div className="font-bold text-gray-800">Skills</div><div className="h-6 w-full bg-gray-300 rounded-sm"></div></div></div></div> },
    { name: 'modern', description: 'Sleek single-column design.', isPro: false, preview: <div className="h-full w-full bg-white p-2 flex flex-col text-black text-[5px] leading-tight font-sans"><div className="flex justify-between items-start border-b-2 border-teal-500 pb-1"><div><div className="text-teal-500 font-light text-[10px]">NAME</div><div className="text-gray-500">Title</div></div><div className="text-right text-gray-500">Contact<br/>Info</div></div><div className="mt-2 space-y-1"><div className="text-teal-500 font-bold tracking-wider">SUMMARY</div><div className="h-4 w-full bg-gray-200 rounded-sm"></div><div className="text-teal-500 font-bold tracking-wider mt-1">EXPERIENCE</div><div className="h-8 w-full bg-gray-200 rounded-sm"></div></div></div> },
    { name: 'simple', description: 'Minimalist and text-focused.', isPro: false, preview: <div className="h-full w-full bg-white p-2 flex flex-col text-black text-[5px] leading-tight font-sans"><div className="font-semibold text-[8px]">NAME</div><div className="text-gray-500">Contact</div><div className="mt-3 space-y-1"><div className="text-gray-500 tracking-wider border-b border-gray-200 pb-0.5">EXPERIENCE</div><div className="h-8 w-full bg-gray-100 rounded-sm mt-1"></div><div className="text-gray-500 tracking-wider border-b border-gray-200 pb-0.5 mt-2">SKILLS</div><div className="h-4 w-full bg-gray-100 rounded-sm mt-1"></div></div></div> },
    { name: 'creative', description: 'Asymmetrical with a sidebar.', isPro: true, preview: <div className="h-full w-full bg-[#F8F5F2] flex text-[5px] leading-tight font-sans"><div className="w-1/3 h-full bg-[#1a2c3f] text-white p-2 flex flex-col items-center"><div className="w-8 h-8 rounded-full bg-[#c8a46e] mb-2"></div><div className="font-bold border-b border-[#c8a46e] pb-0.5 mb-1 text-[#c8a46e] w-full text-center">CONTACT</div></div><div className="w-2/3 p-2 text-slate-800"><div className="text-[10px] font-bold text-[#1a2c3f]">NAME</div><div className="text-[#c8a46e] font-medium">Title</div><div className="mt-3 space-y-1"><div className="font-bold tracking-wider text-[#1a2c3f]">SUMMARY</div><div className="h-8 w-full bg-gray-300/70 rounded-sm"></div></div></div></div> },
    { name: 'technical', description: 'Clean & professional for devs.', isPro: true, preview: <div className="h-full w-full bg-white p-2 text-[5px] leading-tight font-mono"><div className="flex justify-between items-baseline"><div className="text-[9px] text-black">NAME</div><div className="text-[7px] text-blue-600">Title</div></div><div className="w-full h-[1px] bg-gray-200 my-1"></div><div className="mt-2 space-y-2"><div className="text-blue-600">// SKILLS</div><div className="h-6 w-full bg-gray-100 rounded-sm mt-1"></div><div className="text-blue-600 mt-1">// EXPERIENCE</div><div className="h-8 w-full bg-gray-100 rounded-sm mt-1"></div></div></div> },
    ...resumeTemplateNames.filter(n => n.includes('-')).map(name => {
        const base = name.split('-')[0];
        const isBasePro = ['creative', 'technical'].includes(base);
        const variantNum = parseInt(name.split('-')[1]);
        const isPro = isBasePro || (!isBasePro && (variantNum > 6 && variantNum < 10));
        return { name, description: `A ${isPro ? 'premium' : 'new'} take on the ${base} style.`, isPro, preview: <div className="h-full w-full bg-gray-800 flex items-center justify-center text-gray-500"><span className="text-xs">{name}</span></div> }
    })
];

const PORTFOLIO_TEMPLATES: { name: PortfolioTemplate, description: string, isPro: boolean, preview: React.ReactNode }[] = [
    { name: 'onyx', description: 'Dark, modern, and minimalist.', isPro: false, preview: <div className="h-full w-full bg-[#111827] p-1 flex flex-col text-[5px] leading-tight font-sans text-white"><div className="text-center py-2"><div className="font-bold text-[10px]">NAME</div><div className="text-teal-400 text-[7px]">Title</div></div><div className="font-bold text-center mt-1">My Work</div><div className="flex gap-1 p-1 flex-grow items-center"><div className="h-full w-1/2 bg-[#1F2937] rounded-sm p-1"><div className="w-full h-1/2 bg-gray-500 rounded-sm"></div></div><div className="h-full w-1/2 bg-[#1F2937] rounded-sm p-1"><div className="w-full h-1/2 bg-gray-500 rounded-sm"></div></div></div></div> },
    { name: 'quartz', description: 'Clean, professional, and light.', isPro: false, preview: <div className="h-full w-full bg-white flex text-[5px] leading-tight font-serif text-black"><div className="w-1/3 h-full border-r border-gray-200 p-1"><div className="font-bold">Contact</div><div className="h-6 w-full bg-gray-100 mt-1"></div></div><div className="w-2/3 p-1"><div className="font-bold text-center text-[8px] mb-1">NAME</div><div className="font-bold">About</div><div className="h-4 w-full bg-gray-100 mt-1"></div><div className="font-bold mt-2">Projects</div><div className="h-8 w-full bg-gray-100 mt-1"></div></div></div> },
    { name: 'sapphire', description: 'Creative, bold, and colorful.', isPro: false, preview: <div className="h-full w-full bg-gray-100 flex flex-col text-[5px] leading-tight font-sans text-black"><div className="h-1/3 bg-indigo-600 text-white p-2"><div className="text-[10px] font-bold">NAME</div><div>Title</div></div><div className="p-1 flex-grow"><div className="font-bold text-center">Work</div><div className="flex gap-1 mt-1 flex-grow h-full items-stretch"><div className="w-1/2 bg-white rounded-sm shadow-md"></div><div className="w-1/2 bg-white rounded-sm shadow-md"></div></div></div></div> },
    { name: 'emerald', description: 'Classic & professional with avatar.', isPro: true, preview: <div className="h-full w-full bg-gray-100 flex flex-col items-center text-[5px] leading-tight font-sans text-black p-1"><div className="w-10 h-10 rounded-full bg-[#81B29A] border-2 border-white shadow-md"></div><div className="font-bold text-[8px] mt-1">NAME</div><div className="text-gray-500">Title</div><div className="mt-2 font-bold text-[#81B29A]">Portfolio</div><div className="flex gap-1 mt-1 w-full"><div className="w-1/2 h-8 bg-white shadow-sm rounded"></div><div className="w-1/2 h-8 bg-white shadow-sm rounded"></div></div></div> },
    { name: 'ruby', description: 'Bold, elegant, editorial style.', isPro: true, preview: <div className="h-full w-full bg-[#1a1a1a] flex flex-col items-center text-[5px] leading-tight font-serif text-white p-1"><div className="w-10 h-10 rounded-full bg-pink-700 border-2 border-white/50"></div><div className="font-bold text-[10px] mt-1">NAME</div><div className="text-pink-600">Title</div><div className="mt-2 flex gap-1 w-full flex-grow items-center"><div className="w-1/2 h-full bg-[#2a2a2a] rounded-sm"></div><div className="w-1/2 h-full bg-[#2a2a2a] rounded-sm"></div></div></div> },
     ...portfolioTemplateNames.filter(n => n.includes('-')).map(name => {
        const base = name.split('-')[0];
        const isBasePro = ['emerald', 'ruby'].includes(base);
        const variantNum = parseInt(name.split('-')[1]);
        const isPro = isBasePro || (!isBasePro && (variantNum > 6 && variantNum < 10));
        return { name, description: `A ${isPro ? 'premium' : 'new'} take on the ${base} style.`, isPro, preview: <div className="h-full w-full bg-gray-800 flex items-center justify-center text-gray-500"><span className="text-xs">{name}</span></div> }
    })
];


const ImagePreview: React.FC<{ 
  imageId: string, 
  className: string, 
  alt: string, 
  placeholder: React.ReactNode 
}> = ({ imageId, className, alt, placeholder }) => {
  // Handle absolute URLs (http/https) and local uploads
  if (imageId.startsWith('http')) {
    return <img src={imageId} alt={alt} className={className} />;
  }

  // Prepend localhost:5000 to upload paths
  if (imageId.startsWith('/uploads/')) {
    const fullUrl = `${VITE_LOCAL_API_URL}${imageId}`;
    return <img src={fullUrl} alt={alt} className={className} />;
  }
  
  return <>{placeholder}</>;
};

export default function GeneratorModal({ onClose, docToEdit, onUpgrade }: GeneratorModalProps) {
    const { currentUser, consumeToken, addDocument, updateDocument, markGenerationCompleted, saveImage } = useAuth();
    const [formData, setFormData] = useState<Omit<DocumentRequest, 'docType'>>({ ...DEFAULT_FORM_DATA, name: currentUser?.name || 'Alex Doe' });
    const [docType, setDocType] = useState<DocumentType>(docToEdit?.type || 'Resume');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [wizardStep, setWizardStep] = useState(1);

    useEffect(() => {
        if (docToEdit?.sourceRequest) {
            setFormData(prev => ({
                ...prev,
                ...docToEdit.sourceRequest
            }));
            setDocType(docToEdit.type);
        }
    }, [docToEdit]);
    
    useEffect(() => {
        setWizardStep(1);
    }, [docType]);

    useEffect(() => {
        if (docToEdit) {
            const { docType: savedDocType, ...savedData } = docToEdit.sourceRequest;
            setFormData({
                ...DEFAULT_FORM_DATA,
                ...savedData
            });
            setDocType(savedDocType);
        } else {
            setFormData({
                ...DEFAULT_FORM_DATA,
                name: currentUser?.name || 'Alex Doe'
            });
            setDocType('Resume');
        }
    }, [docToEdit, currentUser]);

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
    
    const handleProductChange = (productId: string, field: keyof Product, value: string | number) => {
        setFormData(prev => ({
            ...prev,
            products: (prev.products || []).map(p => 
                p.id === productId ? { ...p, [field]: value } : p
            )
        }));
    };

    // Add handlers for resume projects
    const handleResumeProjectChange = (projectId: string, field: keyof Project, value: string) => {
        setFormData(prev => ({
            ...prev,
            projects: (prev.projects || []).map(p => 
                p.id === projectId ? { ...p, [field]: value } : p
            )
        }));
    };
    
    // Add handlers for certifications
    const handleCertificationChange = (certId: string, field: keyof Certification, value: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: (prev.certifications || []).map(c => 
                c.id === certId ? { ...c, [field]: value } : c
            )
        }));
    };

    const handleFileChange = async (file: File, field: 'profilePicture' | 'projectImage' | 'productImage', itemId?: string) => {
  try {
    setIsLoading(true);
    const imageUrl = await saveImage(file);
    
    if (field === 'profilePicture') {
      setFormData(prev => ({...prev, profilePicture: imageUrl}));
    } else if (field === 'projectImage' && itemId) {
      setFormData(prev => ({
        ...prev,
        portfolioProjects: (prev.portfolioProjects || []).map(p => 
          p.id === itemId ? { ...p, image: imageUrl } : p
        )
      }));
    } else if (field === 'productImage' && itemId) {
      setFormData(prev => ({
        ...prev,
        products: (prev.products || []).map(p => 
          p.id === itemId ? { ...p, image: imageUrl } : p
        )
      }));
    }
  } catch (error) {
    console.error('Error handling file change:', error);
    setError('Failed to upload image');
  } finally {
    setIsLoading(false);
  }
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

    const addProduct = () => {
        setFormData(prev => ({
            ...prev,
            products: [...(prev.products || []), { ...emptyProduct, id: `prod_${Date.now()}` }]
        }));
    };
    
    const removeProduct = (id: string) => {
        setFormData(prev => ({
            ...prev,
            products: (prev.products || []).filter(p => p.id !== id)
        }));
    };

    // Add functions for resume projects
    const addResumeProject = () => {
        setFormData(prev => ({
            ...prev,
            projects: [...(prev.projects || []), { 
                id: `res_proj_${Date.now()}`, 
                title: '', 
                description: '', 
                technologies: '',
                link: '' 
            }]
        }));
    };
    
    const removeResumeProject = (id: string) => {
        setFormData(prev => ({
            ...prev,
            projects: (prev.projects || []).filter(p => p.id !== id)
        }));
    };

    // Add functions for certifications
    const addCertification = () => {
        setFormData(prev => ({
            ...prev,
            certifications: [...(prev.certifications || []), { 
                id: `cert_${Date.now()}`, 
                name: '', 
                issuer: '',
                date: '' 
            }]
        }));
    };
    
    const removeCertification = (id: string) => {
        setFormData(prev => ({
            ...prev,
            certifications: (prev.certifications || []).filter(c => c.id !== id)
        }));
    };

    const hasTokens = currentUser ? currentUser.tokens > 0 : false;
    const canPerformAction = currentUser ? currentUser.plan === 'Pro' || hasTokens : false;
    const isFormDisabled = isLoading || !currentUser;
    
    const handleGenerate = useCallback(async () => {
        if (!currentUser) { setError("Please log in."); return; }
        if (!canPerformAction) { 
            setError("You have no generation tokens left. Please upgrade to continue."); 
            return; 
        }

        setIsLoading(true);
        setError('');
        try {
            const request: DocumentRequest = { ...formData, docType };
            const result = await generateDocument(request);
            
            // Extract HTML from markdown code blocks if present
            let cleanContent = result;
            if (result.startsWith('```html')) {
                cleanContent = result
                    .replace(/^```html\n/, '')
                    .replace(/\n```$/, '');
            }
            
            const docTitle = docType === 'Portfolio' 
            ? `${formData.name}'s Portfolio` 
            : `${formData.targetJob} ${docType}`;

            const backendType = mapToBackendType(docType);
  
            if(docToEdit) {
              updateDocument({ ...docToEdit, title: docTitle, type: backendType, content: cleanContent }, request);
              markGenerationCompleted();
            } else {
              addDocument({ title: docTitle, type: backendType, content: cleanContent }, request);
              markGenerationCompleted();
            }
            consumeToken();
            onClose();
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    }, [formData, docType, currentUser, consumeToken, addDocument, updateDocument, docToEdit, onClose, markGenerationCompleted, canPerformAction]);

    const handleUpgrade = () => {
        onClose();
        onUpgrade();
    };

    const getButtonText = () => {
        const action = docToEdit ? 'Update' : 'Generate';
        return `${action} ${docType}`;
    }

    const renderActionButtons = (isWizard: boolean, maxSteps?: number) => {
        const finalStep = !isWizard || (isWizard && wizardStep === maxSteps);
        const isSubmitDisabled = isLoading || !currentUser;

        const wizardControls = (
            <div className="flex justify-between items-center">
                <button type="button" onClick={() => setWizardStep(s => s - 1)} disabled={wizardStep === 1 || isFormDisabled} className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <ArrowLeftIcon /> Back
                </button>
                <button type="button" onClick={() => setWizardStep(s => s + 1)} disabled={isFormDisabled} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-md flex items-center gap-2 disabled:bg-gray-600">
                    Next <ArrowRightIcon />
                </button>
            </div>
        );

        const finalActionButtons = (
             canPerformAction ? (
                <button type="button" onClick={handleGenerate} disabled={isSubmitDisabled} className="w-full bg-cyan-500 text-white font-bold py-3 px-8 rounded-md hover:bg-cyan-400 transition-colors duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center h-12">
                   {isLoading ? <LoadingSpinner /> : getButtonText()}
               </button>
             ) : (
                <button type="button" onClick={handleUpgrade} className="w-full bg-yellow-500 text-black font-bold py-3 px-8 rounded-md hover:bg-yellow-400 transition-colors duration-300 flex items-center justify-center h-12 gap-2">
                    <LockClosedIcon className="h-5 w-5"/>
                    Upgrade to {docToEdit ? 'Update' : 'Generate'}
                </button>
             )
        );

        const wizardFinalButtons = (
            <div className="flex justify-between items-center">
                <button type="button" onClick={() => setWizardStep(s => s - 1)} disabled={wizardStep === 1 || isFormDisabled} className="flex items-center gap-2 text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <ArrowLeftIcon /> Back
                </button>
                 {canPerformAction ? (
                    <button type="button" onClick={handleGenerate} disabled={isSubmitDisabled} className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-6 rounded-md disabled:bg-gray-600 disabled:cursor-not-allowed flex items-center justify-center min-w-[150px]">
                        {isLoading ? <LoadingSpinner /> : getButtonText()}
                    </button>
                 ) : (
                    <button type="button" onClick={handleUpgrade} className="bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2 px-6 rounded-md flex items-center gap-2">
                         <LockClosedIcon className="h-5 w-5"/>
                        Upgrade to {docToEdit ? 'Update' : 'Generate'}
                    </button>
                 )}
            </div>
        );

        return (
            <div className="pt-4 mt-4 border-t border-gray-700">
                {finalStep ? (isWizard ? wizardFinalButtons : finalActionButtons) : wizardControls}
            </div>
        );
    }


    const renderCoverLetterForm = () => (
        <div>
            <div className="space-y-4">
                <FormInput label="Full Name" name="name" value={formData.name} onChange={handleInputChange} disabled={isFormDisabled} />
                <FormInput label="Contact Info" name="contact" value={formData.contact} onChange={handleInputChange} disabled={isFormDisabled} />
                <FormInput label="Target Job Title" name="targetJob" value={formData.targetJob} onChange={handleInputChange} disabled={isFormDisabled} />
                <FormInput label="Target Company" name="targetCompany" value={formData.targetCompany} onChange={handleInputChange} disabled={isFormDisabled} />
                <FormTextarea label="Relevant Experience & Skills" name="experience" value={formData.experience} onChange={handleInputChange} rows={5} disabled={isFormDisabled} />
            </div>
            {renderActionButtons(false)}
        </div>
    );
    
    const renderResumeWizard = () => {
        const maxSteps = 3; // Changed from 2 to 3
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
                    <FormInput label="Target Company" name="targetCompany" value={formData.targetCompany} onChange={handleInputChange} disabled={isFormDisabled} placeholder="Company you're applying to" />
                    <FormTextarea label="Work Experience" name="experience" value={formData.experience} onChange={handleInputChange} rows={5} disabled={isFormDisabled} />
                    <FormTextarea label="Education" name="education" value={formData.education} onChange={handleInputChange} disabled={isFormDisabled} />
                    <FormTextarea label="Skills (comma-separated)" name="skills" value={formData.skills} onChange={handleInputChange} disabled={isFormDisabled} />
                </div>
            )}
            {wizardStep === 2 && (
                <div className="animate-fade-in">
                    <h3 className="text-lg font-semibold text-white text-center">Projects & Certifications</h3>
                    <p className="text-center text-gray-400 text-sm mb-4">
                        Highlight your key projects and certifications
                    </p>
                    
                    {/* Projects Section */}
                    <div className="mb-8">
                        <h4 className="text-md font-semibold text-white mb-3">Projects</h4>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {(formData.projects || []).map((proj, index) => (
                                <div key={proj.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-3 relative">
                                    <FormInput 
                                        label={`Project ${index + 1} Title`} 
                                        name="title" 
                                        value={proj.title} 
                                        onChange={e => handleResumeProjectChange(proj.id, 'title', e.target.value)} 
                                        disabled={isFormDisabled} 
                                    />
                                    <FormTextarea 
                                        label="Description" 
                                        name="description" 
                                        value={proj.description} 
                                        onChange={e => handleResumeProjectChange(proj.id, 'description', e.target.value)} 
                                        rows={2} 
                                        disabled={isFormDisabled} 
                                    />
                                    <FormInput 
                                        label="Technologies Used" 
                                        name="technologies" 
                                        value={proj.technologies || ''} 
                                        onChange={e => handleResumeProjectChange(proj.id, 'technologies', e.target.value)} 
                                        disabled={isFormDisabled}
                                        placeholder="React, Node.js, MongoDB"
                                    />
                                    <FormInput 
                                        label="Project Link (Optional)" 
                                        name="link" 
                                        value={proj.link || ''} 
                                        onChange={e => handleResumeProjectChange(proj.id, 'link', e.target.value)} 
                                        disabled={isFormDisabled}
                                        icon={<LinkIcon />}
                                        placeholder="https://example.com"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removeResumeProject(proj.id)} 
                                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 hover:bg-gray-700 rounded-full"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={addResumeProject} 
                            className="mt-3 w-full text-cyan-400 font-semibold py-2 px-4 rounded-md border-2 border-dashed border-gray-600 hover:bg-gray-800 transition-colors"
                        >
                            + Add Another Project
                        </button>
                    </div>
                    
                    {/* Certifications Section */}
                    <div>
                        <h4 className="text-md font-semibold text-white mb-3">Certifications</h4>
                        <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                            {(formData.certifications || []).map((cert, index) => (
                                <div key={cert.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-3 relative">
                                    <FormInput 
                                        label={`Certification ${index + 1} Name`} 
                                        name="name" 
                                        value={cert.name} 
                                        onChange={e => handleCertificationChange(cert.id, 'name', e.target.value)} 
                                        disabled={isFormDisabled} 
                                    />
                                    <FormInput 
                                        label="Issuing Organization" 
                                        name="issuer" 
                                        value={cert.issuer} 
                                        onChange={e => handleCertificationChange(cert.id, 'issuer', e.target.value)} 
                                        disabled={isFormDisabled} 
                                    />
                                    <FormInput 
                                        label="Date Earned" 
                                        name="date" 
                                        value={cert.date} 
                                        onChange={e => handleCertificationChange(cert.id, 'date', e.target.value)} 
                                        disabled={isFormDisabled}
                                        placeholder="YYYY-MM-DD"
                                        type="date"
                                    />
                                    <button 
                                        type="button" 
                                        onClick={() => removeCertification(cert.id)} 
                                        className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 hover:bg-gray-700 rounded-full"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button 
                            type="button" 
                            onClick={addCertification} 
                            className="mt-3 w-full text-cyan-400 font-semibold py-2 px-4 rounded-md border-2 border-dashed border-gray-600 hover:bg-gray-800 transition-colors"
                        >
                            + Add Another Certification
                        </button>
                    </div>
                </div>
            )}
            {wizardStep === 3 && (
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
            {renderActionButtons(true, maxSteps)}
        </div>);
    };
    
    const renderPortfolioWizard = () => {
        const maxSteps = 6;
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
                            <ImagePreview
                                imageId={formData.profilePicture || ''}
                                alt="Profile Preview"
                                className="w-16 h-16 object-cover rounded-full"
                                placeholder={<div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center"><ProfileIcon className="h-8 w-8 text-gray-500" /></div>}
                            />
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
                                    <ImagePreview imageId={proj.image} alt="Project Preview" className="w-16 h-12 object-cover rounded-md" placeholder={<div className="w-16 h-12 rounded-md bg-gray-800"></div>} />
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
            {wizardStep === 5 && ( // Products
                <div className="animate-fade-in">
                     <h3 className="text-lg font-semibold text-white text-center">Products for Sale</h3>
                     <p className="text-center text-gray-400 text-sm mb-4">Optionally, add products you want to sell.</p>
                    <div className="space-y-6 max-h-64 overflow-y-auto pr-2">
                    {(formData.products || []).map((prod, index) => (
                        <div key={prod.id} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg space-y-3 relative">
                            <FormInput label={`Product ${index + 1} Title`} name="title" value={prod.title} onChange={e => handleProductChange(prod.id, 'title', e.target.value)} disabled={isFormDisabled} />
                            <FormTextarea label="Description" name="description" value={prod.description} onChange={e => handleProductChange(prod.id, 'description', e.target.value)} rows={2} disabled={isFormDisabled} />
                            <FormInput label="Price ($)" name="price" type="number" value={String(prod.price)} onChange={e => handleProductChange(prod.id, 'price', e.target.valueAsNumber || 0)} disabled={isFormDisabled} />
                            <div>
                                <label className="block text-sm font-medium text-gray-300 mb-1">Product Image</label>
                                <div className="flex items-center gap-4">
                                    <label className="flex-grow w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-md cursor-pointer transition-colors">
                                        <UploadIcon />
                                        <span>{prod.image ? 'Change Image' : 'Upload Image'}</span>
                                        <input type="file" accept="image/png, image/jpeg, image/gif" className="hidden" onChange={e => e.target.files && handleFileChange(e.target.files[0], 'productImage', prod.id)} />
                                    </label>
                                     <ImagePreview imageId={prod.image} alt="Product Preview" className="w-16 h-12 object-cover rounded-md" placeholder={<div className="w-16 h-12 rounded-md bg-gray-800"></div>} />
                                </div>
                            </div>
                             <div className="mt-3">
                                <label className="block text-sm font-medium text-gray-300 mb-2">Payment Method</label>
                                <div className="flex gap-4">
                                    {(['link', 'bank', 'flutterwave'] as const).map(method => (
                                        <label key={method} className="flex items-center gap-2 text-sm">
                                            <input
                                                type="radio"
                                                name={`paymentMethod-${prod.id}`}
                                                value={method}
                                                checked={prod.paymentMethod === method}
                                                onChange={() => handleProductChange(prod.id, 'paymentMethod', method)}
                                                className="form-radio h-4 w-4 bg-gray-800 border-gray-600 text-cyan-600 focus:ring-cyan-500"
                                            />
                                            <span className="capitalize">{method}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            {prod.paymentMethod === 'link' && (
                                <FormInput label="Checkout Link" name="checkoutLink" value={prod.checkoutLink || ''} onChange={e => handleProductChange(prod.id, 'checkoutLink', e.target.value)} disabled={isFormDisabled} placeholder="https://your.store/checkout/item" />
                            )}
                            {prod.paymentMethod === 'bank' && (
                                <FormTextarea label="Bank Account Details" name="bankDetails" value={prod.bankDetails || ''} onChange={e => handleProductChange(prod.id, 'bankDetails', e.target.value)} rows={3} disabled={isFormDisabled} placeholder="Bank Name: Example Bank&#10;Account Name: Your Name&#10;Account Number: 1234567890" />
                            )}
                            {prod.paymentMethod === 'flutterwave' && (
                                <FormInput label="Flutterwave Public Key" name="flutterwaveKey" value={prod.flutterwaveKey || ''} onChange={e => handleProductChange(prod.id, 'flutterwaveKey', e.target.value)} disabled={isFormDisabled} placeholder="FLWPUBK_TEST-xxxxxxxx-X" />
                            )}
                            <button type="button" onClick={() => removeProduct(prod.id)} className="absolute top-2 right-2 p-1 text-gray-500 hover:text-red-500 hover:bg-gray-700 rounded-full"><TrashIcon /></button>
                        </div>
                    ))}
                    </div>
                    <button type="button" onClick={addProduct} className="mt-4 w-full text-cyan-400 font-semibold py-2 px-4 rounded-md border-2 border-dashed border-gray-600 hover:bg-gray-800 transition-colors">
                       + Add a Product
                    </button>
                </div>
            )}
            {wizardStep === 6 && ( // Socials & Contact
                 <div className="space-y-4 animate-fade-in">
                     <h3 className="text-lg font-semibold text-white text-center">Final Touches</h3>
                     <p className="text-center text-gray-400 text-sm mb-4">How can people reach you?</p>
                    <FormInput label="Contact Info (Email, Phone, Location)" name="contact" value={formData.contact} onChange={handleInputChange} disabled={isFormDisabled} />
                    <FormInput label="Social Links (comma-separated URLs)" name="portfolioSocialLinks" value={formData.portfolioSocialLinks || ''} onChange={handleInputChange} disabled={isFormDisabled} />
                </div>
            )}
            {renderActionButtons(true, maxSteps)}
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