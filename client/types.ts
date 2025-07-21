
export type DocumentType = 'Resume' | 'Cover Letter' | 'Portfolio';
export type PortfolioTemplate = 
  'onyx' | 'quartz' | 'sapphire' | 'emerald' | 'ruby' |
  'onyx-2' | 'onyx-3' | 'onyx-4' | 'onyx-5' | 'onyx-6' | 'onyx-7' | 'onyx-8' | 'onyx-9' | 'onyx-10' | 'onyx-11' |
  'quartz-2' | 'quartz-3' | 'quartz-4' | 'quartz-5' | 'quartz-6' | 'quartz-7' | 'quartz-8' | 'quartz-9' | 'quartz-10' | 'quartz-11' |
  'sapphire-2' | 'sapphire-3' | 'sapphire-4' | 'sapphire-5' | 'sapphire-6' | 'sapphire-7' | 'sapphire-8' | 'sapphire-9' | 'sapphire-10' | 'sapphire-11' |
  'emerald-2' | 'emerald-3' | 'emerald-4' | 'emerald-5' | 'emerald-6' | 'emerald-7' | 'emerald-8' | 'emerald-9' | 'emerald-10' | 'emerald-11' |
  'ruby-2' | 'ruby-3' | 'ruby-4' | 'ruby-5' | 'ruby-6' | 'ruby-7' | 'ruby-8' | 'ruby-9' | 'ruby-10' | 'ruby-11';
export type ResumeTemplate = 
  'classic' | 'modern' | 'simple' | 'creative' | 'technical' |
  'classic-2' | 'classic-3' | 'classic-4' | 'classic-5' | 'classic-6' | 'classic-7' | 'classic-8' | 'classic-9' | 'classic-10' | 'classic-11' |
  'modern-2' | 'modern-3' | 'modern-4' | 'modern-5' | 'modern-6' | 'modern-7' | 'modern-8' | 'modern-9' | 'modern-10' | 'modern-11' |
  'simple-2' | 'simple-3' | 'simple-4' | 'simple-5' | 'simple-6' | 'simple-7' | 'simple-8' | 'simple-9' | 'simple-10' | 'simple-11' |
  'creative-2' | 'creative-3' | 'creative-4' | 'creative-5' | 'creative-6' | 'creative-7' | 'creative-8' | 'creative-9' | 'creative-10' | 'creative-11' |
  'technical-2' | 'technical-3' | 'technical-4' | 'technical-5' | 'technical-6' | 'technical-7' | 'technical-8' | 'technical-9' | 'technical-10' | 'technical-11';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string; // Base64 encoded image
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  image: string; // Base64 encoded image
  paymentMethod?: 'link' | 'bank' | 'flutterwave';
  checkoutLink?: string;
  bankDetails?: string;
  flutterwaveKey?: string;
}

export interface Document {
  id: string;
  title: string;
  type: DocumentType;
  content: string;
  createdAt: string; // ISO string
  sourceRequest?: DocumentRequest; // To enable editing
  isPublic?: boolean;
}

export interface DocumentRequest {
  docType: DocumentType;
  name: string;
  contact: string;
  experience: string;
  education: string;
  skills: string;
  targetJob: string;
  targetCompany: string;
  // Resume fields
  resumeTemplate?: ResumeTemplate;
  // Portfolio fields
  profilePicture?: string; // Base64 encoded image
  portfolioBio?: string;
  portfolioProjects?: PortfolioProject[];
  portfolioSocialLinks?: string;
  portfolioTemplate?: PortfolioTemplate;
  products?: Product[];
}

export type UserPlan = 'Free' | 'Pro';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Should be handled securely, not stored plaintext long-term in a real app
  plan: UserPlan;
  tokens: number;
  documents: Document[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  name: string;
  email: string;
  password: string;
}

// --- Resume Analyser Types ---

export interface ResumeCorrection {
    original: string;
    suggestion: string;
    explanation: string;
}

export interface ResumeAnalysis {
    overallFeedback: {
        score: number;
        summary: string;
    };
    strengths: string[];
    weaknesses: string[];
    corrections: ResumeCorrection[];
    aiContentScore: {
        probability: number;
        explanation: string;
    };
    recommendedRoles: string[];
}

export interface JobPosting {
    title: string;
    company: string;
    description: string;
    requirements: string;
    datePosted: string;
    url: string;
}

export interface GroundingSource {
    uri: string;
    title: string;
}

export interface AnalysisResult {
    analysis: ResumeAnalysis;
    jobs: JobPosting[];
    sources: GroundingSource[];
}
