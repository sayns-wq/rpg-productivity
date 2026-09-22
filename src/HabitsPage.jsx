import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { CATEGORIES, getFatigueMultiplier } from "./constants";
import { ArrowLeft, Plus, Check, Trash2, Flame, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { checkAndAwardBadges } from "./badgeChecker";
import { useTheme } from "./useTheme";
import toast from "react-hot-toast";

function calculateHabitXp(baseXp, streak) {
  const xp = baseXp - streak * 10;
  return Math.max(xp, 10);
}

function HabitsPage() {
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalXp, setModalXp] = useState(50);
  const [modalCategory, setModalCategory] = useState("health");
  const [xpAnimations, setXpAnimations] = useState([]);
  const [profile, setProfile] = useState(null);
  const { theme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (isMounted && data) setProfile(data);
    };

    const loadHabits = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("habits")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (isMounted && data) {
        setHabits(data);
        setLoading(false);
      }
    };

    loadProfile();
    loadHabits();

    return () => {
      isMounted = false;
    };
  }, []);

  const loadHabitsData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from("habits")
      .select("*")
      .eq("user_id", session.user.id)
      .order("created_at", { ascending: false });

    if (data) setHabits(data);
  };

  const addXpAnimation = (xp, isReduced) => {
    const id = crypto.randomUUID();
    setXpAnimations((prev) => [...prev, { id, xp, isReduced }]);
    setTimeout(() => {
      setXpAnimations((prev) => prev.filter((a) => a.id !== id));
    }, 1500);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const {
      data: { session },
    } = await supabase.auth.getSession();

    await supabase.from("habits").insert([
      {
        user_id: session.user.id,
        title: modalTitle,
        base_xp: modalXp,
        category: modalCategory,
      },
    ]);

    setShowModal(false);
    setModalTitle("");
    setModalXp(50);
    setModalCategory("health");
    await loadHabitsData();
    toast.success("Привычка создана!");
  };

  const handleComplete = async (habit) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const now = new Date();
    const lastCompleted = habit.last_completed_at
      ? new Date(habit.last_completed_at)
      : null;

    if (lastCompleted && lastCompleted.toDateString() === now.toDateString()) {
      toast("Ты уже выполнил эту привычку сегодня!", { icon: "⚠️" });
      return;
    }

    let newStreak = 1;
    if (lastCompleted) {
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastCompleted.toDateString() === yesterday.toDateString()) {
        newStreak = (habit.current_streak || 0) + 1;
      }
    }

    const baseXp = calculateHabitXp(habit.base_xp, newStreak);
    const fatigueMultiplier = getFatigueMultiplier(profile?.fatigue || 0);
    const xpEarned = Math.round(baseXp * fatigueMultiplier);
    const isReduced = xpEarned < baseXp;

    await supabase
      .from("habits")
      .update({
        current_streak: newStreak,
        last_completed_at: now.toISOString(),
      })
      .eq("id", habit.id);

    await supabase.from("action_logs").insert([
      {
        user_id: session.user.id,
        type: "habit",
        title: habit.title,
        xp_earned: xpEarned,
        category: habit.category,
      },
    ]);

    const { data: profileData } = await supabase
      .from("profiles")
      .select("total_xp")
      .eq("id", session.user.id)
      .single();

    const newTotalXp = (profileData.total_xp || 0) + xpEarned;
    await supabase
      .from("profiles")
      .update({ total_xp: newTotalXp })
      .eq("id", session.user.id);

    addXpAnimation(xpEarned, isReduced);
    setProfile({ ...profile, total_xp: newTotalXp });
    await loadHabitsData();
    await checkAndAwardBadges(session.user.id);

    toast.success(`+${xpEarned} XP!`);
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить привычку?")) return;
    await supabase.from("habits").delete().eq("id", id);
    await loadHabitsData();
    toast.success("Привычка удалена");
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.bg} text-white transition-colors duration-500`}
    >
      {/* Анимации XP */}
      {xpAnimations.map((anim) => (
        <div
          key={anim.id}
          className={`fixed top-20 right-4 sm:right-10 text-2xl sm:text-4xl font-bold animate-xp-gain z-40 pointer-events-none ${
            anim.isReduced ? "text-orange-400 opacity-70" : "text-yellow-400"
          }`}
        >
          +{anim.xp} XP {anim.isReduced && "(усталость)"}
        </div>
      ))}

      <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        {/* Шапка */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link
            to="/app"
            className="text-gray-400 hover:text-white transition p-2 -ml-2 sm:ml-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2 min-w-0">
            <Flame className="text-orange-400 flex-shrink-0" size={24} />
            <span className="truncate">Привычки</span>
          </h1>
        </div>

        {/* Основной блок */}
        <div className="glass rounded-2xl p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
            <h2 className="text-lg sm:text-xl font-semibold">Твои привычки</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 sm:py-2 rounded-lg transition flex items-center justify-center gap-2 min-h-[44px] w-full sm:w-auto font-semibold"
            >
              <Plus size={20} />
              <span>Создать</span>
            </button>
          </div>

          {habits.length === 0 ? (
            <p className="text-gray-500 text-center py-8 text-sm">
              Нет привычек. Создай первую, чтобы начать серию! 🔥
            </p>
          ) : (
            <div className="space-y-3">
              {habits.map((habit) => {
                const cat = CATEGORIES[habit.category] || CATEGORIES.health;
                const todayXp = calculateHabitXp(
                  habit.base_xp,
                  (habit.current_streak || 0) + 1,
                );
                const fatigueMultiplier = getFatigueMultiplier(
                  profile?.fatigue || 0,
                );
                const actualXp = Math.round(todayXp * fatigueMultiplier);

                return (
                  <div
                    key={habit.id}
                    className="bg-gray-800/50 p-3 sm:p-4 rounded-lg flex items-start gap-3 hover:bg-gray-800/70 transition group"
                  >
                    <span className="text-2xl flex-shrink-0 mt-0.5">
                      {cat.icon}
                    </span>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm sm:text-base truncate">
                        {habit.title}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Flame size={12} className="text-orange-400" />
                          День {habit.current_streak || 0}
                        </span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded bg-${cat.color}-600/20 text-${cat.color}-400 border border-${cat.color}-500/30`}
                        >
                          {cat.icon}{" "}
                          <span className="hidden sm:inline">{cat.name}</span>
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-yellow-400 flex items-center gap-1 mt-1.5">
                        <Zap size={12} />
                        Сегодня: {actualXp} XP{" "}
                        {fatigueMultiplier < 1 && (
                          <span className="text-orange-400 text-[10px] sm:text-xs">
                            (с учётом усталости)
                          </span>
                        )}
                      </p>
                    </div>

                    {/* Кнопки действий: всегда видны на мобильных, по ховеру на ПК */}
                    <div className="flex gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition flex-shrink-0 mt-1 sm:mt-0">
                      <button
                        onClick={() => handleComplete(habit)}
                        className="bg-green-600/20 hover:bg-green-600 text-green-400 hover:text-white p-2 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Выполнить"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="bg-red-600/20 hover:bg-red-600 text-red-400 hover:text-white p-2 rounded-lg transition min-w-[44px] min-h-[44px] flex items-center justify-center"
                        aria-label="Удалить"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Модальное окно */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in">
          <div className="glass rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <Flame className="text-orange-400" size={24} />
                Новая привычка
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white p-2 min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Название
                </label>
                {/* text-base (16px) предотвращает зум на iOS при фокусе */}
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full bg-gray-800/50 text-white text-base px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition min-h-[44px]"
                  placeholder="Поход в зал"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Категория
                </label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full bg-gray-800/50 text-white text-base px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition min-h-[44px]"
                >
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key} className="bg-gray-900">
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Базовый XP
                </label>
                <input
                  type="number"
                  value={modalXp}
                  onChange={(e) =>
                    setModalXp(Math.max(10, parseInt(e.target.value) || 10))
                  }
                  className="w-full bg-gray-800/50 text-white text-base px-4 py-3 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition min-h-[44px]"
                  min="10"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  Опыт уменьшается с каждым днём подряд (минимум 10 XP)
                </p>
              </div>

              <div className="flex gap-3 mt-6 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition min-h-[44px]"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold py-3 rounded-lg transition min-h-[44px]"
                >
                  Создать
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default HabitsPage;
