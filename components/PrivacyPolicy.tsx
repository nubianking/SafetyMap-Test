import React, { useEffect } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';

interface PrivacyPolicyProps {
  onBack: () => void;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfc] text-[#1a1a1a] selection:bg-blue-200 font-serif pb-32">
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 bg-[#fcfcfc]/90 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex justify-between items-center font-sans">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-zinc-600 hover:text-black transition-colors font-bold text-sm uppercase tracking-widest"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to App
        </button>
        <div className="flex items-center gap-2 text-zinc-400">
          <Shield className="w-4 h-4" />
          <span className="text-xs font-bold uppercase tracking-widest">Privacy Policy</span>
        </div>
      </div>

      {/* Document Container */}
      <div className="max-w-3xl mx-auto px-6 pt-20 space-y-16">
        
        {/* Title Section */}
        <div className="space-y-6 border-b border-zinc-200 pb-12">
          <h1 className="text-5xl md:text-6xl font-black tracking-tight text-black font-sans">Privacy Policy</h1>
          <h2 className="text-2xl md:text-3xl font-medium text-zinc-600">Safety Map Africa</h2>
          <div className="pt-4 space-y-1">
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-sans">Effective Date: 03-04-2026</p>
            <p className="text-sm font-bold uppercase tracking-widest text-zinc-400 font-sans">Last Updated: 03-04-2026</p>
          </div>
        </div>

        {/* 1. Introduction */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">1. Introduction</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa (“we”, “our”, “us”) is committed to protecting the privacy and security of our users. This Privacy Policy explains how Safety Map Africa collects, uses, processes, stores, and protects personal information when users interact with the <strong>Safety Map Africa mobile application, website, and related services</strong>.</p>
            <p>By using the Safety Map Africa platform, you agree to the collection and use of information in accordance with this Privacy Policy.</p>
          </div>
        </section>

        {/* 2. Information We Collect */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">2. Information We Collect</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>To operate effectively, Safety Map Africa collects certain categories of information.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">2.1 Account Information</h3>
            <p>When users register for the platform, we may collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name or username</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Account credentials</li>
              <li>Device identification information</li>
            </ul>
            <p>This information helps us manage user accounts and secure access to the platform.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">2.2 Location Information</h3>
            <p>Safety Map Africa relies on location data to provide real-time safety intelligence.</p>
            <p>We may collect:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>GPS coordinates</li>
              <li>device movement and direction</li>
              <li>approximate geographic location</li>
              <li>time-based location signals</li>
            </ul>
            <p>Location data is used to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>detect nearby incidents</li>
              <li>provide safety alerts</li>
              <li>verify incident reports</li>
              <li>improve safety mapping accuracy</li>
            </ul>
            <p>Location sharing can be disabled in device settings, but some platform features may become unavailable.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">2.3 Incident Evidence</h3>
            <p>When users report incidents, they may upload:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>video recordings</li>
              <li>audio recordings</li>
              <li>photos</li>
              <li>incident descriptions</li>
            </ul>
            <p>These submissions may include embedded metadata such as:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>timestamp</li>
              <li>device information</li>
              <li>approximate location</li>
            </ul>
            <p>Evidence is used for incident verification and safety analysis.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">2.4 Device Information</h3>
            <p>To maintain system integrity and security, we may collect device-related information including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>device model</li>
              <li>operating system</li>
              <li>device identifiers</li>
              <li>application version</li>
              <li>crash logs and diagnostic data</li>
            </ul>
            <p>This information helps us improve performance and detect potential misuse.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">2.5 Usage Data</h3>
            <p>We may collect anonymous usage information including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>app interaction events</li>
              <li>map activity</li>
              <li>feature usage</li>
              <li>system performance metrics</li>
            </ul>
            <p>This data helps us improve the functionality and reliability of the platform.</p>
          </div>
        </section>

        {/* 3. How We Use Your Information */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">3. How We Use Your Information</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa uses collected information to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>enable real-time incident reporting</li>
              <li>verify safety alerts and reports</li>
              <li>generate safety insights and risk alerts</li>
              <li>improve platform functionality and reliability</li>
              <li>prevent fraud and abuse</li>
              <li>maintain system security</li>
              <li>support research and safety analytics</li>
            </ul>
            <p>We only process information for legitimate operational purposes.</p>
          </div>
        </section>

        {/* 4. Incident Evidence Processing */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">4. Incident Evidence Processing</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Evidence submitted to the platform may be analyzed using automated technologies, including artificial intelligence systems, to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>detect hazards</li>
              <li>classify incidents</li>
              <li>assess risk levels</li>
              <li>verify authenticity of media submissions</li>
            </ul>
            <p>These systems help maintain the accuracy and reliability of the Safety Map network.</p>
          </div>
        </section>

        {/* 5. Data Sharing */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">5. Data Sharing</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa does <strong>not sell personal data</strong> to third parties.</p>
            <p>However, information may be shared in limited circumstances.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">5.1 Public Safety Alerts</h3>
            <p>Verified incidents may appear on the Safety Map for community awareness. These alerts do not reveal the identity of the reporting user.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">5.2 Service Providers</h3>
            <p>We may work with trusted service providers who support:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>cloud infrastructure</li>
              <li>data storage</li>
              <li>analytics</li>
              <li>security monitoring</li>
            </ul>
            <p>These providers are required to protect data in accordance with strict confidentiality agreements.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">5.3 Legal Requirements</h3>
            <p>We may disclose information when required by law, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>compliance with legal obligations</li>
              <li>protection of user safety</li>
              <li>investigation of unlawful activity</li>
            </ul>
          </div>
        </section>

        {/* 6. User Privacy Protections */}
        <section className="space-y-8">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">6. User Privacy Protections</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa implements several safeguards to protect users.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Anonymous Reporting</h3>
            <p>Incident reporters are not publicly identified on the Safety Map.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Location Obfuscation</h3>
            <p>The system may generalize location information to prevent precise identification of reporting users.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Data Encryption</h3>
            <p>Sensitive data is protected using modern encryption protocols during transmission and storage.</p>

            <h3 className="text-2xl font-bold text-black mt-8 font-sans">Access Control</h3>
            <p>Only authorized systems and personnel can access sensitive data.</p>
          </div>
        </section>

        {/* 7. Data Retention */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">7. Data Retention</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa retains data only as long as necessary to support platform operations.</p>
            <p>Retention periods may vary depending on:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>incident investigations</li>
              <li>system security requirements</li>
              <li>legal obligations</li>
            </ul>
            <p>Data that is no longer required may be securely deleted or anonymized.</p>
          </div>
        </section>

        {/* 8. User Rights */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">8. User Rights</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Users may have certain rights regarding their personal information depending on applicable laws.</p>
            <p>These rights may include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>requesting access to personal data</li>
              <li>requesting correction of inaccurate information</li>
              <li>requesting deletion of account data</li>
              <li>withdrawing consent for certain processing activities</li>
            </ul>
            <p>Requests can be submitted through the platform’s support channels.</p>
          </div>
        </section>

        {/* 9. Security Measures */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">9. Security Measures</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa employs multiple security practices designed to protect user information.</p>
            <p>These include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>encrypted data transmission</li>
              <li>secure cloud infrastructure</li>
              <li>authentication and authorization controls</li>
              <li>monitoring for unauthorized activity</li>
              <li>regular system updates and security reviews</li>
            </ul>
            <p>While we take reasonable steps to protect data, no system can guarantee absolute security.</p>
          </div>
        </section>

        {/* 10. Children's Privacy */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">10. Children's Privacy</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa is not intended for individuals under the age of 18.</p>
            <p>We do not knowingly collect personal information from minors. If such information is discovered, it will be removed promptly.</p>
          </div>
        </section>

        {/* 11. International Data Processing */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">11. International Data Processing</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>Safety Map Africa may process and store data on servers located in multiple regions depending on infrastructure providers.</p>
            <p>By using the platform, users acknowledge that data may be transferred and processed outside their country of residence.</p>
          </div>
        </section>

        {/* 12. Changes to This Privacy Policy */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">12. Changes to This Privacy Policy</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>We may update this Privacy Policy periodically to reflect changes in technology, legal requirements, or platform functionality.</p>
            <p>Users will be notified of significant updates through the platform or website.</p>
            <p>Continued use of the platform indicates acceptance of the updated policy.</p>
          </div>
        </section>

        {/* 13. Contact Information */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-black font-sans">13. Contact Information</h2>
          <div className="space-y-4 text-lg leading-relaxed text-zinc-700">
            <p>For questions, concerns, or privacy-related requests, users may contact Safety Map Africa through:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Email: privacy@safetymap.africa</li>
              <li>Support Portal: support.safetymap.africa</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
};

export default PrivacyPolicy;
