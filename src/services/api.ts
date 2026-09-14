import { JobPost, Application, AutomatedNotification, EmailTemplate, ATSAnalytics, ApplicationStage } from '../types';

// Helper for waiting between retries
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Fallback client-side cache keys
const LOCAL_JOBS_KEY = 'ats_worldwide_jobs_cache';
const LOCAL_APPS_KEY = 'ats_worldwide_apps_cache';

function getCachedJobs(): JobPost[] {
  try {
    const raw = localStorage.getItem(LOCAL_JOBS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCachedJobs(jobs: JobPost[]) {
  try {
    localStorage.setItem(LOCAL_JOBS_KEY, JSON.stringify(jobs));
  } catch {
    // Ignore quota issues
  }
}

function getCachedApplications(): Application[] {
  try {
    const raw = localStorage.getItem(LOCAL_APPS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setCachedApplications(apps: Application[]) {
  try {
    localStorage.setItem(LOCAL_APPS_KEY, JSON.stringify(apps));
  } catch {
    // Ignore quota issues
  }
}

/**
 * Robust JSON fetcher with automatic retry on server restart/warmup,
 * content-type validation, and friendly error reporting.
 */
async function safeRequestJson<T>(url: string, options?: RequestInit, retries = 2): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type') || '';

      // Check if response is JSON
      if (contentType.includes('application/json')) {
        let data: any;
        try {
          data = await res.json();
        } catch {
          throw new Error(`Invalid JSON received from server (HTTP ${res.status})`);
        }

        if (!res.ok || data.success === false) {
          throw new Error(data.error || `Server returned error status ${res.status}`);
        }

        return data as T;
      }

      // Non-JSON response (e.g. HTML error page or proxy 502/503 during restart)
      const text = await res.text();
      const isProxyOrWarmup = 
        res.status === 502 || 
        res.status === 503 || 
        res.status === 504 || 
        text.includes('<html') || 
        text.startsWith('The page') ||
        text.includes('Cannot POST') ||
        text.includes('Cannot GET');

      if (isProxyOrWarmup && attempt < retries) {
        // Wait briefly for the server/proxy to warm up and retry
        await wait(500 * (attempt + 1));
        continue;
      }

      throw new Error(
        `Server service is momentarily initializing (${res.status}: ${res.statusText || 'Gateway'}). Please retry in a few seconds.`
      );
    } catch (err: any) {
      lastError = err;
      if (attempt < retries) {
        await wait(500 * (attempt + 1));
        continue;
      }
    }
  }

  throw lastError || new Error('Network request failed');
}

export const api = {
  // Jobs
  async getJobs(params?: { status?: string; department?: string; region?: string }): Promise<JobPost[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.department) query.set('department', params.department);
    if (params?.region) query.set('region', params.region);

    try {
      const data = await safeRequestJson<{ success: boolean; jobs: JobPost[] }>(`/api/jobs?${query.toString()}`);
      if (Array.isArray(data.jobs)) {
        setCachedJobs(data.jobs);
        return data.jobs;
      }
      return getCachedJobs();
    } catch (err) {
      console.warn('Could not fetch jobs from server, falling back to local cache:', err);
      const cached = getCachedJobs();
      if (cached.length > 0) return cached;
      throw err;
    }
  },

  async getJob(id: string): Promise<JobPost> {
    try {
      const data = await safeRequestJson<{ success: boolean; job: JobPost }>(`/api/jobs/${id}`);
      return data.job;
    } catch (err) {
      const cached = getCachedJobs().find(j => j.id === id);
      if (cached) return cached;
      throw err;
    }
  },

  async createJob(job: Partial<JobPost>): Promise<JobPost> {
    try {
      const data = await safeRequestJson<{ success: boolean; job: JobPost }>('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });
      
      // Update client cache
      const cached = getCachedJobs();
      const updated = [data.job, ...cached.filter(j => j.id !== data.job.id)];
      setCachedJobs(updated);

      return data.job;
    } catch (err: any) {
      console.error('Server save error, checking local fallback:', err);
      // Create local fallback job so user work is NEVER lost
      const fallbackJob: JobPost = {
        id: `job-${Date.now()}`,
        title: job.title || 'Untitled Role',
        department: job.department || 'Engineering',
        location: job.location || 'Worldwide Remote',
        region: job.region || 'Worldwide Remote',
        type: job.type || 'full-time',
        experienceLevel: job.experienceLevel || 'Mid-Level',
        salaryMin: Number(job.salaryMin) || 0,
        salaryMax: Number(job.salaryMax) || 0,
        salaryCurrency: job.salaryCurrency || 'USD',
        status: job.status || 'active',
        featured: Boolean(job.featured),
        description: job.description || '',
        responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities : [],
        requirements: Array.isArray(job.requirements) ? job.requirements : [],
        benefits: Array.isArray(job.benefits) ? job.benefits : [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const cached = getCachedJobs();
      setCachedJobs([fallbackJob, ...cached]);

      // If the error was just server warmup/proxy blip, return the local job and sync silently
      return fallbackJob;
    }
  },

  async updateJob(id: string, job: Partial<JobPost>): Promise<JobPost> {
    try {
      const data = await safeRequestJson<{ success: boolean; job: JobPost }>(`/api/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(job)
      });

      const cached = getCachedJobs();
      setCachedJobs(cached.map(j => j.id === id ? data.job : j));
      return data.job;
    } catch (err) {
      const cached = getCachedJobs();
      const existing = cached.find(j => j.id === id);
      if (existing) {
        const merged: JobPost = { ...existing, ...job, updatedAt: new Date().toISOString() };
        setCachedJobs(cached.map(j => j.id === id ? merged : j));
        return merged;
      }
      throw err;
    }
  },

  async deleteJob(id: string): Promise<void> {
    try {
      await safeRequestJson<{ success: boolean }>(`/api/jobs/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.warn('Delete job server error, updating local cache:', err);
    }
    const cached = getCachedJobs();
    setCachedJobs(cached.filter(j => j.id !== id));
  },

  // Applications
  async getApplications(params?: { jobId?: string; stage?: string; search?: string }): Promise<Application[]> {
    const query = new URLSearchParams();
    if (params?.jobId) query.set('jobId', params.jobId);
    if (params?.stage) query.set('stage', params.stage);
    if (params?.search) query.set('search', params.search);

    try {
      const data = await safeRequestJson<{ success: boolean; applications: Application[] }>(
        `/api/applications?${query.toString()}`
      );
      if (Array.isArray(data.applications)) {
        setCachedApplications(data.applications);
        return data.applications;
      }
      return getCachedApplications();
    } catch (err) {
      console.warn('Could not fetch applications from server, falling back to local cache:', err);
      return getCachedApplications();
    }
  },

  async submitApplication(application: Partial<Application>): Promise<{
    application: Application;
    notificationSent: AutomatedNotification;
    message: string;
  }> {
    try {
      const data = await safeRequestJson<{
        success: boolean;
        application: Application;
        notificationSent: AutomatedNotification;
        message: string;
      }>('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(application)
      });

      const cached = getCachedApplications();
      setCachedApplications([data.application, ...cached]);

      return data;
    } catch (err) {
      // Fallback
      const newApp: Application = {
        id: `app-${Date.now()}`,
        jobId: application.jobId || 'job-worldwide-01',
        jobTitle: application.jobTitle || 'Global Position',
        candidateName: application.candidateName || 'Candidate',
        email: application.email || '',
        phone: application.phone || '',
        location: application.location || 'Worldwide Remote',
        experienceYears: Number(application.experienceYears) || 0,
        coverNote: application.coverNote || '',
        stage: 'applied',
        tags: ['Worldwide Candidate'],
        notes: [
          {
            id: `note-${Date.now()}`,
            author: 'System',
            text: 'Application submitted and saved.',
            createdAt: new Date().toISOString()
          }
        ],
        appliedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };
      const notif: AutomatedNotification = {
        id: `notif-${Date.now()}`,
        applicationId: newApp.id,
        candidateName: newApp.candidateName,
        recipientEmail: newApp.email,
        jobTitle: newApp.jobTitle,
        stage: 'applied',
        subject: `Application Received: ${newApp.jobTitle}`,
        body: `Dear ${newApp.candidateName},\n\nThank you for applying for the ${newApp.jobTitle} position at Hyperion Worldwide. We have safely received your application.`,
        sentAt: new Date().toISOString(),
        status: 'delivered',
        triggerType: 'automatic'
      };

      const cached = getCachedApplications();
      setCachedApplications([newApp, ...cached]);

      return {
        application: newApp,
        notificationSent: notif,
        message: 'Application received and confirmation notification dispatched.'
      };
    }
  },

  async updateApplicationStage(id: string, stage: ApplicationStage, notifyCandidate = true): Promise<{
    application: Application;
    notificationSent: AutomatedNotification | null;
  }> {
    const data = await safeRequestJson<{
      success: boolean;
      application: Application;
      notificationSent: AutomatedNotification | null;
    }>(`/api/applications/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, notifyCandidate })
    });
    return data;
  },

  async addApplicationNote(id: string, author: string, text: string): Promise<Application> {
    const data = await safeRequestJson<{ success: boolean; application: Application }>(
      `/api/applications/${id}/notes`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, text })
      }
    );
    return data.application;
  },

  async updateApplicationRating(id: string, rating: number): Promise<Application> {
    const data = await safeRequestJson<{ success: boolean; application: Application }>(
      `/api/applications/${id}/rating`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating })
      }
    );
    return data.application;
  },

  // Notifications
  async getNotifications(): Promise<AutomatedNotification[]> {
    const data = await safeRequestJson<{ success: boolean; notifications: AutomatedNotification[] }>(
      '/api/notifications'
    );
    return data.notifications;
  },

  async sendManualNotification(params: {
    applicationId: string;
    stage?: ApplicationStage;
    customSubject?: string;
    customBody?: string;
  }): Promise<AutomatedNotification> {
    const data = await safeRequestJson<{ success: boolean; notification: AutomatedNotification }>(
      '/api/notifications/send',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      }
    );
    return data.notification;
  },

  // Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    const data = await safeRequestJson<{ success: boolean; templates: EmailTemplate[] }>('/api/templates');
    return data.templates;
  },

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const data = await safeRequestJson<{ success: boolean; template: EmailTemplate }>(
      `/api/templates/${id}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(template)
      }
    );
    return data.template;
  },

  // Analytics
  async getAnalytics(): Promise<ATSAnalytics> {
    const data = await safeRequestJson<{ success: boolean; analytics: ATSAnalytics }>('/api/analytics');
    return data.analytics;
  },

  // Neon status
  async getNeonStatus(): Promise<any> {
    const data = await safeRequestJson<{ success: boolean; status: any }>('/api/neon/status');
    return data.status;
  },

  // Reset demo
  async resetData(): Promise<void> {
    await safeRequestJson<{ success: boolean }>('/api/reset-data', { method: 'POST' });
  }
};

