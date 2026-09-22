import { useEffect, useState, useMemo } from "react";
import { supabase } from "./supabaseClient";
import { CLASSES } from "./constants";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "./useTheme";

// Локации для Воина
const WARRIOR_LOCATIONS = [
  {
    xp: 0,
    name: "Пробуждение воина",
    icon: "⚔️",
    description: "Ты взял в руки меч",
  },
  {
    xp: 100,
    name: "Новобранец",
    icon: "🛡️",
    description: "Первые тренировки пройдены",
  },
  {
    xp: 250,
    name: "Оруженосец",
    icon: "🗡️",
    description: "Ты учишься владеть оружием",
  },
  {
    xp: 500,
    name: "Солдат",
    icon: "⚔️",
    description: "Ты готов к первым битвам",
  },
  {
    xp: 1000,
    name: "Защитник",
    icon: "🛡️",
    description: "Ты защищаешь слабых",
  },
  { xp: 2000, name: "Рыцарь", icon: "🏰", description: "Ты служишь королю" },
  {
    xp: 3500,
    name: "Ветеран",
    icon: "⚔️",
    description: "Ты прошёл через многие битвы",
  },
  {
    xp: 5000,
    name: "Капитан",
    icon: "🧑‍✈️",
    description: "Ты ведёшь отряд за собой",
  },
  {
    xp: 7500,
    name: "Командор",
    icon: "🏆",
    description: "Ты командуешь армией",
  },
  {
    xp: 10000,
    name: "Генерал",
    icon: "⚔️",
    description: "Твоя стратегия непобедима",
  },
  {
    xp: 15000,
    name: "Маршал",
    icon: "🎖️",
    description: "Ты высший военный чин",
  },
  {
    xp: 20000,
    name: "Паладин",
    icon: "🛡️",
    description: "Свет и честь — твоё оружие",
  },
  {
    xp: 30000,
    name: "Драконоборец",
    icon: "🐉",
    description: "Ты побеждаешь драконов",
  },
  {
    xp: 50000,
    name: "Герой битв",
    icon: "⚔️",
    description: "О твоих подвигах поют песни",
  },
  {
    xp: 75000,
    name: "Легенда войны",
    icon: "🏆",
    description: "Ты непобедимый воин",
  },
  {
    xp: 100000,
    name: "Полководец",
    icon: "🎖️",
    description: "Ты покоряешь империи",
  },
  {
    xp: 150000,
    name: "Император",
    icon: "👑",
    description: "Ты правишь миром",
  },
  {
    xp: 250000,
    name: "Божественный воин",
    icon: "🏆",
    description: "Боги сражаются рядом с тобой",
  },
  {
    xp: 500000,
    name: "Валькирия",
    icon: "⚔️",
    description: "Ты ведёшь души павших в Валгаллу",
  },
  {
    xp: 1000000,
    name: "Бог войны",
    icon: "🔥",
    description: "Ты — Арес, ты — Марс",
  },
];

