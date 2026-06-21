"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import UserAvatar from "@/components/UserAvatar";
import { fetchLeaderboard, getUserId } from "@/lib/api";

function StatCard({ label, children }) {
  return (
    <div className="glass-panel p-lg rounded-xl col-span-1">
      <p className="font-label-sm text-label-sm text-secondary font-mono mb-sm">{label}</p>
      {children}
    </div>
  );
}

function LeaderboardRow({ user, isCurrentUser = false }) {
  const router = useRouter();

  if (isCurrentUser) {
    return (
      <div 
        onClick={() => router.push(`/profile/${user.id}`)}
        className="grid grid-cols-12 px-lg py-lg bg-primary/10 backdrop-blur-md items-center user-glow relative z-10 scale-[1.01] rounded-xl my-2 cursor-pointer hover:bg-primary/20 transition-all"
      >
        <div className="col-span-1 font-headline-md text-headline-md text-primary font-bold">{user.rank}</div>
        <div className="col-span-5 md:col-span-6 flex items-center gap-md">
          <div className="relative">
            {user.avatar ? (
              <div className="w-12 h-12 rounded-full border-2 border-primary p-0.5">
                <img alt="User" className="w-full h-full rounded-full bg-surface-variant object-cover" src={user.avatar} />
              </div>
            ) : (
              <UserAvatar name={user.name} className="w-12 h-12 text-xl" />
            )}
            <div className="absolute -bottom-1 -right-1 bg-primary w-4 h-4 rounded-full border-2 border-surface flex items-center justify-center">
              <span className="material-symbols-outlined text-[10px] text-surface font-bold">check</span>
            </div>
          </div>
          <div>
            <p className="font-body-lg text-body-lg text-on-surface font-bold">{user.name} (You)</p>
            <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest">{user.title}</span>
          </div>
        </div>
        <div className="col-span-3 md:col-span-3 text-right font-label-md text-label-md text-primary font-bold">{user.saved}</div>
        <div className="col-span-3 md:col-span-2 text-right">
          <span className="bg-primary text-surface px-md py-xs rounded-lg font-mono text-label-md font-bold">{user.points}</span>
        </div>
      </div>
    );
  }

  const isTopThree = user.rank <= 3;

  return (
    <div
      onClick={() => router.push(`/profile/${user.id}`)}
      className={`grid grid-cols-12 px-lg py-lg items-center hover:bg-white/10 cursor-pointer transition-colors group ${
        user.glowClass || ""
      } ${isTopThree && user.rank === 1 ? "glass-panel border-none" : "bg-transparent"} ${!isTopThree ? 'border-b border-white/5 last:border-none rounded-xl' : 'rounded-xl'}`}
    >
      <div className="col-span-1 font-headline-md text-headline-md text-primary font-bold">{user.rank}</div>
      <div className="col-span-5 md:col-span-6 flex items-center gap-md">
        {user.avatar ? (
          <div className={`${user.isLarge ? "w-12 h-12" : "w-10 h-10"} rounded-full ${user.borderColor || "border-white/10"} border-2 p-0.5`}>
            <img alt="User" className="w-full h-full rounded-full bg-surface-variant object-cover" src={user.avatar} />
          </div>
        ) : (
          <UserAvatar name={user.name} className={`${user.isLarge ? "w-12 h-12 text-xl" : "w-10 h-10 text-lg"} border border-white/10`} />
        )}
        <div>
          <p className={`${user.isLarge ? "font-body-lg text-body-lg font-semibold" : "font-body-md text-body-md"} text-on-surface`}>
            {user.name}
          </p>
          <span className={`font-label-sm text-label-sm ${user.rank <= 3 ? "text-secondary uppercase tracking-tighter" : "text-on-surface-variant"}`}>
            {user.title}
          </span>
        </div>
      </div>
      <div className="col-span-3 md:col-span-3 text-right font-label-md text-label-md text-on-surface">{user.saved}</div>
      <div className="col-span-3 md:col-span-2 text-right">
        {user.rank === 1 ? (
          <span className="bg-primary/20 text-primary px-sm py-xs rounded-lg font-mono text-label-md">{user.points}</span>
        ) : (
          <span className="font-mono text-label-md text-on-surface-variant">{user.points}</span>
        )}
      </div>
    </div>
  );
}

