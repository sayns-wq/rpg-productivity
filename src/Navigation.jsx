import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { getLevelInfo } from "./utils/xpCalculator";
import {
  Calendar,
  Award,
  TrendingUp,
  Flame,
  History,
  Palette,
  Bell,
  Menu,
  X,
  LogOut,
  TreePine,
  Map,
} from "lucide-react";

function Navigation({
  profile,
  level,
  onSignOut,
  notificationsEnabled,
  onEnableNotifications,
}) {
  // Если level не передаётся как пропс, вычисляем его из профиля
  const currentLevel = level || getLevelInfo(profile?.total_xp || 0).level;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  // Блокируем скролл при открытом меню
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const menuItems = [
    { path: "/stats", icon: TrendingUp, label: "Статистика" },
    { path: "/habits", icon: Flame, label: "Привычки" },
    { path: "/weekly-plan", icon: TreePine, label: "План на неделю" },
    { path: "/weekly-digest", icon: Calendar, label: "Итоги недели" },
    { path: "/adventure-map", icon: Map, label: "Карта приключений" },
    { path: "/badges", icon: Award, label: "Ачивки" },
    { path: "/history", icon: History, label: "История" },
    { path: "/customization", icon: Palette, label: "Внешний вид" },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Кнопка открытия меню */}
      <button
        onClick={() => setIsOpen(true)}
        className="text-gray-400 hover:text-white transition p-2"
      >
        <Menu size={24} />
      </button>

      {/* Оверлей + меню */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Затемнение фона */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />

          {/* Само меню */}
          <div className="relative w-80 h-full bg-gray-900 border-l border-gray-700 shadow-2xl overflow-y-auto">
            {/* Шапка меню */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-6 z-10">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    {profile?.username || "Герой"}
                  </h3>
                  <p className="text-yellow-400">Уровень {currentLevel}</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition p-1"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {/* Пункты меню */}
            <nav className="p-4 space-y-2">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                    isActive(item.path)
                      ? "bg-purple-600/30 text-white border border-purple-500/50"
                      : "text-gray-400 hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              ))}

              {/* Уведомления */}
              <button
                onClick={() => {
                  onEnableNotifications();
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  notificationsEnabled
                    ? "bg-green-600/30 text-green-400 border border-green-500/50"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Bell size={20} />
                <span className="font-medium">
                  Уведомления {notificationsEnabled ? "✓" : ""}
                </span>
              </button>

              {/* Выход */}
              <button
                onClick={() => {
                  onSignOut();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition text-gray-400 hover:bg-red-900/30 hover:text-red-400 border border-transparent hover:border-red-500/50"
              >
                <LogOut size={20} />
                <span className="font-medium">Выйти</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </>
  );
}

export default Navigation;