const MAGE_LOCATIONS = [
  {
    xp: 0,
    name: "Пробуждение силы",
    icon: "🔮",
    description: "Ты почувствовал магию",
  },
  {
    xp: 100,
    name: "Послушник",
    icon: "📖",
    description: "Ты учишь первые заклинания",
  },
  { xp: 250, name: "Адепт", icon: "✨", description: "Ты постигаешь тайны" },
  {
    xp: 500,
    name: "Ученик",
    icon: "🔮",
    description: "Твой первый шар молнии",
  },
  {
    xp: 1000,
    name: "Заклинатель",
    icon: "⚡",
    description: "Ты владеешь стихиями",
  },
  { xp: 2000, name: "Маг", icon: "🧙", description: "Ты настоящий волшебник" },
  { xp: 3500, name: "Волшебник", icon: "📖", description: "Твоя сила растёт" },
  { xp: 5000, name: "Чародей", icon: "🔮", description: "Ты творишь чудеса" },
  {
    xp: 7500,
    name: "Колдун",
    icon: "🌙",
    description: "Ты владеешь тёмной магией",
  },
  {
    xp: 10000,
    name: "Ведун",
    icon: "🔥",
    description: "Огонь подчиняется тебе",
  },
  {
    xp: 15000,
    name: "Магистр",
    icon: "📖",
    description: "Ты знаешь все заклинания",
  },
  { xp: 20000, name: "Архимаг", icon: "🧙", description: "Ты учитель магии" },
  {
    xp: 30000,
    name: "Верховный маг",
    icon: "👑",
    description: "Ты глава ордена",
  },
  {
    xp: 50000,
    name: "Повелитель стихий",
    icon: "🌊",
    description: "Все стихии твои",
  },
  {
    xp: 75000,
    name: "Хранитель тайн",
    icon: "🔮",
    description: "Ты знаешь секреты вселенной",
  },
  { xp: 100000, name: "Пророк", icon: "🌟", description: "Ты видишь будущее" },
  {
    xp: 150000,
    name: "Божественный маг",
    icon: "✨",
    description: "Твоя магия божественна",
  },
  {
    xp: 250000,
    name: "Создатель",
    icon: "🌍",
    description: "Ты создаёшь миры",
  },
  {
    xp: 500000,
    name: "Вселенский разум",
    icon: "🧠",
    description: "Ты — сознание космоса",
  },
  {
    xp: 1000000,
    name: "Бог магии",
    icon: "🔮",
    description: "Ты — Мерлин, ты — Гэндальф",
  },
];
const ROGUE_LOCATIONS = [
  {
    xp: 0,
    name: "Тень пробуждается",
    icon: "🗡️",
    description: "Ты вышел из тени",
  },
  { xp: 100, name: "Воришка", icon: "🎒", description: "Первые кражи" },
  {
    xp: 250,
    name: "Карманник",
    icon: "👛",
    description: "Ты ловок и незаметен",
  },
  {
    xp: 500,
    name: "Разбойник",
    icon: "🗡️",
    description: "Ты грабишь на дорогах",
  },
  { xp: 1000, name: "Ниндзя", icon: "🌑", description: "Ты мастер скрытности" },
  { xp: 2000, name: "Убийца", icon: "🩸", description: "Ты опасен" },
  {
    xp: 3500,
    name: "Ассасин",
    icon: "🗡️",
    description: "Ты работаешь на гильдию",
  },
  { xp: 5000, name: "Мастер теней", icon: "🌑", description: "Ты невидим" },
  { xp: 7500, name: "Призрак", icon: "👻", description: "Тебя никто не видит" },
  { xp: 10000, name: "Тень", icon: "🌑", description: "Ты — воплощение тьмы" },
  {
    xp: 15000,
    name: "Глава гильдии",
    icon: "👑",
    description: "Ты руководишь ворами",
  },
  {
    xp: 20000,
    name: "Король воров",
    icon: "👑",
    description: "Ты легенда underworld",
  },
  { xp: 30000, name: "Фантом", icon: "👻", description: "Ты миф, ты легенда" },
  {
    xp: 50000,
    name: "Неуловимый",
    icon: "💨",
    description: "Тебя невозможно поймать",
  },
  {
    xp: 75000,
    name: "Мастер ядов",
    icon: "🧪",
    description: "Твой арсенал смертоносен",
  },
  {
    xp: 100000,
    name: "Повелитель теней",
    icon: "🌑",
    description: "Тьма подчиняется тебе",
  },
  {
    xp: 150000,
    name: "Божественный убийца",
    icon: "🗡️",
    description: "Даже боги боятся тебя",
  },
  {
    xp: 250000,
    name: "Хакер реальности",
    icon: "💻",
    description: "Ты взламываешь саму реальность",
  },
  {
    xp: 500000,
    name: "Абсолютная тень",
    icon: "🌑",
    description: "Ты — сама тьма",
  },
  {
    xp: 1000000,
    name: "Бог обмана",
    icon: "🎭",
    description: "Ты — Локи, ты — Гермес",
  },
];

