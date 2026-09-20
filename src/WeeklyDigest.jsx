import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { CATEGORIES } from "./constants";
import { ArrowLeft, Calendar, Award, Flame, Target } from "lucide-react";
import { useTheme } from "./useTheme";
import { Link } from "react-router-dom";
import { subDays, format, startOfDay, endOfDay } from "date-fns";
import { ru } from "date-fns/locale";

function WeeklyDigest() {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [digest, setDigest] = useState({
    totalXp: 0,
    completedTasks: 0,
    completedHabits: 0,
    completedMilestones: 0,
    topCategory: null,
    dailyBreakdown: [],
    streakDays: 0,
  });

  useEffect(() => {
    let isMounted = true;

    const loadDigest = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const weekAgo = subDays(new Date(), 7).toISOString();

      const { data: logs } = await supabase
        .from("action_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("created_at", weekAgo)
        .order("created_at", { ascending: true });

      if (!logs) {
        setLoading(false);
        return;
      }

      // Общее количество XP
      const totalXp = logs.reduce((sum, log) => sum + log.xp_earned, 0);

      // Количество по типам
      const completedTasks = logs.filter((l) => l.type === "task").length;
      const completedHabits = logs.filter((l) => l.type === "habit").length;
      const completedMilestones = logs.filter(
        (l) => l.type === "milestone",
      ).length;

      // Топ категория
      // Топ категория
      const categoryCounts = {};
      logs.forEach((log) => {
        const cat = log.category || "work";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const topCategoryKey = Object.keys(categoryCounts).reduce(
        (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
        null,
      ); // ← важно: начальное значение null

      const topCategory = topCategoryKey
        ? CATEGORIES[topCategoryKey] || CATEGORIES.work
        : null;

      // Разбивка по дням
      const dailyBreakdown = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const dayLogs = logs.filter((log) => {
          const logDate = new Date(log.created_at);
          return logDate >= dayStart && logDate <= dayEnd;
        });

        const dayXp = dayLogs.reduce((sum, log) => sum + log.xp_earned, 0);

        dailyBreakdown.push({
          date: format(date, "EEE, dd.MM", { locale: ru }),
          tasks: dayLogs.length,
          xp: dayXp,
        });
      }

      // Серия дней (сколько дней подряд были действия)
      const uniqueDays = new Set(
        logs.map((log) => format(new Date(log.created_at), "yyyy-MM-dd")),
      );
      const streakDays = uniqueDays.size;
      if (isMounted) {
        setDigest({
          totalXp,
          completedTasks,
          completedHabits,
          completedMilestones,
          topCategory,
          dailyBreakdown,
          streakDays,
        });
      }

      setLoading(false);
    };

    loadDigest();

    return () => {
      isMounted = false;
    };
  }, []);

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
      <div className="max-w-4xl mx-auto p-6">
        {/* Шапка */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Calendar className="text-purple-400" />
            Итоги недели
          </h1>
        </div>

        {/* Главная карточка */}
        <div className="glass rounded-2xl p-8 mb-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500/30">
          <div className="text-center">
            <p className="text-gray-400 text-sm mb-2">
              За последние 7 дней ты заработал
            </p>
            <p className="text-6xl font-bold text-yellow-400 mb-2">
              {digest.totalXp} XP
            </p>
            <p className="text-gray-400">
              Это примерно {Math.round(digest.totalXp / 7)} XP в день
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-400" size={24} />
              <span className="text-sm text-gray-400">Выполнено дел</span>
            </div>
            <p className="text-3xl font-bold">{digest.completedTasks}</p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-orange-400" size={24} />
              <span className="text-sm text-gray-400">Привычек выполнено</span>
            </div>
            <p className="text-3xl font-bold">{digest.completedHabits}</p>
          </div>

          <div className="glass rounded-xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-purple-400" size={24} />
              <span className="text-sm text-gray-400">Достижений</span>
            </div>
            <p className="text-3xl font-bold">{digest.completedMilestones}</p>
          </div>
        </div>

        {/* Топ категория */}
        <div className="glass rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            🏆 Самая активная категория
          </h2>
          {digest.topCategory ? (
            <div className="flex items-center gap-4">
              <span className="text-5xl">{digest.topCategory.icon}</span>
              <div>
                <p className="text-2xl font-bold">{digest.topCategory.name}</p>
                <p className="text-gray-400">
                  Ты молодец, что фокусируешься на этом!
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              Пока нет данных для определения категории
            </p>
          )}
        </div>

        {/* Разбивка по дням */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">📅 Активность по дням</h2>
          <div className="space-y-3">
            {digest.dailyBreakdown.map((day, index) => (
              <div
                key={index}
                className="bg-gray-800/50 p-4 rounded-lg flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold">{day.date}</p>
                  <p className="text-sm text-gray-400">{day.tasks} действий</p>
                </div>
                <p className="text-yellow-400 font-bold">+{day.xp} XP</p>
              </div>
            ))}
          </div>
        </div>

        {/* Серия дней */}
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-4">
            <Flame className="text-orange-400" size={48} />
            <div>
              <p className="text-gray-400 text-sm">Ты был активен</p>
              <p className="text-3xl font-bold">
                {digest.streakDays} из 7 дней
              </p>
              <p className="text-gray-400 text-sm mt-1">
                {digest.streakDays === 7
                  ? " Идеальная неделя!"
                  : digest.streakDays >= 5
                    ? " Отличный результат!"
                    : "📈 Есть куда расти"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyDigest;
