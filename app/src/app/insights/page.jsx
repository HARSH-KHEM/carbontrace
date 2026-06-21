"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import { getInsights, markTipComplete } from "@/lib/api";

function WeeklySavingsCard({ savings, breakdown, onShowModal, onRefresh, hasTips }) {
  return (
    <div className="lg:col-span-4">
      <div className="glass-card h-full rounded-2xl p-lg flex flex-col justify-between relative border-l-[4px] border-secondary">
        <div>
          <div className="font-label-sm text-label-sm text-on-surface-variant/60 mb-sm">WEEKLY ESTIMATED SAVINGS</div>
          <div className="flex items-baseline gap-2">
            <span className="font-display-lg text-display-lg text-primary">{savings}</span>
            <span className="font-headline-md text-headline-md text-on-surface-variant">kg CO2e</span>
          </div>
        </div>
        <div className="mt-lg flex flex-col gap-2">
          {hasTips && (
            <button onClick={onShowModal} className="w-full bg-white/5 border border-white/10 text-on-surface-variant hover:text-on-surface hover:bg-white/10 py-md rounded-xl transition-all font-label-md text-label-md">
              View Detailed Breakdown
            </button>
          )}
          <button onClick={onRefresh} className="w-full bg-primary border border-primary text-on-primary hover:bg-primary/90 py-md rounded-xl transition-all font-label-md text-label-md flex items-center justify-center gap-2 glow-lime">
            <span className="material-symbols-outlined text-sm">auto_awesome</span>
            Get Fresh AI Insights
          </button>
        </div>
      </div>
    </div>
  );
}

function InsightCard({ tip, isCompleted, onMarkDone, index }) {
  const impactColors = {
    high: "bg-red-500/20 text-red-400 border-red-500/30",
    medium: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    low: "bg-green-500/20 text-green-400 border-green-500/30"
  };
  const impactBadge = tip.impact ? impactColors[tip.impact.toLowerCase()] || impactColors.medium : impactColors.medium;

  return (
    <div 
      className="lg:col-span-4 group" 
      style={{ animation: `fadeIn 0.5s ease ${index * 200}ms both` }}
    >
      <div
        className={`glass-card h-full rounded-2xl p-lg relative flex flex-col transition-all duration-300 hover:bg-white/[0.08] ${
          isCompleted ? "opacity-40 scale-[0.98]" : ""
        }`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-secondary/60"></div>
        <div className="flex items-center justify-between mb-md">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">{tip.categoryIcon}</span>
            <span className="font-label-md text-label-md text-secondary">{tip.category}</span>
          </div>
          <span className={`px-2 py-1 rounded border text-[10px] font-bold uppercase tracking-wider ${impactBadge}`}>
            {tip.impact} impact
          </span>
        </div>
        <h3 className="font-headline-md text-headline-md text-on-surface mb-sm">{tip.title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant/80 mb-xl">{tip.description}</p>
        <button
          onClick={() => onMarkDone(tip.id)}
          disabled={isCompleted}
          className={`mt-auto ${
            isCompleted
              ? "bg-primary/40 pointer-events-none"
              : "bg-primary-container/10 hover:bg-primary-container hover:text-on-primary-container"
          } text-primary-container border border-primary-container/20 px-lg py-sm rounded-xl font-label-md text-label-md transition-all flex items-center justify-center gap-2 glow-lime active:scale-95`}
        >
          <span className="material-symbols-outlined text-md">
            {isCompleted ? "task_alt" : "check_circle"}
          </span>
          {isCompleted ? "Completed" : "Mark as done"}
        </button>
      </div>
    </div>
  );
}

export default function InsightsPage() {
  const [insightsData, setInsightsData] = useState(null);
  const [completedTips, setCompletedTips] = useState(new Set());
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  async function loadData(refresh = false) {
    if (refresh) setIsGenerating(true);
    else setIsLoading(true);

    const data = await getInsights(refresh);
    setInsightsData(data);
    
    setIsLoading(false);
    setIsGenerating(false);
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleMarkDone = async (tipId) => {
    await markTipComplete(tipId);
    setCompletedTips((prev) => new Set([...prev, tipId]));
  };

  if (isLoading && !insightsData) {
    return (
      <div className="flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 ml-0 md:ml-[280px] min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            <p className="text-on-surface-variant animate-pulse">Loading...</p>
          </div>
        </main>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[280px] min-h-screen overflow-y-auto px-4 md:px-12 py-xl relative">
        {/* Atmospheric Background */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full -z-10 translate-x-1/2 -translate-y-1/2"></div>

        {/* Header */}
        <header className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-xs">Your personalized tips this week</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Our AI analyzed your recent carbon footprint data to provide actionable steps for a more sustainable lifestyle.
            </p>
          </div>
          <div className="flex gap-sm">
            <div className="glass-card px-md py-sm rounded-lg flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary text-sm">trending_down</span>
              <span className="font-label-sm text-label-sm text-secondary">Efficiency up 12%</span>
            </div>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
          <div className="lg:col-span-12">
            <WeeklySavingsCard
              savings={insightsData.weeklyEstimatedSavings}
              breakdown={insightsData.savingsBreakdown}
              onShowModal={() => setShowModal(true)}
              onRefresh={() => loadData(true)}
              hasTips={insightsData.tips.length > 0}
            />
          </div>
          {isGenerating ? (
            <div className="lg:col-span-12 flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
              <p className="text-on-surface-variant animate-pulse font-label-md">EcoBot is analyzing your footprint...</p>
            </div>
          ) : insightsData.tips.length === 0 ? (
            <div className="lg:col-span-12 flex flex-col items-center justify-center py-20">
              <p className="text-on-surface-variant font-label-md">Click above to get your personalized tips powered by AI 🌱</p>
            </div>
          ) : (
            insightsData.tips.map((tip, index) => (
              <InsightCard
                key={tip.id}
                tip={tip}
                isCompleted={completedTips.has(tip.id)}
                onMarkDone={handleMarkDone}
                index={index}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <Footer className="mt-xl border-t border-white/5" />

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="glass-card w-[90%] max-w-[500px] min-w-[320px] rounded-2xl p-xl relative shadow-2xl animate-in zoom-in-95 duration-200">
              <button onClick={() => setShowModal(false)} className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-lg">Detailed Breakdown</h2>
              <div className="space-y-4">
                <p className="text-on-surface-variant text-sm">Placeholder for detailed breakdown chart or data.</p>
                <div className="flex justify-between items-center bg-surface-container/50 p-4 rounded-xl border border-white/5">
                  <span className="text-on-surface">Energy</span>
                  <span className="font-bold text-primary">{insightsData.savingsBreakdown.energy}%</span>
                </div>
                <div className="flex justify-between items-center bg-surface-container/50 p-4 rounded-xl border border-white/5">
                  <span className="text-on-surface">Travel</span>
                  <span className="font-bold text-primary">{insightsData.savingsBreakdown.travel}%</span>
                </div>
                <div className="flex justify-between items-center bg-surface-container/50 p-4 rounded-xl border border-white/5">
                  <span className="text-on-surface">Diet</span>
                  <span className="font-bold text-primary">{insightsData.savingsBreakdown.diet}%</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <MobileNav />
    </div>
  );
}
