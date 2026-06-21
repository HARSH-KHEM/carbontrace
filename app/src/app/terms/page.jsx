import Link from "next/link";
import Footer from "@/components/Footer";

export default function TermsOfService() {
  return (
    <div className="bg-forest-gradient min-h-screen flex flex-col">
      <nav className="w-full z-50 bg-surface/30 backdrop-blur-xl border-b border-white/10 shadow-xl py-md">
        <div className="flex items-center gap-2 px-lg max-w-7xl mx-auto">
          <Link href="/" className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-3xl">eco</span>
            <span className="font-headline-md text-headline-md font-bold text-primary">CarbonTrace</span>
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-4xl mx-auto px-lg py-xl">
        <div className="glass-panel p-xl rounded-3xl">
          <h1 className="font-headline-lg text-4xl text-white mb-8">Terms of Service</h1>
          
          <div className="space-y-6 text-on-surface-variant font-body-md leading-relaxed">
            <p className="font-bold text-primary">
              Notice: CarbonTrace is a student hackathon project built for the Virtual Prompt Hackathon. It is provided "as is" without warranties.
            </p>
            
            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">1. Acceptance of Terms</h2>
              <p>By accessing or using CarbonTrace, you agree to these Terms of Service. If you do not agree to these terms, please do not use the application.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">2. Description of Service</h2>
              <p>CarbonTrace is a carbon footprint tracker and leaderboard built as a demonstration project. The platform uses AI to estimate carbon emissions based on user-provided descriptions of their daily activities. These estimates are approximate and for educational/gamification purposes only.</p>
            </section>

            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">3. User Responsibilities</h2>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You agree not to submit malicious code, abuse the AI calculator endpoint, or artificially inflate your leaderboard rank.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">4. Disclaimer of Warranties</h2>
              <p>
                CarbonTrace is a hackathon prototype. The service is provided on an "as is" and "as available" basis. We do not guarantee that the service will be uninterrupted, error-free, or permanently available. 
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">5. Contact Us</h2>
              <p>
                If you have any questions or feedback regarding these terms, please contact us at <a href="mailto:hackarsh08@gmail.com" className="text-primary hover:underline">hackarsh08@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
