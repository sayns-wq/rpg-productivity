import { Sparkles } from "lucide-react";

export function LevelUpModal({ level, username, totalXp }) {
  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 animate-fade-in">
      <div className="text-center animate-level-up">
        <div className="relative">
          <Sparkles className="w-40 h-40 text-yellow-400 mx-auto mb-4 animate-pulse" />
          <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"></div>
        </div>
        <h2 className="text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 mb-4">
          УРОВЕНЬ {level}!
        </h2>
        <p className="text-3xl text-white mb-2">Поздравляем, {username}!</p>
        <p className="text-xl text-gray-400">
          Ты становишься сильнее с каждым днём
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <div className="bg-gray-800/50 px-6 py-3 rounded-lg">
            <p className="text-sm text-gray-400">Всего XP</p>
            <p className="text-2xl font-bold text-yellow-400">{totalXp}</p>
          </div>
          <div className="bg-gray-800/50 px-6 py-3 rounded-lg">
            <p className="text-sm text-gray-400">Уровень</p>
            <p className="text-2xl font-bold text-purple-400">{level}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
