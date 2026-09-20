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

    if (data) setHabits(data);
    setLoading(false);
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
    await loadHabits();
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
      toast("Ты уже выполнил эту привычку сегодня!", {
        icon: "⚠️",
      });
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

    // Применяем множитель усталости
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

    // Показываем анимацию XP
    addXpAnimation(xpEarned, isReduced);

    setProfile({ ...profile, total_xp: newTotalXp });
    await loadHabits();
    // ✅ Добавляем проверку ачивок
    await checkAndAwardBadges(session.user.id);
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить привычку?")) return;
    await supabase.from("habits").delete().eq("id", id);
    await loadHabits();
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.bg} text-white`}>
      {/* Анимации XP */}
      {xpAnimations.map((anim) => (
        <div
          key={anim.id}
          className={`fixed top-20 right-10 text-4xl font-bold animate-xp-gain z-40 ${
            anim.isReduced ? "text-orange-400 opacity-70" : "text-yellow-400"
          }`}
        >
          +{anim.xp} XP {anim.isReduced && "(усталость)"}
        </div>
      ))}

      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/app"
            className="text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Flame className="text-orange-400" />
            Привычки
          </h1>
        </div>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Твои привычки</h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Plus size={20} />
              Создать
            </button>
          </div>

          {habits.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Нет привычек</p>
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
                    className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center hover:bg-gray-800/70 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <p className="font-semibold">{habit.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-400 flex items-center gap-1">
                            <Flame size={12} className="text-orange-400" />
                            День {habit.current_streak || 0} подряд
                          </span>
                          <span
                            className={`text-xs px-2 py-1 rounded bg-${cat.color}-600/20 text-${cat.color}-400`}
                          >
                            {cat.name}
                          </span>
                        </div>
                        <p className="text-sm text-yellow-400 flex items-center gap-1 mt-1">
                          <Zap size={12} />
                          Сегодня: {actualXp} XP{" "}
                          {fatigueMultiplier < 1 && (
                            <span className="text-orange-400">
                              (с учётом усталости)
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button
                        onClick={() => handleComplete(habit)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(habit.id)}
                        className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
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

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Flame className="text-orange-400" />
              Новая привычка
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Название
                </label>
                <input
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                  placeholder="Поход в зал"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Категория
                </label>
                <select
                  value={modalCategory}
                  onChange={(e) => setModalCategory(e.target.value)}
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                >
                  {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <option key={key} value={key}>
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
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                  min="10"
                  required
                />
                <p className="text-xs text-gray-400 mt-2">
                  Опыт уменьшается с каждым днём подряд (минимум 10 XP)
                </p>
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition"
                >
                  Создать
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 rounded-lg transition"
                >
                  Отмена
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
