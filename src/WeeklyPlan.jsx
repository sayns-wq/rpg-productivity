import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { CATEGORIES, PRIORITIES } from "./constants";
import { useTheme } from "./useTheme";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import {
  format,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameDay,
  isToday,
} from "date-fns";
import { ru } from "date-fns/locale";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  GripVertical,
  Target,
} from "lucide-react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

// Перетаскиваемая задача
function DraggableTask({ task, onComplete, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: task.id,
      data: { ...task, type: "task" },
    });

  const cat = CATEGORIES[task.category] || CATEGORIES.work;
  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`bg-gray-800/50 p-3 rounded-lg mb-2 cursor-move hover:bg-gray-800/70 transition group ${
        task.status === "done" ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-start gap-2">
        <div className="text-gray-500 hover:text-gray-300 mt-1">
          <GripVertical size={16} />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className={`font-semibold truncate ${task.status === "done" ? "line-through text-gray-500" : ""}`}
          >
            {task.title}
          </p>

          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span
              className={`text-xs px-2 py-1 rounded bg-${cat.color}-600/20 text-${cat.color}-400`}
            >
              {cat.icon} {cat.name}
            </span>
            <span
              className={`text-xs px-2 py-1 rounded bg-${priority.color}-600/20 text-${priority.color}-400`}
            >
              {priority.icon}
            </span>
            <span className="text-xs text-yellow-400">{task.xp} XP</span>
          </div>

          {task.deadline && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <Clock size={10} />
              {format(new Date(task.deadline), "dd MMM, HH:mm", { locale: ru })}
            </p>
          )}
        </div>

        {task.status !== "done" && (
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onComplete(task);
              }}
              className="text-green-400 hover:text-green-300"
            >
              <Check size={18} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(task.id);
              }}
              className="text-red-400 hover:text-red-300"
            >
              <GripVertical size={18} className="rotate-45" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Колонка дня с поддержкой дропа
function DayColumn({ day, tasks, onComplete, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: `day-${day.toISOString()}`,
    data: {
      type: "day",
      date: day,
    },
  });

  const dayTasks = tasks.filter((task) => {
    if (!task.deadline || task.status === "done") return false;
    const taskDate = new Date(task.deadline);
    return isSameDay(taskDate, day);
  });

  const totalXp = dayTasks.reduce((sum, t) => sum + t.xp, 0);

  return (
    <div
      ref={setNodeRef}
      className={`glass rounded-xl p-4 min-h-[300px] transition ${
        isOver ? "border-2 border-purple-500 bg-purple-900/20" : ""
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3
            className={`font-bold text-lg ${isToday(day) ? "text-purple-400" : ""}`}
          >
            {format(day, "EEEE", { locale: ru })}
          </h3>
          <p className="text-sm text-gray-400 capitalize">
            {format(day, "dd MMMM", { locale: ru })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-yellow-400">{totalXp}</p>
          <p className="text-xs text-gray-400">{dayTasks.length} задач</p>
        </div>
      </div>

      {dayTasks.map((task) => (
        <DraggableTask
          key={task.id}
          task={task}
          onComplete={onComplete}
          onDelete={onDelete}
        />
      ))}

      {dayTasks.length === 0 && (
        <p className="text-gray-600 text-center py-8 text-sm">
          Нет задач на этот день
        </p>
      )}
    </div>
  );
}

// Секция "Задачи без даты" с поддержкой дропа
function NoDeadlineSection({ tasks, onComplete, onDelete }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "no-deadline-section",
    data: {
      type: "no-deadline",
    },
  });

  return (
    <div
      ref={setNodeRef}
      className={`mt-8 glass rounded-xl p-6 transition ${
        isOver ? "border-2 border-purple-500 bg-purple-900/20" : ""
      }`}
    >
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Target className="text-gray-400" />
        Задачи без даты ({tasks.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tasks.map((task) => (
          <DraggableTask
            key={task.id}
            task={task}
            onComplete={onComplete}
            onDelete={onDelete}
          />
        ))}
      </div>
      {tasks.length === 0 && (
        <p className="text-gray-500 text-center py-4">
          Все задачи распределены по дням!
        </p>
      )}
      {isOver && (
        <p className="text-purple-400 text-center mt-4 text-sm">
          Отпусти задачу здесь, чтобы убрать дедлайн
        </p>
      )}
    </div>
  );
}

