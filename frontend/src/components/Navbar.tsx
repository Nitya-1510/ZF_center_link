'use client';
import React, { useState } from 'react';
import { Terminal, Radio, Menu, X, Shield } from 'lucide-react';
import Link from 'next/link';

export const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="relative z-50 flex items-center justify-between px-6 py-4 border-b border-cyan-500/20 bg-[#07090e]/95 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-cyan-400/40 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,210,255,0.25)]">
          <Terminal className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500 block">ZF Mobility Systems Hub</span>
          <h1 className="text-sm font-black tracking-wider text-slate-100 uppercase">Centre for Automotive Innovation</h1>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#0d121d] px-3 py-1.5 text-slate-300">
          <Radio className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="text-slate-500">CAN-BUS:</span>
          <span className="font-bold text-cyan-400">500 KBPS</span>
        </div>
        <div className="flex items-center gap-2 rounded-md border border-slate-800 bg-[#0d121d] px-3 py-1.5 text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span>ASIL-D READY</span>
        </div>
        <div className="flex items-center gap-1.5 rounded-md border border-cyan-500/20 bg-cyan-950/20 px-2.5 py-1 text-[11px] text-cyan-300">
          <span>PYTHON</span>
          <span className="text-cyan-600">•</span>
          <span>PYTORCH</span>
          <span className="text-cyan-600">•</span>
          <span>RTLAB</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/admin"
          className="hidden sm:flex items-center gap-2 rounded-lg border border-slate-800 bg-[#0d121d] px-3.5 py-1.5 text-xs font-mono text-slate-300 hover:border-cyan-500/40 hover:text-cyan-400 transition"
        >
          <Shield className="h-3.5 w-3.5" />
          CONSOLE
        </Link>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 rounded-lg border border-cyan-400/40 bg-cyan-950/30 px-3.5 py-1.5 font-mono text-xs text-cyan-300 hover:bg-cyan-500/20 transition"
        >
          {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          <span>{menuOpen ? 'CLOSE' : 'MENU +'}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 top-[65px] z-50 flex flex-col justify-between bg-[#07090e]/98 backdrop-blur-2xl p-8 md:p-12 border-t border-cyan-500/20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
            <div className="space-y-4">
              <p className="font-mono text-xs text-cyan-500 uppercase tracking-widest">// Fast Index</p>
              <ul className="space-y-4 font-mono text-2xl font-bold">
                {['01 HOME', '02 ABOUT', '03 PROJECTS', '04 CONTACT', '05 LOGIN'].map((item, idx) => (
                  <li key={idx}>
                    <a
                      href={`#${item.split(' ')[1].toLowerCase()}`}
                      onClick={() => setMenuOpen(false)}
                      className="block text-slate-300 hover:text-cyan-400 hover:translate-x-3 transition"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-slate-800 bg-[#0d121d]/80 p-6 font-mono text-xs text-slate-400 space-y-4">
              <p className="text-cyan-400 font-bold uppercase tracking-wider">// Lab Operational Status</p>
              <p>Target Unit: #CAI-TESTBED-MICH-01</p>
              <p>HIL Latency: 1.1ms (Real-Time Control Loop)</p>
              <p>Encryption Layer: AES-GCM-256 + CAN-Sec Protocol</p>
            </div>
          </div>
          <div className="text-center font-mono text-xs text-slate-600">
            ZF AUTOMOTIVE INNOVATION PORTAL © 2026 // ALL TELEMETRY CHANNELS SYNCHRONIZED
          </div>
        </div>
      )}
    </header>
  );
};