function AdventureMapPage() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [totalXp, setTotalXp] = useState(0);
  const [avatarClass, setAvatarClass] = useState("warrior");
  const [selectedLocation, setSelectedLocation] = useState(null);

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

      const { data } = await supabase
        .from("profiles")
        .select("total_xp, avatar_class")
        .eq("id", session.user.id)
        .single();

      if (isMounted && data) {
        setTotalXp(data.total_xp || 0);
        setAvatarClass(data.avatar_class || "warrior");
        setLoading(false);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  const locations = useMemo(() => {
    if (avatarClass === "mage") return MAGE_LOCATIONS;
    if (avatarClass === "rogue") return ROGUE_LOCATIONS;
    return WARRIOR_LOCATIONS;
  }, [avatarClass]);

  const getCurrentLocationIndex = () => {
    for (let i = locations.length - 1; i >= 0; i--) {
      if (totalXp >= locations[i].xp) return i;
    }
    return 0;
  };

  const getAvatarIcon = () => {
    const icons = { warrior: "🛡️", mage: "🔮", rogue: "🗡️" };
    return icons[avatarClass] || "🛡️";
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

  const currentLocationIndex = getCurrentLocationIndex();

  const mapWidth = 3800;
  const mapHeight = 700;
  const locationSpacing = 180;
  const startX = 250;
  const centerY = 350;

  const generatePath = () => {
    let path = `M ${startX} ${centerY}`;
    for (let i = 1; i < locations.length; i++) {
      const x = startX + i * locationSpacing;
      const y = centerY + Math.sin(i * 0.8) * 80;
      const prevX = startX + (i - 1) * locationSpacing;
      const prevY = centerY + Math.sin((i - 1) * 0.8) * 80;
      const controlX = (prevX + x) / 2;
      const controlY = (prevY + y) / 2 - 40;
      path += ` Q ${controlX} ${controlY} ${x} ${y}`;
    }
    return path;
  };

  const getLocationPosition = (index) => {
    const x = startX + index * locationSpacing;
    const y = centerY + Math.sin(index * 0.8) * 80;
    return { x, y };
  };

  return (
    <div
      className={`min-h-screen ${theme.bg} text-white transition-colors duration-500`}
    >
      <style>{`
        .map-container::-webkit-scrollbar {
          height: 6px;
        }
        .map-container::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 3px;
        }
        .map-container::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.6);
          border-radius: 3px;
        }
      `}</style>

      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
        {/* Шапка */}
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link
            to="/app"
            className="text-gray-400 hover:text-white transition p-2 -ml-2 sm:ml-0 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-gray-800"
          >
            <ArrowLeft size={24} />
          </Link>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2">
              <span className="flex-shrink-0">🗺️</span>
              <span className="truncate">Карта приключений</span>
            </h1>
            <p className="text-xs sm:text-sm text-gray-400 truncate">
              Путь {CLASSES[avatarClass]?.name || "Героя"}
            </p>
          </div>
        </div>
        {/* Прогресс */}
        <div className="glass rounded-2xl p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold mb-4">
            📊 Твой прогресс
          </h2>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="text-4xl sm:text-5xl flex-shrink-0">
              {getAvatarIcon()}
            </div>
            <div className="flex-1 w-full">
              <p className="text-base sm:text-lg font-semibold truncate">
                {CLASSES[avatarClass]?.name || "Герой"}
              </p>
              <p className="text-sm text-gray-400">
                Всего: {totalXp.toLocaleString()} XP
              </p>
              <div className="mt-2 bg-gray-700 rounded-full h-3 sm:h-4 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-500 to-yellow-500 h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((totalXp / 1000000) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-2">
                {locations[currentLocationIndex + 1]
                  ? `До следующей локации: ${(locations[currentLocationIndex + 1].xp - totalXp).toLocaleString()} XP`
                  : "🏆 Ты достиг максимума!"}
              </p>
            </div>
          </div>
        </div>
        {/* Карта */}
        <div className="glass rounded-2xl p-2 sm:p-4 mb-4 sm:mb-6 overflow-hidden">
          {/* touch-pan-x разрешает горизонтальный скролл пальцем на мобильных */}
          <div
            className="map-container overflow-x-auto overflow-y-hidden touch-pan-x"
            style={{ height: "350px", maxHeight: "50vh" }}
          >
            <svg
              viewBox={`0 0 ${mapWidth} ${mapHeight}`}
              className="h-full min-w-[800px] sm:min-w-full"
              preserveAspectRatio="xMinYMid meet"
            >
              <defs>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <linearGradient id="pathGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#fbbf24" />
                </linearGradient>
              </defs>

              {/* Компас */}
              <g transform="translate(100, 100)">
                <circle
                  cx="0"
                  cy="0"
                  r="35"
                  fill="#d4b896"
                  stroke="#8b7355"
                  strokeWidth="2"
                  opacity="0.6"
                />
                <path d="M 0 -20 L 5 0 L 0 20 L -5 0 Z" fill="#22c55e" />
                <text
                  x="0"
                  y="-28"
                  textAnchor="middle"
                  fontSize="14"
                  fill="#8b7355"
                  fontWeight="bold"
                >
                  С
                </text>
                <text
                  x="0"
                  y="42"
                  textAnchor="middle"
                  fontSize="14"
                  fill="#8b7355"
                >
                  Ю
                </text>
                <text
                  x="-38"
                  y="5"
                  textAnchor="middle"
                  fontSize="14"
                  fill="#8b7355"
                >
                  З
                </text>
                <text
                  x="38"
                  y="5"
                  textAnchor="middle"
                  fontSize="14"
                  fill="#8b7355"
                >
                  В
                </text>
              </g>

              {/* Путь */}
              <path
                d={generatePath()}
                stroke="#8b4513"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="15,8"
                opacity="0.5"
              />
              <path
                d={generatePath()}
                stroke="url(#pathGradient)"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${currentLocationIndex * locationSpacing * 1.5}, 10000`}
                opacity="0.8"
              />

              {/* Локации */}
              {locations.map((loc, index) => {
                const { x, y } = getLocationPosition(index);
                const isPassed = index < currentLocationIndex;
                const isCurrent = index === currentLocationIndex;

                // Чередование: чётные индексы - название сверху, нечётные - снизу
                const showNameAbove = index % 2 === 0;

                // Обрезаем длинные названия (чуть меньше обрезаем, так как шрифт крупнее)
                const shortName =
                  loc.name.length > 18
                    ? loc.name.substring(0, 16) + "..."
                    : loc.name;

                return (
                  <g
                    key={index}
                    className="cursor-pointer"
                    onClick={() => setSelectedLocation(loc)}
                  >
                    {/* УВЕЛИЧЕННАЯ ЗОНА НАЖАТИЯ (r=70 вместо 60) */}
                    <circle cx={x} cy={y} r="70" fill="transparent" />

                    {/* Свечение для текущей локации (УВЕЛИЧЕНО) */}
                    {isCurrent && (
                      <>
                        <circle
                          cx={x}
                          cy={y}
                          r="65"
                          fill="#fbbf24"
                          opacity="0.3"
                          className="animate-pulse"
                        />
                        <circle
                          cx={x}
                          cy={y}
                          r="55"
                          fill="#fbbf24"
                          opacity="0.2"
                          className="animate-ping"
                        />
                      </>
                    )}

                    {/* Основной круг локации (УВЕЛИЧЕН: r=40 -> r=50, обводка толще) */}
                    <circle
                      cx={x}
                      cy={y}
                      r="50"
                      fill={
                        isPassed ? "#22c55e" : isCurrent ? "#fbbf24" : "#6b7280"
                      }
                      stroke="#fff"
                      strokeWidth="4"
                      filter={isCurrent ? "url(#glow)" : ""}
                    />

                    {/* Иконка (УВЕЛИЧЕНА: 32 -> 44, Y смещён для идеальной центровки в круге 100x100) */}
                    <text
                      x={x}
                      y={y + 15}
                      textAnchor="middle"
                      fontSize="44"
                      className="pointer-events-none"
                    >
                      {loc.icon}
                    </text>

                    {/* Название локации (УВЕЛИЧЕНО: 13 -> 18, отступы от круга увеличены) */}
                    <text
                      x={x}
                      y={showNameAbove ? y - 60 : y + 75}
                      textAnchor="middle"
                      fontSize="18"
                      fill="#ffffff"
                      fontWeight="800"
                      className="pointer-events-none"
                      style={{
                        textShadow: "2px 2px 6px rgba(0,0,0,0.95)",
                        paintOrder: "stroke",
                        stroke: "rgba(0,0,0,0.95)",
                        strokeWidth: "5px",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      }}
                    >
                      {shortName}
                    </text>

                    {/* XP (УВЕЛИЧЕНО: 11 -> 15, отступы от названия увеличены) */}
                    <text
                      x={x}
                      y={showNameAbove ? y - 40 : y + 95}
                      textAnchor="middle"
                      fontSize="15"
                      fill="#fbbf24"
                      fontWeight="bold"
                      className="pointer-events-none"
                      style={{
                        textShadow: "1px 1px 4px rgba(0,0,0,0.95)",
                        paintOrder: "stroke",
                        stroke: "rgba(0,0,0,0.95)",
                        strokeWidth: "4px",
                      }}
                    >
                      {loc.xp.toLocaleString()} XP
                    </text>

                    {/* Индикатор "Текущая" (тоже увеличен и отодвинут) */}
                    {isCurrent && (
                      <text
                        x={x}
                        y={showNameAbove ? y - 80 : y + 115}
                        textAnchor="middle"
                        fontSize="13"
                        fill="#fbbf24"
                        fontWeight="bold"
                        className="pointer-events-none animate-pulse"
                        style={{ textShadow: "1px 1px 3px rgba(0,0,0,0.95)" }}
                      >
                        ▼ ТЫ ЗДЕСЬ ▼
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Аватар игрока */}
              {(() => {
                const { x, y } = getLocationPosition(currentLocationIndex);
                return (
                  <g
                    className="animate-bounce"
                    style={{ animationDuration: "2s" }}
                  >
                    <text
                      x={x}
                      y={y - 65}
                      textAnchor="middle"
                      fontSize="48"
                      className="pointer-events-none"
                      style={{
                        filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.5))",
                      }}
                    >
                      {getAvatarIcon()}
                    </text>
                  </g>
                );
              })()}
            </svg>
          </div>
          <p className="text-center text-xs text-gray-500 mt-2 sm:hidden">
            ← Свайпай влево/вправо для просмотра карты →
          </p>
        </div>

        {/* Модальное окно (Bottom Sheet на мобильных) */}
        {selectedLocation && (
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 z-50 animate-fade-in"
            onClick={() => setSelectedLocation(null)}
          >
            <div
              className="glass bg-gray-900 rounded-t-2xl sm:rounded-2xl p-6 w-full sm:max-w-md max-h-[85vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Индикатор свайпа для мобильных */}
              <div className="w-12 h-1.5 bg-gray-700 rounded-full mx-auto mb-4 sm:hidden" />

              <div className="text-center">
                <div className="text-6xl sm:text-7xl mb-4">
                  {selectedLocation.icon}
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-2">
                  {selectedLocation.name}
                </h2>
                <p className="text-yellow-400 text-lg sm:text-xl mb-4">
                  {selectedLocation.xp.toLocaleString()} XP
                </p>
                <p className="text-gray-300 mb-6 text-sm sm:text-base leading-relaxed">
                  {selectedLocation.description}
                </p>

                <div
                  className={`inline-block px-4 py-2 rounded-lg font-semibold text-sm sm:text-base ${
                    totalXp >= selectedLocation.xp
                      ? "bg-green-500/20 text-green-400 border border-green-500/50"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {totalXp >= selectedLocation.xp
                    ? "✅ Пройдено!"
                    : `Осталось: ${(selectedLocation.xp - totalXp).toLocaleString()} XP`}
                </div>
              </div>

              <button
                onClick={() => setSelectedLocation(null)}
                className="w-full mt-6 bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-lg transition min-h-[44px]"
              >
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdventureMapPage;
