import { useEffect } from "react";
import { CATEGORIES, PRIORITIES } from "../../constants";
import { STATS } from "../../constants/stats";
import { X, Calendar, Zap } from "lucide-react";

export function TaskModal({
  modalType,
  modalTitle,
  modalXp,
  modalCategory,
  modalPriority,
  modalDeadline,
  modalStats,
  isEditing,
  fatigueMultiplier,
  onTitleChange,
  onXpChange,
  onCategoryChange,
  onPriorityChange,
  onDeadlineChange,
  onStatsChange,
  onSubmit,
  onClose,
}) {
  // Запрет скролла основной страницы при открытом попапе
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const cat = CATEGORIES[modalCategory] || CATEGORIES.work;
  const priority = PRIORITIES[modalPriority] || PRIORITIES.medium;

  const handleStatsToggle = (statKey) => {
    const current = modalStats || [];
    if (current.includes(statKey)) {
      onStatsChange(current.filter((s) => s !== statKey));
    } else if (current.length < 2) {
      onStatsChange([...current, statKey]);
    }
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

  return (
    <>
      {/* Затемняющая подложка */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Сам попап */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pointer-events-none">
        <div
          className="bg-gray-900 border border-gray-700 rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col pointer-events-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Шапка попапа */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <span className="text-3xl">📝</span>
              {isEditing ? "Редактировать дело" : "Новое дело"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Контент с кастомным скроллом */}
          <div className="modal-scroll overflow-y-auto flex-1 p-6 space-y-5">
            {/* Название */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Название
              </label>
              <input
                type="text"
                value={modalTitle}
                onChange={(e) => onTitleChange(e.target.value)}
                className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                placeholder="Введите название..."
                autoFocus
              />
            </div>

            {/* Категория */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Категория
              </label>
              <select
                value={modalCategory}
                onChange={(e) => onCategoryChange(e.target.value)}
                className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition cursor-pointer"
              >
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key} className="bg-gray-900">
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Приоритет */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Приоритет
              </label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(PRIORITIES).map(([key, p]) => {
                  const isSelected = modalPriority === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => onPriorityChange(key)}
                      className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-1 ${
                        isSelected
                          ? "border-white bg-gray-800"
                          : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <span
                        className="w-5 h-5 rounded-full"
                        style={{ backgroundColor: p.color }}
                      />
                      <span className="text-xs text-gray-300">{p.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* XP */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                XP (базовое значение)
              </label>
              <input
                type="number"
                value={modalXp}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "") {
                    onXpChange("");
                  } else {
                    const numValue = parseInt(value, 10);
                    if (!isNaN(numValue)) {
                      onXpChange(Math.max(1, numValue));
                    }
                  }
                }}
                className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                min="1"
                placeholder="20"
              />
              <p className="text-xs text-gray-500 mt-1">
                Получишь:{" "}
                {Math.round((parseInt(modalXp) || 0) * fatigueMultiplier)} XP
                {fatigueMultiplier < 1 && (
                  <span className="text-red-400">
                    {" "}
                    (усталость: ×{fatigueMultiplier})
                  </span>
                )}
              </p>
            </div>

            {/* Дедлайн */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Дедлайн (опционально)
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  value={modalDeadline || ""}
                  onChange={(e) => onDeadlineChange(e.target.value || null)}
                  className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
                />
                <Calendar
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                  size={18}
                />
              </div>
            </div>

            {/* Характеристики */}
            <div>
              <label className="block text-gray-300 text-sm mb-2">
                Какие характеристики развивает задача?
                <span className="text-gray-500 text-xs ml-2">(1-2)</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(STATS).map(([key, stat]) => {
                  const isSelected = (modalStats || []).includes(key);
                  const isMaxSelected = (modalStats || []).length >= 2;

                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => handleStatsToggle(key)}
                      disabled={!isSelected && isMaxSelected}
                      className={`p-3 rounded-lg border-2 transition flex items-center gap-2 ${
                        isSelected
                          ? "border-purple-500 bg-purple-500/20"
                          : isMaxSelected
                            ? "border-gray-800 bg-gray-800/30 opacity-50 cursor-not-allowed"
                            : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                      }`}
                    >
                      <span className="text-xl">{stat.icon}</span>
                      <span className="text-sm">{stat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Футер с кнопками */}
          <div className="flex gap-3 p-6 border-t border-gray-800">
            <button
              onClick={onSubmit}
              disabled={!modalTitle.trim()}
              className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Zap size={18} />
              {isEditing ? "Сохранить" : "Создать"}
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition"
            >
              Отмена
            </button>
          </div>
        </div>
      </div>

      {/* Стили для кастомного скроллбара */}
      <style>{`
        .modal-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .modal-scroll::-webkit-scrollbar-track {
          background: rgba(31, 41, 55, 0.5);
          border-radius: 4px;
        }
        .modal-scroll::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.6);
          border-radius: 4px;
        }
        .modal-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.8);
        }
      `}</style>
    </>
  );
}
