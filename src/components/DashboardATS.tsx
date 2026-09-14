import React, { useState, useMemo } from 'react';
import { 
  Users, Briefcase, BarChart3, Mail, Database, Search, 
  Filter, Plus, MoreHorizontal, ArrowRight, Star, Clock, 
  MapPin, CheckCircle2, AlertCircle, RefreshCw, Send, 
  ExternalLink, Edit, Trash2, Copy, Eye, FileText, ChevronRight
} from 'lucide-react';
import { 
  JobPost, Application, AutomatedNotification, EmailTemplate, 
  ATSAnalytics, ApplicationStage, JobRegion 
} from '../types';
import { api } from '../services/api';
import { JobModal } from './JobModal';
import { CandidateModal } from './CandidateModal';

interface DashboardATSProps {
  jobs: JobPost[];
  applications: Application[];
  notifications: AutomatedNotification[];
  templates: EmailTemplate[];
  analytics: ATSAnalytics | null;
  onRefresh: () => void;
  onViewCareerPage: () => void;
  onCreateJobClick: () => void;
}

const PIPELINE_COLUMNS: { id: ApplicationStage; title: string; color: string }[] = [
  { id: 'applied', title: 'Applied / New', color: 'bg-slate-100 text-slate-700' },
  { id: 'screening', title: 'Screening', color: 'bg-amber-50 text-amber-800 border-amber-200' },
  { id: 'technical', title: 'Tech Screen', color: 'bg-blue-50 text-blue-800 border-blue-200' },
  { id: 'interview', title: 'Team Interview', color: 'bg-purple-50 text-purple-800 border-purple-200' },
  { id: 'offer', title: 'Offer Sent', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  { id: 'hired', title: 'Hired', color: 'bg-teal-600 text-white' }
];

export const DashboardATS: React.FC<DashboardATSProps> = ({
  jobs,
  applications,
  notifications,
  templates,
  analytics,
  onRefresh,
  onViewCareerPage,
  onCreateJobClick
}) => {
  const [activeTab, setActiveTab] = useState<'pipeline' | 'jobs' | 'analytics' | 'notifications' | 'neon'>('pipeline');
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [selectedJobFilter, setSelectedJobFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [selectedCandidate, setSelectedCandidate] = useState<Application | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);

  // Template editing state
  const [selectedTemplateStage, setSelectedTemplateStage] = useState<ApplicationStage>('applied');
  const [templateSubject, setTemplateSubject] = useState('');
  const [templateBody, setTemplateBody] = useState('');
  const [templateSaving, setTemplateSaving] = useState(false);
  const [templateSavedMsg, setTemplateSavedMsg] = useState('');

  // Neon test state
  const [neonPingLoading, setNeonPingLoading] = useState(false);
  const [neonPingResult, setNeonPingResult] = useState<any>(null);

  // Filtered applications
  const filteredApplications = useMemo(() => {
    return applications.filter(app => {
      const matchesJob = selectedJobFilter === 'All' || app.jobId === selectedJobFilter;
      const matchesSearch = !searchQuery.trim() || 
        app.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesJob && matchesSearch;
    });
  }, [applications, selectedJobFilter, searchQuery]);

  const handleOpenCandidate = (candidate: Application) => {
    setSelectedCandidate(candidate);
    setIsCandidateModalOpen(true);
  };

  const handleQuickAdvance = async (e: React.MouseEvent, candidate: Application) => {
    e.stopPropagation();
    const order: ApplicationStage[] = ['applied', 'screening', 'technical', 'interview', 'offer', 'hired'];
    const currIdx = order.indexOf(candidate.stage);
    if (currIdx >= 0 && currIdx < order.length - 1) {
      const nextStage = order[currIdx + 1];
      try {
        await api.updateApplicationStage(candidate.id, nextStage, true);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to update stage');
      }
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (confirm('Are you sure you want to delete this job post? Associated applications will remain archived.')) {
      try {
        await api.deleteJob(jobId);
        onRefresh();
      } catch (err: any) {
        alert(err.message || 'Failed to delete job');
      }
    }
  };

  const handleDuplicateJob = async (job: JobPost) => {
    try {
      await api.createJob({
        ...job,
        title: `${job.title} (Copy)`,
        status: 'draft',
        createdAt: new Date().toISOString()
      });
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to duplicate job');
    }
  };

  const handleSaveJob = async (jobData: Partial<JobPost>) => {
    if (editingJob) {
      await api.updateJob(editingJob.id, jobData);
    } else {
      await api.createJob(jobData);
    }
    onRefresh();
  };

  // Switch template
  const activeTemplate = templates.find(t => t.stage === selectedTemplateStage) || templates[0];

  const handleSaveTemplate = async () => {
    if (!activeTemplate) return;
    setTemplateSaving(true);
    setTemplateSavedMsg('');
    try {
      await api.updateTemplate(activeTemplate.id, {
        subject: templateSubject || activeTemplate.subject,
        body: templateBody || activeTemplate.body
      });
      setTemplateSavedMsg('Template updated successfully!');
      onRefresh();
      setTimeout(() => setTemplateSavedMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save template');
    } finally {
      setTemplateSaving(false);
    }
  };

  const handleTestNeon = async () => {
    setNeonPingLoading(true);
    try {
      const status = await api.getNeonStatus();
      setNeonPingResult(status);
    } catch (err: any) {
      alert(err.message || 'Error checking status');
    } finally {
      setNeonPingLoading(false);
    }
  };

  const handleResetData = async () => {
    if (confirm('Reset to initial sample jobs, applications, and notifications?')) {
      await api.resetData();
      onRefresh();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20">
      
      {/* Top ATS Subheader with Tabs */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight font-display">
                  HR & ATS Central Command
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Worldwide Applicant Tracking, Pipeline Analytics & Automated Notifications
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                onClick={onViewCareerPage}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>View Public Career Portal</span>
              </button>
              <button
                onClick={() => {
                  setEditingJob(null);
                  setIsJobModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create Worldwide Job</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-1 overflow-x-auto py-2">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'pipeline'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Candidate Pipeline ({applications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('jobs')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'jobs'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Job Posts Worldwide ({jobs.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'analytics'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Pipeline Analytics</span>
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'notifications'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Automated Notifications ({notifications.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('neon')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-xl whitespace-nowrap transition-all ${
                activeTab === 'neon'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4 text-emerald-600" />
              <span>Neon DB & Persistence</span>
            </button>
          </div>

        </div>
      </div>

      {/* Tab 1: Candidate Pipeline & ATS */}
      {activeTab === 'pipeline' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-5">
          
          {/* Controls Bar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 flex flex-wrap items-center justify-between gap-4 shadow-xs">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative min-w-[240px] flex-1 sm:flex-initial">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search candidates, skills, location..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedJobFilter}
                  onChange={e => setSelectedJobFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700"
                >
                  <option value="All">All Job Openings ({jobs.length})</option>
                  {jobs.map(j => (
                    <option key={j.id} value={j.id}>
                      {j.title} ({j.region})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-slate-100 p-1 rounded-xl border border-slate-200 flex items-center">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                    viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Board
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-500'
                  }`}
                >
                  Table
                </button>
              </div>

              <button
                onClick={onRefresh}
                className="p-1.5 text-slate-500 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                title="Refresh Pipeline"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Kanban Board View */}
          {viewMode === 'kanban' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3.5 items-start overflow-x-auto pb-6">
              {PIPELINE_COLUMNS.map(col => {
                const colApps = filteredApplications.filter(a => a.stage === col.id);
                return (
                  <div
                    key={col.id}
                    className="bg-slate-200/50 rounded-2xl p-3 border border-slate-200 flex flex-col min-w-[210px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/80">
                      <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
                        {col.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-white text-slate-700 shadow-2xs">
                        {colApps.length}
                      </span>
                    </div>

                    {/* Candidate Cards */}
                    <div className="space-y-2.5 min-h-[350px]">
                      {colApps.length === 0 ? (
                        <div className="h-32 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-3">
                          <span className="text-[11px] text-slate-400 font-medium">No candidates in {col.title}</span>
                        </div>
                      ) : (
                        colApps.map(candidate => (
                          <div
                            key={candidate.id}
                            onClick={() => handleOpenCandidate(candidate)}
                            className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer space-y-2 group"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                                  {candidate.candidateName}
                                </h4>
                                <p className="text-[11px] text-slate-500 truncate max-w-[150px]">
                                  {candidate.jobTitle}
                                </p>
                              </div>
                              <div className="flex items-center text-amber-400 shrink-0">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span className="text-[10px] text-slate-600 font-bold ml-0.5">
                                  {candidate.rating || 4}
                                </span>
                              </div>
                            </div>

                            <div className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="truncate">{candidate.location}</span>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-1">
                              {candidate.tags.slice(0, 2).map((t, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200"
                                >
                                  {t}
                                </span>
                              ))}
                            </div>

                            {/* Footer & Quick Advance button */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400">
                              <span>{new Date(candidate.appliedAt).toLocaleDateString()}</span>
                              {col.id !== 'hired' && (
                                <button
                                  onClick={(e) => handleQuickAdvance(e, candidate)}
                                  className="px-2 py-0.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 rounded-md font-semibold transition-colors flex items-center gap-0.5"
                                  title="Advance to next pipeline stage"
                                >
                                  <span>Advance</span>
                                  <ArrowRight className="w-2.5 h-2.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View */
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">Candidate</th>
                    <th className="p-3.5">Job Opening</th>
                    <th className="p-3.5">Location</th>
                    <th className="p-3.5">Experience</th>
                    <th className="p-3.5">Stage</th>
                    <th className="p-3.5">Rating</th>
                    <th className="p-3.5">Applied Date</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredApplications.map(app => (
                    <tr
                      key={app.id}
                      onClick={() => handleOpenCandidate(app)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                      <td className="p-3.5 font-bold text-slate-900">
                        <div>{app.candidateName}</div>
                        <div className="text-[11px] text-slate-400 font-normal">{app.email}</div>
                      </td>
                      <td className="p-3.5">{app.jobTitle}</td>
                      <td className="p-3.5">{app.location}</td>
                      <td className="p-3.5">{app.experienceYears} yrs</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-200">
                          {app.stage}
                        </span>
                      </td>
                      <td className="p-3.5 font-bold text-amber-500">★ {app.rating || 4}</td>
                      <td className="p-3.5 text-slate-400">{new Date(app.appliedAt).toLocaleDateString()}</td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCandidate(app);
                          }}
                          className="px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded-lg font-semibold"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* Tab 2: Worldwide Job Posts Management */}
      {activeTab === 'jobs' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Worldwide Job Openings</h2>
              <p className="text-xs text-slate-500">Manage, edit, publish or archive roles across worldwide hubs</p>
            </div>
            <button
              onClick={() => {
                setEditingJob(null);
                setIsJobModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Worldwide Role</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {jobs.map(job => {
              const jobApps = applications.filter(a => a.jobId === job.id);
              return (
                <div
                  key={job.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
                        {job.department}
                      </span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          job.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : job.status === 'draft'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                      {job.title}
                    </h3>

                    <p className="text-xs text-slate-600 line-clamp-2">
                      {job.description}
                    </p>

                    <div className="text-xs text-slate-500 space-y-1 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{job.location}</span>
                      </div>
                      <div className="flex items-center gap-1.5 font-medium text-slate-700">
                        <span>{job.salaryCurrency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-xs font-bold text-slate-700">
                      <span>{jobApps.length} Applicants</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleDuplicateJob(job)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                        title="Duplicate Job"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          setEditingJob(job);
                          setIsJobModalOpen(true);
                        }}
                        className="p-1.5 text-blue-600 hover:text-blue-800 rounded-lg hover:bg-blue-50"
                        title="Edit Job"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteJob(job.id)}
                        className="p-1.5 text-rose-500 hover:text-rose-700 rounded-lg hover:bg-rose-50"
                        title="Delete Job"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Candidate Pipeline Analytics */}
      {activeTab === 'analytics' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          
          {/* High-level KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Active Worldwide Roles</div>
              <div className="text-3xl font-black text-slate-900 mt-1">
                {analytics?.activeJobs ?? jobs.filter(j => j.status === 'active').length}
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Across 4 continents</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Total Applications</div>
              <div className="text-3xl font-black text-blue-600 mt-1">
                {analytics?.totalApplications ?? applications.length}
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">In centralized pipeline</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Offer Acceptance Rate</div>
              <div className="text-3xl font-black text-indigo-600 mt-1">87.5%</div>
              <div className="text-[11px] text-emerald-600 font-medium mt-1">Above tech benchmark</div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="text-xs font-semibold text-slate-500">Avg Time to Hire</div>
              <div className="text-3xl font-black text-teal-600 mt-1">14.5 days</div>
              <div className="text-[11px] text-slate-500 font-medium mt-1">Fast-track async screens</div>
            </div>
          </div>

          {/* Pipeline Conversion Funnel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
              Candidate Pipeline Conversion Funnel
            </h3>
            
            <div className="space-y-3 pt-2">
              {PIPELINE_COLUMNS.map(col => {
                const count = applications.filter(a => a.stage === col.id).length;
                const pct = applications.length > 0 ? Math.round((count / applications.length) * 100) : 0;
                return (
                  <div key={col.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{col.title}</span>
                      <span className="font-mono text-slate-500">{count} candidates ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(pct, 5)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Regional & Department Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Applications by Region
              </h3>
              <div className="space-y-3">
                {['Worldwide Remote', 'Americas', 'EMEA', 'APAC'].map(reg => {
                  const regApps = applications.filter(a => {
                    const job = jobs.find(j => j.id === a.jobId);
                    return job?.region === reg || a.location.toLowerCase().includes(reg.toLowerCase());
                  });
                  return (
                    <div key={reg} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">{reg}</span>
                      <span className="font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {regApps.length} applications
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">
                Department Distribution
              </h3>
              <div className="space-y-3">
                {Array.from(new Set(jobs.map(j => j.department))).map(dept => {
                  const deptJobs = jobs.filter(j => j.department === dept);
                  const deptApps = applications.filter(a => deptJobs.some(j => j.id === a.jobId));
                  return (
                    <div key={dept} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                      <span className="font-semibold text-slate-800">{dept}</span>
                      <span className="font-mono px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200">
                        {deptApps.length} candidates ({deptJobs.length} roles)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Tab 4: Automated Notifications Center & Outbox */}
      {activeTab === 'notifications' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Automated Status Notification System</h2>
              <p className="text-xs text-slate-500">
                Every candidate status transition triggers an automated email notification dispatched to their inbox.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              Active Outbox: {notifications.length} Emails
            </span>
          </div>

          {/* Template Customizer Drawer */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Configure Email Templates by Pipeline Stage
            </h3>

            {/* Stage Selector */}
            <div className="flex flex-wrap gap-2">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => {
                    setSelectedTemplateStage(tpl.stage);
                    setTemplateSubject(tpl.subject);
                    setTemplateBody(tpl.body);
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selectedTemplateStage === tpl.stage
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tpl.name} ({tpl.stage})
                </button>
              ))}
            </div>

            {templateSavedMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl">
                {templateSavedMsg}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Subject Line (Supports `{'{{candidate_name}}'}`, `{'{{job_title}}'}`, `{'{{company}}'}`)
                </label>
                <input
                  type="text"
                  value={templateSubject || activeTemplate?.subject || ''}
                  onChange={e => setTemplateSubject(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Body Content
                </label>
                <textarea
                  rows={5}
                  value={templateBody || activeTemplate?.body || ''}
                  onChange={e => setTemplateBody(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-mono leading-relaxed"
                />
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSaveTemplate}
                  disabled={templateSaving}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                >
                  {templateSaving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </div>
          </div>

          {/* Dispatched Notification History / Outbox */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-3 p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Dispatched Outbox Log ({notifications.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3">Recipient</th>
                    <th className="p-3">Job Role</th>
                    <th className="p-3">Stage Trigger</th>
                    <th className="p-3">Subject Line</th>
                    <th className="p-3">Dispatched At</th>
                    <th className="p-3">Delivery</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {notifications.map(notif => (
                    <tr key={notif.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 font-semibold text-slate-900">
                        {notif.candidateName}
                        <div className="text-[10px] text-slate-400 font-mono">{notif.recipientEmail}</div>
                      </td>
                      <td className="p-3 text-slate-600">{notif.jobTitle}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                          {notif.stage}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 font-medium truncate max-w-xs">{notif.subject}</td>
                      <td className="p-3 text-slate-400 font-mono text-[11px]">
                        {new Date(notif.sentAt).toLocaleString()}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>DELIVERED</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Tab 5: Neon Database & Global Persistence Inspector */}
      {activeTab === 'neon' && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Neon Database Architecture</h2>
                  <p className="text-xs text-slate-500">Persistent worldwide database with serverless PostgreSQL</p>
                </div>
              </div>

              <button
                onClick={handleTestNeon}
                disabled={neonPingLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${neonPingLoading ? 'animate-spin' : ''}`} />
                <span>Test DB Health</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Linked Neon Project</span>
                <div className="font-mono font-bold text-slate-900 text-sm">patient-pine-60793247</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Active Branch</span>
                <div className="font-mono font-bold text-emerald-700 text-sm">production</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Config File (neon.ts)</span>
                <div className="font-mono font-semibold text-slate-800 text-xs">defineConfig({`{ auth: true }`})</div>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <span className="text-slate-500 font-medium">Resilience Mode</span>
                <div className="font-semibold text-slate-800 text-xs">Worldwide Persistent Layer Active</div>
              </div>
            </div>

            {neonPingResult && (
              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs space-y-2">
                <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>DB Status Verified</span>
                </div>
                <div className="text-slate-700">
                  {neonPingResult.message}
                </div>
                <div className="text-[11px] text-slate-500 font-mono">
                  Checked at: {neonPingResult.lastChecked}
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Want to reset demo jobs & candidate pipeline back to factory defaults?
              </span>
              <button
                onClick={handleResetData}
                className="px-3.5 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl border border-rose-200 transition-colors"
              >
                Reset Demo Dataset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Profile Modal */}
      <CandidateModal
        application={selectedCandidate}
        isOpen={isCandidateModalOpen}
        onClose={() => {
          setIsCandidateModalOpen(false);
          setSelectedCandidate(null);
        }}
        onUpdate={() => {
          onRefresh();
          // Keep selected candidate updated in place
          if (selectedCandidate) {
            const updated = applications.find(a => a.id === selectedCandidate.id);
            if (updated) setSelectedCandidate(updated);
          }
        }}
      />

      {/* Job Create/Edit Modal */}
      <JobModal
        isOpen={isJobModalOpen}
        initialJob={editingJob}
        onClose={() => {
          setIsJobModalOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
      />

    </div>
  );
};
