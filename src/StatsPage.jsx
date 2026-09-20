import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { CATEGORIES } from "./constants";
import {
  ArrowLeft,
  TrendingUp,
  Award,
  Target,
  Zap,
  Flame,
  Clock,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "./useTheme";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import { useStats } from "./hooks/useStats";
import { CharacterStats } from "./components/Stats/CharacterStats";
import {
  subDays,
  format,
  startOfDay,
  differenceInDays,
  addDays,
} from "date-fns";
import { ru } from "date-fns/locale";
import { SEO } from "./components/SEO";

function StatsPage() {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [userId, setUserId] = useState(null);
  const { stats: characterStats, loading: statsLoading } = useStats(userId);
  const [stats, setStats] = useState({
    weeklyXp: [],
    categoryDistribution: [],
    tasksByDay: [],
    maxStreak: 0,
    avgXpPerDay: 0,
    totalTasks: 0,
    totalHabits: 0,
    totalMilestones: 0,
    completionRate: 0,
    levelPrediction: null,
    heatmapData: [],
    heatmapWeeks: [], // ← добавь
    heatmapMonths: [], // ← добавь
    taskTypeDistribution: [],
  });

  const calculateLevelPrediction = (profile, avgXp) => {
    if (!profile || avgXp === 0) return null;

    const currentLevel = profile.level || 1;
    const currentXp = profile.total_xp || 0;

    // XP needed for next level
    const xpForNextLevel = (currentLevel + 1) * 100;
    const xpToNextLevel = xpForNextLevel - (currentXp % xpForNextLevel);

    const daysToNext = Math.ceil(xpToNextLevel / avgXp);
    const predictedDate = addDays(new Date(), daysToNext);

    return {
      daysToNext,
      predictedDate: format(predictedDate, "dd MMMM", { locale: ru }),
      xpToNext: xpToNextLevel,
    };
  };

  const generateHeatmapData = (logs, days) => {
    // Создаём объект для быстрого поиска по дате
    const logsByDate = {};
    logs.forEach((log) => {
      const dateStr = format(new Date(log.created_at), "yyyy-MM-dd");
      if (!logsByDate[dateStr]) {
        logsByDate[dateStr] = { xp: 0, count: 0 };
      }
      logsByDate[dateStr].xp += log.xp_earned;
      logsByDate[dateStr].count += 1;
    });

    // Генерируем данные за последние N дней
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const dateStr = format(date, "yyyy-MM-dd");
      const dayData = logsByDate[dateStr] || { xp: 0, count: 0 };

      data.push({
        date: dateStr,
        dayOfWeek: date.getDay(), // 0 = воскресенье, 1 = понедельник, ...
        xp: dayData.xp,
        count: dayData.count,
        level:
          dayData.xp === 0
            ? 0
            : dayData.xp < 50
              ? 1
              : dayData.xp < 100
                ? 2
                : dayData.xp < 200
                  ? 3
                  : 4,
      });
    }

    return data;
  };

  const organizeHeatmapIntoWeeks = (heatmapData) => {
    // Определяем первый день (должен быть понедельник)
    const firstDay = new Date(heatmapData[0]?.date);
    const firstDayOfWeek = firstDay.getDay(); // 0 = вс, 1 = пн, ...

    // Если первый день не понедельник, добавляем пустые ячейки
    const offset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;

    // Создаём массив недель
    const weeks = [];
    let currentWeek = Array(7).fill(null);

    // Заполняем смещение
    for (let i = 0; i < offset; i++) {
      currentWeek[i] = null;
    }

    // Заполняем данные
    heatmapData.forEach((dayData, index) => {
      const dayIndex = (offset + index) % 7;
      currentWeek[dayIndex] = dayData;

      if (dayIndex === 6 || index === heatmapData.length - 1) {
        weeks.push([...currentWeek]);
        currentWeek = Array(7).fill(null);
      }
    });

    return weeks;
  };

  const getHeatmapMonths = (heatmapData, weeks) => {
    const months = [];
    let lastMonth = null;

    weeks.forEach((week, weekIndex) => {
      // Берём первый непустой день недели
      const firstDay = week.find((d) => d !== null);
      if (!firstDay) return;

      const date = new Date(firstDay.date);
      const month = format(date, "MMM", { locale: ru });

      if (month !== lastMonth) {
        months.push({
          label: month,
          weekIndex,
        });
        lastMonth = month;
      }
    });

    return months;
  };

  const calculateMaxStreak = (logs) => {
    if (logs.length === 0) return 0;

    const uniqueDays = new Set(
      logs.map((log) => format(new Date(log.created_at), "yyyy-MM-dd")),
    );
    const sortedDays = Array.from(uniqueDays).sort();

    let maxStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < sortedDays.length; i++) {
      const prevDay = new Date(sortedDays[i - 1]);
      const currDay = new Date(sortedDays[i]);
      const diff = differenceInDays(currDay, prevDay);

      if (diff === 1) {
        currentStreak++;
        maxStreak = Math.max(maxStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return maxStreak;
  };

  const getCategoryColor = (category) => {
    const colors = {
      work: "#3b82f6",
      self: "#a855f7",
      finance: "#22c55e",
      personal: "#ec4899",
      health: "#f97316",
      hobby: "#eab308",
      home: "#6b7280",
    };
    return colors[category] || "#6b7280";
  };
  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        if (isMounted) setLoading(false);
        return;
      }

      // Загружаем все логи за последние 90 дней для тепловой карты
      const ninetyDaysAgo = subDays(new Date(), 90).toISOString();

      const { data: logs } = await supabase
        .from("action_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("created_at", ninetyDaysAgo)
        .order("created_at", { ascending: true });

      // Загружаем профиль для текущего уровня
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, level")
        .eq("id", session.user.id)
        .single();

      if (!isMounted) return;

      if (!logs) {
        setLoading(false);
        return;
      }

      // 1. Тепловая карта активности (последние 90 дней)
      const heatmapData = generateHeatmapData(logs, 90);
      const heatmapWeeks = organizeHeatmapIntoWeeks(heatmapData);
      const heatmapMonths = getHeatmapMonths(heatmapData, heatmapWeeks);

      // 2. График XP за неделю
      const weeklyXp = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = addDays(dayStart, 1);

        const dayLogs = logs.filter((log) => {
          const logDate = new Date(log.created_at);
          return logDate >= dayStart && logDate < dayEnd;
        });

        const totalXp = dayLogs.reduce((sum, log) => sum + log.xp_earned, 0);

        weeklyXp.push({
          day: format(date, "EEE", { locale: ru }),
          xp: totalXp,
          fullDate: format(date, "dd.MM"),
        });
      }

      // 3. Распределение по категориям
      const categoryCounts = {};
      logs.forEach((log) => {
        const cat = log.category || "work";
        categoryCounts[cat] = (categoryCounts[cat] || 0) + log.xp_earned;
      });

      const categoryDistribution = Object.entries(categoryCounts).map(
        ([key, value]) => ({
          name: CATEGORIES[key]?.name || key,
          value,
          color: getCategoryColor(key),
        }),
      );

      // 4. Распределение по типам задач
      const taskTypeCounts = {
        tasks: logs
          .filter((l) => l.type === "task")
          .reduce((sum, l) => sum + l.xp_earned, 0),
        habits: logs
          .filter((l) => l.type === "habit")
          .reduce((sum, l) => sum + l.xp_earned, 0),
        milestones: logs
          .filter((l) => l.type === "milestone")
          .reduce((sum, l) => sum + l.xp_earned, 0),
      };

      const taskTypeDistribution = [
        { name: "Дела", value: taskTypeCounts.tasks, color: "#3b82f6" },
        { name: "Привычки", value: taskTypeCounts.habits, color: "#f97316" },
        {
          name: "Достижения",
          value: taskTypeCounts.milestones,
          color: "#a855f7",
        },
      ].filter((item) => item.value > 0);

      // 5. Количество задач по дням (14 дней)
      const tasksByDay = [];
      for (let i = 13; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = addDays(dayStart, 1);

        const dayLogs = logs.filter((log) => {
          const logDate = new Date(log.created_at);
          return logDate >= dayStart && logDate < dayEnd;
        });

        tasksByDay.push({
          day: format(date, "dd.MM"),
          tasks: dayLogs.length,
        });
      }

      // 6. Максимальная серия дней
      const maxStreak = calculateMaxStreak(logs);

      // 7. Среднее XP в день
      const uniqueDays = new Set(
        logs.map((log) => format(new Date(log.created_at), "yyyy-MM-dd")),
      );
      const totalXp = logs.reduce((sum, log) => sum + log.xp_earned, 0);
      const avgXpPerDay =
        uniqueDays.size > 0 ? Math.round(totalXp / uniqueDays.size) : 0;

      // 8. Коэффициент выполнения
      const { data: allTasks } = await supabase
        .from("tasks")
        .select("status")
        .eq("user_id", session.user.id);

      if (!isMounted) return;

      const completedTasks =
        allTasks?.filter((t) => t.status === "done").length || 0;
      const totalCreatedTasks = allTasks?.length || 1;
      const completionRate = Math.round(
        (completedTasks / totalCreatedTasks) * 100,
      );

      // 9. Прогноз уровня
      const levelPrediction = calculateLevelPrediction(profile, avgXpPerDay);

      // 10. Общее количество по типам
      const totalTasks = logs.filter((l) => l.type === "task").length;
      const totalHabits = logs.filter((l) => l.type === "habit").length;
      const totalMilestones = logs.filter((l) => l.type === "milestone").length;

      if (isMounted) {
        setUserId(session.user.id);
        setStats({
          weeklyXp,
          categoryDistribution,
          taskTypeDistribution,
          tasksByDay,
          maxStreak,
          avgXpPerDay,
          totalTasks,
          totalHabits,
          totalMilestones,
          completionRate,
          levelPrediction,
          heatmapData,
          heatmapWeeks,
          heatmapMonths,
        });
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []); // Пустой массив зависимостей

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
    <div
      className={`min-h-screen ${theme.bg} text-white transition-colors duration-500`}
    >
      <SEO
        title="Статистика и прогресс"
        description="Отслеживай свой прогресс, уровни и развитие характеристик персонажа"
        noIndex={true} // Приватная страница — не индексируется
      />
      <div className="max-w-7xl mx-auto p-6">
        {/* Шапка */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="text-gray-400 hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <TrendingUp className="text-purple-400" />
            Статистика
          </h1>
        </div>

        {/* Метрики в grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="text-blue-400" size={20} />
              <span className="text-sm text-gray-400">Всего дел</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalTasks}</p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="text-orange-400" size={20} />
              <span className="text-sm text-gray-400">Привычек</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalHabits}</p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-purple-400" size={20} />
              <span className="text-sm text-gray-400">Достижений</span>
            </div>
            <p className="text-2xl font-bold">{stats.totalMilestones}</p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-green-400" size={20} />
              <span className="text-sm text-gray-400">Макс. серия</span>
            </div>
            <p className="text-2xl font-bold">{stats.maxStreak} дн.</p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-yellow-400" size={20} />
              <span className="text-sm text-gray-400">Выполнение</span>
            </div>
            <p className="text-2xl font-bold">{stats.completionRate}%</p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-pink-400" size={20} />
              <span className="text-sm text-gray-400">Средний XP/день</span>
            </div>
            <p className="text-2xl font-bold">{stats.avgXpPerDay}</p>
          </div>

          {stats.levelPrediction && (
            <div className="glass rounded-xl p-4 col-span-2">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="text-cyan-400" size={20} />
                <span className="text-sm text-gray-400">Прогноз уровня</span>
              </div>
              <p className="text-lg font-bold">
                Через {stats.levelPrediction.daysToNext} дн.
              </p>
              <p className="text-sm text-gray-400">
                {stats.levelPrediction.predictedDate}
              </p>
            </div>
          )}
        </div>
        <CharacterStats stats={characterStats} loading={statsLoading} />
        {/* Тепловая карта */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            🔥 Тепловая карта активности
          </h2>

          {/* Легенда */}
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
            <span>Меньше:</span>
            <div className="w-4 h-4 rounded bg-gray-800"></div>
            <div className="w-4 h-4 rounded bg-green-900/50"></div>
            <div className="w-4 h-4 rounded bg-green-700/50"></div>
            <div className="w-4 h-4 rounded bg-green-500/50"></div>
            <div className="w-4 h-4 rounded bg-green-400"></div>
            <span>Больше</span>
          </div>

          {/* Карта */}
          <div className="overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Заголовки месяцев */}
              <div className="flex mb-2 ml-10">
                {stats.heatmapMonths.map((month, index) => (
                  <div
                    key={index}
                    className="flex-1 text-xs text-gray-400 text-center"
                    style={{ minWidth: "12px" }}
                  >
                    {month.label}
                  </div>
                ))}
              </div>

              {/* Дни недели и ячейки */}
              {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map(
                (dayName, dayIndex) => (
                  <div key={dayName} className="flex mb-1">
                    {/* Название дня */}
                    <div className="w-10 text-xs text-gray-400 flex items-center justify-end pr-2">
                      {dayName}
                    </div>

                    {/* Ячейки недели */}
                    {stats.heatmapWeeks.map((week, weekIndex) => {
                      const dayData = week[dayIndex];
                      const level = dayData?.level || 0;

                      return (
                        <div
                          key={weekIndex}
                          className={`flex-1 h-3 mx-[2px] rounded-sm ${
                            level === 0
                              ? "bg-gray-800"
                              : level === 1
                                ? "bg-green-900/50"
                                : level === 2
                                  ? "bg-green-700/50"
                                  : level === 3
                                    ? "bg-green-500/50"
                                    : "bg-green-400"
                          }`}
                          title={
                            dayData
                              ? `${dayData.date}: ${dayData.xp} XP, ${dayData.count} действий`
                              : ""
                          }
                        />
                      );
                    })}
                  </div>
                ),
              )}
            </div>
          </div>
        </div>

        {/* Графики в grid 2 колонки */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* XP за неделю */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              📈 XP за последние 7 дней
            </h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={stats.weeklyXp}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="xp"
                  stroke="#a855f7"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Распределение по типам */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">
              🥧 Распределение по типам
            </h2>
            {stats.taskTypeDistribution.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Нет данных</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.taskTypeDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.taskTypeDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Задач по дням */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">📊 Выполнено за 14 дней</h2>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={stats.tasksByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="tasks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* По категориям */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">🎯 По категориям</h2>
            {stats.categoryDistribution.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Нет данных</p>
            ) : (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={stats.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats.categoryDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Кнопка перехода к детальной статистике категорий */}
        <div className="mt-6 text-center">
          <Link
            to="/categories"
            className="inline-flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition font-semibold"
          >
            <TrendingUp size={20} />
            Детальный анализ по категориям
          </Link>
        </div>
      </div>
    </div>
  );
}

export default StatsPage;
