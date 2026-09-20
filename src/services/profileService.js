import { supabase } from "../supabaseClient";

export const profileService = {
  async getProfile(userId) {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) throw error;
    if (!data) throw new Error("Профиль не найден");
    return data;
  },

  async updateFatigue(userId, fatigue) {
    const { data, error } = await supabase
      .from("profiles")
      .update({ fatigue })
      .eq("id", userId)
      .select();

    if (error) throw error;
    return data[0];
  },

  async addXp(userId, xpAmount) {
    try {
      const profile = await this.getProfile(userId);

      const currentXp = profile.total_xp || 0;
      const newTotalXp = currentXp + xpAmount;

      const { data, error } = await supabase
        .from("profiles")
        .update({ total_xp: newTotalXp })
        .eq("id", userId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error("Ошибка добавления XP:", error);
      throw error;
    }
  },
};
