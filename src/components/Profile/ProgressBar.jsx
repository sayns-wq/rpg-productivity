import { PROGRESS_SKINS } from "../../constants";

export function ProgressBar({ currentXp, xpForNext, totalXp, progressSkin }) {
  const progressPercent = Math.round((currentXp / xpForNext) * 100);
  const skin = PROGRESS_SKINS[progressSkin || "default"];

  return (
    <div className="mb-4">
      <div className="flex justify-between text-sm text-gray-400 mb-2">
        <span>
          XP: {currentXp} / {xpForNext}
        </span>
        <span>Всего: {totalXp || 0} XP</span>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-6 overflow-hidden border border-gray-600">
        <div
          className={`bg-gradient-to-r ${skin.class} h-full rounded-full transition-all duration-1000 ease-out relative`}
          style={{ width: `${progressPercent}%` }}
        >
          <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