function HowRankingWorks({ isOpen, onToggle }) {
  return (
    <div className="mb-lg">
      <button
        onClick={onToggle}
        className="flex items-center gap-sm text-on-surface-variant hover:text-primary transition-colors group"
        id="ranking-info-toggle"
      >
        <span className="material-symbols-outlined text-[18px] group-hover:text-primary transition-colors">info</span>
        <span className="font-label-md text-label-md">How Ranking Works</span>
        <span
          className={`material-symbols-outlined text-[18px] transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </button>

      <div
        className={`overflow-hidden transition-all duration-400 ease-in-out ${
          isOpen ? "max-h-[600px] opacity-100 mt-md" : "max-h-0 opacity-0"
        }`}
      >
        <div className="glass-card rounded-2xl p-lg border border-white/10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {/* Points */}
            <div className="space-y-sm">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">stars</span>
                <h3 className="font-headline-md text-[16px] text-on-surface font-semibold">Earning Points</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center bg-white/5 rounded-lg px-md py-sm">
                  <span className="font-body-md text-[14px] text-on-surface-variant">CO₂ Saved</span>
                  <span className="font-label-md text-label-md text-primary font-bold">×10 pts/kg</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-lg px-md py-sm">
                  <span className="font-body-md text-[14px] text-on-surface-variant">Activity Logged</span>
                  <span className="font-label-md text-label-md text-secondary font-bold">+5 pts</span>
                </div>
                <div className="flex justify-between items-center bg-white/5 rounded-lg px-md py-sm">
                  <span className="font-body-md text-[14px] text-on-surface-variant">Streak Day</span>
                  <span className="font-label-md text-label-md text-secondary font-bold">+3 pts</span>
                </div>
              </div>
            </div>

            {/* How CO2 Saved is Computed */}
            <div className="space-y-sm">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">eco</span>
                <h3 className="font-headline-md text-[16px] text-on-surface font-semibold">CO₂ Saved (kg)</h3>
              </div>
              <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                Each activity you log is compared against a high-emission baseline for
                that category (e.g. driving vs biking, meat vs plant-based meals).
              </p>
              <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                The difference is your <span className="text-primary font-semibold">CO₂ saved</span> —
                the more eco-friendly your choices, the higher your savings.
              </p>
            </div>

            {/* Tie-Breaking */}
            <div className="space-y-sm">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">balance</span>
                <h3 className="font-headline-md text-[16px] text-on-surface font-semibold">Tie-Breaking</h3>
              </div>
              <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                If two users have the same total points, the one who registered
                first ranks higher — rewarding early adopters.
              </p>
            </div>

            {/* Updates */}
            <div className="space-y-sm">
              <div className="flex items-center gap-sm mb-sm">
                <span className="material-symbols-outlined text-primary text-[20px]">update</span>
                <h3 className="font-headline-md text-[16px] text-on-surface font-semibold">Real-Time Updates</h3>
              </div>
              <p className="font-body-md text-[14px] text-on-surface-variant leading-relaxed">
                Points and rankings update <span className="text-primary font-semibold">immediately</span> after
                each activity you log. No waiting — your impact is reflected in real time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ForestDust() {
  useEffect(() => {
    const container = document.getElementById("forest-dust");
    if (!container) return;

    const particleCount = 20;
    const particles = [];

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      const size = Math.random() * 4 + 1;
      particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        background: #4ade80;
        border-radius: 50%;
        opacity: ${Math.random() * 0.3};
        top: ${Math.random() * 100}%;
        left: ${Math.random() * 100}%;
        filter: blur(2px);
        animation: float ${10 + Math.random() * 20}s infinite ease-in-out;
      `;
      container.appendChild(particle);
      particles.push(particle);
    }

    return () => {
      particles.forEach((p) => p.remove());
    };
  }, []);

  return <div className="fixed inset-0 pointer-events-none z-[60]" id="forest-dust"></div>;
}

