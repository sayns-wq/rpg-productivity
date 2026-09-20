import {
  Check,
  Trash2,
  Zap,
  Edit,
  AlertTriangle,
  Clock,
  Copy,
} from "lucide-react";
import { CATEGORIES, PRIORITIES } from "../../constants";
import { format, isBefore, isToday, isTomorrow } from "date-fns";
import { ru } from "date-fns/locale";

export function TaskCard({
  task,
  onComplete,
  onDelete,
  onEdit,
  onDuplicate,
  fatigueMultiplier,
  now,
  tomorrow,
}) {
  const cat = CATEGORIES[task.category] || CATEGORIES.work;
  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;
  const adjustedXp = Math.round(task.xp * fatigueMultiplier);

  const deadlineDate = task.deadline ? new Date(task.deadline) : null;
  const isOverdue = deadlineDate ? isBefore(deadlineDate, now) : false;
  const isUrgent = deadlineDate
    ? !isOverdue && isBefore(deadlineDate, tomorrow)
    : false;
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
  const getDeadlineText = () => {
    if (!deadlineDate) return null;
    if (isToday(deadlineDate)) return "Сегодня";
    if (isTomorrow(deadlineDate)) return "Завтра";
    return format(deadlineDate, "dd MMM, HH:mm", { locale: ru });
  };

  const borderColor = isOverdue
    ? "border-red-500"
    : isUrgent
      ? "border-orange-500"
      : priority.color === "red"
        ? "border-red-500/50"
        : "border-transparent";

  return (
    <div
      className={`bg-gray-800/50 p-4 rounded-lg flex justify-between items-center hover:bg-gray-800/70 transition group border-l-4 ${borderColor}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <span className="text-2xl flex-shrink-0">{cat.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">{task.title}</p>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className="text-xs px-2 py-1 rounded border"
              style={{
                borderColor: `${getCategoryColor(task.category)}80`, // 80 = 50% opacity
                backgroundColor: `${getCategoryColor(task.category)}20`, // 20 = 12% opacity
                color: getCategoryColor(task.category),
              }}
            >
              {cat.name}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded bg-${priority.color}-600/20 text-${priority.color}-400 flex items-center gap-1`}
            >
              {priority.icon} {priority.name}
            </span>
            {deadlineDate && (
              <span
                className={`text-xs px-2 py-1 rounded flex items-center gap-1 ${
                  isOverdue
                    ? "bg-red-600/20 text-red-400"
                    : isUrgent
                      ? "bg-orange-600/20 text-orange-400"
                      : "bg-blue-600/20 text-blue-400"
                }`}
              >
                <Clock size={10} />
                {getDeadlineText()}
                {isOverdue && <AlertTriangle size={10} />}
              </span>
            )}
            <span className="text-sm text-yellow-400 flex items-center gap-1">
              <Zap size={12} />
              {adjustedXp} XP
            </span>
          </div>
        </div>
      </div>
      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition flex-shrink-0 ml-2">
        {task.status !== "done" && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicate(task);
              }}
              className="bg-gray-600 hover:bg-gray-700 text-white p-2 rounded-lg transition"
              title="Копировать задачу"
            >
              <Copy size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(task);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition"
              title="Редактировать"
            >
              <Edit size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task);
              }}
              className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-lg transition"
              title="Выполнить"
            >
              <Check size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg transition"
              title="Удалить"
            >
              <Trash2 size={18} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
