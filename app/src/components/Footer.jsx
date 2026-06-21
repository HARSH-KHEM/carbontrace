import Link from "next/link";

export default function Footer({ className = "", showSocial = false }) {
  return (
    <footer
      className={`w-full mt-auto bg-surface-container-highest/50 backdrop-blur-md border-t border-white/5 ${className}`}
    >
      <div className="flex flex-col md:flex-row justify-between items-center px-lg py-xl max-w-7xl mx-auto gap-8">
        <div className="flex flex-col gap-4 items-center md:items-start">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-2xl">
              eco
            </span>
            <span className="font-headline-md text-headline-md font-bold text-primary">
              CarbonTrace
            </span>
          </div>
          <p className="text-on-surface-variant text-label-sm font-label-sm text-center md:text-left">
            © 2026 CarbonTrace. All rights reserved.
          </p>
          <p className="text-on-surface-variant/50 text-[10px] font-label-sm text-center md:text-left mt-1">
            Built by Harsh, Software Engineering @ DTU, for Virtual Prompt Hackathon
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          <Link
            href="/privacy"
            className="text-on-surface-variant hover:text-primary transition-all font-label-sm text-label-sm underline"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="text-on-surface-variant hover:text-primary transition-all font-label-sm text-label-sm underline"
          >
            Terms of Service
          </Link>
          <Link
            href="/#platform"
            className="text-on-surface-variant hover:text-primary transition-all font-label-sm text-label-sm underline"
          >
            Impact Report
          </Link>
        </div>
        {showSocial && (
          <div className="flex gap-4">
            <Link
              href="#"
              className="w-10 h-10 rounded-full flex items-center justify-center glass-panel text-white hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">public</span>
            </Link>
            <Link
              href="#"
              className="w-10 h-10 rounded-full flex items-center justify-center glass-panel text-white hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">forum</span>
            </Link>
          </div>
        )}
      </div>
    </footer>
  );
}
