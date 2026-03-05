
import React from 'react';
import { useSentryRewards } from '../../hooks/useSentryRewards';
import { SentryTelemetry } from '../../types/rewards';

interface OracleDashboardProps {
  telemetry: SentryTelemetry;
}

export const OracleDashboard: React.FC<OracleDashboardProps> = ({ telemetry }) => {
  const { sessionTotal, currentRate, isSyncing } = useSentryRewards(telemetry);

  return (
    <div className="w-full flex justify-between items-start pointer-events-none z-50">
      {/* Node Status */}
      <div className="bg-slate-900/90 border border-blue-500/30 p-4 rounded-2xl backdrop-blur-md pointer-events-auto shadow-2xl">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Sentry Active</span>
        </div>
        <p className="text-3xl font-black text-white tracking-tighter italic">
          {sessionTotal.toFixed(2)} <span className="text-xs text-slate-400 not-italic uppercase font-bold">RGT</span>
        </p>
      </div>

      {/* AI Pulse Meter */}
      <div className="flex flex-col items-end gap-3">
        <div className="bg-slate-900/90 p-3 rounded-2xl border border-white/10 backdrop-blur-md pointer-events-auto text-right shadow-2xl">
          <p className="text-[9px] uppercase text-slate-500 font-black tracking-widest">Grid Integrity</p>
          <div className="flex gap-1.5 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 w-5 rounded-full transition-all duration-500 ${
                  i <= Math.ceil(telemetry.geminiQualityScore * 5) ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'bg-slate-700'
                }`} 
              />
            ))}
          </div>
        </div>
        {isSyncing && (
          <div className="flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-4 py-1.5 rounded-full backdrop-blur-md">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse" />
            <p className="text-[9px] text-blue-400 font-black uppercase tracking-widest italic">Syncing with Gemini...</p>
          </div>
        )}
      </div>
    </div>
  );
};
