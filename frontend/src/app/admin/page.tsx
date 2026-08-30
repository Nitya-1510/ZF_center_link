'use client';
import React, { useState } from 'react';
import { Shield, Key, RefreshCw, PlusCircle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function AdminConsole() {
  const [token, setToken] = useState<string | null>(null);
  const [username, setUsername] = useState('zf_operator');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // New Project Form
  const [projectForm, setProjectForm] = useState({
    project_code: '',
    title: '',
    lead: '',
    description: '',
    tech_tags: '',
  });
  const [projStatus, setProjStatus] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    const body = new URLSearchParams();
    body.append('username', username);
    body.append('password', password);

    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: body.toString(),
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
      } else {
        setAuthError('Authentication failed: Invalid operator key');
      }
    } catch {
      setAuthError('Unable to connect to backend server at port 8000');
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setProjStatus('Ingesting project into DB...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/admin/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(projectForm),
      });
      if (res.ok) {
        setProjStatus('Project registered successfully.');
        setProjectForm({ project_code: '', title: '', lead: '', description: '', tech_tags: '' });
      } else {
        setProjStatus('Error: Project code duplicate or schema error.');
      }
    } catch {
      setProjStatus('Error: Server connection unreachable.');
    }
  };

  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-4 lg:p-10 font-sans">
      <div className="w-full max-w-4xl rounded-2xl border border-slate-800 bg-[#0b0f17] p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">

        <div className="flex items-center justify-between pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <Shield className="h-6 w-6 text-cyan-400" />
            <h1 className="text-xl font-bold uppercase tracking-wider text-white">Operator Console</h1>
          </div>
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-md border border-slate-800 bg-[#0e131b] px-3 py-1.5 font-mono text-xs text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            RETURN TO HUD
          </Link>
        </div>

        {!token ? (
          <form onSubmit={handleLogin} className="max-w-md mx-auto my-10 space-y-4">
            <div className="text-center font-mono text-xs text-slate-500 mb-4">
              DEFAULT OPERATOR: zf_operator / telemetry@2026
            </div>
            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1.5 uppercase">Operator ID</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3.5 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1.5 uppercase">Passkey</label>
              <input
                type="password"
                placeholder="Enter password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3.5 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>
            {authError && (
              <p className="font-mono text-xs text-red-400">{authError}</p>
            )}
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 font-mono text-xs font-bold uppercase text-black hover:bg-cyan-400 transition"
            >
              <Key className="h-4 w-4" />
              AUTHENTICATE SESSION
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-8">
            <div className="flex items-center justify-between rounded-lg border border-emerald-500/20 bg-emerald-950/20 px-4 py-2 font-mono text-xs text-emerald-400">
              <span>ACTIVE SESSION: zf_operator</span>
              <span>BEARER AUTH VALIDATED</span>
            </div>

            <form onSubmit={handleCreateProject} className="rounded-xl border border-slate-800 bg-[#0e131b] p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase text-white flex items-center gap-2">
                <PlusCircle className="h-4 w-4 text-cyan-400" />
                Ingest New Research Project
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[11px] text-slate-400 mb-1 uppercase">Project Identifier</label>
                  <input
                    required
                    placeholder="03: PROJ-003"
                    value={projectForm.project_code}
                    onChange={(e) => setProjectForm({ ...projectForm, project_code: e.target.value })}
                    className="w-full rounded-md border border-slate-800 bg-[#07090e] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-mono text-[11px] text-slate-400 mb-1 uppercase">Project Lead</label>
                  <input
                    required
                    placeholder="e.g. Dr. Alex Mercer"
                    value={projectForm.lead}
                    onChange={(e) => setProjectForm({ ...projectForm, lead: e.target.value })}
                    className="w-full rounded-md border border-slate-800 bg-[#07090e] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1 uppercase">Title</label>
                <input
                  required
                  placeholder="e.g. FlexRay High-Speed Bus Aggregator"
                  value={projectForm.title}
                  onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                  className="w-full rounded-md border border-slate-800 bg-[#07090e] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1 uppercase">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Summary specifications..."
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  className="w-full rounded-md border border-slate-800 bg-[#07090e] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-mono text-[11px] text-slate-400 mb-1 uppercase">Tech Tags (Comma separated)</label>
                <input
                  required
                  placeholder="C++, ROS2, Simulink, CAN-FD"
                  value={projectForm.tech_tags}
                  onChange={(e) => setProjectForm({ ...projectForm, tech_tags: e.target.value })}
                  className="w-full rounded-md border border-slate-800 bg-[#07090e] px-3 py-1.5 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {projStatus && <span className="font-mono text-xs text-cyan-400">{projStatus}</span>}
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-500 px-4 py-2 font-mono text-xs font-bold uppercase text-black hover:bg-cyan-400 transition ml-auto"
                >
                  Save to Database
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </main>
  );
}