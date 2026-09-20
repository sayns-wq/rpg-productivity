import { useState, useMemo } from "react";
import { Plus, ChevronDown, ChevronUp, Search } from "lucide-react";
import { TaskCard } from "./TaskCard";
import { CATEGORIES } from "../../constants";

export function TaskSection({
  title,
  icon,
  tasks,
  expanded,
  onToggle,
  onCreate,
  onEdit,
  onComplete,
  onDelete,
  onDuplicate,
  fatigueMultiplier,
  buttonColor,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState("deadline");
  const [showAll, setShowAll] = useState(false);

  const VISIBLE_LIMIT = 10;

  // Выносим "сейчас" в переменную — это решает проблему с Date.now() в рендере
  const now = useMemo(() => new Date(), []);
  const tomorrow = useMemo(
    () => new Date(now.getTime() + 24 * 60 * 60 * 1000),
    [now],
  );

  const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        const matchesSearch = task.title
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
        const matchesCategory =
          categoryFilter === "all" || task.category === categoryFilter;
        const matchesPriority =
          priorityFilter === "all" || task.priority === priorityFilter;

        return matchesSearch && matchesCategory && matchesPriority;
      })
      .sort((a, b) => {
        if (sortBy === "deadline") {
          const aDeadline = a.deadline
            ? new Date(a.deadline).getTime()
            : Infinity;
          const bDeadline = b.deadline
            ? new Date(b.deadline).getTime()
            : Infinity;
          return aDeadline - bDeadline;
        }
        if (sortBy === "priority") {
          return (
            (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2)
          );
        }
        if (sortBy === "xp") {
          return b.xp - a.xp;
        }
        return (
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      });
  }, [tasks, searchQuery, categoryFilter, priorityFilter, sortBy]);

  const visibleTasks = showAll
    ? filteredTasks
    : filteredTasks.slice(0, VISIBLE_LIMIT);

  return (
    <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
      <div className="flex justify-between items-center mb-4">
        <div
          className="flex items-center gap-2 cursor-pointer flex-1"
          onClick={onToggle}
        >
          <span className="text-2xl">{icon}</span>
          <h2 className="text-2xl font-bold flex-1">{title}</h2>
          <span className="text-gray-400 text-sm">{tasks.length}</span>
          {expanded ? <ChevronUp /> : <ChevronDown />}
        </div>
        <button
          onClick={onCreate}
          className={`${buttonColor} text-white px-4 py-2 rounded-lg transition flex items-center gap-2 transform hover:scale-105 ml-4`}
        >
          <Plus size={20} />
          Создать
        </button>
      </div>

      {expanded && (
        <div className="space-y-3">
          {tasks.length > 3 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Поиск..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-800/50 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
                />
              </div>

              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-800/50 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="all">Все категории</option>
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                  <option key={key} value={key}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="bg-gray-800/50 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="all">Все приоритеты</option>
                <option value="urgent">🔴 Срочные</option>
                <option value="high">🟠 Высокие</option>
                <option value="medium"> Средние</option>
                <option value="low">🔵 Низкие</option>
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-gray-800/50 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none text-sm"
              >
                <option value="deadline">По дедлайну</option>
                <option value="priority">По приоритету</option>
                <option value="xp">По XP</option>
                <option value="date">По дате</option>
              </select>
            </div>
          )}

          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onComplete={onComplete}
              onDelete={onDelete}
              onEdit={onEdit}
              onDuplicate={onDuplicate}
              fatigueMultiplier={fatigueMultiplier}
              now={now}
              tomorrow={tomorrow}
            />
          ))}

          {filteredTasks.length === 0 && (
            <p className="text-gray-500 text-center py-8">
              {searchQuery ||
              categoryFilter !== "all" ||
              priorityFilter !== "all"
                ? "Ничего не найдено"
                : `Нет ${title.toLowerCase()}`}
            </p>
          )}

          {filteredTasks.length > VISIBLE_LIMIT && (
            <div className="flex justify-center pt-2">
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-sm text-purple-400 hover:text-purple-300 transition flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-purple-900/20"
              >
                {showAll ? (
                  <>
                    <ChevronUp size={16} />
                    Свернуть (показать {VISIBLE_LIMIT})
                  </>
                ) : (
                  <>
                    <ChevronDown size={16} />
                    Показать все ({filteredTasks.length})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
