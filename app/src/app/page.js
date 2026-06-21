"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import { fetchLeaderboard } from "@/lib/api";

function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/30 backdrop-blur-xl border-b border-white/10 shadow-xl">
      <div className="flex justify-between items-center px-lg py-md max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-3xl">eco</span>
          <span className="font-headline-md text-headline-md font-bold text-primary">CarbonTrace</span>
        </div>
        <div className="hidden md:flex gap-8 items-center">
          <Link href="#platform" className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-md">Platform</Link>
          <Link href="#solutions" className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-md">Solutions</Link>
          <Link href="#resources" className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-md">Resources</Link>
          <Link href="#contact" className="text-on-surface-variant hover:text-primary transition-colors duration-300 font-label-md">Contact</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden sm:block text-on-surface-variant hover:text-primary transition-colors font-label-md">Log In</Link>
          <Link href="/onboarding">
            <button className="bg-primary-container text-on-primary-container px-6 py-2 rounded-full font-label-md font-bold primary-glow scale-95 active:scale-90 transition-transform">
              Get Started
            </button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  const [totalSaved, setTotalSaved] = useState(0);

  useEffect(() => {
    async function getStats() {
      const data = await fetchLeaderboard();
      if (data && data.allUsersFlat) {
        const sum = data.allUsersFlat.reduce((acc, u) => acc + (u.rawCo2Saved || 0), 0);
        setTotalSaved(Math.round(sum));
      }
    }
    getStats();
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img
          alt="Crisp forest canopy"
          className="w-full h-full object-cover"
          src="https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1920&q=80"
        />
        <div className="absolute inset-0 jungle-overlay"></div>
      </div>
      <div className="relative z-10 max-w-5xl mx-auto px-lg text-center">
        {totalSaved > 0 && (
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse"></span>
            <span className="font-label-sm text-soft-green">Community Impact: {totalSaved} kg CO₂ Saved</span>
          </div>
        )}
        <h1 className="font-display-lg text-display-lg md:text-[80px] md:leading-[1.1] text-white mb-6 tracking-tight drop-shadow-lg">
          Track. Reduce. <span className="text-neon-green drop-shadow-md">Impact.</span>
        </h1>
        <p className="font-body-lg text-body-lg text-white max-w-2xl mx-auto mb-10 drop-shadow-md">
          The high-fidelity carbon monitoring platform for the next generation of eco-conscious leaders. Gain precision insights into your environmental footprint with real-time tracking.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link href="/onboarding">
            <button className="w-full sm:w-auto bg-neon-green text-surface px-8 py-4 rounded-xl font-headline-md font-bold primary-glow transition-all hover:-translate-y-1">
              Start Tracking Now
            </button>
          </Link>
        </div>
      </div>
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-50">
        <span className="material-symbols-outlined text-white text-3xl">keyboard_double_arrow_down</span>
      </div>
    </section>
  );
}

