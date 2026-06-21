"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { fetchPublicProfile } from "@/lib/api";
import UserAvatar from "@/components/UserAvatar";
import { createClient } from "@/utils/supabase/client";

export default function ProfilePage() {
  const { id } = useParams();
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      // Check if logged in user is viewing their own profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user && user.id === id) {
        router.push("/settings");
        return;
      }

      const data = await fetchPublicProfile(id);
      if (data) {
        setProfile(data);
      }
      setLoading(false);
    }
    load();
  }, [id, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface flex flex-col items-center justify-center p-xl">
        <span className="material-symbols-outlined text-6xl text-error mb-4">error</span>
        <h1 className="font-headline-lg text-headline-lg text-on-surface mb-2">Profile Not Found</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-lg">This user might not exist or has been deleted.</p>
        <Link href="/leaderboard" className="bg-primary text-surface font-bold py-sm px-md rounded-xl hover:brightness-110 transition-all">
          Back to Leaderboard
        </Link>
      </div>
    );
  }

  const level = Math.floor((profile.impact_score || 0) / 100) + 1;
  let title = "Getting Started";
  if (level >= 3 && level <= 5) title = "Eco Tracker";
  else if (level >= 6 && level <= 10) title = "Green Habit Builder";
  else if (level > 10) title = "Sustainability Leader";

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center p-md md:p-xl pb-32">
      {/* Background FX */}
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px] -z-10 pointer-events-none"></div>

      <div className="w-full max-w-4xl">
        <Link href="/leaderboard" className="inline-flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-xl">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-label-md">Back to Leaderboard</span>
        </Link>

        <div className="glass-card rounded-2xl p-xl flex flex-col md:flex-row items-center md:items-start gap-xl relative overflow-hidden">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-primary/30 shadow-[0_0_30px_rgba(74,222,128,0.15)] flex-shrink-0">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name || profile.username} className="w-full h-full object-cover" />
            ) : (
              <UserAvatar name={profile.full_name || profile.username || "U"} className="w-full h-full text-5xl" />
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">
              {profile.full_name || profile.username || "Anonymous Tracker"}
            </h1>
            <p className="font-label-md text-label-md text-primary font-bold uppercase tracking-widest mb-4">
              Level {level} • {title}
            </p>
            {profile.bio && (
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                {profile.bio}
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-md mt-xl">
          <div className="glass-card rounded-xl p-md flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-2">emoji_events</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Rank</p>
            <p className="font-headline-md text-headline-md text-on-surface">#{profile.rank}</p>
          </div>
          <div className="glass-card rounded-xl p-md flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-2">eco</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">CO2 Saved</p>
            <p className="font-headline-md text-headline-md text-on-surface">{(profile.co2_saved || 0).toFixed(1)}kg</p>
          </div>
          <div className="glass-card rounded-xl p-md flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-2">local_fire_department</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Current Streak</p>
            <p className="font-headline-md text-headline-md text-on-surface">{profile.streak_days || 0} days</p>
          </div>
          <div className="glass-card rounded-xl p-md flex flex-col items-center text-center">
            <span className="material-symbols-outlined text-primary text-3xl mb-2">stars</span>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Total Points</p>
            <p className="font-headline-md text-headline-md text-on-surface">{profile.impact_score || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
