export const CATEGORIES = {
  work: { name: "Работа", icon: "💼", color: "blue" },
  self: { name: "Саморазвитие", icon: "🧠", color: "purple" },
  finance: { name: "Финансы", icon: "💰", color: "green" },
  personal: { name: "Личная жизнь", icon: "❤️", color: "pink" },
  health: { name: "Здоровье", icon: "🏋️", color: "orange" },
  hobby: { name: "Хобби", icon: "🎨", color: "yellow" },
  home: { name: "Быт", icon: "🏠", color: "gray" },
};

export const TIERS = {
  chore: { name: "Дело", icon: "📝", baseXp: 20, color: "blue" },
  feat: { name: "Подвиг", icon: "⚔️", baseXp: 100, color: "red" },
  milestone: { name: "Достижение", icon: "🏆", baseXp: 1000, color: "purple" },
};

// Множитель XP в зависимости от усталости
export function getFatigueMultiplier(fatigue) {
  if (fatigue >= 80) return 0.25;
  if (fatigue >= 50) return 0.5;
  return 1;
}

export const CLASSES = {
  warrior: { name: "Воин", icon: "🛡️", desc: "Сила, упорство и дисциплина" },
  mage: { name: "Маг", icon: "🔮", desc: "Знания, интеллект и стратегия" },
  rogue: {
    name: "Разбойник",
    icon: "🗡️",
    desc: "Скорость, хитрость и адаптивность",
  },
};

export const PROGRESS_SKINS = {
  default: { name: "Классика", class: "from-yellow-500 to-yellow-300" },
  neon: {
    name: "Киберпанк",
    class: "from-cyan-400 via-purple-500 to-pink-500",
  },
  fire: { name: "Пламя", class: "from-red-600 via-orange-500 to-yellow-400" },
  nature: {
    name: "Природа",
    class: "from-green-400 via-emerald-500 to-teal-600",
  },
  ice: { name: "Лёд", class: "from-blue-300 via-blue-500 to-indigo-600" },
};

export const THEMES = {
  purple: {
    name: "Мистика",
    bg: "bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900",
    accent: "purple",
  },
  ocean: {
    name: "Океан",
    bg: "bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900",
    accent: "blue",
  },
  forest: {
    name: "Лес",
    bg: "bg-gradient-to-br from-gray-900 via-green-900 to-gray-900",
    accent: "green",
  },
  crimson: {
    name: "Багровый",
    bg: "bg-gradient-to-br from-gray-900 via-red-950 to-gray-900",
    accent: "red",
  },
};

export const BADGE_CONDITIONS = {
  total_xp: { name: "Накопить XP", icon: "⚡", unit: "XP" },
  tasks_completed: { name: "Выполнить дел", icon: "📝", unit: "шт" },
  habits_streak: { name: "Серия привычек", icon: "🔥", unit: "дней" },
  category_tasks: { name: "Задач в категории", icon: "🎯", unit: "шт" },
  milestones_completed: { name: "Достижений", icon: "🏆", unit: "шт" },
};

export const QUEST_TARGETS = {
  complete_tasks: { name: "Выполнить дел", icon: "📝", unit: "шт" },
  complete_habits: { name: "Выполнить привычек", icon: "🔄", unit: "шт" },
  earn_xp: { name: "Заработать XP", icon: "⚡", unit: "XP" },
  category_focus: { name: "Задач в категории", icon: "🎯", unit: "шт" },
};

export const BADGE_ICONS = [
  "🏆",
  "🥇",
  "🥈",
  "🥉",
  "⭐",
  "💎",
  "🔥",
  "🎯",
  "🗡️",
  "🛡️",
  "👑",
  "🌟",
  "💪",
  "❤️",
  "🏋️",
  "💰",
  "🎨",
  "📚",
  "🚀",
  "⚡",
  "🎮",
  "🎵",
  "🌍",
  "🏠",
  "🦊",
  "🦁",
];

export const PRIORITIES = {
  low: { name: "Низкий", color: "gray", icon: "🔵", order: 0 },
  medium: { name: "Средний", color: "blue", icon: "🟡", order: 1 },
  high: { name: "Высокий", color: "orange", icon: "🟠", order: 2 },
  urgent: { name: "Срочный", color: "red", icon: "🔴", order: 3 },
};

export const DEADLINE_FILTERS = {
  today: "Сегодня",
  tomorrow: "Завтра",
  week: "Эта неделя",
  month: "Этот месяц",
  all: "Все",
};
