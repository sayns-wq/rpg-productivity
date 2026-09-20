import { useState, useEffect } from "react";
import { supabase } from "../supabaseClient";
import { STATS } from "../constants/stats";

export function useStats(userId) {
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadStats = async () => {
    const { data, error } = await supabase
      .from("user_stats")
      .select("*")
      .eq("user_id", userId);

    if (error) {
      console.error("Ошибка загрузки характеристик:", error);
    } else if (data) {
      const statsWithInfo = data.map((stat) => ({
        ...stat,
        ...STATS[stat.stat_type],
        level: Math.floor(stat.xp / 100) + 1,
        xpToNext: 100 - (stat.xp % 100),
      }));
      setStats(statsWithInfo);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Проверяем что userId существует и не равен "null"
    if (
      !userId ||
      userId === "null" ||
      userId === null ||
      userId === undefined
    ) {
      setLoading(false);
      return;
    }

    let isMounted = true;

    const load = async () => {
      const { data, error } = await supabase
        .from("user_stats")
        .select("*")
        .eq("user_id", userId);

      if (!isMounted) return;

      if (error) {
        console.error("Ошибка загрузки характеристик:", error);
      } else if (data) {
        const statsWithInfo = data.map((stat) => ({
          ...stat,
          ...STATS[stat.stat_type],
          level: Math.floor(stat.xp / 100) + 1,
          xpToNext: 100 - (stat.xp % 100),
        }));
        setStats(statsWithInfo);
      }
      setLoading(false);
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const addStatXp = async (statType, xpAmount) => {
    const stat = stats.find((s) => s.stat_type === statType);
    if (!stat) return;

    const newXp = stat.xp + xpAmount;
    const newLevel = Math.floor(newXp / 100) + 1;
    const oldLevel = Math.floor(stat.xp / 100) + 1;

    const { error } = await supabase
      .from("user_stats")
      .update({
        xp: newXp,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .eq("stat_type", statType);

    if (error) {
      console.error("Ошибка обновления характеристики:", error);
      return null;
    }

    await loadStats();

    return {
      statType,
      oldLevel,
      newLevel,
      leveledUp: newLevel > oldLevel,
    };
  };

  return { stats, loading, addStatXp, refetch: loadStats };
}
