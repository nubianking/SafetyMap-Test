
import React from 'react';
import { TrustCard } from './TrustCard';
import { ICONS } from '../../constants';
import { TrendingUp, Clock, ShieldCheck, Zap, Fuel, Wifi, Users, Wallet, Settings, Award } from 'lucide-react';

export interface SessionRecord {
  date: string;
  qualityScore: number;
  incidents: number;
  yield: number;
  status: 'PAID' | 'AUDIT_FLAGGED' | 'PENDING';
}

export interface UserProfileData {
  alias: string;
  rank: string;
  score: number;
  balance: number;
  history: SessionRecord[];
  // additional onboarding fields may be present
  fullName?: string;
  dob?: string;
  phone?: string;
  email?: string;
  nationality?: string;
  mobility?: string;
  zone?: string;
  bankName?: string;
  accountNumber?: string;
}
const MOCK_HISTORY: SessionRecord[] = [
  { date: 'FEB 20, 2026', qualityScore: 98, incidents: 2, yield: 45.20, status: 'PAID' },
  { date: 'FEB 19, 2026', qualityScore: 82, incidents: 0, yield: 12.10, status: 'PAID' },
  { date: 'FEB 18, 2026', qualityScore: 45, incidents: 1, yield: 2.50, status: 'AUDIT_FLAGGED' },
  { date: 'FEB 17, 2026', qualityScore: 91, incidents: 0, yield: 15.40, status: 'PAID' },
];

interface MapperProfileProps {
  user?: UserProfileData | null;
}

