import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

const Whitepaper: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] selection:bg-blue-200 font-serif pb-32">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-[#fcfcfc]/90 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex justify-between items-center font-sans">
        <button 
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-zinc-600 hover:text-black transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </button>
        <div className="flex items-center gap-2 text-zinc-400">
          <FileText className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Whitepaper v1.0</span>
        </div>
      </div>

      {/* Document Container */}
      <div className="max-w-3xl mx-auto px-6 pt-20 space-y-16">
        
        {/* Title Section */}
        <div className="space-y-6 border-b border-zinc-200 pb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-black font-sans">Safety Map Africa</h1>
          <h2 className="text-2xl md:text-3xl font-medium text-zinc-600">Decentralized Urban Safety Intelligence Network</h2>
          <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 pt-4 font-sans">Whitepaper v1.0</p>
        </div>

        {/* 1. Executive Summary */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">1. Executive Summary</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p><strong>Safety Map Africa</strong> is a decentralized urban safety intelligence platform designed to transform ordinary citizens and drivers into <strong>real-time safety sensors</strong>.</p>
            <p>Using <strong>mobile devices, geospatial intelligence, and multi-modal AI</strong>, the platform enables communities to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>detect incidents in real time</li>
              <li>verify threats collectively</li>
              <li>predict high-risk zones</li>
              <li>improve emergency response</li>
              <li>incentivize accurate reporting</li>
            </ul>
            <p>The platform introduces a <strong>distributed sensing network</strong>, where participants called <strong>Mappers</strong> contribute verified environmental data through <strong>video and audio incident reporting</strong>.</p>
            <p>By combining <strong>crowdsourced intelligence, AI-driven analysis, and cryptographic verification</strong>, Safety Map Africa creates a <strong>transparent and trustworthy safety grid</strong>.</p>
            <p>The system is optimized for <strong>rapidly growing urban environments</strong>, particularly across <strong>African cities where formal safety infrastructure may be limited</strong>.</p>
          </div>
        </section>

        {/* 2. Problem Statement */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">2. Problem Statement</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Urban populations across Africa are expanding rapidly, creating complex safety challenges.</p>
            <p>Common issues include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>delayed emergency response</li>
              <li>insufficient surveillance infrastructure</li>
              <li>unreliable incident reporting</li>
              <li>misinformation on social media</li>
              <li>fragmented safety data systems</li>
            </ul>
            <p>In many cities, real-time situational awareness is extremely limited.</p>
            <p>Traditional safety infrastructure relies heavily on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>centralized surveillance</li>
              <li>manual reporting</li>
              <li>delayed verification processes</li>
            </ul>
            <p>These systems often fail to provide <strong>timely and accurate safety intelligence</strong>.</p>
            <p>As a result:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>communities remain reactive rather than proactive</li>
              <li>emergency services lack actionable real-time information</li>
              <li>misinformation spreads faster than verified data</li>
            </ul>
            <p>A scalable solution must combine <strong>community participation, intelligent verification, and automated risk detection</strong>.</p>
          </div>
        </section>

        {/* 3. Vision */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">3. Vision</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa aims to build the <strong>largest decentralized urban safety intelligence network in Africa</strong>.</p>
            <p>The platform envisions a future where:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>every citizen can contribute to public safety</li>
              <li>cities gain real-time visibility into emerging risks</li>
              <li>misinformation is automatically filtered through verification</li>
              <li>safety insights are shared transparently and responsibly</li>
            </ul>
            <p>The goal is to create a <strong>self-improving safety ecosystem</strong> where community participation strengthens security for everyone.</p>
          </div>
        </section>

        {/* 4. Platform Overview */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">4. Platform Overview</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa operates through a network of <strong>Mapper Nodes</strong>, which are mobile devices contributing environmental observations to a shared safety grid.</p>
            <p>Each node can:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>detect anomalies using onboard sensors</li>
              <li>submit incident evidence through video or audio recordings</li>
              <li>verify reports submitted by other users</li>
              <li>receive alerts about nearby risks</li>
            </ul>
            <p>These signals are processed through a <strong>central intelligence layer</strong> powered by AI and geospatial analytics.</p>
            <p>The system then:</p>
            <ol className="list-decimal pl-6 space-y-2">
              <li>analyzes incoming signals</li>
              <li>verifies incident authenticity</li>
              <li>determines incident severity</li>
              <li>distributes alerts to nearby users</li>
            </ol>
            <p>The result is a <strong>live situational awareness map</strong> representing real-time safety intelligence.</p>
          </div>
        </section>

        {/* 5. Core Components */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">5. Core Components</h2>
          
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <h3 className="text-2xl font-bold text-black mt-8 font-sans">5.1 Mapper Network</h3>
            <p>Mappers are participating users who contribute safety data.</p>
            <p>Each mapper device acts as a <strong>distributed sensing node</strong> capable of:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>capturing evidence</li>
              <li>submitting reports</li>
              <li>verifying nearby incidents</li>
              <li>receiving safety alerts</li>
            </ul>
            <p>Mapper contributions help the system identify incidents earlier than traditional reporting mechanisms.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">5.2 Incident Reporting</h3>
            <p>Mappers can submit two types of incident evidence.</p>
            
            <h4 className="text-xl font-bold text-black mt-6 font-sans">Video Incident Reporting</h4>
            <p>Users can upload short video clips capturing events such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>robbery</li>
              <li>assault</li>
              <li>accidents</li>
              <li>fire</li>
              <li>violent disturbances</li>
            </ul>
            <p>Videos include embedded metadata such as location and timestamp to support forensic verification.</p>

            <h4 className="text-xl font-bold text-black mt-6 font-sans">Audio Incident Reporting</h4>
            <p>Audio reports allow users to capture incidents where video may be unsafe.</p>
            <p>Examples include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>gunshots</li>
              <li>explosions</li>
              <li>screams</li>
              <li>crowd panic</li>
              <li>public disturbances</li>
            </ul>
            <p>AI models analyze the acoustic signature to determine potential threats.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">5.3 Incident Verification Network</h3>
            <p>To prevent misinformation, incidents undergo <strong>multi-layer verification</strong>.</p>
            <p>Verification sources include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>nearby Mapper confirmations</li>
              <li>AI evidence analysis</li>
              <li>reporter credibility score</li>
              <li>historical incident patterns</li>
            </ul>
            <p>Each report receives a <strong>credibility score</strong> determining whether it becomes a verified alert.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">5.4 Live Safety Map</h3>
            <p>The Safety Map provides a real-time view of urban risk signals.</p>
            <p>Map layers include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>verified incidents</li>
              <li>pending reports</li>
              <li>predictive risk zones</li>
              <li>nearby mapper activity</li>
            </ul>
            <p>The map enables users to make <strong>informed mobility decisions</strong>.</p>
          </div>
        </section>

        {/* 6. Artificial Intelligence Layer */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">6. Artificial Intelligence Layer</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa integrates <strong>multi-modal AI models</strong> capable of analyzing visual and acoustic data.</p>
            <p>The AI system performs several tasks.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Visual Analysis</h3>
            <p>Video evidence is processed to detect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>weapons</li>
              <li>fire or smoke</li>
              <li>aggressive crowd behavior</li>
              <li>vehicle collisions</li>
              <li>abnormal movement patterns</li>
            </ul>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Audio Analysis</h3>
            <p>Audio evidence is classified for signals such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>gunshots</li>
              <li>explosions</li>
              <li>glass breaking</li>
              <li>panic screams</li>
              <li>collision sounds</li>
            </ul>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Risk Prediction</h3>
            <p>The system analyzes historical data to predict <strong>high-risk zones</strong> based on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>incident frequency</li>
              <li>crowd patterns</li>
              <li>environmental signals</li>
              <li>time-of-day risk patterns</li>
            </ul>
            <p>These predictions help prevent incidents before escalation.</p>
          </div>
        </section>

        {/* 7. System Architecture */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">7. System Architecture</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>The Safety Map Africa architecture is composed of several layers.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Client Layer</h3>
            <p>Mobile applications used by Mapper nodes.</p>
            <p>Capabilities include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>incident capture</li>
              <li>evidence upload</li>
              <li>map visualization</li>
              <li>verification participation</li>
            </ul>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">API Layer</h3>
            <p>Handles communication between clients and backend services.</p>
            <p>Responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>authentication</li>
              <li>incident submission</li>
              <li>location updates</li>
              <li>media upload management</li>
            </ul>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Intelligence Layer</h3>
            <p>Processes incoming signals using AI models and verification engines.</p>
            <p>Responsibilities include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>media analysis</li>
              <li>anomaly detection</li>
              <li>credibility scoring</li>
              <li>incident classification</li>
            </ul>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Data Layer</h3>
            <p>Stores structured incident data and geospatial information.</p>
            <p>Core databases manage:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>incident records</li>
              <li>mapper nodes</li>
              <li>verification signals</li>
              <li>trust scores</li>
            </ul>
          </div>
        </section>

        {/* 8. Security and Privacy */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">8. Security and Privacy</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Protecting users is a fundamental principle of the platform.</p>
            <p>Several safeguards are implemented.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Anonymous Reporting</h3>
            <p>Public maps do not reveal the identity of reporters.</p>
            <p>Only the system retains secure identifiers.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Location Privacy</h3>
            <p>Reporter location is obfuscated to prevent targeting.</p>
            <p>Displayed coordinates represent a <strong>generalized zone</strong> rather than exact position.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Evidence Integrity</h3>
            <p>Uploaded evidence undergoes forensic validation to detect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>tampering</li>
              <li>synthetic media</li>
              <li>metadata inconsistencies</li>
            </ul>
            <p>This protects the network from misinformation.</p>
          </div>
        </section>

        {/* 9. Trust and Reputation System */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">9. Trust and Reputation System</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>To ensure reliability, Safety Map Africa uses a <strong>reputation model</strong>.</p>
            <p>Mapper trust scores increase when:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>reports are verified</li>
              <li>evidence quality is high</li>
              <li>verification participation is consistent</li>
            </ul>
            <p>Trust scores decrease when:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>false reports occur</li>
              <li>manipulation is detected</li>
            </ul>
            <p>Higher trust levels grant greater influence in incident verification.</p>
          </div>
        </section>

        {/* 10. Incentive Model */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">10. Incentive Model</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa introduces a <strong>tokenized incentive mechanism</strong> designed to reward verified contributions.</p>
            <p>Participants earn rewards when their data:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>contributes to incident verification</li>
              <li>provides high-quality evidence</li>
              <li>helps confirm nearby reports</li>
            </ul>
            <p>This incentive structure encourages responsible participation and sustained engagement.</p>
          </div>
        </section>

        {/* 11. Use Cases */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">11. Use Cases</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>The platform supports multiple real-world scenarios.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Community Safety</h3>
            <p>Residents gain real-time awareness of nearby threats.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Driver Safety</h3>
            <p>Drivers can avoid dangerous routes using predictive alerts.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Emergency Response</h3>
            <p>Emergency responders can access real-time incident intelligence.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Urban Planning</h3>
            <p>Aggregated safety data can inform city planning decisions.</p>
          </div>
        </section>

        {/* 12. Scalability */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">12. Scalability</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa is designed to scale across major urban environments.</p>
            <p>The architecture supports:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>tens of thousands of concurrent Mapper nodes</li>
              <li>real-time geospatial updates</li>
              <li>distributed media processing</li>
              <li>AI inference pipelines</li>
            </ul>
            <p>Cloud-based infrastructure ensures the system can expand as adoption grows.</p>
          </div>
        </section>

        {/* 13. Roadmap */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">13. Roadmap</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            
            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Phase 1 — MVP</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Mapper mobile application</li>
              <li>incident reporting</li>
              <li>live safety map</li>
              <li>AI classification pipeline</li>
            </ul>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Phase 2 — Verification Network</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>multi-node verification</li>
              <li>credibility scoring engine</li>
              <li>trust ranking system</li>
            </ul>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Phase 3 — Predictive Intelligence</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>risk heatmaps</li>
              <li>anomaly prediction models</li>
              <li>behavioral risk detection</li>
            </ul>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Phase 4 — Ecosystem Expansion</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>integration with emergency services</li>
              <li>cross-city safety networks</li>
              <li>advanced AI detection models</li>
            </ul>
          </div>
        </section>

        {/* 14. Ethical Considerations */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">14. Ethical Considerations</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa is designed with responsible technology principles.</p>
            <p>Key commitments include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>strict privacy protections</li>
              <li>transparent data governance</li>
              <li>safeguards against misuse</li>
              <li>community-driven accountability</li>
            </ul>
            <p>The platform does not aim to replace law enforcement but to <strong>augment community awareness and response capacity</strong>.</p>
          </div>
        </section>

        {/* 15. Conclusion */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">15. Conclusion</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa introduces a new paradigm for urban safety through <strong>collective intelligence and AI-powered situational awareness</strong>.</p>
            <p>By empowering communities to contribute verified safety signals, the platform transforms fragmented reporting into a <strong>coordinated intelligence network</strong>.</p>
            <p>Through scalable architecture, advanced verification systems, and privacy protections, Safety Map Africa aims to become a foundational infrastructure layer for <strong>next-generation urban safety across Africa</strong>.</p>
          </div>
        </section>

      </div>
    </div>
  );
};

export default Whitepaper;
