"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import UserAvatar from "@/components/UserAvatar";
import { fetchDashboardData, fetchRecentLogs, fetchWeeklyEmissions, searchUsers } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";

function HeroStatCard({ dailyCO2, percentChange }) {
  return (
    <div className="glass-card rounded-3xl p-xl relative overflow-hidden flex flex-col justify-center min-h-[200px] group mb-lg">
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-primary/20 transition-all duration-700"></div>
      <div className="relative z-10">
        <p className="font-label-md text-label-md text-secondary mb-2 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
          Daily Footprint
        </p>
        <h2 className="font-display-lg text-display-lg md:text-[48px] mb-1 text-on-surface">Your CO2 today:</h2>
        <p className="font-headline-lg text-[40px] md:text-[64px] font-extrabold text-primary drop-shadow-[0_0_20px_rgba(74,222,128,0.4)] transition-all">
          {dailyCO2} kg
        </p>
        <div className="mt-4 flex items-center gap-3">
          <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">trending_down</span>
            {Math.abs(percentChange)}% lower
          </span>
          <span className="text-on-surface-variant text-sm">than yesterday</span>
        </div>
      </div>
    </div>
  );
}

function QuickStats({ dashboardData }) {
  const stats = [
    { label: "Total CO2 Month", value: `${Math.round(dashboardData.dailyCO2 * 12 + 45)} kg`, icon: "cloud" },
    { label: "CO2 Saved vs Avg", value: `${dashboardData.co2Saved?.toFixed(1) || 0} kg`, icon: "eco" },
    { label: "Current Streak", value: `${dashboardData.streakDays} Days`, icon: "local_fire_department", isStreak: true }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mb-lg">
      {stats.map((s, i) => (
        <div key={i} className="glass-card rounded-2xl p-lg flex items-center gap-4 group hover:bg-white/5 transition-all">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${s.isStreak ? 'bg-[#ffaa00]/20 text-[#ffaa00]' : 'bg-primary/20 text-primary'} transition-transform group-hover:scale-110`}>
            <span className="material-symbols-outlined text-2xl">{s.icon}</span>
          </div>
          <div>
            <p className="font-label-sm text-on-surface-variant uppercase tracking-widest">{s.label}</p>
            <p className={`font-headline-md text-2xl font-bold ${s.isStreak ? 'text-[#ffaa00] amber-glow' : 'text-on-surface'}`}>{s.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function ActivityDetailModal({ activities, onClose }) {
  if (!activities || activities.length === 0) return null;

  const isMulti = activities.length > 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="glass-card rounded-3xl w-full max-w-2xl max-h-[85vh] overflow-hidden relative z-10 flex flex-col border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-lg border-b border-white/5 flex justify-between items-center bg-surface-container/50">
          <div>
            <h3 className="font-headline-md text-headline-md text-on-surface">Activity Details</h3>
            <p className="font-body-md text-on-surface-variant">
              {isMulti ? `${activities.length} activities logged on this day` : 'Breakdown of your logged activity'}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-on-surface transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-lg overflow-y-auto custom-scrollbar flex-1 space-y-xl">
          {activities.map((act, index) => (
            <div key={act.id || index} className={`space-y-lg ${index > 0 ? 'pt-lg border-t border-white/5' : ''}`}>
              
              {isMulti && (
                <div className="flex justify-between items-center">
                  <h4 className="font-headline-sm text-primary">Entry {index + 1}</h4>
                  <span className="text-xs text-on-surface-variant bg-white/5 px-3 py-1 rounded-full">
                    {act.time || new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              )}

              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-container-low p-md rounded-2xl border border-white/5">
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-widest mb-1">Total CO2</p>
                  <p className="font-headline-md text-on-surface font-bold text-2xl">{Number(act.total_co2 || 0).toFixed(1)} <span className="text-sm font-normal text-on-surface-variant">kg</span></p>
                </div>
                <div className="bg-primary/10 p-md rounded-2xl border border-primary/20 relative overflow-hidden">
                  <div className="absolute -right-4 -bottom-4 opacity-20">
                    <span className="material-symbols-outlined text-6xl text-primary">eco</span>
                  </div>
                  <p className="font-label-sm text-primary uppercase tracking-widest mb-1">CO2 Saved</p>
                  <p className="font-headline-md text-primary font-bold text-2xl relative z-10">{Number(act.co2_saved || 0).toFixed(1)} <span className="text-sm font-normal opacity-80">kg</span></p>
                </div>
              </div>

              {/* Categories */}
              <div className="space-y-4">
                {[
                  { label: "Transport", value: act.transport_co2, input: act.transport_input, icon: "directions_car", color: "text-blue-400", bg: "bg-blue-400/10" },
                  { label: "Food", value: act.food_co2, input: act.food_input, icon: "restaurant", color: "text-orange-400", bg: "bg-orange-400/10" },
                  { label: "Energy", value: act.energy_co2, input: act.energy_input, icon: "bolt", color: "text-yellow-400", bg: "bg-yellow-400/10" },
                  { label: "Shopping", value: act.shopping_co2, input: act.shopping_input, icon: "shopping_bag", color: "text-purple-400", bg: "bg-purple-400/10" }
                ].map((cat, i) => (
                  <div key={i} className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-2xl items-start md:items-center">
                    <div className="flex items-center gap-3 min-w-[140px] shrink-0">
                      <div className={`w-10 h-10 rounded-full ${cat.bg} ${cat.color} flex items-center justify-center`}>
                        <span className="material-symbols-outlined">{cat.icon}</span>
                      </div>
                      <div>
                        <p className="font-bold text-on-surface text-sm">{cat.label}</p>
                        <p className="font-mono text-primary text-sm">{Number(cat.value || 0).toFixed(1)} kg</p>
                      </div>
                    </div>
                    <div className="flex-1 text-sm text-on-surface-variant italic bg-surface-container-low p-3 rounded-xl w-full">
                      {cat.input ? `"${cat.input}"` : "No description provided."}
                    </div>
                  </div>
                ))}
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RechartsEmissionChart({ data, onBarClick }) {
  const chartData = data.map(d => ({
    name: d.day,
    co2: d.value,
    activities: d.activities,
  }));

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card border border-white/10 p-sm rounded-lg backdrop-blur-md">
          <p className="text-on-surface-variant text-xs mb-1">{label}</p>
          <p className="text-primary font-bold">{`${payload[0].value} kg CO2`}</p>
          <p className="text-xs text-on-surface-variant/60 mt-1">Click to view details</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card rounded-3xl p-xl mb-lg">
      <h3 className="font-headline-md text-headline-md text-on-surface mb-2">Weekly Emissions</h3>
      <p className="font-body-md text-on-surface-variant mb-6">Last 7 days of your carbon footprint.</p>
      
      <div className="h-[300px] w-full">
        {chartData.length > 0 && chartData.some(d => d.co2 > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#a3a3a3" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar 
                dataKey="co2" 
                radius={[4, 4, 0, 0]}
                onClick={(data) => {
                  if (data && data.payload && data.payload.activities && data.payload.activities.length > 0) {
                    onBarClick(data.payload.activities);
                  }
                }}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill="#4ade80" 
                    className={`transition-opacity drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] ${entry.activities && entry.activities.length > 0 ? 'cursor-pointer hover:opacity-80' : 'opacity-50'}`} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-on-surface-variant font-label-md">
            Log your first activity to see your stats
          </div>
        )}
      </div>
    </div>
  );
}

function RecentActivity({ logs, onLogClick }) {
  return (
    <div className="glass-card rounded-3xl overflow-hidden flex flex-col mb-lg">
      <div className="p-lg border-b border-white/5 flex justify-between items-center">
        <h3 className="font-headline-md text-headline-md text-on-surface">Recent Activity</h3>
      </div>
      <div className="flex-1 overflow-auto custom-scrollbar">
        {logs.length === 0 ? (
          <div className="p-xl text-center text-on-surface-variant font-label-md">
            No recent activity
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <tbody className="text-sm">
              {logs.slice(0, 3).map((log) => (
                <tr 
                  key={log.id} 
                  className="hover:bg-white/5 transition-colors group border-b border-white/5 last:border-0 cursor-pointer"
                  onClick={() => log.rawLog && onLogClick([log.rawLog])}
                >
                  <td className="px-lg py-md flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-xl">{log.icon || 'eco'}</span>
                    </div>
                    <div>
                      <p className="font-bold text-on-surface">{log.activity}</p>
                      <p className="text-xs text-on-surface-variant/60">{log.time}</p>
                    </div>
                  </td>
                  <td className="px-lg py-md font-bold text-primary text-right">{log.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ImpactCard({ dashboardData }) {
  const saved = dashboardData.co2Saved || 0;
  const trees = (saved / 2.5).toFixed(1);
  const km = (saved / 0.21).toFixed(0);

  return (
    <div className="glass-card rounded-3xl p-xl mb-lg relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-tr from-secondary/10 to-transparent opacity-50"></div>
      <h3 className="font-headline-md text-headline-md text-on-surface mb-6 relative z-10">Your Impact</h3>
      <div className="grid grid-cols-2 gap-md relative z-10">
        <div className="bg-surface-container/50 p-md rounded-2xl border border-white/5 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-3xl text-secondary mb-2">forest</span>
          <p className="font-bold text-xl text-on-surface">{trees}</p>
          <p className="text-xs text-on-surface-variant">Trees Equivalent</p>
        </div>
        <div className="bg-surface-container/50 p-md rounded-2xl border border-white/5 flex flex-col items-center text-center hover:bg-white/5 transition-colors">
          <span className="material-symbols-outlined text-3xl text-blue-400 mb-2">directions_car</span>
          <p className="font-bold text-xl text-on-surface">{km} km</p>
          <p className="text-xs text-on-surface-variant">Driving Avoided</p>
        </div>
      </div>
    </div>
  );
}


function SidebarCards({ dashboardData }) {
  const progress = (dashboardData.streakDays / dashboardData.streakTarget) * 100;
  const daysLeft = dashboardData.streakTarget - dashboardData.streakDays;

  return (
    <div className="flex flex-col gap-lg">
      <div className="glass-card rounded-3xl p-lg flex flex-col justify-between overflow-hidden relative group">
        <div className="absolute inset-0 bg-gradient-to-br from-[#ffaa00]/10 to-transparent opacity-50"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <p className="font-label-md text-label-md text-[#ffaa00] uppercase tracking-wider">Consistency</p>
            <div className="w-12 h-12 rounded-2xl bg-[#ffaa00]/10 flex items-center justify-center amber-glow transition-transform group-hover:scale-110">
              <span className="text-2xl">🔥</span>
            </div>
          </div>
          <p className="font-headline-md text-headline-md text-on-surface leading-tight">
            {dashboardData.streakDays} Day<br />Impact Streak
          </p>
        </div>
        <div className="relative z-10 mt-6">
          <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden mb-2">
            <div className="bg-[#ffaa00] h-full amber-glow transition-all duration-1000" style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}></div>
          </div>
          <p className="text-xs text-on-surface-variant">
            {daysLeft > 0 ? `${daysLeft} days left to "${dashboardData.streakTitle}" status` : `You are a ${dashboardData.streakTitle}!`}
          </p>
        </div>
      </div>

      <div className="glass-card rounded-3xl p-lg flex flex-col gap-md relative overflow-hidden">
        <div className="bg-surface-container/40 p-md rounded-2xl border border-white/5 relative z-10">
          <p className="font-label-sm text-primary mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">lightbulb</span>
            TIP OF THE DAY
          </p>
          <p className="text-on-surface text-sm leading-relaxed">
            Reducing your meat consumption for just one meal today can save up to <span className="text-primary font-bold">1.8 kg</span> of CO2.
          </p>
        </div>
        <Link href="/insights" className="text-xs text-center text-on-surface-variant hover:text-primary transition-colors relative z-10 uppercase tracking-widest font-bold">
          See more insights
        </Link>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [dashboardData, setDashboardData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [emissions, setEmissions] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedActivities, setSelectedActivities] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const [data, recentLogs, weeklyData] = await Promise.all([
        fetchDashboardData(),
        fetchRecentLogs(),
        fetchWeeklyEmissions("week"),
      ]);
      
      if (!data) {
        router.push('/login');
        return;
      }
      
      setDashboardData(data);
      setLogs(recentLogs);
      setEmissions(weeklyData);
    }
    loadData();
  }, [router]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery && searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  if (!dashboardData) return null;

  return (
    <>
      <Sidebar />
      <MobileNav />
      <main className="md:ml-[280px] p-md md:p-xl max-w-7xl mx-auto pb-24 md:pb-xl">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-md mb-xl">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">
              Welcome back, {dashboardData.userName}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant">Your jungle is thriving today.</p>
          </div>
          <div className="flex items-center gap-md">
            <div className="relative group z-50">
              <input
                className="bg-surface-container-low border-none rounded-full px-xl py-sm text-sm focus:ring-1 focus:ring-primary w-full md:w-64 transition-all duration-300 placeholder:text-on-surface-variant/40"
                placeholder="Search..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/50">
                search
              </span>
              
              {searchQuery && searchQuery.length >= 2 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-low border border-white/10 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl">
                  {isSearching ? (
                    <div className="p-4 text-center text-on-surface-variant text-sm">Searching...</div>
                  ) : searchResults.length > 0 ? (
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map(user => (
                        <div 
                          key={user.id}
                          onClick={() => router.push(`/profile/${user.id}`)}
                          className="flex items-center gap-3 p-3 hover:bg-white/5 cursor-pointer transition-colors border-b border-white/5 last:border-none"
                        >
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <UserAvatar name={user.full_name || user.username || "U"} className="w-8 h-8 text-xs" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-label-md text-on-surface truncate">{user.full_name || user.username}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-on-surface-variant text-sm">No users found</div>
                  )}
                </div>
              )}
            </div>
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="w-10 h-10 rounded-full glass-card flex items-center justify-center text-on-surface hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined">notifications</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-64 glass-card rounded-xl p-md z-50 border border-white/10 shadow-2xl">
                  <p className="font-label-sm text-center text-on-surface-variant">No notifications yet</p>
                </div>
              )}
            </div>
            <Link href="/settings" className="w-10 h-10 rounded-full border-2 border-primary p-0.5 hover:scale-105 transition-transform">
              {dashboardData.avatarUrl ? (
                <img
                  alt="User"
                  className="w-full h-full rounded-full bg-surface-container object-cover"
                  src={dashboardData.avatarUrl}
                />
              ) : (
                <UserAvatar name={dashboardData.firstName || "User"} className="w-full h-full text-sm" />
              )}
            </Link>
          </div>
        </header>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          
          {/* Left Column (Main) */}
          <div className="lg:col-span-8 flex flex-col">
            <HeroStatCard dailyCO2={dashboardData.dailyCO2} percentChange={dashboardData.percentChange} />
            <QuickStats dashboardData={dashboardData} />
            <RechartsEmissionChart data={emissions} onBarClick={(activities) => setSelectedActivities(activities)} />
          </div>

          {/* Right Column (Sidebar equivalent) */}
          <div className="lg:col-span-4 flex flex-col">
            <SidebarCards dashboardData={dashboardData} />
            <div className="mt-lg">
              <ImpactCard dashboardData={dashboardData} />
              <RecentActivity logs={logs} onLogClick={(activities) => setSelectedActivities(activities)} />
            </div>
          </div>

        </div>

        {/* Modal */}
        <ActivityDetailModal 
          activities={selectedActivities} 
          onClose={() => setSelectedActivities(null)} 
        />

        {/* Mobile FAB */}
        <button className="md:hidden fixed bottom-24 right-6 w-14 h-14 bg-primary text-on-primary rounded-full shadow-2xl flex items-center justify-center lime-glow active:scale-90 transition-transform">
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </main>
      <Footer className="md:ml-[280px]" />
    </>
  );
}