function PlatformSection() {
  return (
    <section id="platform" className="relative py-24 px-lg scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto z-10">
        <div className="mb-16 text-center">
          <h2 className="font-headline-lg text-headline-lg text-white mb-4">How Tracking & Ranking Works</h2>
          <div className="h-1 w-24 bg-neon-green rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)] mx-auto"></div>
          <p className="text-on-surface-variant mt-6 max-w-2xl mx-auto">
            Our platform gamifies your carbon footprint reduction. Every positive choice you make earns you points and boosts your global rank.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-neon-green/10 blur-[50px] rounded-full group-hover:bg-neon-green/20 transition-all"></div>
            <span className="material-symbols-outlined text-neon-green text-4xl mb-4">chat</span>
            <h3 className="font-headline-md text-white mb-2">1. Log via AI Calculator</h3>
            <p className="text-on-surface-variant">
              Simply chat with EcoBot about your day—your transport, food, energy, and shopping. The AI automatically estimates your emissions and compares them against high-emission baselines.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-neon-green/10 blur-[50px] rounded-full group-hover:bg-neon-green/20 transition-all"></div>
            <span className="material-symbols-outlined text-neon-green text-4xl mb-4">military_tech</span>
            <h3 className="font-headline-md text-white mb-2">2. Earn Impact Points</h3>
            <p className="text-on-surface-variant">
              You earn <strong>10 points</strong> for every kg of CO₂ saved, <strong>+5 points</strong> just for logging an activity, and <strong>+3 points</strong> for every consecutive day in your streak.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-neon-green/10 blur-[50px] rounded-full group-hover:bg-neon-green/20 transition-all"></div>
            <span className="material-symbols-outlined text-neon-green text-4xl mb-4">leaderboard</span>
            <h3 className="font-headline-md text-white mb-2">3. Climb the Leaderboard</h3>
            <p className="text-on-surface-variant">
              Compete globally! Your points determine your rank. In the event of a tie, the user who joined the platform earlier breaks the tie. All your past entries remain clickable and transparent.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolutionsSection() {
  return (
    <section id="solutions" className="relative py-24 px-lg bg-surface-container/30 border-y border-white/5 scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/img2.jpg" alt="Forest background" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface pointer-events-none"></div>
      </div>
      <div className="relative max-w-7xl mx-auto z-10">
        <div className="mb-16">
          <h2 className="font-headline-lg text-headline-lg text-white mb-4">Who is CarbonTrace For?</h2>
          <div className="h-1 w-24 bg-neon-green rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)]"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h3 className="font-headline-md text-white mb-4">Individuals & Communities</h3>
            <p className="text-on-surface-variant mb-6 text-lg leading-relaxed">
              CarbonTrace is designed for individuals tracking their personal habits, students running friendly competitions, and communities wanting visibility into their daily carbon footprint.
            </p>
            <p className="text-on-surface-variant text-lg leading-relaxed">
              We built this as a lightweight, gamified tool to raise awareness. No corporate jargon, no enterprise ERP plugins—just you, your choices, and the tangible impact you can make every day.
            </p>
          </div>
          <div className="glass-panel p-8 flex items-center justify-center min-h-[300px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-90 transition-opacity duration-500 group-hover:opacity-100 group-hover:scale-105 transform"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-surface/40 to-transparent"></div>
            <div className="relative z-10 text-center">
              <span className="material-symbols-outlined text-neon-green text-6xl mb-4 drop-shadow-md">groups</span>
              <p className="font-headline-md text-white drop-shadow-lg font-bold">Join the Community</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ResourcesSection() {
  return (
    <section id="resources" className="relative py-24 px-lg scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1920&q=80')] bg-cover bg-center opacity-80 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-surface pointer-events-none"></div>
      <div className="relative max-w-7xl mx-auto z-10">
        <div className="mb-16 text-center">
          <h2 className="font-headline-lg text-headline-lg text-white mb-4">Helpful Resources</h2>
          <div className="h-1 w-24 bg-neon-green rounded-full shadow-[0_0_10px_rgba(74,222,128,0.5)] mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a href="https://www3.epa.gov/carbon-footprint-calculator/" target="_blank" rel="noopener noreferrer" className="glass-panel glass-panel-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neon-green group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">public</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-white">EPA Calculator</h4>
              <p className="text-xs text-on-surface-variant">Official U.S. EPA tool</p>
            </div>
          </a>
          <a href="https://www.ipcc.ch/" target="_blank" rel="noopener noreferrer" className="glass-panel glass-panel-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neon-green group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">menu_book</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-white">IPCC Reports</h4>
              <p className="text-xs text-on-surface-variant">Climate change data</p>
            </div>
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="glass-panel glass-panel-hover p-6 flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-neon-green group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">code</span>
            </div>
            <div>
              <h4 className="font-headline-sm text-white">GitHub Repo</h4>
              <p className="text-xs text-on-surface-variant">View the source code</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  return (
    <section id="contact" className="relative py-24 px-lg scroll-mt-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <img src="/img1.jpg" alt="Get in Touch background" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent pointer-events-none"></div>
      </div>
      <div className="relative max-w-3xl mx-auto text-center z-10">
        <span className="material-symbols-outlined text-neon-green text-5xl mb-6 drop-shadow-md">call</span>
        <h2 className="font-headline-lg text-headline-lg text-white mb-6 drop-shadow-lg">Get In Touch</h2>
        <p className="text-white text-lg mb-8 drop-shadow-md font-bold">
          Have questions about the platform or want to report an issue? Reach out to us directly.
        </p>
        <div className="inline-flex flex-col sm:flex-row items-center gap-6 glass-panel px-8 py-6 rounded-2xl">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neon-green">phone_iphone</span>
            <span className="text-white font-headline-sm font-mono">+91 9315839562</span>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/20"></div>
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-neon-green">mail</span>
            <a href="mailto:hackarsh08@gmail.com" className="text-white font-headline-sm hover:text-neon-green transition-colors">
              hackarsh08@gmail.com
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function LandingPage() {
  const panelsRef = useRef(null);

  useEffect(() => {
    // Mouse follow radial gradient effect on glass panels
    const handleMouseMove = (e) => {
      const panels = document.querySelectorAll(".glass-panel");
      panels.forEach((panel) => {
        const rect = panel.getBoundingClientRect();
        const panelX = (e.clientX - rect.left) / rect.width;
        const panelY = (e.clientY - rect.top) / rect.height;

        if (panelX > 0 && panelX < 1 && panelY > 0 && panelY < 1) {
          panel.style.background = `radial-gradient(circle at ${panelX * 100}% ${panelY * 100}%, rgba(74, 222, 128, 0.08) 0%, rgba(255, 255, 255, 0.06) 100%)`;
        } else {
          panel.style.background = "rgba(255, 255, 255, 0.06)";
        }
      });
    };

    document.addEventListener("mousemove", handleMouseMove);

    // Scroll reveal
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("opacity-100");
          entry.target.classList.remove("opacity-0", "translate-y-8");
        }
      });
    });

    document.querySelectorAll(".glass-panel").forEach((panel) => {
      panel.classList.add("transition-all", "duration-1000", "opacity-0", "translate-y-8");
      observer.observe(panel);
    });

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={panelsRef} className="overflow-x-hidden scroll-smooth">
      <Navbar />
      <HeroSection />
      <PlatformSection />
      <SolutionsSection />
      <ResourcesSection />
      <ContactSection />
      <Footer showSocial />
    </div>
  );
}
