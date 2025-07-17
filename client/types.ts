
export type DocumentType = 'Resume' | 'Cover Letter' | 'Portfolio';
export type PortfolioTemplate = 'onyx' | 'quartz' | 'sapphire' | 'emerald' | 'ruby';
export type ResumeTemplate = 'classic' | 'modern' | 'simple' | 'creative' | 'technical';

export interface PortfolioProject {
  id: string;
  title: string;
  description: string;
  link: string;
  image: string; // Base64 encoded image
}

export interface Document {
  id: string;
  title: string;
  content: string;
  docType: string; // 👈 Make sure it's `docType` not `type`
  createdAt: string;
  isPublic?: boolean;
  sourceRequest?: any;
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
