import React, { useState, useEffect } from 'react';
import { X, Globe, DollarSign, Building2, Briefcase, Award } from 'lucide-react';
import { JobPost, JobRegion, JobType, JobStatus } from '../types';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (jobData: Partial<JobPost>) => Promise<void>;
  initialJob?: JobPost | null;
}

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialJob
}) => {
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Worldwide Remote (Any Timezone)');
  const [region, setRegion] = useState<JobRegion>('Worldwide Remote');
  const [type, setType] = useState<JobType>('full-time');
  const [experienceLevel, setExperienceLevel] = useState<'Entry' | 'Mid-Level' | 'Senior' | 'Lead' | 'Executive'>('Senior');
  const [salaryMin, setSalaryMin] = useState(130000);
  const [salaryMax, setSalaryMax] = useState(170000);
  const [salaryCurrency, setSalaryCurrency] = useState('USD');
  const [status, setStatus] = useState<JobStatus>('active');
  const [featured, setFeatured] = useState(false);
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');
  const [benefitsText, setBenefitsText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialJob) {
      setTitle(initialJob.title);
      setDepartment(initialJob.department);
      setLocation(initialJob.location);
      setRegion(initialJob.region);
      setType(initialJob.type);
      setExperienceLevel(initialJob.experienceLevel);
      setSalaryMin(initialJob.salaryMin);
      setSalaryMax(initialJob.salaryMax);
      setSalaryCurrency(initialJob.salaryCurrency);
      setStatus(initialJob.status);
      setFeatured(Boolean(initialJob.featured));
      setDescription(initialJob.description);
      setResponsibilitiesText(initialJob.responsibilities.join('\n'));
      setRequirementsText(initialJob.requirements.join('\n'));
      setBenefitsText(initialJob.benefits.join('\n'));
    } else {
      setTitle('');
      setDepartment('Engineering');
      setLocation('Worldwide Remote (Any Timezone)');
      setRegion('Worldwide Remote');
      setType('full-time');
      setExperienceLevel('Senior');
      setSalaryMin(130000);
      setSalaryMax(170000);
      setSalaryCurrency('USD');
      setStatus('active');
      setFeatured(false);
      setDescription('');
      setResponsibilitiesText('Design, test, and ship high-reliability software for global users.\nCollaborate across worldwide timezones asynchronously.\nParticipate in code reviews and architecture discussions.');
      setRequirementsText('3+ years of relevant industry experience.\nProficiency with modern web or backend engineering stacks.\nExcellent asynchronous communication skills.');
      setBenefitsText('100% remote flexibility with home office stipend\nCompetitive global compensation and equity\nUnlimited PTO and international health coverage');
    }
    setError('');
  }, [initialJob, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Job title is required');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const responsibilities = responsibilitiesText.split('\n').map(s => s.trim()).filter(Boolean);
      const requirements = requirementsText.split('\n').map(s => s.trim()).filter(Boolean);
      const benefits = benefitsText.split('\n').map(s => s.trim()).filter(Boolean);

      await onSave({
        title: title.trim(),
        department,
        location: location.trim(),
        region,
        type,
        experienceLevel,
        salaryMin: Number(salaryMin),
        salaryMax: Number(salaryMax),
        salaryCurrency,
        status,
        featured,
        description: description.trim(),
        responsibilities,
        requirements,
        benefits
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save job post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full my-8 border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {initialJob ? 'Edit Worldwide Job Post' : 'Create Worldwide Job Post'}
              </h2>
              <p className="text-xs text-slate-500">
                Changes persist globally across all regions via Neon DB
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

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Distributed Systems Engineer"
                required
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <select
                value={department}
                onChange={e => setDepartment(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
                <option value="Operations">Operations</option>
                <option value="People & Talent">People & Talent</option>
                <option value="Security">Security</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Global Region
              </label>
              <select
                value={region}
                onChange={e => setRegion(e.target.value as JobRegion)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Worldwide Remote">Worldwide Remote (Anywhere)</option>
                <option value="Americas">Americas (AMER)</option>
                <option value="EMEA">Europe, Middle East, Africa (EMEA)</option>
                <option value="APAC">Asia-Pacific (APAC)</option>
                <option value="Hybrid">Hybrid Hubs</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location Label
              </label>
              <input
                type="text"
                value={location}
                onChange={e => setLocation(e.target.value)}
                placeholder="e.g. Worldwide Remote (UTC-8 to UTC+8)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Type
              </label>
              <select
                value={type}
                onChange={e => setType(e.target.value as JobType)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={e => setExperienceLevel(e.target.value as any)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Entry">Entry Level (0-2 yrs)</option>
                <option value="Mid-Level">Mid-Level (2-5 yrs)</option>
                <option value="Senior">Senior (5-8 yrs)</option>
                <option value="Lead">Lead / Staff (8+ yrs)</option>
                <option value="Executive">Executive / Director</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salary Range (Min - Max)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={salaryMin}
                  onChange={e => setSalaryMin(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  placeholder="Min"
                />
                <span className="text-slate-400">-</span>
                <input
                  type="number"
                  value={salaryMax}
                  onChange={e => setSalaryMax(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                  placeholder="Max"
                />
                <select
                  value={salaryCurrency}
                  onChange={e => setSalaryCurrency(e.target.value)}
                  className="px-2.5 py-2 text-xs font-semibold rounded-xl border border-slate-200 bg-slate-50"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status
              </label>
              <div className="flex items-center gap-3 pt-1">
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'active'}
                    onChange={() => setStatus('active')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <span>Active (Published)</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'draft'}
                    onChange={() => setStatus('draft')}
                    className="text-amber-600 focus:ring-amber-500"
                  />
                  <span>Draft</span>
                </label>
                <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                  <input
                    type="radio"
                    name="status"
                    checked={status === 'closed'}
                    onChange={() => setStatus('closed')}
                    className="text-slate-600 focus:ring-slate-500"
                  />
                  <span>Closed</span>
                </label>
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Role Summary / Description
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Give candidates an overview of what the role entails and the team mission..."
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Key Responsibilities (one per line)
              </label>
              <textarea
                rows={3}
                value={responsibilitiesText}
                onChange={e => setResponsibilitiesText(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Requirements & Qualifications (one per line)
              </label>
              <textarea
                rows={3}
                value={requirementsText}
                onChange={e => setRequirementsText(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-mono text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Benefits & Perks (one per line)
              </label>
              <textarea
                rows={3}
                value={benefitsText}
                onChange={e => setBenefitsText(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white font-mono text-xs"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={featured}
                onChange={e => setFeatured(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Feature at the top of Careers Page</span>
            </label>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
              >
                {saving ? 'Saving...' : initialJob ? 'Update Job' : 'Publish Worldwide'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