export default function LeaderboardPage() {
  const [data, setData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showRankingInfo, setShowRankingInfo] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const result = await fetchLeaderboard();
      if (!result) {
        router.push('/login');
        return;
      }
      setData(result);
    }
    loadData();
  }, [router]);

  if (!data) return null;

  const filteredUsers = searchQuery 
    ? data.allUsersFlat.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : null;

  // Compute total community impact from all users
  const totalCommunityImpact = data.allUsersFlat
    ? data.allUsersFlat.reduce((sum, u) => sum + (u.rawCo2Saved || 0), 0)
    : 0;

  const today = new Date();
  const currentMonth = today.toLocaleString('default', { month: 'long' });
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const monthProgressPercent = Math.round((currentDay / daysInMonth) * 100);

  return (
    <div className="bg-forest-gradient min-h-screen">
      <ForestDust />
      <Sidebar />
      <MobileNav />
      <main className="md:ml-[280px] min-h-screen px-4 md:px-12 py-xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-lg mb-xl">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Global Leaderboard</h1>
            <p className="font-body-md text-body-md text-on-surface-variant">
              See how your sustainable actions stack up against the community.
            </p>
          </div>
          <div className="relative w-full md:w-96">
            <div className="absolute inset-y-0 left-0 pl-md flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-on-surface-variant">search</span>
            </div>
            <input
              className="w-full glass-panel bg-[#112614] border-none rounded-xl pl-10 pr-md py-3 text-on-surface focus:ring-1 focus:ring-primary focus:outline-none transition-all placeholder:text-on-surface-variant/50"
              placeholder="Search eco-warriors..."
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </header>

        {/* How Ranking Works — collapsible panel */}
        <HowRankingWorks
          isOpen={showRankingInfo}
          onToggle={() => setShowRankingInfo((prev) => !prev)}
        />

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mb-xl">
          <StatCard label="YOUR RANK">
            <div className="flex items-end gap-xs">
              <span className="font-headline-lg text-headline-lg text-primary">#{data.currentUser?.rank ?? "—"}</span>
              <span className="font-label-sm text-label-sm text-on-surface-variant pb-1">/ {data.totalUsers.toLocaleString()}</span>
            </div>
          </StatCard>
          <StatCard label="TOTAL IMPACT">
            <div className="flex items-end gap-xs">
              <span className="font-headline-lg text-headline-lg text-on-surface">
                {totalCommunityImpact >= 1000
                  ? (totalCommunityImpact / 1000).toFixed(1)
                  : totalCommunityImpact.toFixed(1)}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant pb-1">
                {totalCommunityImpact >= 1000 ? "tCO2e Saved" : "kgCO2e Saved"}
              </span>
            </div>
          </StatCard>
          <div className="glass-panel p-lg rounded-xl col-span-1 md:col-span-2 relative overflow-hidden group">
            <div className="relative z-10">
              <p className="font-label-sm text-label-sm text-secondary font-mono mb-sm">CURRENT CAMPAIGN</p>
              <p className="font-headline-md text-headline-md text-on-surface">Carbon Neutral {currentMonth}</p>
              <div className="w-full bg-white/10 h-2 rounded-full mt-md overflow-hidden">
                <div className="bg-primary h-full primary-glow" style={{ width: `${monthProgressPercent}%` }}></div>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-[120px]">forest</span>
            </div>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="glass-panel rounded-xl overflow-hidden mb-xl">
          {/* Table Header */}
          <div className="grid grid-cols-12 px-lg py-md border-b border-white/5 bg-white/5 font-label-md text-label-md text-on-surface-variant">
            <div className="col-span-1">RANK</div>
            <div className="col-span-5 md:col-span-6">USER</div>
            <div className="col-span-3 md:col-span-3 text-right">SAVED (kg)</div>
            <div className="col-span-3 md:col-span-2 text-right">POINTS</div>
          </div>

          <div className="divide-y divide-white/5">
            {data.users.length === 0 ? (
              <div className="p-xl text-center text-on-surface-variant font-label-md">
                Be the first eco-warrior — log your first activity!
              </div>
            ) : filteredUsers ? (
              filteredUsers.map((user) => (
                <LeaderboardRow key={user.id} user={user} isCurrentUser={data.currentUser?.id === user.id} />
              ))
            ) : (
              <>
                {data.users.map((user) => (
                  <LeaderboardRow key={user.id} user={user} isCurrentUser={data.currentUser?.id === user.id} />
                ))}

                {data.currentUser && data.currentUser.rank > 3 && (
                  <>
                    <div className="py-4 text-center text-on-surface-variant/30 text-label-sm">...</div>
                    <LeaderboardRow user={data.currentUser} isCurrentUser />
                  </>
                )}

                {data.otherUsers
                  .filter((user) => user.id !== data.currentUser?.id)
                  .map((user) => (
                    <LeaderboardRow key={user.id} user={user} isCurrentUser={data.currentUser?.id === user.id} />
                ))}
              </>
            )}
          </div>

          {/* Pagination */}
          {data.totalUsers > 10 && (
            <div className="bg-white/5 p-lg flex justify-between items-center">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="font-label-md text-label-md text-primary flex items-center gap-xs hover:underline"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                Previous 50
              </button>
              <div className="flex gap-sm">
                {[1, 2, 3].map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded ${
                      currentPage === page
                        ? "glass-panel text-primary border-primary"
                        : "hover:bg-white/10 cursor-pointer"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <span className="w-8 h-8 flex items-center justify-center">...</span>
              </div>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                className="font-label-md text-label-md text-primary flex items-center gap-xs hover:underline"
              >
                Next 50
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
