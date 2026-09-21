import { Heart, AlertTriangle } from "lucide-react";
import { calculateFatigueMultiplier } from "../../utils/xpCalculator";

export function FatigueBar({ fatigue, onFatigueChange }) {
  const multiplier = calculateFatigueMultiplier(fatigue);

  return (
    <div className="border-t border-gray-700 pt-3 sm:pt-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Heart
            className={fatigue > 50 ? "text-red-400" : "text-green-400"}
            size={18}
          />
          <span className="text-sm font-semibold">Усталость: {fatigue}%</span>
          {multiplier < 1 && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} />
              XP × {multiplier}
            </span>
          )}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => onFatigueChange(-20)}
            className="flex-1 sm:flex-none text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-2 rounded transition min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold"
            title="Отдохнул"
          >
            <span className="hidden sm:inline">-20%</span>
            <span className="sm:hidden">-20</span>
          </button>
          <button
            onClick={() => onFatigueChange(20)}
            className="flex-1 sm:flex-none text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-2 rounded transition min-h-[44px] min-w-[44px] flex items-center justify-center font-semibold"
            title="Плохой день"
          >
            <span className="hidden sm:inline">+20%</span>
            <span className="sm:hidden">+20</span>
          </button>
        </div>
      </div>

      <div className="w-full bg-gray-700/50 rounded-full h-2.5 sm:h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            fatigue >= 80
              ? "bg-red-500"
              : fatigue >= 50
                ? "bg-orange-500"
                : "bg-green-500"
          }`}
          style={{ width: `${fatigue}%` }}
        />
      </div>
    </div>
  );
}
