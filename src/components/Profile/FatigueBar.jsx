import { Heart, AlertTriangle } from "lucide-react";
import { calculateFatigueMultiplier } from "../../utils/xpCalculator";

export function FatigueBar({ fatigue, onFatigueChange }) {
  const multiplier = calculateFatigueMultiplier(fatigue);

  return (
    <div className="border-t border-gray-700 pt-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Heart
            className={fatigue > 50 ? "text-red-400" : "text-green-400"}
            size={20}
          />
          <span className="text-sm font-semibold">Усталость: {fatigue}%</span>
          {multiplier < 1 && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} />
              XP × {multiplier}
            </span>
          )}
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onFatigueChange(-20)}
            className="text-xs bg-green-600/20 hover:bg-green-600/40 text-green-400 px-3 py-1 rounded transition"
            title="Отдохнул"
          >
            -20%
          </button>
          <button
            onClick={() => onFatigueChange(20)}
            className="text-xs bg-red-600/20 hover:bg-red-600/40 text-red-400 px-3 py-1 rounded transition"
            title="Плохой день"
          >
            +20%
          </button>
        </div>
      </div>
      <div className="w-full bg-gray-700/50 rounded-full h-3 overflow-hidden">
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
