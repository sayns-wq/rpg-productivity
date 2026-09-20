import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";
import { ArrowLeft, Target, Flame, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { useTheme } from "./useTheme";

function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const { theme } = useTheme();

  useEffect(() => {
    let isMounted = true;

    const loadHistory = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("action_logs")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (isMounted && data) {
        setLogs(data);
        setLoading(false);
      }
    };

    loadHistory();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredLogs =
    filter === "all" ? logs : logs.filter((log) => log.type === filter);

  const getIcon = (type) => {
    switch (type) {
      case "task":
        return <Target className="text-blue-400" size={20} />;
      case "habit":
        return <Flame className="text-orange-400" size={20} />;
      case "milestone":
        return <Trophy className="text-purple-400" size={20} />;
      default:
        return null;
    }
  };

  const getTypeName = (type) => {
    switch (type) {
      case "task":
        return "Задача";
      case "habit":
        return "Привычка";
      case "milestone":
        return "Достижение";
      default:
        return type;
    }
  };

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
    <div className={`min-h-screen ${theme.bg} text-white`}>
      <div className="max-w-4xl mx-auto p-6">
        {/* Шапка */}
        <div className="flex items-center gap-4 mb-6">
          <Link
            to="/"
            className="text-gray-400 hover:text-white transition flex items-center gap-2"
          >
            <ArrowLeft size={24} />
          </Link>
          <h1 className="text-3xl font-bold">📜 История действий</h1>
        </div>

        {/* Фильтры */}
        <div className="glass rounded-xl p-4 mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-lg transition ${
              filter === "all"
                ? "bg-purple-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            Все ({logs.length})
          </button>
          <button
            onClick={() => setFilter("task")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              filter === "task"
                ? "bg-blue-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            <Target size={16} />
            Задачи ({logs.filter((l) => l.type === "task").length})
          </button>
          <button
            onClick={() => setFilter("habit")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              filter === "habit"
                ? "bg-orange-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            <Flame size={16} />
            Привычки ({logs.filter((l) => l.type === "habit").length})
          </button>
          <button
            onClick={() => setFilter("milestone")}
            className={`px-4 py-2 rounded-lg transition flex items-center gap-2 ${
              filter === "milestone"
                ? "bg-purple-600 text-white"
                : "bg-gray-800/50 text-gray-400 hover:text-white"
            }`}
          >
            <Trophy size={16} />
            Достижения ({logs.filter((l) => l.type === "milestone").length})
          </button>
        </div>

        {/* Список */}
        <div className="glass rounded-xl p-6">
          {filteredLogs.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              {filter === "all"
                ? "Пока нет выполненных действий"
                : `Нет записей в категории "${getTypeName(filter)}"`}
            </p>
          ) : (
            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="bg-gray-800/50 p-4 rounded-lg flex items-center justify-between hover:bg-gray-800/70 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-700/50 rounded-lg">
                      {getIcon(log.type)}
                    </div>
                    <div>
                      <p className="font-semibold">{log.title}</p>
                      <p className="text-sm text-gray-400">
                        {new Date(log.created_at).toLocaleString("ru-RU", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <p className="text-yellow-400 font-bold text-lg">
                    +{log.xp_earned} XP
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default HistoryPage;
