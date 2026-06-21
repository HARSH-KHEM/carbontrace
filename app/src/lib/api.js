import { createClient } from '@/utils/supabase/client';

const supabase = createClient();

// Helper to get current user ID
async function getUserId() {
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id;
}

export async function fetchDashboardData() {
  const userId = await getUserId();
  if (!userId) return null;

  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error || !profile) throw error;

    const today = new Date();
    today.setHours(0,0,0,0);
    const { data: todayLogs } = await supabase
      .from('activities')
      .select('total_co2')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString());
    
    const dailyCO2 = todayLogs?.reduce((sum, log) => sum + Number(log.total_co2 || 0), 0) || 0;

    return {
      userName: profile.username || "Eco Warrior",
      dailyCO2: dailyCO2,
      percentChange: 0,
      streakDays: profile.streak_days || 0,
      streakTarget: 7,
      streakTitle: profile.title || "Beginner",
      impactScore: profile.impact_score || 0,
      co2Saved: profile.co2_saved || 0,
      avatarUrl: profile.avatar_url || null,
    };
  } catch (e) {
    console.error('Error fetching dashboard data:', e);
    return {
      userName: "User", dailyCO2: 0, percentChange: 0, streakDays: 0,
      streakTarget: 7, streakTitle: "Beginner", impactScore: 0, co2Saved: 0, avatarUrl: null
    };
  }
}

export async function fetchRecentLogs() {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const { data, error } = await supabase
      .from('activities')
      .select('id, transport_co2, food_co2, energy_co2, shopping_co2, total_co2, created_at, transport_input, food_input, energy_input, shopping_input')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) throw error;

    return data.map(log => ({
      id: log.id,
      activity: "Daily Summary",
      icon: "eco",
      impact: `${Number(log.total_co2).toFixed(1)} kg`,
      time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      rawLog: log,
      co2_saved: computeActivityCO2Saved(log)
    }));
  } catch (e) {
    console.error('Error fetching recent logs:', e.message || e);
    return [];
  }
}

export async function fetchWeeklyEmissions(range = 'week') {
  const userId = await getUserId();
  if (!userId) return [];

  try {
    const days = range === 'month' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);
    startDate.setHours(0,0,0,0);

    const { data, error } = await supabase
      .from('activities')
      .select('id, transport_co2, food_co2, energy_co2, shopping_co2, total_co2, created_at, transport_input, food_input, energy_input, shopping_input')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Initialize all days
    const dailyData = {};
    for (let i = 0; i < days; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (days - 1 - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayName = range === 'week' 
        ? d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
        : d.getDate().toString();
      dailyData[dateStr] = { day: dayName, dateStr: dateStr, value: 0, activities: [] };
    }

    if (data) {
      data.forEach(log => {
        const dateStr = log.created_at.split('T')[0];
        if (dailyData[dateStr]) {
          dailyData[dateStr].value += Number(log.total_co2 || 0);
          dailyData[dateStr].activities.push({
            ...log,
            co2_saved: computeActivityCO2Saved(log),
            time: new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          });
        }
      });
    }

    const allDays = Object.values(dailyData);
    const maxVal = Math.max(...allDays.map(d => d.value), 10);

    return allDays.map((d, index) => ({
      day: d.day,
      dateStr: d.dateStr,
      value: Number(d.value.toFixed(1)),
      height: `${Math.max(5, (d.value / maxVal) * 100)}%`,
      isHighlighted: index === allDays.length - 1,
      activities: d.activities
    }));
  } catch (e) {
    console.error('Error fetching emissions:', e.message || e);
    return [];
  }
}

export async function searchUsers(query) {
  if (!query || query.length < 2) return [];
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .limit(10);
  
  if (error) {
    console.error("Error searching users:", error);
    return [];
  }
  return data || [];
}

// ─── Per-Category Baselines (kg CO2e) ───
// These represent the high-emission alternative for each category.
// co2_saved per activity = sum of max(0, baseline - actual) across categories.
const CATEGORY_BASELINES = {
  transport: 4.2,  // ~20 km car commute (0.21 kg/km)
  food:      9.9,  // 3 meat-heavy meals (3.3 kg each)
  energy:    3.9,  // 8h screen (1.86) + medium heating (2.0)
  shopping:  4.0,  // ~1 item heavy-packaging (4 kg)
};

