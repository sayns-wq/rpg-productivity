import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { CLASSES, PROGRESS_SKINS, THEMES } from "./constants";
import { ArrowLeft, Save, Palette, Sword, Activity } from "lucide-react";
import { Link } from "react-router-dom";

function CustomizationPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Локальное состояние для предпросмотра перед сохранением
  const [settings, setSettings] = useState({
    avatar_class: "warrior",
    progress_skin: "default",
    theme_color: "purple",
  });

  useEffect(() => {
    let isMounted = true;

    const loadProfile = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("profiles")
        .select(
          "username, level, total_xp, avatar_class, progress_skin, theme_color",
        )
        .eq("id", session.user.id)
        .single();

      if (isMounted && data) {
        setProfile(data);
        setSettings({
          avatar_class: data.avatar_class || "warrior",
          progress_skin: data.progress_skin || "default",
          theme_color: data.theme_color || "purple",
        });
      }

      if (isMounted) setLoading(false);
    };

    loadProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const {
      data: { session },
    } = await supabase.auth.getSession();

    const { error } = await supabase
      .from("profiles")
      .update(settings)
      .eq("id", session.user.id);

    if (!error) {
      // Сохраняем тему в localStorage для мгновенного применения на всех страницах
      localStorage.setItem("theme_color", settings.theme_color);
      localStorage.setItem("progress_skin", settings.progress_skin);
      localStorage.setItem("avatar_class", settings.avatar_class);

      // Перезагружаем страницу, чтобы применить тему везде
      window.location.href = "/";
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${THEMES[settings.theme_color].bg} text-white`}
      >
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
      </div>
    );
  }

  const currentTheme = THEMES[settings.theme_color];
  const currentClass = CLASSES[settings.avatar_class];
  const currentSkin = PROGRESS_SKINS[settings.progress_skin];

  return (
    <div
      className={`min-h-screen ${currentTheme.bg} text-white transition-colors duration-500`}
    >
      <div className="max-w-4xl mx-auto p-6">
        {/* Шапка */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            <ArrowLeft size={24} /> Назад
          </Link>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Palette className="text-purple-400" />
            Кастомизация
          </h1>
        </div>

        {/* Предпросмотр персонажа */}
        <div className="glass rounded-2xl p-8 mb-8 text-center border-2 border-white/10">
          <div className="text-8xl mb-4 animate-bounce">
            {currentClass.icon}
          </div>
          <h2 className="text-3xl font-bold mb-2">
            {profile?.username || "Герой"}
          </h2>
          <p className="text-xl text-gray-400 mb-6">
            {currentClass.name} • Уровень {profile?.level || 1}
          </p>

          <div className="max-w-md mx-auto">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Прогресс до следующего уровня</span>
            </div>
            <div className="w-full bg-gray-700/50 rounded-full h-6 overflow-hidden border border-gray-600">
              <div
                className={`bg-gradient-to-r ${currentSkin.class} h-full rounded-full transition-all duration-500 relative`}
                style={{ width: "65%" }} // Демонстрационный процент
              >
                <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Секция: Класс персонажа */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Sword size={20} className="text-yellow-400" />
            Класс персонажа
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(CLASSES).map(([key, cls]) => (
              <button
                key={key}
                onClick={() => setSettings({ ...settings, avatar_class: key })}
                className={`p-4 rounded-xl border-2 transition text-left ${
                  settings.avatar_class === key
                    ? "border-yellow-400 bg-yellow-400/10"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                }`}
              >
                <div className="text-4xl mb-2">{cls.icon}</div>
                <div className="font-bold text-lg">{cls.name}</div>
                <div className="text-sm text-gray-400">{cls.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Секция: Скин прогресс-бара */}
        <div className="glass rounded-2xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Activity size={20} className="text-green-400" />
            Стиль прогресса
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(PROGRESS_SKINS).map(([key, skin]) => (
              <button
                key={key}
                onClick={() => setSettings({ ...settings, progress_skin: key })}
                className={`p-4 rounded-xl border-2 transition ${
                  settings.progress_skin === key
                    ? "border-white bg-white/10"
                    : "border-gray-700 bg-gray-800/50 hover:border-gray-500"
                }`}
              >
                <div className="font-bold mb-3">{skin.name}</div>
                <div className="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${skin.class} h-full rounded-full`}
                    style={{ width: "70%" }}
                  ></div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Секция: Цветовая тема */}
        <div className="glass rounded-2xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Palette size={20} className="text-pink-400" />
            Цветовая тема
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(THEMES).map(([key, theme]) => (
              <button
                key={key}
                onClick={() => setSettings({ ...settings, theme_color: key })}
                className={`p-4 rounded-xl border-2 transition ${theme.bg} ${
                  settings.theme_color === key
                    ? "border-white ring-2 ring-white/50"
                    : "border-gray-700 hover:border-gray-500"
                }`}
              >
                <div className="font-bold text-white">{theme.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Кнопка сохранения */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl transition transform hover:scale-[1.02] flex items-center justify-center gap-2 text-lg"
        >
          {saving ? (
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-white"></div>
          ) : (
            <>
              <Save size={24} />
              Сохранить изменения
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default CustomizationPage;
