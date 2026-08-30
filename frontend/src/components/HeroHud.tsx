'use client';
import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';

export const HeroHud = () => {
  const [speed, setSpeed] = useState(128);
  const [rpm, setRpm] = useState(4200);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpeed((prev) => (prev > 165 ? 115 : prev + Math.floor(Math.random() * 5) - 2));
      setRpm((prev) => (prev > 5400 ? 3900 : prev + Math.floor(Math.random() * 120) - 50));
    }, 400);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden p-8 lg:p-12 border-b border-slate-800 bg-[#07090e]">
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-950/30 px-3.5 py-1 text-xs font-mono text-cyan-300">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            TELEMETRY ACTIVE // ISO 26262
          </div>

          <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase leading-tight">
            Autonomous & <br />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-200 to-blue-500 bg-clip-text text-transparent">
              E-Mobility Testbed
            </span>
          </h1>

          <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-xl">
            Advancing zero-emission, fail-operational automotive architectures through hardware-in-the-loop
            CAN simulation and deep edge telemetry models.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-4">
            <a
              href="#projects"
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-black shadow-[0_0_25px_rgba(0,210,255,0.4)] hover:bg-cyan-400 transition"
            >
              Explore Projects
              <ChevronRight className="h-4 w-4" />
            </a>
            <a
              href="#transmission"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-[#0e131b] px-6 py-3.5 font-mono text-xs font-bold uppercase tracking-wider text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition"
            >
              Learn More
            </a>
          </div>
        </div>

        <div className="lg:col-span-5 flex justify-center">
          <div className="relative flex h-80 w-80 items-center justify-center rounded-full border border-cyan-500/20 bg-[#0d121d]/80 p-4 shadow-[0_0_50px_rgba(0,210,255,0.08)]">
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-cyan-500/20 animate-[spin_20s_linear_infinite]" />
            <div className="absolute inset-8 rounded-full border border-slate-800" />

            {[...Array(28)].map((_, i) => (
              <div
                key={i}
                className="absolute h-full w-0.5 bg-transparent"
                style={{ transform: `rotate(${i * (360 / 28)}deg)` }}
              >
                <div className={`h-2.5 w-0.5 ${i < 18 ? 'bg-cyan-400/80 shadow-[0_0_6px_#00d2ff]' : 'bg-slate-700'}`} />
              </div>
            ))}

            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <svg className="h-14 w-14 text-cyan-400 mb-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M7 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M17 17m-2 0a2 2 0 1 0 4 0a2 2 0 1 0 -4 0" />
                <path d="M5 17h-2v-6l2 -5h9l4 5h1a2 2 0 0 1 2 2v4h-2m-4 0h-6" />
                <path d="M9 5l0 6" />
                <path d="M14 5l1 6" />
              </svg>

              <div className="font-mono">
                <span className="text-3xl font-black tracking-tight text-white">{speed}</span>
                <span className="ml-1 text-xs text-cyan-400 font-bold">KM/H</span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-[11px] font-mono text-slate-400">
                <span>{rpm} RPM</span>
                <span>•</span>
                <span className="text-emerald-400 font-bold">L4 ENGAGED</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};