function computeActivityCO2Saved(activity) {
  const saved =
    Math.max(0, CATEGORY_BASELINES.transport - (activity.transport_co2 || 0)) +
    Math.max(0, CATEGORY_BASELINES.food      - (activity.food_co2 || 0)) +
    Math.max(0, CATEGORY_BASELINES.energy     - (activity.energy_co2 || 0)) +
    Math.max(0, CATEGORY_BASELINES.shopping   - (activity.shopping_co2 || 0));
  return Math.round(saved * 100) / 100; // 2 decimal places
}

// ─── Daily Activity Logger ───
export async function logActivity(data) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: 'Not authenticated' };

  try {
    const activityRow = {
      transport_co2: data.transport_co2 || 0,
      food_co2: data.food_co2 || 0,
      energy_co2: data.energy_co2 || 0,
      shopping_co2: data.shopping_co2 || 0,
      total_co2: data.totalCO2 || data.total_co2 || 0,
      transport_input: data.transport_input || null,
      food_input: data.food_input || null,
      energy_input: data.energy_input || null,
      shopping_input: data.shopping_input || null,
    };

    const { data: inserted, error } = await supabase
      .from('activities')
      .insert([{ user_id: userId, ...activityRow }])
      .select()
      .single();
    
    if (error) throw error;
    const result = inserted;

    // ─── Recalculate profile stats via atomic RPC ───
    const { error: rpcError } = await supabase.rpc('recalculate_profile_stats', {
      user_uuid: userId
    });

    if (rpcError) {
      console.error('Error recalculating profile stats:', rpcError);
      // We still return success for the activity log itself
    }

    return { success: true, id: result.id };
  } catch (err) {
    console.error('Error logging activity:', err.message || err);
    return { success: false, error: err.message || 'Failed to log activity' };
  }
}

export async function checkTodayLog() {
  const userId = await getUserId();
  if (!userId) return null;
  try {
    const today = new Date();
    today.setHours(0,0,0,0);
    const { data } = await supabase
      .from('activities')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', today.toISOString())
      .order('created_at', { ascending: false })
      .limit(1);
    return data && data.length > 0 ? data[0] : null;
  } catch (e) {
    return null;
  }
}

export async function saveDraft(data) {
  return { success: true };
}

export async function calculateFootprint(data) {
  let transportCO2 = 0;
  const dist = data.travelDistance || 0;
  if (data.vehicleType === "Electric Car" || data.vehicleType === "Petrol SUV" || data.vehicleType?.includes("Car")) {
    transportCO2 = dist * 0.21;
  } else if (data.vehicleType === "Public Transport" || data.vehicleType?.includes("Bus")) {
    transportCO2 = dist * 0.089;
  } else if (data.vehicleType === "Train" || data.vehicleType === "Subway") {
    transportCO2 = dist * 0.041;
  } else if (data.vehicleType === "Cycling/Walking" || data.vehicleType?.includes("Walk") || data.vehicleType?.includes("Bike")) {
    transportCO2 = 0;
  } else {
    transportCO2 = dist * 0.21;
  }

  const meatMeals = data.mealsWithMeat || 0;
  const noMeatMeals = Math.max(0, 3 - meatMeals);
  let foodCO2 = (meatMeals * 3.3) + (noMeatMeals * 1.5);
  if (data.locallySourced) foodCO2 *= 0.8;

  let energyCO2 = (data.deviceHours || 0) * 0.233;
  const hl = data.heatingLevel || 0;
  if (hl < 33) energyCO2 += 1;
  else if (hl < 66) energyCO2 += 2.5;
  else energyCO2 += 4;

  const items = data.itemsPurchased || 0;
  const pack = data.packagingLevel || "";
  let shoppingCO2 = 0;
  if (pack.includes("Plastic-Free") || pack.includes("Low")) shoppingCO2 = items * 1;
  else if (pack.includes("Medium")) shoppingCO2 = items * 2.5;
  else shoppingCO2 = items * 4;

  return { totalCO2: transportCO2 + foodCO2 + energyCO2 + shoppingCO2 };
}

