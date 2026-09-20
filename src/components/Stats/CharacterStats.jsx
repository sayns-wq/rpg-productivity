// import { STATS } from "../../constants/stats";

export function CharacterStats({ stats, loading }) {
  const getStatColor = (statType) => {
    const colors = {
      willpower: "#ef4444", // red-500
      intelligence: "#3b82f6", // blue-500
      charisma: "#a855f7", // purple-500
      agility: "#22c55e", // green-500
      luck: "#eab308", // yellow-500
      wisdom: "#6366f1", // indigo-500
      energy: "#f97316", // orange-500
    };
    return colors[statType] || "#6b7280";
  };
  if (loading) {
    return (
      <div className="text-center py-8 text-gray-400">
        Загрузка характеристик...
      </div>
    );
  }

  return (
    <div className="glass rounded-2xl p-6 mb-6">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        📊 Характеристики персонажа
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div key={stat.stat_type} className="bg-gray-800/50 p-4 rounded-xl">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{stat.icon}</span>
              <div>
                <h3 className="font-bold">{stat.name}</h3>
                <p className="text-xs text-gray-400">{stat.description}</p>
              </div>
            </div>

            <div className="mb-2">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-400">Уровень {stat.level}</span>
                <span className="text-yellow-400">
                  {stat.xp} / {stat.xp + stat.xpToNext} XP
                </span>
              </div>
              <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${stat.xp % 100}%`,
                    backgroundColor: getStatColor(stat.stat_type),
                  }}
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              До следующего уровня: {stat.xpToNext} XP
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
