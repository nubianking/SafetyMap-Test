import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Scale } from 'lucide-react';

const LegalNotice: React.FC = () => {
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
          <Scale className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Legal Notice</span>
        </div>
      </div>

      {/* Document Container */}
      <div className="max-w-3xl mx-auto px-6 pt-20 space-y-16">
        
        {/* Title Section */}
        <div className="space-y-6 border-b border-zinc-200 pb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-black font-sans">Legal Notice</h1>
          <h2 className="text-2xl md:text-3xl font-medium text-zinc-600">Safety Map Africa</h2>
          <div className="pt-4 space-y-1">
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-sans">Effective Date: 3/5/2026</p>
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-sans">Last Updated: 3/5/2026</p>
          </div>
        </div>

        {/* 1. Introduction */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">1. Introduction</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Welcome to <strong>Safety Map Africa</strong>. This Legal Notice governs the use of the Safety Map Africa mobile application, website, and all related services (collectively referred to as the <strong>“Platform”</strong>).</p>
            <p>By accessing or using the Platform, users agree to comply with and be legally bound by the terms outlined in this Legal Notice. If you do not agree with these terms, you should discontinue use of the Platform immediately.</p>
            <p>Safety Map Africa reserves the right to update or modify this Legal Notice at any time. Continued use of the Platform following updates constitutes acceptance of the revised terms.</p>
          </div>
        </section>

        {/* 2. Nature of the Platform */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">2. Nature of the Platform</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa is a <strong>community-driven situational awareness platform</strong> designed to allow users to report, verify, and view safety-related incidents within their geographic area.</p>
            <p>The Platform enables users to submit reports including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>images</li>
              <li>videos</li>
              <li>audio recordings</li>
              <li>incident descriptions</li>
            </ul>
            <p>These submissions may be analyzed using automated technologies to assist in classifying incidents and improving situational awareness.</p>
            <p>The Platform is intended to support <strong>community awareness and information sharing</strong> and does <strong>not operate as a law enforcement agency, emergency service provider, or public safety authority</strong>.</p>
          </div>
        </section>

        {/* 3. No Emergency Services */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">3. No Emergency Services</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa <strong>is not an emergency response service</strong>.</p>
            <p>Users should <strong>not rely on the Platform as a substitute for contacting emergency authorities</strong> in urgent situations.</p>
            <p>In the event of an emergency, users must contact the appropriate local emergency services or law enforcement agencies directly.</p>
            <p>Safety Map Africa does not guarantee that reported incidents will be reviewed, verified, or responded to in real time.</p>
          </div>
        </section>

        {/* 4. User Responsibilities */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">4. User Responsibilities</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Users of the Platform agree to use the service responsibly and lawfully.</p>
            <p>Users must not:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>submit false or misleading incident reports</li>
              <li>upload manipulated or fabricated media</li>
              <li>violate the privacy or rights of others</li>
              <li>use the Platform to harass, threaten, or harm individuals</li>
              <li>interfere with the operation or security of the Platform</li>
            </ul>
            <p>Users are solely responsible for the accuracy and legality of any content they submit.</p>
            <p>Safety Map Africa reserves the right to remove content and suspend accounts that violate these rules.</p>
          </div>
        </section>

        {/* 5. User-Generated Content */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">5. User-Generated Content</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>All incident reports, media uploads, and other submissions provided by users constitute <strong>user-generated content</strong>.</p>
            <p>By submitting content to the Platform, users grant Safety Map Africa a <strong>non-exclusive, worldwide, royalty-free license</strong> to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>store the content</li>
              <li>analyze the content using automated technologies</li>
              <li>display verified incidents on the Platform</li>
              <li>use anonymized data to improve safety intelligence systems</li>
            </ul>
            <p>Users retain ownership of their submitted content but acknowledge that the Platform may process the content for operational purposes.</p>
          </div>
        </section>

        {/* 6. Content Verification and Accuracy */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">6. Content Verification and Accuracy</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa uses a combination of:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>automated analysis systems</li>
              <li>user verification</li>
              <li>credibility scoring mechanisms</li>
            </ul>
            <p>to assess the reliability of incident reports.</p>
            <p>However, the Platform <strong>cannot guarantee the accuracy, completeness, or reliability of all reported incidents</strong>.</p>
            <p>Information presented on the Platform should be treated as <strong>informational and advisory only</strong>.</p>
          </div>
        </section>

        {/* 7. Privacy and Data Protection */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">7. Privacy and Data Protection</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa is committed to protecting user privacy.</p>
            <p>Information collected through the Platform is processed in accordance with the <strong>Safety Map Africa Privacy Policy</strong>.</p>
            <p>The Platform implements safeguards such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>anonymized reporting</li>
              <li>location obfuscation</li>
              <li>secure data storage</li>
            </ul>
            <p>Users are encouraged to review the Privacy Policy to understand how personal information is handled.</p>
          </div>
        </section>

        {/* 8. Limitation of Liability */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">8. Limitation of Liability</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>To the fullest extent permitted by law, Safety Map Africa and its operators shall <strong>not be liable</strong> for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>inaccuracies in incident reports</li>
              <li>user-generated content</li>
              <li>delays in data processing</li>
              <li>misuse of information provided on the Platform</li>
              <li>any damages resulting from reliance on the Platform’s information</li>
            </ul>
            <p>Users assume full responsibility for decisions made based on information obtained through the Platform.</p>
          </div>
        </section>

        {/* 9. Intellectual Property */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">9. Intellectual Property</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>All platform elements including but not limited to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>software</li>
              <li>design</li>
              <li>maps</li>
              <li>algorithms</li>
              <li>logos</li>
              <li>trademarks</li>
            </ul>
            <p>are the intellectual property of Safety Map Africa or its licensors.</p>
            <p>Users may not reproduce, distribute, or reverse engineer any part of the Platform without prior written authorization.</p>
          </div>
        </section>

        {/* 10. Account Suspension and Enforcement */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">10. Account Suspension and Enforcement</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa reserves the right to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>suspend or terminate accounts</li>
              <li>remove content</li>
              <li>restrict access to services</li>
            </ul>
            <p>when users violate platform policies, engage in abusive behavior, or compromise system integrity.</p>
            <p>Such actions may be taken without prior notice where necessary to protect the platform and its users.</p>
          </div>
        </section>

        {/* 11. Compliance With Laws */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">11. Compliance With Laws</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Users must comply with all applicable laws and regulations when using the Platform, including laws relating to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>privacy</li>
              <li>surveillance</li>
              <li>recording of individuals</li>
              <li>data protection</li>
              <li>public safety reporting</li>
            </ul>
            <p>Safety Map Africa does not authorize users to violate local laws when collecting or sharing incident information.</p>
          </div>
        </section>

        {/* 12. Third-Party Services */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">12. Third-Party Services</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>The Platform may rely on third-party infrastructure and services such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>cloud hosting</li>
              <li>mapping services</li>
              <li>analytics providers</li>
            </ul>
            <p>Safety Map Africa is not responsible for disruptions or issues caused by third-party services.</p>
          </div>
        </section>

        {/* 13. Modifications to the Platform */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">13. Modifications to the Platform</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa may update, modify, or discontinue certain features of the Platform at its discretion.</p>
            <p>Such changes may occur without prior notice and are part of the ongoing development and improvement of the service.</p>
          </div>
        </section>

        {/* 14. Governing Law */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">14. Governing Law</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>This Legal Notice shall be governed by and interpreted in accordance with the applicable laws of the jurisdiction in which Safety Map Africa operates, unless otherwise required by applicable international regulations.</p>
            <p>Any disputes arising from the use of the Platform shall be resolved in accordance with the applicable legal framework.</p>
          </div>
        </section>

        {/* 15. Contact Information */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">15. Contact Information</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>For legal inquiries or requests relating to this Legal Notice, users may contact:</p>
            <p><strong>Safety Map Africa Legal Department</strong></p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: legal@safetymap.africa</li>
              <li>Website: safetymap.africa</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
};

export default LegalNotice;