// ─── AI Insights ───
export async function getInsights(refresh = false) {
  const userId = await getUserId();
  
  let tips = [];
  if (userId) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    let data = null, error = null;
    if (!refresh) {
      // 1. Check insights table for tips generated this week
      const res = await supabase
        .from('insights')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', sevenDaysAgo.toISOString())
        .order('created_at', { ascending: false });
      data = res.data;
      error = res.error;
    }

    if (!refresh && !error && data && data.length >= 3) {
      tips = data.slice(0, 3).map(t => ({
        id: t.id,
        category: t.category,
        categoryIcon: t.icon || "eco",
        title: t.title,
        description: t.description,
        impact: t.impact || 'medium',
        isFeatured: t.is_featured,
        isCompleted: t.is_completed
      }));
    } else if (refresh) {
      // 2. If refresh is true -> call /api/insights route to generate fresh ones
      try {
        const res = await fetch(`/api/insights?refresh=true`);
        if (res.ok) {
          const freshData = await res.json();
          tips = freshData.map(t => ({
            id: t.id,
            category: t.category,
            categoryIcon: t.icon || "eco",
            title: t.title,
            description: t.description,
            impact: t.impact || 'medium',
            isFeatured: t.is_featured,
            isCompleted: t.is_completed
          }));
        }
      } catch (err) {
        console.error("Failed to generate fresh insights:", err);
      }
    }
  }

  // Fallback tips if API fails during a refresh
  if (refresh && tips.length === 0) {
    tips = [
      {
        id: "tip-1",
        category: "energy",
        categoryIcon: "eco",
        title: "Optimize your home's thermal canopy",
        description: "Adjusting your smart thermostat by just 2 degrees during peak evening hours could reduce your weekly footprint.",
        impact: "high",
        isFeatured: true,
        isCompleted: false
      },
      {
        id: "tip-2",
        category: "shopping",
        categoryIcon: "local_shipping",
        title: "Consolidate Orders",
        description: "Wait for two more items in your cart before shipping.",
        impact: "medium",
        isCompleted: false
      },
      {
        id: "tip-3",
        category: "food",
        categoryIcon: "restaurant",
        title: "Meatless Mondays",
        description: "Switching to plant-based meals one day a week saves significant emissions.",
        impact: "high",
        isCompleted: false
      }
    ];
  }

  return {
    weeklyEstimatedSavings: 12.8,
    savingsBreakdown: {
      energy: 70,
      travel: 30,
      diet: 55,
    },
    tips,
  };
}

export async function markTipComplete(tipId) {
  const userId = await getUserId();
  if (!userId) return { success: false };

  const { error } = await supabase
    .from('insights')
    .update({ is_completed: true })
    .eq('id', tipId)
    .eq('user_id', userId);

  if (error) {
    console.error("Error marking tip complete:", error);
    return { success: false };
  }

  return { success: true };
}

export async function getWeeklySavings() {
  return { savings: 12.8, unit: "kg CO2e" };
}

