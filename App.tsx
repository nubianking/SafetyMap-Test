
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import LiveGridSection from './components/LiveGridSection';
import IncentiveSection from './components/IncentiveSection';
import Footer from './components/Footer';
import { AppProvider, useAppContext } from './contexts/AppContext';

// Lazy load components
const MapView = lazy(() => import('./components/MapView'));
const DriverPortal = lazy(() => import('./components/DriverPortal'));
const OnboardingPortal = lazy(() => import('./components/OnboardingPortal'));
const AnonymousUploadPortal = lazy(() => import('./components/AnonymousUploadPortal'));
const MapperProfile = lazy(() => import('./components/profile/MapperProfile'));
const MapperLogin = lazy(() => import('./components/auth/MapperLogin'));
const OperationsPortal = lazy(() => import('./components/OperationsPortal'));
const Whitepaper = lazy(() => import('./components/Whitepaper'));
const PrivacyPolicy = lazy(() => import('./components/PrivacyPolicy'));
const LegalNotice = lazy(() => import('./components/LegalNotice'));

// Layout component for pages with header and footer
const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5]">
    <Header />
    <div className="pt-24">
      {children}
    </div>
    <Footer />
  </div>
);

// Full screen layout
const FullScreenLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="fixed inset-0 z-[2000] bg-black">
    {children}
  </div>
);

// Home page component
const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();

  return (
    <div className="min-h-screen w-full bg-[#050505] text-[#e5e5e5] selection:bg-orange-500/30">
      <Header />
      <main>
        <HeroSection />
        
        {/* Driver Quick Access */}
        <div className="px-6 md:px-12 py-12 max-w-7xl mx-auto">
          <div className="bg-zinc-900 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-black tracking-tighter uppercase mb-2">Driver Onboarding</h3>
              <p className="text-zinc-500 text-sm font-medium">Test our AI vision engine. Mount your phone and start earning.</p>
            </div>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-10 py-5 bg-white text-black font-black text-[10px] tracking-[0.2em] uppercase rounded-xl hover:bg-orange-600 hover:text-white transition-all transform hover:-translate-y-1"
            >
              Start Onboarding
            </button>
          </div>
        </div>

        <LiveGridSection />
        <IncentiveSection />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
};

// App content component
const AppContent: React.FC = () => {
  const { currentUser, liveAlerts } = useAppContext();

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/map" element={<FullScreenLayout><MapView liveAlerts={liveAlerts} /></FullScreenLayout>} />
        <Route path="/login" element={<MapperLogin />} />
        <Route path="/operations" element={currentUser ? <MainLayout><OperationsPortal user={currentUser} /></MainLayout> : <Navigate to="/login" />} />
        <Route path="/profile" element={currentUser ? <MainLayout><MapperProfile user={currentUser} /></MainLayout> : <Navigate to="/login" />} />
        <Route path="/whitepaper" element={<Whitepaper />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/legal" element={<LegalNotice />} />
        <Route path="/upload" element={<MainLayout><AnonymousUploadPortal /></MainLayout>} />
        <Route path="/onboarding" element={<MainLayout><OnboardingPortal /></MainLayout>} />
        <Route path="/driver" element={currentUser ? <MainLayout><DriverPortal user={currentUser} /></MainLayout> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Suspense>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AppProvider>
        <Router>
          <AppContent />
        </Router>
      </AppProvider>
    </ErrorBoundary>
  );
};

export default App;
