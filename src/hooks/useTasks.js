import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabaseClient";
import { taskService } from "../services/taskService";
import { profileService } from "../services/profileService";
import { checkAndAwardBadges } from "../badgeChecker";
// import toast from "react-hot-toast";
import { useStats } from "./useStats";

export function useTasks(userId) {
  const [chores, setChores] = useState([]);
  const [feats, setFeats] = useState([]);
  const [milestones, setMilestones] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addStatXp } = useStats(userId);
  const loadData = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const [choresData, featsData, milestonesData] = await Promise.all([
        taskService.getTasks(userId, "chore"),
        taskService.getTasks(userId, "feat"),
        taskService.getMilestones(userId),
      ]);

      setChores(choresData || []);
      setFeats(featsData || []);
      setMilestones(milestonesData || []);
    } catch (error) {
      console.error("Ошибка загрузки задач:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const [choresData, featsData, milestonesData] = await Promise.all([
          taskService.getTasks(userId, "chore"),
          taskService.getTasks(userId, "feat"),
          taskService.getMilestones(userId),
        ]);

        if (isMounted) {
          setChores(choresData || []);
          setFeats(featsData || []);
          setMilestones(milestonesData || []);
        }
      } catch (error) {
        console.error("Ошибка загрузки задач:", error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, [userId]);
  const createTask = async (
    tier,
    title,
    xp,
    category,
    priority = "medium",
    deadline = null,
    stats = [],
  ) => {
    const newTask = {
      id: crypto.randomUUID(),
      title,
      xp,
      tier,
      category,
      priority,
      deadline,
      stats,
      status: "active",
      created_at: new Date().toISOString(),
    };

    // Оптимистичное обновление UI
    if (tier === "chore") {
      setChores((prev) => [newTask, ...prev]);
    } else if (tier === "feat") {
      setFeats((prev) => [newTask, ...prev]);
    } else if (tier === "milestone") {
      setMilestones((prev) => [newTask, ...prev]);
    }

    try {
      if (tier === "chore" || tier === "feat") {
        const { data, error } = await supabase
          .from("tasks")
          .insert([
            {
              user_id: userId,
              title,
              xp,
              tier,
              category,
              priority,
              deadline,
              stats,
            },
          ])
          .select();

        if (error) throw error;

        if (tier === "chore") {
          setChores((prev) =>
            prev.map((t) =>
              t.id === newTask.id ? { ...t, id: data[0].id } : t,
            ),
          );
        } else if (tier === "feat") {
          setFeats((prev) =>
            prev.map((t) =>
              t.id === newTask.id ? { ...t, id: data[0].id } : t,
            ),
          );
        }
      } else if (tier === "milestone") {
        const { data, error } = await supabase
          .from("milestones")
          .insert([
            {
              user_id: userId,
              title,
              xp,
              category,
              priority,
              deadline,
              stats,
            },
          ])
          .select();

        if (error) throw error;

        setMilestones((prev) =>
          prev.map((m) => (m.id === newTask.id ? { ...m, id: data[0].id } : m)),
        );
      }
    } catch (error) {
      console.error("Ошибка создания:", error);
      if (tier === "chore") {
        setChores((prev) => prev.filter((t) => t.id !== newTask.id));
      } else if (tier === "feat") {
        setFeats((prev) => prev.filter((t) => t.id !== newTask.id));
      } else if (tier === "milestone") {
        setMilestones((prev) => prev.filter((m) => m.id !== newTask.id));
      }
      throw error;
    }
  };

  const updateTask = async (id, tier, updates) => {
    try {
      if (tier === "chore" || tier === "feat") {
        const { error } = await supabase
          .from("tasks")
          .update(updates)
          .eq("id", id)
          .select();

        if (error) throw error;

        if (tier === "chore") {
          setChores((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          );
        } else {
          setFeats((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
          );
        }
      } else if (tier === "milestone") {
        const { error } = await supabase
          .from("milestones")
          .update(updates)
          .eq("id", id)
          .select();

        if (error) throw error;

        setMilestones((prev) =>
          prev.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        );
      }
    } catch (error) {
      console.error("Ошибка обновления:", error);
      throw error;
    }
  };

  const completeTask = async (task, profile, onXpEarned) => {
    const multiplier =
      profile.fatigue >= 80 ? 0.25 : profile.fatigue >= 50 ? 0.5 : 1;
    const earnedXp = Math.round(task.xp * multiplier);

    await updateTask(task.id, task.tier, {
      status: "done",
      completed_at: new Date().toISOString(),
    });

    // Преобразуем tier в понятный истории type
    const logType =
      task.tier === "chore"
        ? "task"
        : task.tier === "feat"
          ? "habit"
          : task.tier === "milestone"
            ? "milestone"
            : "task";

    await supabase.from("action_logs").insert([
      {
        user_id: userId,
        type: logType, // 'task', 'habit' или 'milestone'
        title: task.title,
        xp_earned: earnedXp,
        tier: task.tier, // оригинальный tier сохраняем для статистики
        category: task.category || "work",
      },
    ]);

    // Начисляем XP характеристикам
    if (task.stats && task.stats.length > 0 && addStatXp) {
      const statXp = Math.ceil(earnedXp / task.stats.length);

      for (const statType of task.stats) {
        await addStatXp(statType, statXp);
      }
    }

    try {
      await profileService.addXp(userId, earnedXp);
      onXpEarned(earnedXp, task.tier, earnedXp < task.xp);

      if (task.tier === "chore") {
        setChores((prev) => prev.filter((t) => t.id !== task.id));
      } else {
        setFeats((prev) => prev.filter((t) => t.id !== task.id));
      }

      const result = await checkAndAwardBadges(userId);
      if (result?.awarded) {
        await loadData();
      }
    } catch (error) {
      console.error("Ошибка при завершении задачи:", error);
      throw error;
    }
  };

  const completeMilestone = async (milestone, profile, onXpEarned) => {
    const multiplier =
      profile.fatigue >= 80 ? 0.25 : profile.fatigue >= 50 ? 0.5 : 1;
    const earnedXp = Math.round(milestone.xp * multiplier);

    await supabase
      .from("milestones")
      .update({ status: "done", completed_at: new Date().toISOString() })
      .eq("id", milestone.id);

    await supabase.from("action_logs").insert([
      {
        user_id: userId,
        type: "milestone",
        title: milestone.title,
        xp_earned: earnedXp,
        category: milestone.category,
      },
    ]);

    // Начисляем XP характеристикам
    if (milestone.stats && milestone.stats.length > 0 && addStatXp) {
      const statXp = Math.ceil(earnedXp / milestone.stats.length);

      for (const statType of milestone.stats) {
        await addStatXp(statType, statXp);
      }
    }

    try {
      await profileService.addXp(userId, earnedXp);
      onXpEarned(earnedXp, "milestone", earnedXp < milestone.xp);

      setMilestones((prev) => prev.filter((m) => m.id !== milestone.id));

      await checkAndAwardBadges(userId);
    } catch (error) {
      console.error("Ошибка при завершении достижения:", error);
      throw error;
    }
  };

  const deleteTask = async (type, id) => {
    if (type === "chore" || type === "feat") {
      await taskService.deleteTask(id);
      if (type === "chore") {
        setChores((prev) => prev.filter((t) => t.id !== id));
      } else {
        setFeats((prev) => prev.filter((t) => t.id !== id));
      }
    } else if (type === "milestone") {
      await taskService.deleteMilestone(id);
      setMilestones((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // const updateTask = async (id, tier, updates) => {
  //   try {
  //     if (tier === "chore" || tier === "feat") {
  //       const { error } = await supabase
  //         .from("tasks")
  //         .update(updates)
  //         .eq("id", id)
  //         .select();

  //       if (error) throw error;

  //       // Обновляем локальное состояние
  //       if (tier === "chore") {
  //         setChores((prev) =>
  //           prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  //         );
  //       } else {
  //         setFeats((prev) =>
  //           prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
  //         );
  //       }
  //     } else if (tier === "milestone") {
  //       const { error } = await supabase
  //         .from("milestones")
  //         .update(updates)
  //         .eq("id", id)
  //         .select();

  //       if (error) throw error;

  //       setMilestones((prev) =>
  //         prev.map((m) => (m.id === id ? { ...m, ...updates } : m)),
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Ошибка обновления:", error);
  //     throw error;
  //   }
  // };

  const duplicateTask = async (task) => {
    const newTaskData = {
      title: `${task.title} (копия)`,
      xp: task.xp,
      tier: task.tier,
      category: task.category,
      priority: task.priority || "medium",
      deadline: task.deadline,
      status: "active",
      created_at: new Date().toISOString(),
    };

    // Создаём через существующую функцию
    return createTask(
      task.tier,
      newTaskData.title,
      newTaskData.xp,
      newTaskData.category,
      newTaskData.priority,
      newTaskData.deadline,
    );
  };

  // Добавь в return:
  return {
    chores,
    feats,
    milestones,
    loading,
    loadData,
    createTask,
    updateTask,
    duplicateTask, // <-- добавь это
    completeTask,
    completeMilestone,
    deleteTask,
  };
}