// ─── Leaderboard ───
export async function fetchLeaderboard() {
  try {
    // Query profiles directly, sorted by impact_score DESC then created_at ASC
    // (tie-break: earlier registration wins)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, co2_saved, impact_score, streak_days, level, created_at')
      .order('impact_score', { ascending: false })
      .order('created_at', { ascending: true });

    if (error || !data || data.length === 0) {
      return { users: [], currentUser: null, otherUsers: [], totalUsers: 0, allUsersFlat: [] };
    }

    // Compute dense rank: same score → same rank, next distinct score → rank+1
    let currentRank = 1;
    const users = data.map((u, index) => {
      if (index > 0 && u.impact_score !== data[index - 1].impact_score) {
        currentRank = index + 1;
      }
      return {
        id: u.id,
        rank: currentRank,
        name: u.username || u.full_name || 'Anonymous User',
        title: `Level ${u.level || 1}`,
        avatar: u.avatar_url,
        saved: (u.co2_saved || 0).toFixed(1),
        points: `${u.impact_score || 0}`,
        rawCo2Saved: u.co2_saved || 0,
        rawPoints: u.impact_score || 0,
        streakDays: u.streak_days || 0,
        glowClass: currentRank === 1 ? "gold-glow" : currentRank === 2 ? "silver-glow" : currentRank === 3 ? "bronze-glow" : "",
        borderColor: currentRank === 1 ? "border-[#ffd700]" : currentRank === 2 ? "border-[#c0c0c0]" : currentRank === 3 ? "border-[#cd7f32]" : "",
        isLarge: index === 0,
      };
    });

    const userId = await getUserId();
    let currentUser = null;
    if (userId) {
      const me = users.find(u => u.id === userId);
      if (me) {
        currentUser = { ...me, initials: me.name.substring(0,2).toUpperCase() };
      }
    }

    return {
      users: users.slice(0, 3),
      currentUser,
      otherUsers: users.slice(3),
      totalUsers: data.length,
      allUsersFlat: users // for search
    };
  } catch (e) {
    console.error("Error fetching leaderboard:", e);
    return { users: [], currentUser: null, otherUsers: [], totalUsers: 0, allUsersFlat: [] };
  }
}

export async function fetchPublicProfile(userId) {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url, bio, co2_saved, impact_score, streak_days, level, created_at')
      .eq('id', userId)
      .single();

    if (error || !profile) return null;

    // Compute rank efficiently by counting users with a strictly higher impact score
    const { count } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .gt('impact_score', profile.impact_score || 0);

    const rank = (count || 0) + 1;

    return { ...profile, rank };
  } catch (e) {
    console.error("Error fetching public profile:", e);
    return null;
  }
}

export async function fetchUserRank() {
  return { rank: 14, total: 1280 };
}

// ─── Onboarding ───
export async function submitOnboarding(answers) {
  const userId = await getUserId();
  if (userId) {
    try {
      const baseline = (answers.commute_type === 'car' ? 10 : 2) + (answers.diet_type === 'meat' ? 5 : 2);
      await supabase.from('onboarding').insert([{
        user_id: userId,
        commute_type: answers.commute_type || 'car',
        diet_type: answers.diet_type || 'mixed',
        heating_type: answers.heating_type || 'gas',
        baseline_co2: baseline
      }]);
      await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', userId);
    } catch (e) {
      console.error("Error submitting onboarding", e);
    }
  }
  return { success: true };
}

export async function skipOnboarding() {
  return { success: true };
}

// ─── Settings ───
export async function updateProfile(data) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: 'Not authenticated' };
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: data.fullName,
      username: data.username || data.fullName,
      location: data.location,
      occupation: data.occupation,
      bio: data.bio
    })
    .eq('id', userId);

  if (error) {
    console.error("Error updating profile:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updatePreferences(data) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: 'Not authenticated' };
  const { error } = await supabase
    .from('profile_private')
    .upsert({ id: userId, preferences: data });

  if (error) {
    console.error("Error updating preferences:", error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function connectAccount(service) {
  return { success: true };
}

export async function disconnectAccount(service) {
  return { success: true };
}

export async function deleteAccount() {
  return { success: true };
}

export async function checkOnboardingStatus() {
  const userId = await getUserId();
  if (!userId) return false;
  try {
    const { data } = await supabase.from('profiles').select('onboarding_completed').eq('id', userId).single();
    return data?.onboarding_completed || false;
  } catch (e) {
    return false;
  }
}

export async function fetchProfileSettings() {
  const userId = await getUserId();
  if (!userId) return null;
  try {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    return data;
  } catch (e) {
    return null;
  }
}

export async function uploadAvatar(file) {
  const userId = await getUserId();
  if (!userId) return { success: false, error: 'Not authenticated' };

  try {
    const fileExt = file.name.split('.').pop();
    const filePath = `${userId}/avatar.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    
    if (data) {
      const publicUrlWithCacheBuster = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: publicUrlWithCacheBuster }).eq('id', userId);
      return { success: true, publicUrl: publicUrlWithCacheBuster };
    }
    return { success: false, error: 'Failed to get public URL' };
  } catch (error) {
    console.error('Error uploading avatar:', error);
    return { success: false, error: error.message };
  }
}
