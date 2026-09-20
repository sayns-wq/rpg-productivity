export function getLevelInfo(totalXp) {
  let level = 1;
  let xpForNext = 100;
  let currentXp = totalXp;

  while (currentXp >= xpForNext) {
    currentXp -= xpForNext;
    level++;
    xpForNext = level * 100;
  }

  return { level, currentXp, xpForNext };
}

export function calculateFatigueMultiplier(fatigue) {
  if (fatigue >= 80) return 0.25;
  if (fatigue >= 50) return 0.5;
  return 1;
}

export function calculateHabitXp(baseXp, streak) {
  const xp = baseXp - streak * 10;
  return Math.max(xp, 10);
}
