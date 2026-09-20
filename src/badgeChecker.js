import { supabase } from "./supabaseClient";

export async function checkAndAwardBadges(userId) {
  // Получаем все активные ачивки пользователя
  const { data: badges } = await supabase
    .from("badges")
    .select("*")
    .eq("user_id", userId)
    .eq("is_active", true);

  if (!badges) return;

  // Получаем уже полученные ачивки
  const { data: earned } = await supabase
    .from("user_badges")
    .select("badge_id")
    .eq("user_id", userId);

  const earnedIds = new Set(earned?.map((e) => e.badge_id) || []);

  // Получаем статистику пользователя
  const { data: profile } = await supabase
    .from("profiles")
    .select("total_xp")
    .eq("id", userId)
    .single();

  const { count: tasksCount } = await supabase
    .from("action_logs")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("type", "task");

  const { count: milestonesCount } = await supabase
    .from("action_logs")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .eq("type", "milestone");

  // Проверяем каждую ачивку
  for (const badge of badges) {
    if (earnedIds.has(badge.id)) continue;

    let conditionMet = false;

    switch (badge.condition_type) {
      case "total_xp":
        conditionMet = (profile?.total_xp || 0) >= badge.condition_value;
        break;
      case "tasks_completed":
        conditionMet = (tasksCount || 0) >= badge.condition_value;
        break;
      case "milestones_completed":
        conditionMet = (milestonesCount || 0) >= badge.condition_value;
        break;
      // Для habits_streak и category_tasks нужна более сложная логика
    }

    if (conditionMet) {
      // Добавляем ачивку
      await supabase.from("user_badges").insert([
        {
          user_id: userId,
          badge_id: badge.id,
        },
      ]);

      // Начисляем награду
      if (badge.reward_xp > 0) {
        await supabase
          .from("profiles")
          .update({ total_xp: (profile?.total_xp || 0) + badge.reward_xp })
          .eq("id", userId);
      }
    }
  }
}
