
import React, { useState } from 'react';
import { ICONS, MOCK_INCIDENTS } from '../constants';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [activeTab, setActiveTab] = useState<'FEED' | 'ANALYTICS'>('FEED');

  return (
    <aside className={`absolute md:relative z-40 h-full bg-[#0a0a0a] border-r border-zinc-800 transition-all duration-300 flex flex-col ${isOpen ? 'w-80' : 'w-0 overflow-hidden'}`}>
      <div className="flex border-b border-zinc-800">
        <button 
          onClick={() => setActiveTab('FEED')}
          className={`flex-1 py-4 text-[10px] font-bold tracking-widest transition-colors ${activeTab === 'FEED' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          LIVE FEED ({MOCK_INCIDENTS.length})
        </button>
        <button 
          onClick={() => setActiveTab('ANALYTICS')}
          className={`flex-1 py-4 text-[10px] font-bold tracking-widest transition-colors ${activeTab === 'ANALYTICS' ? 'text-white border-b-2 border-blue-500' : 'text-zinc-500 hover:text-zinc-300'}`}
        >
          ANALYTICS
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeTab === 'FEED' ? (
          MOCK_INCIDENTS.map((incident) => (
            <div key={incident.id} className="group relative bg-[#111111] border border-zinc-800 p-4 rounded hover:border-zinc-600 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-tighter">
                  {incident.timestamp}
                </span>
                <span className="bg-zinc-800 text-[9px] font-black px-1.5 py-0.5 rounded text-white tracking-widest uppercase">
                  ALERT
                </span>
              </div>
              <h3 className="text-sm font-bold mb-1 leading-tight group-hover:text-white transition-colors">
                {incident.title}
              </h3>
              <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
                {incident.description}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${incident.severity === 'high' ? 'bg-orange-600' : incident.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`}></span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">
                    {incident.type.replace('_', ' ')}
                  </span>
                </div>
                {incident.hasFootage && (
                  <button className="flex items-center gap-1 text-blue-500 hover:text-blue-400 text-[10px] font-bold transition-colors">
                    <ICONS.Radio className="w-3 h-3" />
                    Footage
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="space-y-6">
            <div className="bg-[#111111] border border-zinc-800 p-4 rounded">
              <h4 className="text-[10px] font-black text-zinc-500 tracking-widest mb-4 uppercase">Weekly Incidents</h4>
              <div className="flex items-end justify-between h-24 gap-1">
                {[40, 65, 30, 85, 45, 90, 55].map((h, i) => (
                  <div key={i} className="flex-1 bg-zinc-800 rounded-t relative group">
                    <div style={{ height: `${h}%` }} className="bg-blue-600 w-full rounded-t group-hover:bg-blue-400 transition-colors"></div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-2 text-[9px] text-zinc-600 font-bold uppercase">
                <span>Mon</span>
                <span>Sun</span>
              </div>
            </div>
            
            <div className="bg-[#111111] border border-zinc-800 p-4 rounded">
              <h4 className="text-[10px] font-black text-zinc-500 tracking-widest mb-4 uppercase">Safe Route Score</h4>
              <div className="flex items-center justify-center p-4">
                <div className="relative w-24 h-24 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-zinc-800"/>
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="251.2" strokeDashoffset="50.24" className="text-orange-500"/>
                  </svg>
                  <span className="absolute text-xl font-black">80%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Toggle button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="absolute top-1/2 -right-4 translate-y-[-50%] w-4 h-12 bg-zinc-800 border border-zinc-700 rounded-r flex items-center justify-center hover:bg-zinc-700 transition-colors z-50 shadow-lg"
      >
        <div className={`w-1 h-4 border-l-2 border-zinc-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}></div>
      </button>
    </aside>
  );
};

export default Sidebar;