const MapperProfile: React.FC<MapperProfileProps> = ({ user }) => {
  const navigate = useNavigate();
  const profileData = user || {
    alias: 'GUEST_NODE',
    rank: 'Oracle Elite',
    score: 94,
    balance: 12450.85,
    history: MOCK_HISTORY
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12 pb-32 relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse"></div>
              <span className="text-[10px] font-black text-zinc-500 tracking-[0.6em] uppercase">Mapper Profile // Node: {profileData.alias}</span>
            </div>
            <h2 className="text-5xl md:text-7xl font-black tracking-tighter italic uppercase leading-none">
              TRUST <span className="text-blue-500">ECONOMY</span>
            </h2>
          </div>
          <button 
            onClick={() => navigate('/')}
            className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-all active:scale-95"
          >
            <ICONS.Plus className="w-6 h-6 rotate-45" />
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Left Column: Trust Card & Stats */}
          <div className="lg:col-span-1 space-y-8">
            <TrustCard rank={profileData.rank} score={profileData.score} balance={profileData.balance} />

            {/* Personal details from onboarding */}
            {(profileData.fullName || profileData.email || profileData.phone) && (
              <div className="bg-zinc-900/20 border border-white/5 rounded-2xl p-4 space-y-2">
                {profileData.fullName && <p className="text-[10px]"><strong>Name:</strong> {profileData.fullName}</p>}
                {profileData.email && <p className="text-[10px]"><strong>Email:</strong> {profileData.email}</p>}
                {profileData.phone && <p className="text-[10px]"><strong>Phone:</strong> {profileData.phone}</p>}
              </div>
            )}
            
            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-blue-600 hover:bg-blue-500 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg">
                <Wallet className="w-5 h-5" />
                <span className="text-[10px] font-black uppercase tracking-widest">Withdraw</span>
              </button>
              <button className="bg-zinc-900 border border-white/10 hover:bg-zinc-800 text-white p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-colors active:scale-95 shadow-lg">
                <Settings className="w-5 h-5 text-zinc-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Node Config</span>
              </button>
            </div>

            {/* Active Badges */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Active Badges</h3>
                <Award className="w-4 h-4 text-yellow-500" />
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-yellow-500" />
                  <span className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">First Responder</span>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-xl flex items-center gap-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <span className="text-[9px] font-black text-blue-500 uppercase tracking-widest">High Accuracy</span>
                </div>
              </div>
            </div>
            
            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] p-8 space-y-6">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Integrity Heatmap</h3>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 28 }).map((_, i) => (
                  <div 
                    key={i} 
                    className={`aspect-square rounded-md transition-all duration-500 ${
                      i % 7 === 0 ? 'bg-zinc-800' : 
                      i % 5 === 0 ? 'bg-blue-900/40' : 
                      i % 3 === 0 ? 'bg-blue-600/60' : 'bg-blue-500'
                    }`}
                  />
                ))}
              </div>
              <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest text-center">Last 30 Days Consistency Audit</p>
            </div>

            <div className="bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] p-8 space-y-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <span className="text-[11px] font-black text-blue-500 uppercase tracking-widest">Next Multiplier</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest leading-relaxed">
                Complete <span className="text-white">4 more</span> Verified High-Severity reports to unlock the <span className="text-blue-400">2.5x Apex Multiplier</span>.
              </p>
            </div>
          </div>

          {/* Right Column: History & Utility */}
          <div className="lg:col-span-2 space-y-12">
            {/* Yield History */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Yield History // Forensic Audit</h3>
                <Clock className="w-5 h-5 text-zinc-700" />
              </div>
              
              <div className="bg-zinc-900/30 border border-white/5 rounded-[3rem] overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5">
                      <th className="p-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Date</th>
                      <th className="p-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Quality</th>
                      <th className="p-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Incidents</th>
                      <th className="p-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Yield</th>
                      <th className="p-6 text-[9px] font-black text-zinc-600 uppercase tracking-widest">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {profileData.history.map((session, i) => (
                      <tr key={i} className="hover:bg-white/5 transition-colors group">
                        <td className="p-6 text-[11px] font-bold text-zinc-400">{session.date}</td>
                        <td className="p-6">
                          <div className="flex items-center gap-2">
                            <div className="w-12 h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div 
                                className={`h-full ${session.qualityScore > 80 ? 'bg-green-500' : session.qualityScore > 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                                style={{ width: `${session.qualityScore}%` }}
                              />
                            </div>
                            <span className="text-[10px] font-black text-white">{session.qualityScore}%</span>
                          </div>
                        </td>
                        <td className="p-6 text-[11px] font-black text-white">{session.incidents}</td>
                        <td className="p-6 text-[11px] font-black text-blue-400">{session.yield.toFixed(2)} RGT</td>
                        <td className="p-6">
                          <span className={`text-[8px] font-black px-2 py-1 rounded-md tracking-widest uppercase ${
                            session.status === 'PAID' ? 'bg-green-500/10 text-green-500' : 
                            session.status === 'AUDIT_FLAGGED' ? 'bg-red-500/10 text-red-500' : 'bg-zinc-800 text-zinc-500'
                          }`}>
                            {session.status.replace('_', ' ')}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Economic Utility */}
            <div className="space-y-8">
              <h3 className="text-[11px] font-black uppercase tracking-[0.4em] text-zinc-500">Economic Utility // RGT Exchange</h3>
              <div className="grid md:grid-cols-3 gap-6">
                {[
                  { icon: Fuel, label: 'Fuel Vouchers', desc: 'Exchange RGT for fuel at partner stations.', color: 'text-orange-500' },
                  { icon: Wifi, label: 'Data Bundles', desc: 'Burn RGT to pay for high-bandwidth data.', color: 'text-blue-500' },
                  { icon: Users, label: 'P2P Staking', desc: 'Transfer RGT to help others stake tiers.', color: 'text-purple-500' },
                ].map((item, i) => (
                  <div key={i} className="bg-zinc-900/40 border border-white/5 p-8 rounded-[2.5rem] hover:border-white/20 transition-all group cursor-pointer">
                    <div className={`w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h4 className="text-lg font-black text-white italic tracking-tighter mb-2 uppercase">{item.label}</h4>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapperProfile;
