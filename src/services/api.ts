import { JobPost, Application, AutomatedNotification, EmailTemplate, ATSAnalytics, ApplicationStage } from '../types';

export const api = {
  // Jobs
  async getJobs(params?: { status?: string; department?: string; region?: string }): Promise<JobPost[]> {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.department) query.set('department', params.department);
    if (params?.region) query.set('region', params.region);

    const res = await fetch(`/api/jobs?${query.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch jobs');
    return data.jobs;
  },

  async getJob(id: string): Promise<JobPost> {
    const res = await fetch(`/api/jobs/${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch job');
    return data.job;
  },

  async createJob(job: Partial<JobPost>): Promise<JobPost> {
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to create job');
    return data.job;
  },

  async updateJob(id: string, job: Partial<JobPost>): Promise<JobPost> {
    const res = await fetch(`/api/jobs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(job)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update job');
    return data.job;
  },

  async deleteJob(id: string): Promise<void> {
    const res = await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete job');
  },

  // Applications
  async getApplications(params?: { jobId?: string; stage?: string; search?: string }): Promise<Application[]> {
    const query = new URLSearchParams();
    if (params?.jobId) query.set('jobId', params.jobId);
    if (params?.stage) query.set('stage', params.stage);
    if (params?.search) query.set('search', params.search);

    const res = await fetch(`/api/applications?${query.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch applications');
    return data.applications;
  },

  async submitApplication(application: Partial<Application>): Promise<{
    application: Application;
    notificationSent: AutomatedNotification;
    message: string;
  }> {
    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(application)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to submit application');
    return data;
  },

  async updateApplicationStage(id: string, stage: ApplicationStage, notifyCandidate = true): Promise<{
    application: Application;
    notificationSent: AutomatedNotification | null;
  }> {
    const res = await fetch(`/api/applications/${id}/stage`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage, notifyCandidate })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update candidate stage');
    return data;
  },

  async addApplicationNote(id: string, author: string, text: string): Promise<Application> {
    const res = await fetch(`/api/applications/${id}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ author, text })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to add note');
    return data.application;
  },

  async updateApplicationRating(id: string, rating: number): Promise<Application> {
    const res = await fetch(`/api/applications/${id}/rating`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rating })
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update rating');
    return data.application;
  },

  // Notifications
  async getNotifications(): Promise<AutomatedNotification[]> {
    const res = await fetch('/api/notifications');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch notifications');
    return data.notifications;
  },

  async sendManualNotification(params: {
    applicationId: string;
    stage?: ApplicationStage;
    customSubject?: string;
    customBody?: string;
  }): Promise<AutomatedNotification> {
    const res = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to send notification');
    return data.notification;
  },

  // Templates
  async getTemplates(): Promise<EmailTemplate[]> {
    const res = await fetch('/api/templates');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch templates');
    return data.templates;
  },

  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(template)
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update template');
    return data.template;
  },

  // Analytics
  async getAnalytics(): Promise<ATSAnalytics> {
    const res = await fetch('/api/analytics');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to fetch analytics');
    return data.analytics;
  },

  // Neon status
  async getNeonStatus(): Promise<any> {
    const res = await fetch('/api/neon/status');
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to check Neon DB status');
    return data.status;
  },

  // Reset demo
  async resetData(): Promise<void> {
    const res = await fetch('/api/reset-data', { method: 'POST' });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to reset data');
  }
};
