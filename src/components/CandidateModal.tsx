import React, { useState } from 'react';
import { 
  X, Mail, Phone, MapPin, Globe, Briefcase, Calendar, 
  FileText, Send, Star, Tag, MessageSquare, CheckCircle, 
  AlertCircle, ChevronRight, ExternalLink
} from 'lucide-react';
import { Application, ApplicationStage, AutomatedNotification } from '../types';
import { api } from '../services/api';

interface CandidateModalProps {
  application: Application | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const STAGES_ORDER: { id: ApplicationStage; label: string }[] = [
  { id: 'applied', label: 'Applied' },
  { id: 'screening', label: 'Screening' },
  { id: 'technical', label: 'Tech Round' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
];

export const CandidateModal: React.FC<CandidateModalProps> = ({
  application,
  isOpen,
  onClose,
  onUpdate
}) => {
  if (!isOpen || !application) return null;

  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStage, setUpdatingStage] = useState(false);
  const [lastDispatchedNotification, setLastDispatchedNotification] = useState<AutomatedNotification | null>(null);
  const [notificationMsg, setNotificationMsg] = useState('');
  const [recruiterName, setRecruiterName] = useState('Senior Talent Partner');

  const handleStageChange = async (newStage: ApplicationStage) => {
    if (newStage === application.stage) return;
    setUpdatingStage(true);
    setNotificationMsg('');
    try {
      const res = await api.updateApplicationStage(application.id, newStage, true);
      if (res.notificationSent) {
        setLastDispatchedNotification(res.notificationSent);
        setNotificationMsg(`Automated status email sent to ${application.email}`);
      }
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to update stage');
    } finally {
      setUpdatingStage(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      await api.addApplicationNote(application.id, recruiterName, newNote.trim());
      setNewNote('');
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleRatingChange = async (rating: number) => {
    try {
      await api.updateApplicationRating(application.id, rating);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to update rating');
    }
  };

  const handleManualNotificationDispatch = async () => {
    try {
      const notif = await api.sendManualNotification({
        applicationId: application.id,
        stage: application.stage
      });
      setLastDispatchedNotification(notif);
      setNotificationMsg(`Status notification resent to ${application.email}`);
      onUpdate();
    } catch (err: any) {
      alert(err.message || 'Failed to trigger notification');
    }
  };

  const currentStageIndex = STAGES_ORDER.findIndex(s => s.id === application.stage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {application.candidateName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">{application.candidateName}</h2>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => handleRatingChange(star)}
                      className="p-0.5 text-amber-400 hover:scale-110 transition-transform"
                      title={`Rate ${star} stars`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          (application.rating || 0) >= star
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1.5">
                <span>Applied for <strong className="text-slate-700">{application.jobTitle}</strong></span>
                <span>•</span>
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{new Date(application.appliedAt).toLocaleDateString()}</span>
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stage Progression Pipeline Bar */}
        <div className="px-6 py-3 bg-slate-50/80 border-b border-slate-200/80 overflow-x-auto">
          <div className="flex items-center gap-1 min-w-max">
            {STAGES_ORDER.map((stageItem, idx) => {
              const isCurrent = application.stage === stageItem.id;
              const isPast = currentStageIndex > idx;
              return (
                <button
                  key={stageItem.id}
                  disabled={updatingStage}
                  onClick={() => handleStageChange(stageItem.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isCurrent
                      ? 'bg-blue-600 text-white shadow-xs'
                      : isPast
                      ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                      : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{stageItem.label}</span>
                  {idx < STAGES_ORDER.length - 1 && (
                    <ChevronRight className="w-3 h-3 opacity-60 ml-0.5" />
                  )}
                </button>
              );
            })}

            <button
              disabled={updatingStage}
              onClick={() => handleStageChange('rejected')}
              className={`ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                application.stage === 'rejected'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-rose-600 border-rose-200 hover:bg-rose-50'
              }`}
            >
              Reject
            </button>
          </div>
        </div>

        {/* Status Notification Dispatched Toast */}
        {notificationMsg && (
          <div className="mx-6 mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800 animate-in fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{notificationMsg}</span>
            </div>
            <button
              onClick={() => setNotificationMsg('')}
              className="text-emerald-600 hover:text-emerald-900 text-xs font-bold"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6 flex-1">
          
          {/* Column 1 & 2: Candidate Details, Resume, Pitch */}
          <div className="md:col-span-2 space-y-5">
            {/* Contact & Meta Card */}
            <div className="bg-slate-50/70 rounded-xl p-4 border border-slate-200/80 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact & Global Location</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-slate-700">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${application.email}`} className="hover:text-blue-600 truncate">
                    {application.email}
                  </a>
                </div>
                {application.phone && (
                  <div className="flex items-center gap-2 text-slate-700">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{application.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-slate-700">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{application.location}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-700">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{application.experienceYears} years experience</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3 text-xs">
                {application.portfolioUrl && (
                  <a
                    href={application.portfolioUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <Globe className="w-3 h-3" />
                    <span>Portfolio</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
                {application.linkedInUrl && (
                  <a
                    href={application.linkedInUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>LinkedIn</span>
                  </a>
                )}
                {application.githubUrl && (
                  <a
                    href={application.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                    <span>GitHub</span>
                  </a>
                )}
              </div>
            </div>

            {/* Candidate Cover Pitch */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">Applicant Cover Pitch</h3>
              <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                {application.coverNote || 'No cover pitch submitted.'}
              </p>
            </div>

            {/* Resume / CV Section */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Resume & CV Document</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                  {application.resumeFileName || 'resume.pdf'}
                </span>
              </div>
              
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/80 text-xs text-slate-600 font-mono leading-relaxed max-h-40 overflow-y-auto">
                {application.resumeText || 'Summary: Candidate profile uploaded via Worldwide Careers application form.'}
              </div>
            </div>

            {/* Automated Notification Trigger Action Card */}
            <div className="bg-blue-50/50 rounded-xl p-4 border border-blue-100 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900">Automated Status Notification System</span>
                <span className="text-[10px] uppercase font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                  Stage: {application.stage}
                </span>
              </div>
              <p className="text-[11px] text-blue-700">
                Whenever candidate stages change, an automated notification email is prepared according to the pre-configured worldwide ATS template.
              </p>
              <div className="pt-2 flex items-center justify-between">
                <button
                  onClick={handleManualNotificationDispatch}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Resend / Dispatch Stage Email</span>
                </button>
              </div>
            </div>
          </div>

          {/* Column 3: Recruiter Notes & Tags */}
          <div className="space-y-4">
            {/* Tags */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                <span>Skills & Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {application.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Recruiter Notes Thread */}
            <div className="bg-white rounded-xl p-4 border border-slate-200 flex flex-col h-[320px]">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
                  <span>Internal Recruiter Notes ({application.notes.length})</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 text-xs">
                {application.notes.length === 0 ? (
                  <p className="text-slate-400 text-center py-6 text-[11px]">
                    No internal notes yet. Add thoughts after screening.
                  </p>
                ) : (
                  application.notes.map((note) => (
                    <div key={note.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                      <div className="flex items-center justify-between text-[10px] text-slate-400">
                        <strong className="text-slate-700 font-semibold">{note.author}</strong>
                        <span>{new Date(note.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-snug">{note.text}</p>
                    </div>
                  ))
                )}
              </div>

              <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-100 space-y-2">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
                  placeholder="Add interview feedback or scorecard note..."
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                />
                <button
                  type="submit"
                  disabled={addingNote || !newNote.trim()}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white rounded-lg text-xs font-semibold transition-colors"
                >
                  {addingNote ? 'Adding...' : 'Post Recruiter Note'}
                </button>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
