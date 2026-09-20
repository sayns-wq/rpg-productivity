import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { CATEGORIES } from "./constants";
import { useTheme } from "./useTheme";
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Award,
  Zap,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from "recharts";
import { subDays } from "date-fns";
// import { ru } from 'date-fns/locale'

function CategoriesPage() {
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [categoryStats, setCategoryStats] = useState({
    radarData: [],
    levelData: [],
    growthData: [],
    weakestCategories: [],
    strongestCategories: [],
    totalXpByCategory: {},
  });
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

      // Загружаем логи за последние 90 дней
      const ninetyDaysAgo = subDays(new Date(), 90).toISOString();

      const { data: logs } = await supabase
        .from("action_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .gte("created_at", ninetyDaysAgo)
        .order("created_at", { ascending: true });

      // Проверка монтирования после await
      if (!isMounted) return;

      if (!logs) {
        if (isMounted) setLoading(false);
        return;
      }

      // Считаем XP по категориям
      const categoryXp = {};
      Object.keys(CATEGORIES).forEach((cat) => {
        categoryXp[cat] = 0;
      });

      logs.forEach((log) => {
        const cat = log.category || "work";
        categoryXp[cat] = (categoryXp[cat] || 0) + log.xp_earned;
      });

      // Считаем количество задач по категориям
      const categoryTaskCount = {};
      Object.keys(CATEGORIES).forEach((cat) => {
        categoryTaskCount[cat] = 0;
      });

      logs.forEach((log) => {
        const cat = log.category || "work";
        categoryTaskCount[cat] = (categoryTaskCount[cat] || 0) + 1;
      });

      // Радарная диаграмма (XP по категориям)
      const radarData = Object.entries(CATEGORIES).map(([key, cat]) => ({
        category: cat.name,
        xp: categoryXp[key] || 0,
        tasks: categoryTaskCount[key] || 0,
        color: getCategoryColor(key),
      }));

      // Уровни по категориям (каждые 500 XP = 1 уровень)
      const levelData = Object.entries(CATEGORIES).map(([key, cat]) => ({
        category: cat.name,
        level: Math.floor((categoryXp[key] || 0) / 500) + 1,
        xp: categoryXp[key] || 0,
        xpToNext: 500 - ((categoryXp[key] || 0) % 500),
        color: getCategoryColor(key),
      }));

      // Анализ роста (сравнение последних 30 дней с предыдущими 30)
      const last30Days = logs.filter((log) => {
        const logDate = new Date(log.created_at);
        return logDate >= subDays(new Date(), 30);
      });

      const prev30Days = logs.filter((log) => {
        const logDate = new Date(log.created_at);
        return (
          logDate >= subDays(new Date(), 60) &&
          logDate < subDays(new Date(), 30)
        );
      });

      const last30Xp = {};
      const prev30Xp = {};
      Object.keys(CATEGORIES).forEach((cat) => {
        last30Xp[cat] = 0;
        prev30Xp[cat] = 0;
      });

      last30Days.forEach((log) => {
        const cat = log.category || "work";
        last30Xp[cat] = (last30Xp[cat] || 0) + log.xp_earned;
      });

      prev30Days.forEach((log) => {
        const cat = log.category || "work";
        prev30Xp[cat] = (prev30Xp[cat] || 0) + log.xp_earned;
      });

      const growthData = Object.entries(CATEGORIES).map(([key, cat]) => {
        const last = last30Xp[key] || 0;
        const prev = prev30Xp[key] || 0;
        const growth =
          prev === 0
            ? last > 0
              ? 100
              : 0
            : Math.round(((last - prev) / prev) * 100);

        return {
          category: cat.name,
          growth,
          last30: last,
          prev30: prev,
          color: getCategoryColor(key),
        };
      });

      // Определяем баланс по абсолютным значениям XP (из прошлого шага)
      const totalXpAllCategories = Object.values(categoryXp).reduce(
        (sum, xp) => sum + xp,
        0,
      );
      const avgXpPerCategory =
        totalXpAllCategories / Object.keys(CATEGORIES).length;

      const deviationData = Object.entries(CATEGORIES).map(([key, cat]) => {
        const xp = categoryXp[key] || 0;
        const deviation =
          avgXpPerCategory === 0
            ? 0
            : Math.round(((xp - avgXpPerCategory) / avgXpPerCategory) * 100);

        return {
          category: cat.name,
          xp,
          deviation,
          color: getCategoryColor(key),
        };
      });

      const sortedByDeviation = [...deviationData].sort(
        (a, b) => a.deviation - b.deviation,
      );

      const strongestCategories = sortedByDeviation
        .filter((c) => c.deviation > 20)
        .slice(-3);
      const weakestCategories = sortedByDeviation
        .filter((c) => c.deviation < -20)
        .slice(0, 3);

      const hasImbalance =
        weakestCategories.length > 0 || strongestCategories.length > 0;
      const balanceMessage = !hasImbalance
        ? "Все сферы в балансе!"
        : `Отклонение от идеала: ${Math.max(...sortedByDeviation.map((c) => Math.abs(c.deviation)))}%`;

      // Финальное обновление состояния, защищённое флагом isMounted
      if (isMounted) {
        setCategoryStats({
          radarData,
          levelData,
          growthData,
          deviationData,
          weakestCategories,
          strongestCategories,
          totalXpByCategory: categoryXp,
          avgXpPerCategory,
          balanceMessage,
          hasImbalance,
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
      <div className="max-w-7xl mx-auto p-6">
        {/* Шапка */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/stats"
            className="text-gray-400 hover:text-white transition"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Target className="text-purple-400" />
              Анализ по категориям
            </h1>
            <p className="text-gray-400">Баланс жизни и прогресс по сферам</p>
          </div>
        </div>

        {/* Метрики в grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-yellow-400" size={20} />
              <span className="text-sm text-gray-400">Всего категорий</span>
            </div>
            <p className="text-2xl font-bold">
              {Object.keys(CATEGORIES).length}
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="text-green-400" size={20} />
              <span className="text-sm text-gray-400">Растущих</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {categoryStats.strongestCategories.length}
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="text-red-400" size={20} />
              <span className="text-sm text-gray-400">Проседающих</span>
            </div>
            <p className="text-2xl font-bold text-red-400">
              {categoryStats.weakestCategories.length}
            </p>
          </div>

          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Award className="text-purple-400" size={20} />
              <span className="text-sm text-gray-400">Макс. уровень</span>
            </div>
            <p className="text-2xl font-bold">
              {Math.max(...categoryStats.levelData.map((l) => l.level))}
            </p>
          </div>
        </div>

        {/* Графики в grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Радарная диаграмма XP */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">🕸️ XP по категориям</h2>
            {categoryStats.radarData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Нет данных</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={categoryStats.radarData}>
                  <PolarGrid stroke="#374151" />
                  <PolarAngleAxis
                    dataKey="category"
                    tick={{ fill: "#9ca3af", fontSize: 12 }}
                  />
                  <PolarRadiusAxis stroke="#374151" />
                  <Radar
                    name="XP"
                    dataKey="xp"
                    stroke="#a855f7"
                    fill="#a855f7"
                    fillOpacity={0.6}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: "8px",
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Уровни по категориям */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4">🎓 Уровни по категориям</h2>
            {categoryStats.levelData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Нет данных</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={categoryStats.levelData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="category"
                    tick={{ fill: "#9ca3af", fontSize: 11 }}
                  />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-gray-900/95 border border-purple-500/50 rounded-lg p-3 shadow-xl">
                            <p className="text-white font-bold text-sm">
                              {label}
                            </p>
                            <p className="text-white text-sm mt-1">
                              Уровень:{" "}
                              <span className="text-yellow-400 font-bold">
                                {data.level}
                              </span>
                            </p>
                            <p className="text-gray-400 text-xs mt-1">
                              {data.xp.toLocaleString()} XP
                            </p>
                            <p className="text-gray-500 text-xs">
                              До следующего: {data.xpToNext} XP
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar dataKey="level" radius={[4, 4, 0, 0]}>
                    {categoryStats.levelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Анализ роста */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            📊 Динамика за последние 30 дней
          </h2>
          {categoryStats.growthData.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Нет данных</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {categoryStats.growthData.map((item, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 p-3 rounded-lg text-center"
                  style={{ borderLeft: `4px solid ${item.color}` }}
                >
                  <p className="text-sm font-semibold mb-1">{item.category}</p>
                  <p
                    className={`text-2xl font-bold ${
                      item.growth > 0
                        ? "text-green-400"
                        : item.growth < 0
                          ? "text-red-400"
                          : "text-gray-400"
                    }`}
                  >
                    {item.growth > 0 ? "+" : ""}
                    {item.growth}%
                  </p>
                  <p className="text-xs text-gray-400 mt-1">{item.last30} XP</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Сильные и слабые стороны */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Сильные категории */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="text-green-400" />
              Опережающие сферы
            </h2>
            {categoryStats.strongestCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Нет явных лидеров
              </p>
            ) : (
              <div className="space-y-3">
                {categoryStats.strongestCategories.map((cat, index) => (
                  <div
                    key={index}
                    className="bg-green-900/20 border border-green-500/30 p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{cat.category}</p>
                      <p className="text-green-400 font-bold">
                        +{cat.deviation}%
                      </p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {cat.xp} XP (среднее:{" "}
                      {Math.round(categoryStats.avgXpPerCategory)})
                    </p>
                    <p className="text-xs text-green-400 mt-1">
                      Опережает на{" "}
                      {Math.round(cat.xp - categoryStats.avgXpPerCategory)} XP
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Слабые категории */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingDown className="text-red-400" />
              Проседающие сферы
            </h2>
            {categoryStats.weakestCategories.length === 0 &&
            !categoryStats.hasImbalance ? (
              <p className="text-gray-500 text-center py-4">
                {categoryStats.balanceMessage}
              </p>
            ) : categoryStats.weakestCategories.length === 0 ? (
              <p className="text-green-400 text-center py-4">
                🎉 Все сферы развиваются гармонично!
              </p>
            ) : (
              <div className="space-y-3">
                {categoryStats.weakestCategories.map((cat, index) => (
                  <div
                    key={index}
                    className="bg-red-900/20 border border-red-500/30 p-3 rounded-lg"
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{cat.category}</p>
                      <p className="text-red-400 font-bold">{cat.deviation}%</p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {cat.xp} XP (среднее:{" "}
                      {Math.round(categoryStats.avgXpPerCategory)})
                    </p>
                    <p className="text-xs text-red-400 mt-1">
                      Отстаёт на{" "}
                      {Math.round(categoryStats.avgXpPerCategory - cat.xp)} XP
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoriesPage;
