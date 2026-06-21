"use client";

import { useState, useEffect, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import MobileNav from "@/components/MobileNav";
import Footer from "@/components/Footer";
import UserAvatar from "@/components/UserAvatar";
import {
  connectAccount,
  disconnectAccount,
  deleteAccount,
  uploadAvatar,
  updatePreferences
} from "@/lib/api";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

function ToggleSwitch({ checked, onChange }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input
        type="checkbox"
        className="sr-only peer"
        checked={checked}
        onChange={onChange}
      />
      <div className="w-11 h-6 bg-surface-container-high rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
    </label>
  );
}

function ConnectedAccountRow({ icon, iconBg, iconColor, name, description, isConnected, onToggle, isPlaceholder }) {
  return (
    <div className="flex items-center justify-between p-md bg-surface-container-low border border-white/5 rounded-xl hover:bg-white/5 transition-colors group">
      <div className="flex items-center gap-md">
        <div
          className={`w-12 h-12 rounded-full ${iconBg} flex items-center justify-center`}
        >
          <span className={`material-symbols-outlined ${iconColor}`}>
            {icon}
          </span>
        </div>
        <div>
          <p className="font-label-md text-label-md text-on-surface">{name}</p>
          <p className="font-label-sm text-label-sm text-on-surface-variant/60">
            {description}
          </p>
        </div>
      </div>
      {isPlaceholder ? (
        <span className="font-label-sm text-label-sm text-on-surface-variant bg-surface-variant px-3 py-1 rounded-full">
          Coming Soon
        </span>
      ) : (
        <button
          onClick={onToggle}
          className={`font-label-md text-label-md hover:underline ${
            isConnected ? "text-error" : "text-primary"
          }`}
        >
          {isConnected ? "Disconnect" : "Connect"}
        </button>
      )}
    </div>
  );
}

function LevelCard({ impactScore }) {
  const score = impactScore || 0;
  const level = Math.floor(score / 100) + 1;
  const xp = score % 100;
  const xpNeeded = 100 - xp;
  
  let title = "Getting Started";
  if (level >= 3 && level <= 5) title = "Eco Tracker";
  else if (level >= 6 && level <= 10) title = "Green Habit Builder";
  else if (level > 10) title = "Sustainability Leader";

  return (
    <div className="glass-card rounded-xl p-xl relative overflow-hidden group">
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 rounded-full blur-3xl transition-all group-hover:bg-primary/20"></div>
      <h3 className="font-label-md text-label-md text-on-surface uppercase tracking-widest mb-lg relative z-10">
        Current Status
      </h3>
      <div className="relative z-10">
        <div className="flex items-end gap-2">
          <span className="font-headline-lg text-headline-lg text-primary">
            Level {level}
          </span>
          <span className="font-label-md text-label-md text-on-surface-variant mb-1.5">
            {title}
          </span>
        </div>
        <div className="w-full h-2 bg-surface-container-high rounded-full mt-4 overflow-hidden">
          <div
            className="h-full bg-primary"
            style={{ width: `${xp}%`, boxShadow: "0 0 10px #4ade80" }}
          ></div>
        </div>
        <p className="font-label-sm text-label-sm text-on-surface-variant/70 mt-3">
          {xpNeeded} XP until next level
        </p>
      </div>
    </div>
  );
}

