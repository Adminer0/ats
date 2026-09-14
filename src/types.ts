export type JobStatus = 'active' | 'draft' | 'closed';
export type JobType = 'full-time' | 'part-time' | 'contract' | 'internship';
export type JobRegion = 'Worldwide Remote' | 'Americas' | 'EMEA' | 'APAC' | 'Hybrid';

export interface JobPost {
  id: string;
  title: string;
  department: string;
  location: string;
  region: JobRegion;
  type: JobType;
  experienceLevel: 'Entry' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive';
  salaryMin: number;
  salaryMax: number;
  salaryCurrency: string;
  status: JobStatus;
  description: string;
  responsibilities: string[];
  requirements: string[];
  benefits: string[];
  featured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ApplicationStage = 
  | 'applied' 
  | 'screening' 
  | 'technical' 
  | 'interview' 
  | 'offer' 
  | 'hired' 
  | 'rejected';

export interface CandidateNote {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

export interface Application {
  id: string;
  jobId: string;
  jobTitle: string;
  candidateName: string;
  email: string;
  phone: string;
  location: string;
  currentRole?: string;
  experienceYears: number;
  portfolioUrl?: string;
  linkedInUrl?: string;
  githubUrl?: string;
  coverNote: string;
  resumeFileName?: string;
  resumeText?: string;
  stage: ApplicationStage;
  rating?: number; // 1 to 5
  tags: string[];
  notes: CandidateNote[];
  appliedAt: string;
  lastUpdated: string;
}

export interface AutomatedNotification {
  id: string;
  applicationId: string;
  candidateName: string;
  recipientEmail: string;
  jobTitle: string;
  stage: ApplicationStage;
  subject: string;
  body: string;
  sentAt: string;
  status: 'sent' | 'delivered' | 'failed';
  triggerType: 'automatic' | 'manual';
}

export interface EmailTemplate {
  id: string;
  stage: ApplicationStage;
  name: string;
  subject: string;
  body: string;
}

export interface ATSAnalytics {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  pipelineByStage: Record<ApplicationStage, number>;
  offersAccepted: number;
  timeToHireDays: number;
  applicationsByDepartment: { department: string; count: number }[];
  applicationsByRegion: { region: string; count: number }[];
}

export interface NeonStatus {
  connected: boolean;
  usingPostgres: boolean;
  projectId: string;
  branch: string;
  connectionType: string;
  activeJobsCount: number;
  applicationsCount: number;
  lastChecked: string;
  message: string;
}
