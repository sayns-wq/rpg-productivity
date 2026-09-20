// Запрос разрешения на уведомления
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.log("Браузер не поддерживает уведомления");
    return false;
  }

  const permission = await Notification.requestPermission();
  return permission === "granted";
}

// Отправка уведомления
export function sendNotification(title, body, icon = null) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    const notification = new Notification(title, {
      body,
      icon: icon || "/favicon.ico",
      badge: "/favicon.ico",
      tag: "rpg-productivity", // Чтобы не дублировать уведомления
    });

    // Автоматически закрыть через 5 секунд
    setTimeout(() => notification.close(), 5000);

    return notification;
  }
}

// Проверка невыполненных привычек
export function checkUncompletedHabits(habits) {
  const now = new Date();
  const currentHour = now.getHours();

  // Если время меньше 20:00, не напоминаем
  if (currentHour < 20) return [];

  const uncompleted = habits.filter((habit) => {
    if (!habit.last_completed_at) return true;

    const lastCompleted = new Date(habit.last_completed_at);
    const today = new Date();

    // Проверяем, выполнена ли привычка сегодня
    return lastCompleted.toDateString() !== today.toDateString();
  });

  return uncompleted;
}
