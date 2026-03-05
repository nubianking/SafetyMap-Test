
import React from 'react';
import { Radio } from 'lucide-react';

interface ReportButtonProps {
  onTrigger: () => void;
}

export const ReportButton: React.FC<ReportButtonProps> = ({ onTrigger }) => {
  return (
    <button 
      onClick={onTrigger}
      className="group relative flex items-center justify-center"
    >
      {/* Outer Glow Ring */}
      <div className="absolute inset-0 bg-red-600/20 rounded-full blur-xl group-active:bg-red-600/40 transition-all" />
      
      {/* Main Button */}
      <div className="relative w-24 h-24 bg-gradient-to-tr from-red-700 to-red-500 rounded-full border-4 border-slate-900 shadow-2xl flex flex-col items-center justify-center transition-transform active:scale-90">
        <Radio size={32} className="text-white mb-1" />
        <span className="text-[10px] font-black text-white uppercase tracking-widest">Report</span>
      </div>
    </button>
  );
};