function WeeklyPlan() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [activeTask, setActiveTask] = useState(null);

  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    }),
  );

  useEffect(() => {
    let isMounted = true;

    const loadTasks = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;
      const { data } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", session.user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false });

      if (isMounted) {
        if (data) {
          setTasks(data);
        }
        setLoading(false);
      }
    };

    loadTasks();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDragStart = (event) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    setActiveTask(task);
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id;
    const overData = over.data.current;

    // Если бросили на день
    if (overData?.type === "day") {
      await updateTaskDeadline(taskId, overData.date);
    }
    // Если бросили в секцию "без даты"
    else if (overData?.type === "no-deadline") {
      await clearTaskDeadline(taskId);
    }
  };

  const updateTaskDeadline = async (taskId, newDeadline) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const deadlineDate = new Date(newDeadline);
    deadlineDate.setHours(12, 0, 0, 0);

    try {
      await supabase
        .from("tasks")
        .update({ deadline: deadlineDate.toISOString() })
        .eq("id", taskId);

      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, deadline: deadlineDate.toISOString() } : t,
        ),
      );

      toast.success("Задача перенесена!");
    } catch (err) {
      console.error("Ошибка:", err);
      toast.error("Не удалось перенести задачу");
    }
  };

  const clearTaskDeadline = async (taskId) => {
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    try {
      await supabase.from("tasks").update({ deadline: null }).eq("id", taskId);

      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, deadline: null } : t)),
      );

      toast.success("Дедлайн удалён!");
    } catch (err) {
      console.error("Ошибка:", err);
      toast.error("Не удалось убрать дедлайн");
    }
  };

  const handleComplete = async (task) => {
    try {
      // 1. Получаем сессию
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        toast.error("Пользователь не авторизован");
        return;
      }

      // 2. Получаем профиль для множителя усталости
      const { data: profileData } = await supabase
        .from("profiles")
        .select("fatigue, total_xp, level")
        .eq("id", session.user.id)
        .single();

      if (!profileData) {
        toast.error("Профиль не найден");
        return;
      }

      // 3. Рассчитываем XP с учётом усталости
      const multiplier =
        profileData.fatigue >= 80 ? 0.25 : profileData.fatigue >= 50 ? 0.5 : 1;
      const earnedXp = Math.round(task.xp * multiplier);

      // 4. Обновляем статус задачи
      await supabase
        .from("tasks")
        .update({
          status: "done",
          completed_at: new Date().toISOString(),
        })
        .eq("id", task.id);

      // 5. Создаём запись в action_logs
      // Преобразуем tier в type для совместимости с историей
      const logType =
        task.tier === "chore"
          ? "task"
          : task.tier === "feat"
            ? "habit"
            : task.tier || "task";

      await supabase.from("action_logs").insert([
        {
          user_id: session.user.id,
          type: logType, // 'task', 'habit', или 'milestone'
          title: task.title,
          xp_earned: earnedXp,
          tier: task.tier || "task", // сохраняем оригинальный tier
          category: task.category || "work",
          created_at: new Date().toISOString(),
        },
      ]);

      // 6. Обновляем профиль (total_xp и level)
      const newTotalXp = (profileData.total_xp || 0) + earnedXp;
      const newLevel = Math.floor(newTotalXp / 100) + 1;
      const oldLevel = profileData.level || 1;

      await supabase
        .from("profiles")
        .update({
          total_xp: newTotalXp,
          level: newLevel,
        })
        .eq("id", session.user.id);

      // 7. Начисляем XP характеристикам (если есть)
      if (task.stats && task.stats.length > 0) {
        const statXp = Math.ceil(earnedXp / task.stats.length);

        for (const statType of task.stats) {
          // Сначала получаем текущее значение
          const { data: currentStat } = await supabase
            .from("user_stats")
            .select("xp")
            .eq("user_id", session.user.id)
            .eq("stat_type", statType)
            .single();

          if (currentStat) {
            // Потом обновляем
            await supabase
              .from("user_stats")
              .update({
                xp: currentStat.xp + statXp,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", session.user.id)
              .eq("stat_type", statType);
          }
        }
      }

      // 8. Обновляем UI
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, status: "done" } : t)),
      );

      // 9. Показываем уведомление
      toast.success(`Задача выполнена! +${earnedXp} XP`);

      // 10. Если уровень повысился
      if (newLevel > oldLevel) {
        setTimeout(() => {
          toast.success(`🎉 Уровень повышен! Теперь уровень ${newLevel}`);
        }, 500);
      }
    } catch (error) {
      console.error("Ошибка при выполнении:", error);
      toast.error("Ошибка при выполнении задачи");
    }
  };

  const handleDelete = async (taskId) => {
    if (!confirm("Удалить задачу?")) return;

    try {
      await supabase.from("tasks").delete().eq("id", taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      toast.success("Задача удалена");
    } catch (err) {
      console.error("Ошибка:", err);
      toast.error("Ошибка при удалении");
    }
  };

  const noDeadlineTasks = tasks.filter(
    (t) => !t.deadline && t.status === "active",
  );

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
        <div className="flex items-center gap-4 mb-6">
          <Link to="/app" className="text-gray-400 hover:text-white transition">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Calendar className="text-purple-400" />
              План на неделю
            </h1>
            <p className="text-gray-400 capitalize">
              {format(weekStart, "dd MMMM", { locale: ru })} -{" "}
              {format(weekEnd, "dd MMMM yyyy", { locale: ru })}
            </p>
          </div>
        </div>

        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {weekDays.map((day) => (
              <DayColumn
                key={`day-${day.toISOString()}`}
                day={day}
                tasks={tasks}
                onComplete={handleComplete}
                onDelete={handleDelete}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <div className="bg-gray-800/90 p-3 rounded-lg shadow-xl border-2 border-purple-500">
                <p className="font-semibold">{activeTask.title}</p>
                <p className="text-sm text-yellow-400">{activeTask.xp} XP</p>
              </div>
            )}
          </DragOverlay>

          {/* Переместили NoDeadlineSection ВНУТРЬ DndContext */}
          <NoDeadlineSection
            tasks={noDeadlineTasks}
            onComplete={handleComplete}
            onDelete={handleDelete}
          />
        </DndContext>
      </div>
    </div>
  );
}

export default WeeklyPlan;
