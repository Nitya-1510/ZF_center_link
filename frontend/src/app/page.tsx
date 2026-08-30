import { Navbar } from '@/components/Navbar';
import { HeroHud } from '@/components/HeroHud';
import { MetricsBar } from '@/components/MetricsBar';
import { ProjectGrid } from '@/components/ProjectGrid';
import { Transmission } from '@/components/Transmission';

export default function Home() {
  return (
    <main className="min-h-screen bg-[#07090e] text-slate-100 flex items-center justify-center p-3 md:p-6 lg:p-10 font-sans">
      <div className="w-full max-w-7xl rounded-2xl md:rounded-3xl border border-slate-800 bg-[#0b0f17] shadow-[0_0_50px_rgba(0,0,0,0.9)] overflow-hidden">
        <Navbar />
        <HeroHud />
        <MetricsBar />
        <ProjectGrid />
        <Transmission />
      </div>
    </main>
  );
}