import { useState, useEffect, useCallback } from "react";
import { profileService } from "../services/profileService";
import { calculateFatigueMultiplier } from "../utils/xpCalculator";

export function useProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [previousXp, setPreviousXp] = useState(null);

  //   const loadProfile = useCallback(async () => {
  //     if (!userId) return

  //     try {
  //       const data = await profileService.getProfile(userId)
  //       setPreviousXp(data.total_xp)
  //       setProfile(data)
  //     } catch (error) {
  //       console.error('Ошибка загрузки профиля:', error)
  //     } finally {
  //       setLoading(false)
  //     }
  //   }, [userId])

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const data = await profileService.getProfile(userId);
        if (isMounted) {
          setPreviousXp(data.total_xp);
          setProfile(data);
        }
      } catch (error) {
        console.error("Ошибка загрузки профиля:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const refreshProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await profileService.getProfile(userId);
      setPreviousXp(profile?.total_xp || 0);
      setProfile(data);
    } catch (error) {
      console.error("Ошибка обновления профиля:", error);
    }
  }, [userId, profile]);

  const updateFatigue = async (delta) => {
    if (!profile) return;

    const newFatigue = Math.max(
      0,
      Math.min(100, (profile.fatigue || 0) + delta),
    );

    try {
      const updated = await profileService.updateFatigue(userId, newFatigue);
      setProfile(updated);
    } catch (error) {
      console.error("Ошибка обновления усталости:", error);
    }
  };

  const fatigueMultiplier = calculateFatigueMultiplier(profile?.fatigue || 0);

  return {
    profile,
    loading,
    previousXp,
    fatigueMultiplier,
    refreshProfile,
    updateFatigue,
  };
}
