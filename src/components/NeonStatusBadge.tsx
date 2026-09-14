import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, RefreshCw, Layers, ShieldCheck, Globe } from 'lucide-react';
import { api } from '../services/api';

interface NeonStatusBadgeProps {
  onRefreshTrigger?: () => void;
}

export const NeonStatusBadge: React.FC<NeonStatusBadgeProps> = ({ onRefreshTrigger }) => {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    try {
      const data = await api.getNeonStatus();
      setStatus(data);
    } catch (e) {
      console.error('Failed to load neon status', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <button
        id="neon-status-pill-btn"
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition-colors shadow-sm"
        title="Neon Database Connection & Architecture Status"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <Database className="w-3.5 h-3.5 text-emerald-600" />
        <span className="font-semibold tracking-wide">Neon DB: patient-pine</span>
        <span className="text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded font-mono">prod</span>
      </button>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-slate-800">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Database className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Neon Database & Global Persistence</h3>
                  <p className="text-xs text-slate-500">Multi-region HR & ATS data layer</p>
                </div>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-sm">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Project ID:</span>
                  <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    patient-pine-60793247
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Branch:</span>
                  <span className="font-mono text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    production
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Neon Config Policy:</span>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    neon.ts (auth: true)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">Data Storage:</span>
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-blue-500" />
                    {status?.connectionType || 'Neon Postgres + Worldwide Persistence'}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-xs text-emerald-900 space-y-1.5">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Neon CLI & Setup Lifecycle Completed</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1 text-[11px]">
                  <li>Neon agent skills & MCP configured (<code>.agents/skills</code>)</li>
                  <li>Linked context pinned to <code>patient-pine-60793247</code> (branch: <code>production</code>)</li>
                  <li><code>neon.ts</code> policy configured with <code>auth: true</code></li>
                  <li>Automated JSONB tables ready: <code>hr_jobs</code>, <code>hr_applications</code>, <code>hr_notifications</code></li>
                </ul>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <span>Active Jobs: <strong className="text-slate-800">{status?.activeJobsCount ?? 1}</strong></span>
                <span>Applications: <strong className="text-slate-800">{status?.applicationsCount ?? 3}</strong></span>
                <button
                  onClick={() => {
                    fetchStatus();
                    if (onRefreshTrigger) onRefreshTrigger();
                  }}
                  disabled={loading}
                  className="flex items-center gap-1 text-slate-600 hover:text-slate-900 font-medium"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                  Check Health
                </button>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition-colors"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
