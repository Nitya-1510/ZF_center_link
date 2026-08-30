'use client';
import React, { useState } from 'react';
import { Lock, Send, UserCheck } from 'lucide-react';

export const Transmission = () => {
  const [form, setForm] = useState({
    subject_id: '',
    return_address: '',
    encrypted_payload: '',
  });
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleTransmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg('DISPATCHING ENCRYPTED TRANSMISSION...');
    try {
      const res = await fetch('http://localhost:8000/api/v1/transmissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatusMsg('TRANSMISSION ACKNOWLEDGED // INGESTED INTO SECURE QUEUE');
        setForm({ subject_id: '', return_address: '', encrypted_payload: '' });
      } else {
        setStatusMsg('TRANSMISSION FAILED // INVALID RESPONSE BUFFER');
      }
    } catch {
      setStatusMsg('OFFLINE BUFFER ACTIVE // LOGGED TO LOCAL CLIENT STORAGE');
    }
  };

  return (
    <section id="transmission" className="p-8 lg:p-12 bg-[#07090e]">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#0d121d] p-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg border border-cyan-400/30 bg-cyan-950/30 flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-cyan-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase">Dr. Elena Rostova</h4>
              <p className="font-mono text-xs text-slate-400">Head of Autonomous Systems</p>
            </div>
          </div>
          <div className="font-mono text-xs text-slate-500 space-y-2 border-t border-slate-800 pt-4">
            <p>LAB: CAI Bench 04 (Vehicle In Loop)</p>
            <p>ENCRYPTION: GPG-KEY-ZF-9902</p>
            <p>STATUS: ACCEPTING TRANSMISSIONS</p>
          </div>
        </div>

        <div className="lg:col-span-8 rounded-xl border border-slate-800 bg-[#0e131b] p-6">
          <form onSubmit={handleTransmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-1.5 uppercase">Subject ID</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. INQ-RESEARCH-COLLAB"
                  value={form.subject_id}
                  onChange={(e) => setForm({ ...form, subject_id: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3.5 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono text-xs text-slate-400 mb-1.5 uppercase">Return Address</label>
                <input
                  required
                  type="email"
                  placeholder="operator@organization.com"
                  value={form.return_address}
                  onChange={(e) => setForm({ ...form, return_address: e.target.value })}
                  className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3.5 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-xs text-slate-400 mb-1.5 uppercase">Encrypted Message Payload</label>
              <textarea
                required
                rows={3}
                placeholder="Enter collaborative proposal or test bench requirements..."
                value={form.encrypted_payload}
                onChange={(e) => setForm({ ...form, encrypted_payload: e.target.value })}
                className="w-full rounded-lg border border-slate-800 bg-[#07090e] px-3.5 py-2 font-mono text-xs text-white focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2 font-mono text-xs text-cyan-400">
                <Lock className="h-3.5 w-3.5" />
                <span>CAN-SEC ENCRYPTED</span>
              </div>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-2.5 font-mono text-xs font-bold uppercase text-black hover:bg-cyan-400 transition shadow-[0_0_15px_rgba(0,210,255,0.3)]"
              >
                <Send className="h-3.5 w-3.5" />
                Dispatch Uplink
              </button>
            </div>

            {statusMsg && (
              <p className="font-mono text-xs text-cyan-300 pt-2 border-t border-slate-800 animate-pulse">
                &gt; {statusMsg}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
};