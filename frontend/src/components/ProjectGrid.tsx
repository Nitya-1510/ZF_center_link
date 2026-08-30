'use client';
import React, { useEffect, useState } from 'react';

interface Project {
  project_code: string;
  title: string;
  lead: string;
  description: string;
  tech_tags: string;
}

export const ProjectGrid = () => {
  const [projects, setProjects] = useState<Project[]>([
    {
      project_code: '01: PROJ-001',
      title: 'BMS Real-Time Thermal Estimator',
      lead: 'Dr. Elena Rostova',
      description: 'High-frequency state-of-charge edge estimation pipeline executing over ISO 26262 ASIL-D compliant CAN nodes.',
      tech_tags: 'PyTorch,C++,CANopen,RTLAB',
    },
    {
      project_code: '02: PROJ-002',
      title: 'Drive-by-Wire Steering Gateway',
      lead: 'Marcus Vance',
      description: 'Sub-millisecond fail-operational steer-by-wire controller with physical layer fault injection telemetry.',
      tech_tags: 'Simulink,AUTOSAR,FPGA,Rust',
    },
  ]);

  useEffect(() => {
    fetch('http://localhost:8000/api/v1/projects')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.length > 0) setProjects(data);
      })
      .catch(() => {});
  }, []);

  return (
    <section id="projects" className="p-8 lg:p-12 border-b border-slate-800 bg-[#07090e]">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <p className="font-mono text-xs text-cyan-400 tracking-widest uppercase">// Innovations Portfolio</p>
          <h2 className="text-2xl font-bold uppercase tracking-wide text-white">Active Research & Deployments</h2>
        </div>
        <div className="font-mono text-xs text-slate-500">CAN_FILTER: ENABLED [0x7DF]</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj, idx) => (
          <div
            key={idx}
            className="group relative rounded-xl border border-slate-800 bg-[#0e131b] p-6 hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(0,210,255,0.15)] transition-all duration-300"
          >
            <div className="flex items-center justify-between font-mono text-xs mb-3">
              <span className="text-cyan-400 font-bold">{proj.project_code}</span>
              <span className="text-slate-500">LEAD: {proj.lead}</span>
            </div>

            <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition">
              {proj.title}
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              {proj.description}
            </p>

            <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800/80">
              {proj.tech_tags.split(',').map((tag, tIdx) => (
                <span
                  key={tIdx}
                  className="rounded-md bg-cyan-950/40 border border-cyan-500/20 px-2 py-0.5 font-mono text-[10px] text-cyan-300"
                >
                  {tag.trim()}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};