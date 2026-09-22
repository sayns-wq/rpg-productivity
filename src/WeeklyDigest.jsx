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

      const totalXp = logs.reduce((sum, log) => sum + log.xp_earned, 0);
      const completedTasks = logs.filter((l) => l.type === "task").length;
      const completedHabits = logs.filter((l) => l.type === "habit").length;
      const completedMilestones = logs.filter(
        (l) => l.type === "milestone",
      ).length;

      const categoryCounts = {};
      logs.forEach((log) => {
        const cat = log.category || "work";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });

      const topCategoryKey = Object.keys(categoryCounts).reduce(
        (a, b) => (categoryCounts[a] > categoryCounts[b] ? a : b),
        null,
      );

      const topCategory = topCategoryKey
        ? CATEGORIES[topCategoryKey] || CATEGORIES.work
        : null;

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
        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen ${theme.bg} text-white transition-colors duration-500`}
    >
      {/* Адаптивные отступы контейнера */}
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
            <Calendar className="text-purple-400 flex-shrink-0" size={24} />
            <span className="truncate">Итоги недели</span>
          </h1>
        </div>

        {/* Главная карточка */}
        <div className="glass rounded-2xl p-6 sm:p-8 mb-4 sm:mb-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500/30">
          <div className="text-center">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">
              За последние 7 дней ты заработал
            </p>
            <p className="text-4xl sm:text-6xl font-bold text-yellow-400 mb-2 break-words">
              {digest.totalXp} XP
            </p>
            <p className="text-gray-400 text-sm">
              Это примерно {Math.round(digest.totalXp / 7)} XP в день
            </p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="glass rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-400 flex-shrink-0" size={20} />
              <span className="text-xs sm:text-sm text-gray-400">
                Выполнено дел
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">
              {digest.completedTasks}
            </p>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-orange-400 flex-shrink-0" size={20} />
              <span className="text-xs sm:text-sm text-gray-400">Привычек</span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">
              {digest.completedHabits}
            </p>
          </div>

          <div className="glass rounded-xl p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-purple-400 flex-shrink-0" size={20} />
              <span className="text-xs sm:text-sm text-gray-400">
                Достижений
              </span>
            </div>
            <p className="text-2xl sm:text-3xl font-bold">
              {digest.completedMilestones}
            </p>
          </div>
        </div>
        {/* Серия дней */}
        <div className="glass rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            <Flame className="text-orange-400 flex-shrink-0" size={32} />
            <div className="min-w-0">
              <p className="text-gray-400 text-xs sm:text-sm">Ты был активен</p>
              <p className="text-2xl sm:text-3xl font-bold">
                {digest.streakDays} из 7 дней
              </p>
              <p className="text-gray-400 text-xs sm:text-sm mt-1">
                {digest.streakDays === 7
                  ? "🔥 Идеальная неделя!"
                  : digest.streakDays >= 5
                    ? "👍 Отличный результат!"
                    : "📈 Есть куда расти"}
              </p>
            </div>
          </div>
        </div>
        {/* Топ категория */}
        <div className="glass rounded-xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            🏆 Самая активная категория
          </h2>
          {digest.topCategory ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-4xl sm:text-5xl flex-shrink-0">
                {digest.topCategory.icon}
              </span>
              <div className="min-w-0">
                <p className="text-xl sm:text-2xl font-bold truncate">
                  {digest.topCategory.name}
                </p>
                <p className="text-gray-400 text-sm">
                  Ты молодец, что фокусируешься на этом!
                </p>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4 text-sm">
              Пока нет данных для определения категории
            </p>
          )}
        </div>

        {/* Разбивка по дням */}
        <div className="glass rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            📅 Активность по дням
          </h2>
          <div className="space-y-2 sm:space-y-3">
            {digest.dailyBreakdown.map((day, index) => (
              <div
                key={index}
                className="bg-gray-800/50 p-3 sm:p-4 rounded-lg flex justify-between items-center"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {day.date}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-400">
                    {day.tasks} действий
                  </p>
                </div>
                <p className="text-yellow-400 font-bold text-sm sm:text-base flex-shrink-0">
                  +{day.xp} XP
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default WeeklyDigest;
