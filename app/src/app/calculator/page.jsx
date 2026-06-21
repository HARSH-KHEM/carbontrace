"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import UserAvatar from "@/components/UserAvatar";
import { fetchProfileSettings, logActivity } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";

const QUESTIONS = [
  "How did you get around today? (e.g. drove 15km to work, took the metro, walked)",
  "What did you eat today? Any meat, dairy or locally sourced food?",
  "How much energy did you use at home today? Any heating, AC, or lots of screen time?",
  "Did you buy anything today — clothes, gadgets, groceries, online orders?",
  "Anything else you want to add? Any flights, events, or unusual activities?"
];

export default function CalculatorPage() {
  const [profile, setProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [calculating, setCalculating] = useState(false);
  const [result, setResult] = useState(null);
  const [isLogging, setIsLogging] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [renderGreeting, setRenderGreeting] = useState(false);
  const [userName, setUserName] = useState("Eco Warrior");
  
  const messagesEndRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    async function loadData() {
      const p = await fetchProfileSettings();
      if (!p) {
        router.push('/login');
        return;
      }
      setProfile(p);
      const name = p?.username || p?.full_name || "Eco Warrior";
      setUserName(name);
      setMessages([
        { role: 'assistant', content: `Hey ${name}! 🌱 ${QUESTIONS[0]}` }
      ]);
    }
    loadData();

    const greeted = sessionStorage.getItem('ecobot_greeted');
    if (!greeted) {
      setRenderGreeting(true);
      setShowGreeting(true);
      sessionStorage.setItem('ecobot_greeted', 'true');
      setTimeout(() => setShowGreeting(false), 2500);
      setTimeout(() => setRenderGreeting(false), 3000);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, calculating, result]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || calculating) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    const nextIndex = questionIndex + 1;
    if (nextIndex < QUESTIONS.length) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: QUESTIONS[nextIndex] }]);
        setQuestionIndex(nextIndex);
      }, 500);
    } else {
      setQuestionIndex(nextIndex);
      setCalculating(true);
      
      try {
        const response = await fetch('/api/calculator', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: newMessages })
        });
        
        if (!response.ok) throw new Error("Failed to calculate");
        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error(err);
        setMessages(prev => [...prev, { role: 'assistant', content: "Oops, I had trouble calculating that. Let's try again." }]);
      } finally {
        setCalculating(false);
      }
    }
  };

  const handleLogActivity = async () => {
    if (isLogging) return;
    setIsLogging(true);
    
    // Extract raw text inputs from user messages
    const userInputs = messages.filter(m => m.role === 'user').map(m => m.content);
    
    const { success } = await logActivity({
      totalCO2: result.totalCO2 || result.total_co2,
      transport_co2: result.transport_co2,
      food_co2: result.food_co2,
      energy_co2: result.energy_co2,
      shopping_co2: result.shopping_co2,
      transport_input: userInputs[0] || null,
      food_input: userInputs[1] || null,
      energy_input: userInputs[2] || null,
      shopping_input: userInputs[3] || null,
    });
    
    if (success) {
      router.push("/dashboard");
    } else {
      alert("Failed to log activity");
      setIsLogging(false);
    }
  };

  const handleRecalculate = () => {
    setResult(null);
    setQuestionIndex(0);
    const name = profile?.username || profile?.full_name || "Eco Warrior";
    setMessages([
      { role: 'assistant', content: `Hey ${name}! 🌱 Let's try this again. ${QUESTIONS[0]}` }
    ]);
  };

  return (
    <>
      {renderGreeting && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#0a1f0f',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          animation: showGreeting ? 'fadeIn 0.5s ease' : 'fadeOut 0.5s ease forwards',
          pointerEvents: showGreeting ? 'auto' : 'none'
        }}>
          <div style={{ fontSize: '4rem', animation: 'growLeaf 1s ease' }}>🌱</div>
          <h2 className="font-headline-lg text-headline-lg text-white mt-6 mb-2">Hey {userName}! Ready to track your footprint today?</h2>
          <p className="font-body-md text-body-md text-soft-green">EcoBot will guide you through a quick conversation</p>
        </div>
      )}

      <Sidebar />
      <MobileNav />
      <main className="md:ml-[280px] min-h-screen relative p-md md:p-xl flex flex-col max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-lg shrink-0">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface">EcoBot Calculator</h2>
            <p className="font-body-md text-on-surface-variant">Chat with your AI coach to log today's footprint.</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-label-md font-label-md text-secondary bg-secondary-container/20 px-3 py-1 rounded-full border border-secondary/30 hidden sm:block">
              {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
            <Link href="/settings" className="w-10 h-10 rounded-full border-2 border-primary overflow-hidden flex items-center justify-center bg-surface-variant hover:scale-105 transition-transform p-0.5 shrink-0">
              {profile?.avatar_url ? (
                <img
                  alt="User Avatar"
                  src={`${profile.avatar_url}?t=${Date.now()}`}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <UserAvatar name={userName || "User"} className="w-full h-full text-sm" />
              )}
            </Link>
          </div>
        </header>

        <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col mb-24 md:mb-0 relative border border-white/5 shadow-2xl">
          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-lg custom-scrollbar space-y-lg relative">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex gap-3 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30 shadow-[0_0_10px_rgba(74,222,128,0.2)]">
                    <span className="material-symbols-outlined text-[16px]">psychiatry</span>
                  </div>
                )}
                <div className={`p-md rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-primary text-on-primary rounded-tr-sm shadow-[0_4px_20px_rgba(74,222,128,0.2)]' 
                    : 'bg-surface-container-low text-on-surface border border-white/5 rounded-tl-sm'
                } animate-in slide-in-from-bottom-2 fade-in duration-300`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {calculating && (
              <div className="flex gap-3 max-w-[85%]">
                <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center shrink-0 border border-primary/30">
                  <span className="material-symbols-outlined text-[16px]">psychiatry</span>
                </div>
                <div className="p-md rounded-2xl bg-surface-container-low text-on-surface border border-white/5 rounded-tl-sm flex items-center gap-2">
                  <span>Calculating your footprint</span>
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              </div>
            )}

            {/* Summary Card */}
            {result && !calculating && (
              <div className="mt-xl animate-in slide-in-from-bottom-4 fade-in duration-500">
                <div className="glass-card rounded-2xl p-xl border-t-4 border-t-primary shadow-[0_10px_40px_rgba(0,0,0,0.5)]">
                  <div className="text-center mb-lg relative">
                    <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150"></div>
                    <p className="font-label-md text-secondary tracking-widest uppercase mb-2 relative z-10">Estimated Impact</p>
                    <h3 className="text-6xl font-extrabold text-primary drop-shadow-[0_0_15px_rgba(74,222,128,0.5)] relative z-10 mb-1">
                      {result.total_co2 || result.totalCO2} <span className="text-2xl text-primary/70">kg</span>
                    </h3>
                    <p className="text-on-surface-variant text-sm relative z-10">Carbon Dioxide Equivalent</p>
                  </div>

                  <div className="space-y-4 mb-lg">
                    {[
                      { label: "Transport", value: result.transport_co2, color: "bg-blue-400" },
                      { label: "Food", value: result.food_co2, color: "bg-orange-400" },
                      { label: "Energy", value: result.energy_co2, color: "bg-yellow-400" },
                      { label: "Shopping", value: result.shopping_co2, color: "bg-purple-400" }
                    ].map((cat, i) => {
                      const percentage = Math.min(100, Math.max(0, (cat.value / (result.total_co2 || result.totalCO2 || 1)) * 100));
                      return (
                        <div key={i} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs font-bold text-on-surface">
                            <span>{cat.label}</span>
                            <span>{cat.value} kg</span>
                          </div>
                          <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                            <div className={`h-full ${cat.color} rounded-full transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <p className="text-sm text-on-surface-variant/90 leading-relaxed mb-lg bg-surface-container-low p-md rounded-xl italic">
                    "{result.breakdown}"
                  </p>

                  <div className="flex flex-wrap gap-2 mb-xl">
                    {result.tips?.map((tip, i) => (
                      <span key={i} className="px-3 py-1 bg-secondary/10 text-secondary border border-secondary/20 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">eco</span>
                        {tip}
                      </span>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={handleLogActivity}
                      disabled={isLogging}
                      className="flex-1 bg-primary text-surface font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors shadow-[0_0_15px_rgba(74,222,128,0.3)] flex justify-center items-center gap-2 disabled:opacity-50"
                    >
                      {isLogging ? "Saving..." : <><span className="material-symbols-outlined">check_circle</span> Log This Activity</>}
                    </button>
                    <button 
                      onClick={handleRecalculate}
                      disabled={isLogging}
                      className="px-6 py-3 border border-white/10 text-on-surface hover:bg-white/5 font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                      Recalculate
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-md bg-surface-container/50 border-t border-white/5 shrink-0 backdrop-blur-md">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                disabled={calculating || result !== null || questionIndex >= QUESTIONS.length}
                value={input}
                maxLength={250}
                onChange={(e) => setInput(e.target.value)}
                placeholder={result ? "Calculation complete" : "Type your response..."}
                className="flex-1 bg-surface-container-high border border-white/10 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={!input.trim() || calculating || result !== null || questionIndex >= QUESTIONS.length}
                className="w-12 h-12 bg-primary text-surface rounded-xl flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:bg-surface-container-high disabled:text-on-surface-variant"
              >
                <span className="material-symbols-outlined">send</span>
              </button>
            </form>
          </div>
        </div>
      </main>
    </>
  );
}
