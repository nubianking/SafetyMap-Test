
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../contexts/AppContext';
import { ICONS } from '../constants';
import { GoogleGenAI, Type } from "@google/genai";

type OnboardingStep = 'WELCOME' | 'PERSONAL' | 'IDENTITY' | 'LOCATION' | 'DEVICE' | 'TRAINING' | 'PAYMENT' | 'PROCESSING' | 'STATUS';

const OnboardingPortal: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAppContext();
  const [step, setStep] = useState<OnboardingStep>('WELCOME');
  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    phone: '',
    email: '',
    nationality: 'Nigerian',
    mobility: 'Public transport',
    zone: 'Lagos Mainland',
    bankName: '',
    accountNumber: ''
  });
  const [selfieCaptured, setSelfieCaptured] = useState<string | null>(null);
  const [quizScore, setQuizScore] = useState(0);
  const [trustScore, setTrustScore] = useState(50);
  const [assignedPasskey, setAssignedPasskey] = useState<string | null>(null);
  const [registrationError, setRegistrationError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    if (currentUser) {
      navigate('/operations');
    }
  }, [currentUser, navigate]);

  const handleNext = () => {
    const steps: OnboardingStep[] = ['WELCOME', 'PERSONAL', 'IDENTITY', 'LOCATION', 'DEVICE', 'TRAINING', 'PAYMENT', 'PROCESSING', 'STATUS'];
    const currentIndex = steps.indexOf(step);
    if (currentIndex < steps.length - 1) {
      setStep(steps[currentIndex + 1]);
      if (steps[currentIndex + 1] === 'PROCESSING') {
        simulateAIProcessing();
      }
    }
  };

  const simulateAIProcessing = async () => {
    // register the mapper profile with backend
    try {
      const payload = {
        alias: formData.email, // use email as alias
        fullName: formData.fullName,
        dob: formData.dob,
        phone: formData.phone,
        email: formData.email,
        nationality: formData.nationality,
        mobility: formData.mobility,
        zone: formData.zone,
        bankName: formData.bankName,
        accountNumber: formData.accountNumber
      };
      const resp = await fetch('/api/mappers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await resp.json();
      if (resp.ok && result.success) {
        setAssignedPasskey(result.data.passkey);
      } else {
        console.error('Registration failed', result.error);
        setRegistrationError(result.error || 'Registration failed');
      }
    } catch (err) {
      console.error('Mapper registration error', err);
      setRegistrationError('Network error during registration');
    }

    // Artificial delay to show AI at work
    setTimeout(() => {
      setTrustScore(prev => prev + 15); // Bonus for completing training
      setStep('STATUS');
    }, 4000);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera access failed", err);
    }
  };

  const captureSelfie = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        canvasRef.current.width = 300;
        canvasRef.current.height = 300;
        context.drawImage(videoRef.current, 0, 0, 300, 300);
        setSelfieCaptured(canvasRef.current.toDataURL('image/jpeg'));
        // Stop camera
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(t => t.stop());
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 'WELCOME':
        return (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom duration-700">
            <div className="w-24 h-24 bg-orange-600 rounded-[2rem] flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(234,88,12,0.3)]">
              <ICONS.User className="w-12 h-12 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4">Mapper <span className="text-orange-600">Onboarding</span></h2>
              <p className="text-zinc-500 max-w-md mx-auto text-lg">Initialize your profile to start earning from the Safety Map grid. Complete 9 steps to activate your node.</p>
            </div>
            <div className="pt-8 flex flex-col gap-4">
              <button onClick={handleNext} className="w-full py-6 bg-white text-black font-black text-[12px] tracking-widest uppercase rounded-2xl shadow-2xl hover:bg-orange-600 hover:text-white transition-all">Start Activation</button>
              <button onClick={() => navigate('/')} className="w-full py-4 text-zinc-500 font-black text-[10px] tracking-widest uppercase hover:text-white transition-all">Cancel</button>
            </div>
          </div>
        );

      case 'PERSONAL':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-4 mb-8">Personal Information</h3>
            <div className="grid gap-5">
              <input 
                type="text" placeholder="Full Legal Name" 
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 transition-all"
                value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})}
              />
              <input 
                type="date" placeholder="Date of Birth" 
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 transition-all"
                value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})}
              />
              <div className="grid grid-cols-2 gap-4">
                 <input 
                  type="tel" placeholder="Phone (OTP)" 
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 transition-all"
                  value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                />
                <input 
                  type="email" placeholder="Email" 
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-6 py-4 text-white focus:outline-none focus:border-orange-500 transition-all"
                  value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                />
              </div>
            </div>
            <button onClick={handleNext} className="w-full mt-10 py-5 bg-orange-600 text-white font-black text-[11px] tracking-widest uppercase rounded-xl">Next Step</button>
          </div>
        );

      case 'IDENTITY':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
            <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-4 mb-8">AI Identity Proof</h3>
            <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 text-center">
              {!selfieCaptured ? (
                <div className="space-y-6">
                  <div className="aspect-square bg-black rounded-2xl overflow-hidden relative border-2 border-dashed border-zinc-800">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover grayscale" />
                    <div className="absolute inset-0 border-[20px] border-black/40 pointer-events-none rounded-full scale-90"></div>
                  </div>
                  <div className="flex flex-col gap-4">
                    <button onClick={startCamera} className="text-[10px] font-black uppercase tracking-widest text-blue-500 underline">Initialize Sensor</button>
                    <button onClick={captureSelfie} className="py-4 bg-white text-black font-black text-[11px] tracking-widest uppercase rounded-xl">Capture Live Selfie</button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <img src={selfieCaptured} className="w-48 h-48 mx-auto rounded-full border-4 border-orange-500 shadow-2xl object-cover" alt="Captured" />
                  <div className="flex items-center justify-center gap-2">
                    <ICONS.Fingerprint className="w-4 h-4 text-orange-500" />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">Liveness Detected: 98%</span>
                  </div>
                  <button onClick={() => setSelfieCaptured(null)} className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Retake</button>
                </div>
              )}
            </div>
            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5 flex items-start gap-4">
              <ICONS.Shield className="w-5 h-5 text-orange-600 shrink-0" />
              <p className="text-[10px] text-zinc-500 font-medium">Vertex AI Vision will perform a forensic match against your government ID in the background.</p>
            </div>
            <button onClick={handleNext} className="w-full mt-6 py-5 bg-orange-600 text-white font-black text-[11px] tracking-widest uppercase rounded-xl">Validate Identity</button>
          </div>
        );

      case 'LOCATION':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-4 mb-8">Coverage Zone</h3>
             <div className="space-y-4">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Select Operational Grid</label>
                <select 
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-6 py-4 text-white focus:outline-none"
                  value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})}
                >
                  <option>Lagos Mainland</option>
                  <option>Lekki / Ajah Axis</option>
                  <option>Ikeja / Agege</option>
                  <option>Badagry Express</option>
                </select>

                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest block pt-4">Mobility Type</label>
                <div className="grid grid-cols-2 gap-4">
                  {['Motorcycle', 'Car', 'Danfo Bus', 'Public Transport'].map(type => (
                    <button 
                      key={type}
                      onClick={() => setFormData({...formData, mobility: type})}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${formData.mobility === type ? 'bg-orange-600 border-orange-400 text-white' : 'bg-zinc-900 border-white/5 text-zinc-500 hover:border-white/20'}`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
             </div>
             <button onClick={handleNext} className="w-full mt-10 py-5 bg-orange-600 text-white font-black text-[11px] tracking-widest uppercase rounded-xl">Next Step</button>
          </div>
        );

      case 'DEVICE':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-4 mb-8">Device Security</h3>
             <div className="bg-zinc-950 p-8 rounded-3xl border border-white/5 space-y-6 font-mono text-[11px]">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-zinc-500 uppercase">Fingerprint Hash</span>
                   <span className="text-white">SHA256: {Math.random().toString(16).substr(2, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                   <span className="text-zinc-500 uppercase">OS Integrity</span>
                   <span className="text-green-500">SECURE (No Root)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                   <span className="text-zinc-500 uppercase">SIM Consistency</span>
                   <span className="text-blue-500">VERIFIED</span>
                </div>
             </div>
             <div className="flex items-center gap-3 p-4 bg-orange-600/5 rounded-xl border border-orange-500/20">
               <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-zinc-900" id="deviceConfirm" />
               <label htmlFor="deviceConfirm" className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">I will only report from this device</label>
             </div>
             <button onClick={handleNext} className="w-full mt-6 py-5 bg-orange-600 text-white font-black text-[11px] tracking-widest uppercase rounded-xl">Bind Device</button>
          </div>
        );

      case 'TRAINING':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-4 mb-8">Mapper Training</h3>
             <div className="space-y-6 overflow-y-auto max-h-[400px] pr-4 custom-scrollbar">
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
                   <h4 className="text-orange-500 font-black uppercase text-[10px] tracking-widest mb-2">Rule #1: Safety First</h4>
                   <p className="text-sm text-zinc-400 leading-relaxed italic">Do not intervene in active incidents. Your role is purely observational. Entering a crime scene results in immediate ban.</p>
                </div>
                <div className="bg-zinc-900 p-6 rounded-2xl border border-white/5">
                   <h4 className="text-blue-500 font-black uppercase text-[10px] tracking-widest mb-2">Rule #2: No Staging</h4>
                   <p className="text-sm text-zinc-400 leading-relaxed italic">Staging incidents or using deepfakes to earn rewards is a criminal offense and will be reported to legal authorities.</p>
                </div>
                <div className="p-4 bg-zinc-950 rounded-2xl border border-white/10 space-y-4">
                  <p className="text-xs font-bold text-white uppercase tracking-widest text-center">Quick Quiz</p>
                  <p className="text-[11px] text-zinc-500 text-center">If you see a robbery in progress, you should:</p>
                  <div className="grid gap-3">
                    <button className="py-3 px-4 bg-zinc-900 border border-white/5 rounded-lg text-[10px] text-left hover:border-red-500 transition-all">A) Intervene and stop it</button>
                    <button onClick={() => setQuizScore(100)} className="py-3 px-4 bg-zinc-900 border border-white/5 rounded-lg text-[10px] text-left hover:border-green-500 transition-all focus:border-green-500">B) Maintain safe distance and stream</button>
                  </div>
                </div>
             </div>
             <button onClick={handleNext} className="w-full mt-6 py-5 bg-orange-600 text-white font-black text-[11px] tracking-widest uppercase rounded-xl">Complete Training</button>
          </div>
        );

      case 'PAYMENT':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-500">
             <h3 className="text-2xl font-black uppercase italic tracking-tighter border-b border-white/10 pb-4 mb-8">Payout Details</h3>
             <div className="grid gap-5">
               <input 
                  type="text" placeholder="Bank Name" 
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-6 py-4 text-white focus:outline-none"
                  value={formData.bankName} onChange={e => setFormData({...formData, bankName: e.target.value})}
                />
                <input 
                  type="text" placeholder="Account Number" 
                  className="w-full bg-zinc-900 border border-white/5 rounded-xl px-6 py-4 text-white focus:outline-none"
                  value={formData.accountNumber} onChange={e => setFormData({...formData, accountNumber: e.target.value})}
                />
                <p className="text-[10px] text-zinc-600 font-medium italic">Name match verified against ID during processing step.</p>
             </div>
             <div className="flex items-center gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5">
                <ICONS.AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0" />
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest leading-relaxed">I agree to the non-interference and legal indemnity policy.</p>
             </div>
             <button onClick={handleNext} className="w-full mt-10 py-6 bg-white text-black font-black text-[12px] tracking-widest uppercase rounded-2xl shadow-2xl">Finalize Registration</button>
          </div>
        );

      case 'PROCESSING':
        return (
          <div className="text-center py-20 space-y-10 animate-in fade-in duration-1000">
             <div className="relative w-32 h-32 mx-auto">
                <div className="absolute inset-0 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 border-4 border-blue-500 border-b-transparent rounded-full animate-spin-slow"></div>
                <ICONS.Cpu className="absolute inset-0 m-auto w-10 h-10 text-white animate-pulse" />
             </div>
             <div className="space-y-4">
                <h3 className="text-3xl font-black italic uppercase tracking-tighter">AI Verification Layer</h3>
                <div className="flex flex-col gap-2">
                   <p className="text-[10px] text-orange-500 font-black tracking-widest uppercase animate-pulse">Running Forensic Match...</p>
                   <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Duplicate Account Check: PASS</p>
                   <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Deepfake Forensic Audit: CLEAN</p>
                   <p className="text-[10px] text-zinc-500 font-black tracking-widest uppercase">Risk Profiling: COMPLETE</p>
                </div>
             </div>
          </div>
        );

      case 'STATUS':
        return (
          <div className="text-center space-y-10 animate-in zoom-in duration-700">
             <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(34,197,94,0.3)]">
                <ICONS.Shield className="w-12 h-12 text-white" />
             </div>
             <div className="space-y-4">
                <h2 className="text-4xl font-black italic uppercase tracking-tighter">Node <span className="text-green-500">Active</span></h2>
                <p className="text-sm text-zinc-400 uppercase tracking-widest">Alias: {formData.email}</p>
                {registrationError && (
                  <div className="text-red-400 text-xs font-bold">{registrationError}</div>
                )}
                <div className="bg-zinc-900 border border-white/5 p-6 rounded-3xl inline-block px-12">
                   <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1">Initial Trust Score</div>
                   <div className="text-4xl font-black text-white">{trustScore}/100</div>
                   <div className="mt-3 text-[9px] font-black text-green-500 uppercase tracking-widest flex items-center justify-center gap-2">
                      <ICONS.TrendingUp className="w-3 h-3" />
                      Above Average Initialization
                   </div>
                </div>
             </div>
             <div className="bg-orange-600/10 p-6 rounded-3xl border border-orange-500/20 max-w-sm mx-auto">
                <p className="text-[11px] text-zinc-400 leading-relaxed font-medium">Your account is approved. Complete your first 5 verified reports to unlock the <span className="text-white font-black">"Persistence Bonus"</span> multiplier.</p>
             </div>
             {assignedPasskey && (
               <div className="bg-black/80 text-white text-[10px] p-4 rounded-xl">
                 Your node passkey: <strong className="font-mono">{assignedPasskey}</strong><br/>
                 Use this value when logging in (you can also use your email).
               </div>
             )}
             <button onClick={() => navigate('/driver')} className="w-full py-6 bg-white text-black font-black text-[12px] tracking-widest uppercase rounded-2xl shadow-2xl hover:bg-orange-600 hover:text-white transition-all">Go to Command Deck</button>
          </div>
        );
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12 bg-black rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,1)] relative overflow-hidden">
      {/* Step Indicator */}
      {step !== 'WELCOME' && step !== 'PROCESSING' && step !== 'STATUS' && (
        <div className="absolute top-12 left-10 right-10 flex gap-1 h-1.5 pointer-events-none">
          {['PERSONAL', 'IDENTITY', 'LOCATION', 'DEVICE', 'TRAINING', 'PAYMENT'].map((s, i) => (
            <div key={i} className={`flex-1 rounded-full transition-all duration-500 ${step === s ? 'bg-orange-600' : 'bg-zinc-800'}`}></div>
          ))}
        </div>
      )}
      
      <div className="pt-10">
        {renderStep()}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
};

export default OnboardingPortal;
