import React from 'react';
import { Cpu, Layers, GitFork, Activity } from 'lucide-react';

export const MetricsBar = () => {
  const metrics = [
    { label: 'PROJECTS', value: '50+', icon: Cpu, detail: 'CAN-FD & Edge Pipeline' },
    { label: 'PUBLICATIONS', value: '20+', icon: Layers, detail: 'IEEE / SAE Mobility Index' },
    { label: 'COLLABORATIONS', value: '15+', icon: GitFork, detail: 'Tier-1 & Academic Units' },
    { label: 'TEST BENCH STATUS', value: '24/7', icon: Activity, detail: 'Active Hardware-in-Loop' },
  ];

  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 border-b border-slate-800 bg-[#0b0f17]">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <div key={i} className="p-6 space-y-1">
            <div className="flex items-center justify-between text-slate-500">
              <span className="font-mono text-xs uppercase tracking-wider">{m.label}</span>
              <Icon className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-white font-mono">{m.value}</div>
            <p className="text-[11px] font-mono text-slate-400">{m.detail}</p>
          </div>
        );
      })}
    </section>
  );
};