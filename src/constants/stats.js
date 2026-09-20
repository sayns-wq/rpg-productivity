export const STATS = {
  willpower: {
    name: "Сила воли",
    icon: "💪",
    color: "red",
    description: "Дисциплина и выполнение обещаний",
  },
  intelligence: {
    name: "Интеллект",
    icon: "🧠",
    color: "blue",
    description: "Обучение и решение сложных задач",
  },
  charisma: {
    name: "Харизма",
    icon: "✨",
    color: "purple",
    description: "Общение и влияние на других",
  },
  agility: {
    name: "Ловкость",
    icon: "🏃",
    color: "green",
    description: "Скорость и адаптивность",
  },
  luck: {
    name: "Удача",
    icon: "🍀",
    color: "yellow",
    description: "Риск и новые возможности",
  },
  wisdom: {
    name: "Мудрость",
    icon: "🔮",
    color: "indigo",
    description: "Опыт и стратегическое мышление",
  },
  energy: {
    name: "Энергия",
    icon: "⚡",
    color: "orange",
    description: "Физическая форма и выносливость",
  },
};

// Привязка категорий к характеристикам (автоматически)
export const CATEGORY_TO_STATS = {
  work: ["willpower", "energy"],
  self: ["intelligence", "wisdom"],
  finance: ["wisdom", "willpower"],
  personal: ["charisma", "wisdom"],
  health: ["energy", "willpower"],
  hobby: ["energy", "agility"],
  home: ["agility", "willpower"],
};
