
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import LiveGridSection from './components/LiveGridSection';
import IncentiveSection from './components/IncentiveSection';
import Footer from './components/Footer';
import MapView from './components/MapView';
import DriverPortal from './components/DriverPortal';
import OnboardingPortal from './components/OnboardingPortal';
import AnonymousUploadPortal from './components/AnonymousUploadPortal';
import MapperProfile, { UserProfileData } from './components/profile/MapperProfile';
import MapperLogin from './components/auth/MapperLogin';
import OperationsPortal from './components/OperationsPortal';
import Whitepaper from './components/Whitepaper';
import PrivacyPolicy from './components/PrivacyPolicy';
import LegalNotice from './components/LegalNotice';
import { LiveAlert } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'HOME' | 'MAP' | 'DRIVER' | 'ONBOARDING' | 'UPLOAD' | 'PROFILE' | 'LOGIN' | 'OPERATIONS' | 'WHITEPAPER' | 'PRIVACY' | 'LEGAL'>('HOME');
  const [liveAlerts, setLiveAlerts] = useState<LiveAlert[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfileData | null>(null);

  useEffect(() => {
    // Fetch initial alerts from the backend
    const fetchAlerts = async () => {
      try {
        const response = await fetch('/api/alerts');
        if (response.ok) {
          const data = await response.json();
          setLiveAlerts(data.slice(0, 10)); // Keep last 10 for UI
        }
      } catch (error) {
        console.error('Failed to fetch alerts:', error);
      }
    };
    fetchAlerts();
  }, []);

  const handleNewAlert = async (alert: LiveAlert) => {
    // Optimistically update UI
    setLiveAlerts(prev => [alert, ...prev].slice(0, 10)); 
    
    if (alert.label.toLowerCase().includes('weapon')) {
      console.log("CRITICAL WEAPON ALERT DETECTED");
    }

    // Post to backend
    try {
      await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(alert),
      });
    } catch (error) {
      console.error('Failed to post alert:', error);
    }
  };

  const handleProfileClick = () => {
    if (currentUser) {
      setView('OPERATIONS');
    } else {
      setView('LOGIN');
    }
  };

  if (view === 'MAP') {
    return (
      <div className="fixed inset-0 z-[2000] bg-black">
        <MapView onBack={() => setView('HOME')} liveAlerts={liveAlerts} />
      </div>
    );
  }

  if (view === 'LOGIN') {
    return <MapperLogin onLoginSuccess={(user) => { setCurrentUser(user); setView('OPERATIONS'); }} onBack={() => setView('HOME')} />;
  }

  if (view === 'OPERATIONS') {
    return (
      <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5]">
        <Header onExploreMap={() => setView('MAP')} onVisualProof={() => setView('UPLOAD')} onProfile={handleProfileClick} onHome={() => setView('HOME')} />
        <div className="pt-24">
          <OperationsPortal user={currentUser} onNavigate={setView} onReportAlert={handleNewAlert} />
        </div>
        <Footer onWhitepaper={() => setView('WHITEPAPER')} onPrivacy={() => setView('PRIVACY')} onLegal={() => setView('LEGAL')} />
      </div>
    );
  }

  if (view === 'PROFILE') {
    return (
      <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5]">
        <Header onExploreMap={() => setView('MAP')} onVisualProof={() => setView('UPLOAD')} onProfile={handleProfileClick} onHome={() => setView('HOME')} />
        <div className="pt-24">
          <MapperProfile user={currentUser} onBack={() => setView('HOME')} />
        </div>
        <Footer onWhitepaper={() => setView('WHITEPAPER')} onPrivacy={() => setView('PRIVACY')} onLegal={() => setView('LEGAL')} />
      </div>
    );
  }

  if (view === 'WHITEPAPER') {
    return <Whitepaper onBack={() => setView('HOME')} />;
  }

  if (view === 'PRIVACY') {
    return <PrivacyPolicy onBack={() => setView('HOME')} />;
  }

  if (view === 'LEGAL') {
    return <LegalNotice onBack={() => setView('HOME')} />;
  }

  if (view === 'UPLOAD') {
    return (
      <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5]">
        <Header onExploreMap={() => setView('MAP')} onVisualProof={() => setView('UPLOAD')} onProfile={handleProfileClick} onHome={() => setView('HOME')} />
        <div className="pt-24 pb-20">
          <AnonymousUploadPortal onReportAlert={handleNewAlert} onBack={() => setView('HOME')} />
        </div>
        <Footer onWhitepaper={() => setView('WHITEPAPER')} onPrivacy={() => setView('PRIVACY')} onLegal={() => setView('LEGAL')} />
      </div>
    );
  }

  if (view === 'ONBOARDING') {
    return (
      <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5]">
        <Header onExploreMap={() => setView('MAP')} onVisualProof={() => setView('UPLOAD')} onProfile={handleProfileClick} onHome={() => setView('HOME')} />
        <div className="pt-24 pb-20">
          <OnboardingPortal onComplete={() => setView('DRIVER')} onCancel={() => setView('HOME')} />
        </div>
        <Footer onWhitepaper={() => setView('WHITEPAPER')} onPrivacy={() => setView('PRIVACY')} onLegal={() => setView('LEGAL')} />
      </div>
    );
  }

  if (view === 'DRIVER') {
    return (
      <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5]">
        <Header onExploreMap={() => setView('MAP')} onVisualProof={() => setView('UPLOAD')} onProfile={handleProfileClick} onHome={() => setView('HOME')} />
        <div className="pt-24">
          <DriverPortal onReportAlert={handleNewAlert} user={currentUser} onOpenProfile={handleProfileClick} />
        </div>
        <Footer onWhitepaper={() => setView('WHITEPAPER')} onPrivacy={() => setView('PRIVACY')} onLegal={() => setView('LEGAL')} />
        <button 
          onClick={() => setView('HOME')}
          className="fixed bottom-8 left-8 z-[2001] bg-white text-black px-6 py-3 rounded-full font-black text-[10px] tracking-widest uppercase shadow-2xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5] selection:bg-orange-500/30">
      <Header onExploreMap={() => setView('LOGIN')} onVisualProof={() => setView('UPLOAD')} onProfile={handleProfileClick} onHome={() => setView('HOME')} />
      <main>
        <HeroSection onExploreMap={() => setView('MAP')} onLogin={() => setView('LOGIN')} />
        
        {/* Driver Quick Access */}
        <div className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Driver Onboarding</h3>
              <p className="text-zinc-500 text-sm font-medium">Test our AI vision engine. Mount your phone and start earning.</p>
            </div>
            <button 
              onClick={() => setView('ONBOARDING')}
              className="px-10 py-5 bg-white text-black font-black text-[10px] tracking-[0.2em] uppercase rounded-xl hover:bg-orange-600 hover:text-white transition-all transform hover:-translate-y-1"
            >
              Start Onboarding
            </button>
          </div>
        </div>

        <LiveGridSection onExpand={() => setView('MAP')} onUpload={() => setView('UPLOAD')} />
        <IncentiveSection onOnboard={() => setView('ONBOARDING')} />
        <FeaturesSection />
      </main>
      <Footer onWhitepaper={() => setView('WHITEPAPER')} onPrivacy={() => setView('PRIVACY')} onLegal={() => setView('LEGAL')} />
    </div>
  );
};

export default App;
