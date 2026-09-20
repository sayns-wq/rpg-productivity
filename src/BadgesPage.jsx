import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { BADGE_CONDITIONS, BADGE_ICONS } from "./constants";
import { ArrowLeft, Plus, Trash2, Check, Award } from "lucide-react";
import { checkAndAwardBadges } from "./badgeChecker";
import { useTheme } from "./useTheme";
import { Link } from "react-router-dom";
import { SEO } from "./components/SEO";

function BadgesPage() {
  const [loading, setLoading] = useState(true);
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { theme } = useTheme();
  const [modalData, setModalData] = useState({
    title: "",
    description: "",
    icon: "🏆",
    condition_type: "total_xp",
    condition_value: 100,
    reward_xp: 50,
  });

  const loadData = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session) return;

    const { data: badgesData } = await supabase
      .from("badges")
      .select("*")
      .eq("user_id", session.user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    const { data: earnedData } = await supabase
      .from("user_badges")
      .select("*, badges(*)")
      .eq("user_id", session.user.id)
      .order("earned_at", { ascending: false });

    if (badgesData) setBadges(badgesData);
    if (earnedData) setEarnedBadges(earnedData);
    setLoading(false);
  };
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: badgesData } = await supabase
        .from("badges")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      const { data: earnedData } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", session.user.id)
        .order("earned_at", { ascending: false });

      if (isMounted) {
        if (badgesData) setBadges(badgesData);
        if (earnedData) setEarnedBadges(earnedData);
        setLoading(false);
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    // Проверяем ачивки при загрузке страницы
    const checkBadges = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const result = await checkAndAwardBadges(session.user.id);
        if (result?.awarded) {
          // Если получили новые ачивки — перезагружаем данные
          setTimeout(() => loadData(), 500);
        }
      }
    };

    checkBadges();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    const {
      data: { session },
    } = await supabase.auth.getSession();

    await supabase.from("badges").insert([
      {
        user_id: session.user.id,
        ...modalData,
      },
    ]);

    setShowModal(false);
    setModalData({
      title: "",
      description: "",
      icon: "🏆",
      condition_type: "total_xp",
      condition_value: 100,
      reward_xp: 50,
    });
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!confirm("Удалить ачивку?")) return;
    await supabase.from("badges").delete().eq("id", id);
    await loadData();
  };

  //   const getProgress = () => {
  //     // Упрощённый расчёт прогресса (в реальности нужно считать из action_logs)
  //     return 0;
  //   };

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
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/app" className="text-gray-400 hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="text-yellow-400" />
            Ачивки
          </h1>
        </div>

        {/* Полученные ачивки */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">
            🏆 Полученные ({earnedBadges.length})
          </h2>
          {earnedBadges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Пока нет полученных ачивок
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {earnedBadges.map((ub) => (
                <div
                  key={ub.id}
                  className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-2 border-yellow-500/50 p-4 rounded-xl text-center"
                >
                  <div className="text-5xl mb-2">{ub.badges?.icon || "🏆"}</div>
                  <p className="font-bold text-sm">{ub.badges?.title}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(ub.earned_at).toLocaleDateString("ru-RU")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Активные ачивки (цели) */}
        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">
              🎯 Активные цели ({badges.length})
            </h2>
            <button
              onClick={() => setShowModal(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition flex items-center gap-2"
            >
              <Plus size={20} />
              Создать
            </button>
          </div>

          {badges.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Нет активных ачивок
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {badges.map((badge) => {
                const condition = BADGE_CONDITIONS[badge.condition_type];
                // const progress = getProgress(badge);
                const isEarned = earnedBadges.some(
                  (ub) => ub.badge_id === badge.id,
                );

                return (
                  <div
                    key={badge.id}
                    className={`p-4 rounded-xl border-2 transition ${
                      isEarned
                        ? "bg-yellow-900/20 border-yellow-500/50"
                        : "bg-gray-800/50 border-gray-700"
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{badge.icon}</div>
                      <button
                        onClick={() => handleDelete(badge.id)}
                        className="text-gray-400 hover:text-red-400 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h3 className="font-bold text-lg mb-1">{badge.title}</h3>
                    <p className="text-sm text-gray-400 mb-3">
                      {badge.description}
                    </p>

                    <div className="bg-gray-900/50 p-3 rounded-lg mb-3">
                      <p className="text-xs text-gray-400 mb-1">Условие:</p>
                      <p className="text-sm font-semibold">
                        {condition.icon} {condition.name}:{" "}
                        {badge.condition_value} {condition.unit}
                      </p>
                    </div>

                    {badge.reward_xp > 0 && (
                      <p className="text-sm text-yellow-400">
                        ⚡ Награда: +{badge.reward_xp} XP
                      </p>
                    )}

                    {isEarned && (
                      <div className="mt-3 flex items-center gap-2 text-green-400 text-sm">
                        <Check size={16} />
                        Получено
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Модалка создания ачивки */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Award className="text-yellow-400" />
              Новая ачивка
            </h2>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Название
                </label>
                <input
                  type="text"
                  value={modalData.title}
                  onChange={(e) =>
                    setModalData({ ...modalData, title: e.target.value })
                  }
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="Первые шаги"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Описание
                </label>
                <textarea
                  value={modalData.description}
                  onChange={(e) =>
                    setModalData({ ...modalData, description: e.target.value })
                  }
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  placeholder="Выполни первую задачу"
                  rows={2}
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Иконка
                </label>
                <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2">
                  {BADGE_ICONS.map((icon, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setModalData({ ...modalData, icon })}
                      className={`text-2xl p-3 rounded-lg transition flex items-center justify-center ${
                        modalData.icon === icon
                          ? "bg-yellow-600/30 border-2 border-yellow-500 scale-110"
                          : "bg-gray-800/50 hover:bg-gray-700/50 border-2 border-transparent"
                      }`}
                      style={{ minHeight: "48px" }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Тип условия
                </label>
                <select
                  value={modalData.condition_type}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      condition_type: e.target.value,
                    })
                  }
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                >
                  {Object.entries(BADGE_CONDITIONS).map(([key, cond]) => (
                    <option key={key} value={key}>
                      {cond.icon} {cond.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Значение ({BADGE_CONDITIONS[modalData.condition_type].unit})
                </label>
                <input
                  type="number"
                  value={modalData.condition_value}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      condition_value: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  min="1"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-300 text-sm mb-2">
                  Награда XP (0 = без награды)
                </label>
                <input
                  type="number"
                  value={modalData.reward_xp}
                  onChange={(e) =>
                    setModalData({
                      ...modalData,
                      reward_xp: parseInt(e.target.value) || 0,
                    })
                  }
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-yellow-500 focus:outline-none"
                  min="0"
                />
              </div>

              <div className="flex gap-2 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white font-bold py-3 rounded-lg transition"
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

export default BadgesPage;
