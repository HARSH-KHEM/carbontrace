import Link from "next/link";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
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
          <h1 className="font-headline-lg text-4xl text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-on-surface-variant font-body-md leading-relaxed">
            <p className="font-bold text-primary">
              Notice: CarbonTrace is a student hackathon project built for the Virtual Prompt Hackathon. It is not a commercial product.
            </p>
            
            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">1. Data We Collect</h2>
              <p>To power the core features of the CarbonTrace app, we collect the following information:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li><strong>Account Data:</strong> Your email address, securely handled via Supabase Authentication.</li>
                <li><strong>Profile Data:</strong> Display name, bio, and avatar if you choose to provide them.</li>
                <li><strong>Activity Logs:</strong> The raw text descriptions of your daily activities (transport, food, energy, shopping) and the calculated CO₂ estimates.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">2. How We Use Your Data</h2>
              <p>We use this data strictly to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-1">
                <li>Provide you with a personal dashboard and carbon footprint analytics.</li>
                <li>Calculate your Impact Points and streak statistics.</li>
                <li>Display your rank and aggregate statistics on the global community leaderboard.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">3. Data Sharing & Security</h2>
              <p>
                <strong>We do not sell, rent, or share your personal data with third parties.</strong> All data is stored in a secure Supabase database with Row Level Security (RLS) policies enforced. The leaderboard aggregates non-sensitive profile metrics (scores and ranks) for public display, but your private activity logs remain visible only to you.
              </p>
            </section>

            <section>
              <h2 className="text-white text-xl font-headline-md mb-2">4. Contact Us</h2>
              <p>
                If you have any questions or wish to have your data deleted, please contact us at <a href="mailto:hackarsh08@gmail.com" className="text-primary hover:underline">hackarsh08@gmail.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