function DangerZone({ onDelete }) {
  return (
    <div className="glass-card rounded-xl p-xl border-error/20">
      <h3 className="font-label-md text-label-md text-error mb-md">
        Danger Zone
      </h3>
      <p className="font-label-sm text-label-sm text-on-surface-variant/60 mb-lg">
        Permanently delete your account and all carbon tracking history.
      </p>
      <button
        onClick={onDelete}
        className="w-full py-md rounded-xl border border-error/30 text-error hover:bg-error/10 transition-colors font-label-md text-label-md"
      >
        Delete Account
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    location: "",
    occupation: "",
    bio: "",
    email: "",
    avatar_url: "",
  });

  const [pushNotifications, setPushNotifications] = useState(true);
  const [highPrecision, setHighPrecision] = useState(true);
  const [darkTheme, setDarkTheme] = useState(true);
  const [biometricLogin, setBiometricLogin] = useState(false);
  const [units, setUnits] = useState("metric");

  const [stats, setStats] = useState({ impact_score: 0, co2_saved: 0 });

  // LOAD on mount
  useEffect(() => {
    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        router.push('/login');
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
        
      const { data: privateProfile } = await supabase
        .from("profile_private")
        .select("*")
        .eq("id", user.id)
        .single();
      
      if (profile) {
        setForm({
          full_name: profile.full_name || "",
          username: profile.username || "",
          location: privateProfile?.location || "",
          occupation: privateProfile?.occupation || "",
          bio: profile.bio || "",
          email: privateProfile?.email || user.email || "",
          avatar_url: profile.avatar_url || "",
        });

        if (privateProfile?.preferences) {
          setPushNotifications(privateProfile.preferences.pushNotifications ?? true);
          setHighPrecision(privateProfile.preferences.highPrecision ?? true);
          setDarkTheme(privateProfile.preferences.darkTheme ?? true);
          setBiometricLogin(privateProfile.preferences.biometricLogin ?? false);
          setUnits(privateProfile.preferences.units || "metric");
        }
        
        setStats({ impact_score: profile.impact_score || 0, co2_saved: profile.co2_saved || 0 });
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  // SAVE
  async function handleSave() {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: form.full_name || null,
        bio: form.bio || null,
        avatar_url: form.avatar_url || null,
      })
      .eq("id", user.id);

    const { error: privateError } = await supabase
      .from("profile_private")
      .upsert({
        id: user.id,
        location: form.location || null,
        occupation: form.occupation || null,
        email: form.email || null,
      });

    const error = profileError || privateError;

    await updatePreferences({
      pushNotifications,
      highPrecision,
      darkTheme,
      biometricLogin,
      units,
    });

    setSaving(false);
    if (!error) {
      setToast("Settings saved!");
      setTimeout(() => setToast(""), 3000);
    } else {
      console.error('Save error:', error);
      setToast("Error: " + (error.message || JSON.stringify(error)));
      setTimeout(() => setToast(""), 6000);
    }
  }

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    setForm({ ...form, avatar_url: objectUrl });

    const result = await uploadAvatar(file);
    if (result.success) {
      setForm((prev) => ({ ...prev, avatar_url: result.publicUrl }));
      setToast("Avatar updated!");
      setTimeout(() => setToast(""), 3000);
    } else {
      setToast("Failed to upload avatar: " + result.error);
      setTimeout(() => setToast(""), 3000);
    }
  };

  const handleCancel = () => {
    window.location.reload();
  };

  // Handlers for placeholder integrations removed

  const handleDeleteAccount = async () => {
    if (
      window.confirm(
        "Are you sure you want to permanently delete your account? This action cannot be undone."
      )
    ) {
      await deleteAccount();
      setToast("Account deleted.");
    }
  };

  if (loading) return <div style={{ color: "white", padding: "40px", display: "flex", justifyContent: "center" }}><div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div></div>;

  return (
    <div className="flex overflow-hidden">
      <Sidebar />
      <main className="flex-1 ml-0 md:ml-[280px] h-screen overflow-y-auto custom-scrollbar pt-xl px-lg pb-[100px] md:pb-xl relative">
        {/* Atmospheric Background */}
        <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>
        <div className="fixed bottom-0 left-[200px] w-[400px] h-[400px] bg-primary/[0.03] rounded-full blur-[120px] -z-10 pointer-events-none"></div>

        {/* Toast Notification */}
        {toast && (
          <div className="fixed top-4 right-4 z-50 bg-primary/20 backdrop-blur-md border border-primary/50 text-on-surface px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-5">
            <span className="material-symbols-outlined text-primary">info</span>
            <p className="font-label-md">{toast}</p>
          </div>
        )}

        <div className="max-w-5xl mx-auto w-full">
          {/* Header */}
          <header className="mb-xl flex flex-col md:flex-row md:items-end justify-between gap-md">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
                Account Settings
              </h1>
              <p className="font-body-md text-body-md text-on-tertiary-container mt-2">
                Manage your environmental profile and application preferences.
              </p>
            </div>
            <div className="flex gap-md">
              <button
                onClick={handleCancel}
                className="bg-surface-variant/30 hover:bg-surface-variant/50 text-on-surface-variant border border-white/10 px-lg py-md rounded-xl font-label-md text-label-md transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-surface font-bold px-xl py-md rounded-xl font-label-md text-label-md glow-button transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
            {/* PERSONAL INFO SECTION */}
            <section className="lg:col-span-7 space-y-lg">
              {/* Profile Card */}
              <div className="glass-card rounded-xl p-xl">
                <div className="flex items-center gap-4 mb-lg">
                  <div className="relative group">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary transition-all shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                      {form.avatar_url ? (
                        <img
                          alt="User Profile"
                          className="w-full h-full object-cover"
                          src={form.avatar_url}
                        />
                      ) : (
                        <UserAvatar name={form.first_name || "User"} className="w-full h-full text-4xl" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 bg-primary text-surface p-1.5 rounded-full border-4 border-surface shadow-xl hover:scale-110 transition-transform"
                    >
                      <span className="material-symbols-outlined text-sm">photo_camera</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <div>
                    <h2 className="font-headline-md text-headline-md text-on-surface">
                      Personal Information
                    </h2>
                    <p className="font-label-sm text-label-sm text-secondary font-mono">
                      USER_ID: CT-9921-X
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
                  <div className="space-y-sm">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                      Full Name
                    </label>
                    <input
                      className="w-full bg-[#112614] border border-white/10 rounded-lg px-md py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                      type="text"
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    />
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                      Email Address
                    </label>
                    <input
                      className="w-full bg-[#112614] border border-white/10 rounded-lg px-md py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                      type="email"
                      value={form.email}
                      disabled
                    />
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                      Location
                    </label>
                    <div className="relative">
                      <input
                        className="w-full bg-[#112614] border border-white/10 rounded-lg pl-10 pr-md py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                        type="text"
                        value={form.location}
                        onChange={(e) => setForm({ ...form, location: e.target.value })}
                      />
                      <span className="material-symbols-outlined absolute left-3 top-3 text-on-surface-variant text-body-md">
                        location_on
                      </span>
                    </div>
                  </div>
                  <div className="space-y-sm">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                      Occupation
                    </label>
                    <input
                      className="w-full bg-[#112614] border border-white/10 rounded-lg px-md py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md"
                      type="text"
                      value={form.occupation}
                      onChange={(e) => setForm({ ...form, occupation: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-lg space-y-sm">
                  <label className="font-label-md text-label-md text-on-surface-variant block">
                    Short Bio
                  </label>
                  <textarea
                    className="w-full bg-[#112614] border border-white/10 rounded-lg px-md py-3 text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all font-body-md resize-none"
                    rows={3}
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              </div>

              {/* Connected Accounts */}
              <div className="glass-card rounded-xl p-xl">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
                  Connected Accounts
                </h3>
                <div className="space-y-md">
                  <ConnectedAccountRow
                    icon="electric_car"
                    iconBg="bg-blue-500/10"
                    iconColor="text-blue-400"
                    name="Tesla Integration"
                    description="Auto-track driving emissions"
                    isConnected={false}
                    onToggle={() => {}}
                    isPlaceholder={true}
                  />
                  <ConnectedAccountRow
                    icon="house"
                    iconBg="bg-secondary/10"
                    iconColor="text-secondary"
                    name="Smart Home Hub"
                    description="Syncing energy data"
                    isConnected={false}
                    onToggle={() => {}}
                    isPlaceholder={true}
                  />
                </div>
              </div>
            </section>

            {/* PREFERENCES SECTION */}
            <aside className="lg:col-span-5 space-y-lg">
              {/* App Preferences */}
              <div className="glass-card rounded-xl p-xl">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-xl">
                  App Preferences
                </h3>
                <div className="space-y-lg">
                  {/* Push Notifications */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface">
                        Push Notifications
                      </h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant/70">
                        Receive alerts for goal milestones
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={pushNotifications}
                      onChange={() => setPushNotifications(!pushNotifications)}
                    />
                  </div>

                  {/* High Precision */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface">
                        High Precision Tracking
                      </h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant/70">
                        Enable sub-gram calculations
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={highPrecision}
                      onChange={() => setHighPrecision(!highPrecision)}
                    />
                  </div>

                  {/* Dark Theme */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface">
                        Dark Forest Theme
                      </h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant/70">
                        Immersive glassmorphic UI
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={darkTheme}
                      onChange={() => setDarkTheme(!darkTheme)}
                    />
                  </div>

                  {/* Biometric */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-label-md text-label-md text-on-surface">
                        Biometric Login
                      </h4>
                      <p className="font-label-sm text-label-sm text-on-surface-variant/70">
                        Use FaceID or Fingerprint
                      </p>
                    </div>
                    <ToggleSwitch
                      checked={biometricLogin}
                      onChange={() => setBiometricLogin(!biometricLogin)}
                    />
                  </div>
                </div>

                {/* Measurement Units */}
                <div className="mt-xl pt-xl border-t border-white/5 space-y-md">
                  <h4 className="font-label-md text-label-md text-secondary uppercase tracking-widest font-bold">
                    Measurement Units
                  </h4>
                  <div className="flex gap-sm">
                    <button
                      onClick={() => setUnits("metric")}
                      className={`flex-1 py-sm rounded-lg text-label-sm font-bold transition-colors ${
                        units === "metric"
                          ? "bg-primary text-surface"
                          : "bg-surface-container-low border border-white/10 text-on-surface-variant hover:bg-white/5"
                      }`}
                    >
                      Metric (kg)
                    </button>
                    <button
                      onClick={() => setUnits("imperial")}
                      className={`flex-1 py-sm rounded-lg text-label-sm font-bold transition-colors ${
                        units === "imperial"
                          ? "bg-primary text-surface"
                          : "bg-surface-container-low border border-white/10 text-on-surface-variant hover:bg-white/5"
                      }`}
                    >
                      Imperial (lb)
                    </button>
                  </div>
                </div>
              </div>

              {/* Level Card */}
              <LevelCard impactScore={stats.impact_score} />

              {/* Share Your Impact */}
              <div className="glass-card rounded-xl p-xl">
                <h3 className="font-headline-md text-headline-md text-on-surface mb-lg">
                  Share Your Impact
                </h3>
                <p className="font-label-sm text-label-sm text-on-surface-variant/70 mb-lg">
                  Inspire others by sharing your carbon tracking journey.
                </p>
                <div className="flex gap-md">
                  <button 
                    onClick={() => {
                      const text = `I've saved ${stats.co2_saved?.toFixed(1) || 0}kg of CO2 with CarbonTrace! 🌱 #CarbonTrace`;
                      window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
                    }}
                    className="flex-1 bg-surface-container-low border border-white/10 hover:bg-white/5 text-on-surface font-bold py-sm px-md rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    Share on X
                  </button>
                  <button
                    onClick={() => {
                      const text = `I've saved ${stats.co2_saved?.toFixed(1) || 0}kg of CO2 with CarbonTrace! 🌱 #CarbonTrace`;
                      navigator.clipboard.writeText(text).then(() => {
                        alert("Caption copied to clipboard! Opening Instagram...");
                        window.open("https://instagram.com", "_blank");
                      }).catch(() => {
                        alert("Failed to copy caption to clipboard.");
                      });
                    }}
                    className="flex-1 bg-surface-container-low border border-white/10 hover:bg-white/5 text-on-surface font-bold py-sm px-md rounded-xl flex items-center justify-center gap-2 transition-colors"
                  >
                    Share on Instagram
                  </button>
                </div>
              </div>

              {/* Danger Zone */}
              <DangerZone onDelete={handleDeleteAccount} />
            </aside>
          </div>

          {/* Footer */}
          <Footer className="mt-xl border-t border-white/5 opacity-60" />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}
