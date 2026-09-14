import React, { useState } from 'react';
import { 
  Briefcase, Globe, MapPin, DollarSign, Search, Filter, 
  ArrowRight, CheckCircle2, FileText, Upload, Sparkles, 
  ExternalLink, Clock, Building2, ShieldCheck, Mail, ChevronRight, X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { JobPost, Application, AutomatedNotification } from '../types';
import { api } from '../services/api';

interface CareerPortalProps {
  jobs: JobPost[];
  onApplicationSubmitted: () => void;
  onOpenAts: () => void;
}

export const CareerPortal: React.FC<CareerPortalProps> = ({
  jobs,
  onApplicationSubmitted,
  onOpenAts
}) => {
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  // Application form states
  const [candidateName, setCandidateName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [currentRole, setCurrentRole] = useState('');
  const [experienceYears, setExperienceYears] = useState(5);
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [coverNote, setCoverNote] = useState('');
  const [resumeFileName, setResumeFileName] = useState('My_Professional_Resume.pdf');
  const [submitting, setSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<{
    application: Application;
    notification: AutomatedNotification;
  } | null>(null);
  const [formError, setFormError] = useState('');

  // Filtering active jobs
  const activeJobs = jobs.filter(j => j.status === 'active');
  const filteredJobs = activeJobs.filter(job => {
    const matchesDept = selectedDepartment === 'All' || job.department === selectedDepartment;
    const matchesRegion = selectedRegion === 'All' || job.region === selectedRegion;
    const matchesSearch = !searchQuery.trim() || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesDept && matchesRegion && matchesSearch;
  });

  const departments = ['All', ...Array.from(new Set(activeJobs.map(j => j.department)))];
  const regions = ['All', 'Worldwide Remote', 'Americas', 'EMEA', 'APAC', 'Hybrid'];

  const handleApplyClick = (job: JobPost) => {
    setSelectedJob(job);
    setIsApplyModalOpen(true);
    setSubmissionSuccess(null);
    setFormError('');
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setResumeFileName(e.dataTransfer.files[0].name);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setResumeFileName(e.target.files[0].name);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob) return;
    if (!candidateName.trim() || !email.trim()) {
      setFormError('Name and Email are required.');
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      const res = await api.submitApplication({
        jobId: selectedJob.id,
        jobTitle: selectedJob.title,
        candidateName: candidateName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim() || 'Worldwide Remote',
        currentRole: currentRole.trim(),
        experienceYears: Number(experienceYears),
        portfolioUrl: portfolioUrl.trim(),
        linkedInUrl: linkedInUrl.trim(),
        githubUrl: githubUrl.trim(),
        coverNote: coverNote.trim(),
        resumeFileName: resumeFileName || 'Candidate_Resume.pdf',
        resumeText: `Candidate Summary: ${candidateName} applied for ${selectedJob.title}. Location: ${location || 'Worldwide'}. Experience: ${experienceYears} yrs. Note: ${coverNote}`
      });

      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });

      setSubmissionSuccess({
        application: res.application,
        notification: res.notificationSent
      });
      onApplicationSubmitted();
    } catch (err: any) {
      setFormError(err.message || 'Failed to submit application');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      {/* Top Banner announcing worldwide remote culture & ATS sync */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 text-white py-2.5 px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider border border-blue-400/30">
              Worldwide Remote
            </span>
            <span className="text-slate-300">
              We hire everywhere on Earth. Asynchronous workflows, global compensation, and multi-region benefits.
            </span>
          </div>
          <button
            onClick={onOpenAts}
            className="flex items-center gap-1 text-blue-300 hover:text-white font-semibold transition-colors underline text-[11px]"
          >
            <span>Go to Centralized Recruiter ATS</span>
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Hero Header */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 py-16 sm:py-20 px-4">
        <div className="max-w-5xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span>Join our globally distributed team</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-900 font-display">
            Build the Future <span className="text-blue-600">Across Continents</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            We are engineering resilient global systems. Explore our worldwide openings or see how applications are tracked live across our decentralized ATS.
          </p>

          {/* Quick Metrics */}
          <div className="pt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left">
              <div className="text-2xl font-black text-slate-900">{activeJobs.length}</div>
              <div className="text-xs text-slate-500 font-medium">Worldwide Roles</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left">
              <div className="text-2xl font-black text-blue-600">100%</div>
              <div className="text-xs text-slate-500 font-medium">Remote Flexibility</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left">
              <div className="text-2xl font-black text-emerald-600">&lt; 48h</div>
              <div className="text-xs text-slate-500 font-medium">Application Review</div>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-left">
              <div className="text-2xl font-black text-indigo-600">Neon DB</div>
              <div className="text-xs text-slate-500 font-medium">Global Persistence</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content & Job Listings */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10">
        
        {/* Search and Filters Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            {/* Search Input */}
            <div className="relative sm:col-span-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search job title, skills, or country..."
                className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Department Filter */}
            <div>
              <select
                value={selectedDepartment}
                onChange={e => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-700"
              >
                {departments.map(d => (
                  <option key={d} value={d}>
                    Department: {d}
                  </option>
                ))}
              </select>
            </div>

            {/* Region Filter */}
            <div>
              <select
                value={selectedRegion}
                onChange={e => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-medium text-slate-700"
              >
                {regions.map(r => (
                  <option key={r} value={r}>
                    Region: {r}
                  </option>
                ))}
              </select>
            </div>

          </div>
        </div>

        {/* Job Cards Listing */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-600">
              Open Positions ({filteredJobs.length})
            </h2>
            <span className="text-xs text-slate-500">
              Showing worldwide published roles
            </span>
          </div>

          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
              <Briefcase className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-base font-bold text-slate-700">No matching positions found</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Try clearing your search filters or check back soon as new positions are added regularly across all worldwide regions.
              </p>
              <button
                onClick={() => {
                  setSelectedDepartment('All');
                  setSelectedRegion('All');
                  setSearchQuery('');
                }}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            filteredJobs.map(job => (
              <div
                key={job.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                      {job.department}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700">
                      {job.region}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                      {job.type}
                    </span>
                    {job.featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800">
                        Featured
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {job.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                      {job.description}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.location}</span>
                    </div>
                    {job.salaryMin > 0 && (
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                        <span>
                          {job.salaryCurrency} ${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} / yr
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.experienceLevel}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <button
                    onClick={() => {
                      setSelectedJob(job);
                      setIsApplyModalOpen(false);
                    }}
                    className="px-4 py-2.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => handleApplyClick(job)}
                    className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                  >
                    <span>Apply Now</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      {/* Detailed Job View Modal (When user clicks "View Details") */}
      {selectedJob && !isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedJob.department}</span>
                <h2 className="text-xl font-bold text-slate-900">{selectedJob.title}</h2>
                <p className="text-xs text-slate-500">{selectedJob.location} • {selectedJob.type}</p>
              </div>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
              <div>
                <h4 className="font-bold text-slate-900 text-sm mb-2">About The Role</h4>
                <p className="text-slate-600 leading-relaxed">{selectedJob.description}</p>
              </div>

              {selectedJob.responsibilities.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Key Responsibilities</h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {selectedJob.responsibilities.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.requirements.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Requirements & Experience</h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {selectedJob.requirements.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedJob.benefits.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 text-sm mb-2">Worldwide Benefits & Perks</h4>
                  <ul className="space-y-1.5 text-slate-600 list-disc list-inside">
                    {selectedJob.benefits.map((b, i) => (
                      <li key={i}>{b}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500 font-medium">Estimated Compensation</div>
                  <div className="text-base font-bold text-slate-900">
                    {selectedJob.salaryCurrency} ${selectedJob.salaryMin.toLocaleString()} - ${selectedJob.salaryMax.toLocaleString()} / yr + Equity
                  </div>
                </div>
                <button
                  onClick={() => setIsApplyModalOpen(true)}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Apply for this Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Application Submission Modal */}
      {isApplyModalOpen && selectedJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Apply for {selectedJob.title}
                </h3>
                <p className="text-xs text-slate-500">{selectedJob.location} • Global Talent Pool</p>
              </div>
              <button
                onClick={() => {
                  setIsApplyModalOpen(false);
                  setSubmissionSuccess(null);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {submissionSuccess ? (
              <div className="p-8 text-center space-y-5 overflow-y-auto">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Application Submitted Worldwide!</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Your profile has been saved to the centralized ATS database and routed to our recruitment leads.
                  </p>
                </div>

                {/* Automated Notification Simulation Receipt */}
                <div className="bg-blue-50/80 rounded-2xl p-5 border border-blue-200 text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-blue-600" />
                      <span className="text-xs font-bold text-blue-900">Automated Notification Dispatched</span>
                    </div>
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                      STATUS: DELIVERED
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 space-y-1 bg-white p-3 rounded-xl border border-blue-100">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-100 pb-1.5">
                      <span><strong>To:</strong> {submissionSuccess.application.email}</span>
                      <span>{new Date(submissionSuccess.notification.sentAt).toLocaleTimeString()}</span>
                    </div>
                    <div className="pt-1 font-semibold text-slate-900">
                      Subject: {submissionSuccess.notification.subject}
                    </div>
                    <div className="text-[11px] text-slate-600 whitespace-pre-line leading-relaxed pt-1">
                      {submissionSuccess.notification.body}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setIsApplyModalOpen(false);
                      setSubmissionSuccess(null);
                    }}
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Back to Careers Page
                  </button>
                  <button
                    onClick={() => {
                      setIsApplyModalOpen(false);
                      setSubmissionSuccess(null);
                      onOpenAts();
                    }}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    View in ATS Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitApplication} className="p-6 overflow-y-auto space-y-4 flex-1">
                {formError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={candidateName}
                      onChange={e => setCandidateName(e.target.value)}
                      placeholder="e.g. Liam Vance"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="liam.vance@example.com"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+1 (555) 012-3456"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Location / Timezone
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Toronto, Canada (EST)"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Current Role / Title
                    </label>
                    <input
                      type="text"
                      value={currentRole}
                      onChange={e => setCurrentRole(e.target.value)}
                      placeholder="e.g. Senior Backend Engineer"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Years of Relevant Experience
                    </label>
                    <input
                      type="number"
                      min={0}
                      max={40}
                      value={experienceYears}
                      onChange={e => setExperienceYears(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      LinkedIn URL
                    </label>
                    <input
                      type="url"
                      value={linkedInUrl}
                      onChange={e => setLinkedInUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Portfolio / GitHub URL
                    </label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={e => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>

                  {/* Resume Upload Dropzone */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Resume / CV Document *
                    </label>
                    <div
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleFileDrop}
                      className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-5 text-center bg-slate-50/60 transition-colors cursor-pointer"
                    >
                      <Upload className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                      <div className="text-xs font-bold text-slate-800">
                        Drag and drop your resume file here
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        PDF, DOCX, or RTF up to 10MB
                      </p>
                      <label className="inline-block mt-3 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-xs">
                        Browse Files
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </label>
                      {resumeFileName && (
                        <div className="mt-2 text-xs font-mono text-emerald-700 bg-emerald-50 py-1 px-3 rounded inline-block">
                          ✓ Selected: {resumeFileName}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cover Pitch */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cover Pitch / Elevator Note
                    </label>
                    <textarea
                      rows={3}
                      value={coverNote}
                      onChange={e => setCoverNote(e.target.value)}
                      placeholder="Tell us about a technical challenge you solved or why you are excited to join..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Automated confirmation email will be dispatched
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsApplyModalOpen(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
                    >
                      {submitting ? 'Submitting...' : 'Submit Application'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
