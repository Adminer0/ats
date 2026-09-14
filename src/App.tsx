import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CareerPortal } from './components/CareerPortal';
import { DashboardATS } from './components/DashboardATS';
import { JobModal } from './components/JobModal';
import { api } from './services/api';
import { JobPost, Application, AutomatedNotification, EmailTemplate, ATSAnalytics } from './types';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<'career' | 'ats'>('career');
  const [jobs, setJobs] = useState<JobPost[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [notifications, setNotifications] = useState<AutomatedNotification[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [analytics, setAnalytics] = useState<ATSAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false);

  const loadAllData = async () => {
    try {
      const [fetchedJobs, fetchedApps, fetchedNotifs, fetchedTpls, fetchedAnalytics] = await Promise.all([
        api.getJobs(),
        api.getApplications(),
        api.getNotifications(),
        api.getTemplates(),
        api.getAnalytics()
      ]);
      setJobs(fetchedJobs);
      setApplications(fetchedApps);
      setNotifications(fetchedNotifs);
      setTemplates(fetchedTpls);
      setAnalytics(fetchedAnalytics);
    } catch (err) {
      console.error('Error loading ATS data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleCreateJob = async (jobData: Partial<JobPost>) => {
    await api.createJob(jobData);
    await loadAllData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          <p className="text-xs font-semibold text-slate-500">
            Connecting to Worldwide Careers & Neon ATS Database...
          </p>
        </div>
      </div>
    );
  }

  const activeJobsCount = jobs.filter(j => j.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        activeJobsCount={activeJobsCount}
        totalApplicationsCount={applications.length}
        onOpenCreateJob={() => setIsCreateJobOpen(true)}
        unreadNotificationsCount={notifications.length}
        onOpenNotifications={() => setCurrentView('ats')}
      />

      <main className="flex-1">
        {currentView === 'career' ? (
          <CareerPortal
            jobs={jobs}
            onApplicationSubmitted={loadAllData}
            onOpenAts={() => setCurrentView('ats')}
          />
        ) : (
          <DashboardATS
            jobs={jobs}
            applications={applications}
            notifications={notifications}
            templates={templates}
            analytics={analytics}
            onRefresh={loadAllData}
            onViewCareerPage={() => setCurrentView('career')}
            onCreateJobClick={() => setIsCreateJobOpen(true)}
          />
        )}
      </main>

      {/* Quick Job Creation Modal from Navbar */}
      <JobModal
        isOpen={isCreateJobOpen}
        onClose={() => setIsCreateJobOpen(false)}
        onSave={handleCreateJob}
      />
    </div>
  );
}
