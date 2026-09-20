import { useState } from "react";
import { supabase } from "../supabaseClient";
import { CLASSES } from "../constants";
import { X, ArrowRight, ArrowLeft, Check } from "lucide-react";
import toast from "react-hot-toast";

export function OnboardingModal({ userId, onComplete }) {
  const [step, setStep] = useState(0); // 0: class, 1: tour, 2: tasks
  const [selectedClass, setSelectedClass] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalSteps = 3;

  const handleClassSelect = async (classKey) => {
    setSelectedClass(classKey);
  };

  const handleContinue = async () => {
    if (step === 0 && !selectedClass) {
      toast.error("Выбери класс персонажа");
      return;
    }

    if (step === 0) {
      // Сохраняем класс
      setLoading(true);
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_class: selectedClass })
        .eq("id", userId);

      if (error) {
        toast.error("Ошибка сохранения класса");
        setLoading(false);
        return;
      }

      // Создаём запись онбординга
      await supabase.from("user_onboarding").insert([
        {
          user_id: userId,
          completed_steps: ["class_selected"],
          current_step: 1,
        },
      ]);

      setLoading(false);
      setStep(1);
    } else if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      // Завершаем онбординг
      await completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    setLoading(true);

    // Создаём стартовые задачи
    const starterTasks = [
      {
        title: " Добро пожаловать в систему!",
        tier: "chore",
        xp: 50,
        category: "self",
        priority: "high",
        stats: ["intelligence", "wisdom"],
      },
      {
        title: "📝 Создай свою первую задачу",
        tier: "chore",
        xp: 30,
        category: "work",
        priority: "medium",
        stats: ["willpower"],
      },
      {
        title: " Изучи дерево навыков",
        tier: "feat",
        xp: 100,
        category: "self",
        priority: "medium",
        stats: ["intelligence"],
      },
      {
        title: "🗺️ Посмотри карту приключений",
        tier: "chore",
        xp: 50,
        category: "hobby",
        priority: "low",
        stats: ["wisdom"],
      },
    ];

    for (const task of starterTasks) {
      await supabase.from("tasks").insert([
        {
          user_id: userId,
          ...task,
          status: "active",
          created_at: new Date().toISOString(),
        },
      ]);
    }

    // Обновляем профиль
    await supabase
      .from("profiles")
      .update({
        is_onboarded: true,
        total_xp: 0,
        level: 1,
      })
      .eq("id", userId);

    // Обновляем онбординг
    await supabase
      .from("user_onboarding")
      .update({
        completed_steps: ["class_selected", "tour_completed", "tasks_created"],
        current_step: 3,
        completed_at: new Date().toISOString(),
      })
      .eq("user_id", userId);

    setLoading(false);
    onComplete();
    toast.success("Добро пожаловать! 🎮");
  };

  const steps = [
    {
      title: "Выбери свой класс",
      description: "Каждый класс имеет уникальный путь развития",
      icon: "️",
    },
    {
      title: "Изучи интерфейс",
      description: "Давай покажем основные возможности системы",
      icon: "🎯",
    },
    {
      title: "Стартовые задачи",
      description: "Мы создали несколько задач для начала пути",
      icon: "📋",
    },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Шапка */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{steps[step].icon}</span>
            <h2 className="text-xl font-bold">
              Шаг {step + 1} из {totalSteps}
            </h2>
          </div>
          <button
            onClick={async () => {
              // Помечаем как завершённый даже если закрыли
              await supabase
                .from("profiles")
                .update({ is_onboarded: true })
                .eq("id", userId);
              onComplete();
            }}
            className="text-gray-400 hover:text-white transition"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Прогресс бар */}
        <div className="w-full bg-gray-800 h-2">
          <div
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-full transition-all duration-500"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          />
        </div>

        {/* Контент */}
        <div className="p-6">
          {step === 0 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-2">{steps[step].title}</h3>
              <p className="text-gray-400 mb-6">{steps[step].description}</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(CLASSES).map(([key, cls]) => (
                  <button
                    key={key}
                    onClick={() => handleClassSelect(key)}
                    className={`p-6 rounded-xl border-2 transition all ${
                      selectedClass === key
                        ? "border-purple-500 bg-purple-500/20"
                        : "border-gray-700 bg-gray-800/50 hover:border-gray-600"
                    }`}
                  >
                    <div className="text-4xl mb-3">{cls.icon}</div>
                    <h4 className="font-bold text-lg mb-1">{cls.name}</h4>
                    <p className="text-sm text-gray-400">{cls.description}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-2">{steps[step].title}</h3>
              <p className="text-gray-400 mb-6">{steps[step].description}</p>

              <div className="space-y-4">
                <div className="bg-gray-800/50 p-4 rounded-lg flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Создавай задачи</h4>
                    <p className="text-sm text-gray-400">
                      Добавляй дела, привычки и достижения на главной странице
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Отслеживай прогресс</h4>
                    <p className="text-sm text-gray-400">
                      Смотри статистику, дерево навыков и карту приключений
                    </p>
                  </div>
                </div>

                <div className="bg-gray-800/50 p-4 rounded-lg flex items-start gap-3">
                  <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-bold mb-1">Развивай характеристики</h4>
                    <p className="text-sm text-gray-400">
                      Каждая задача развивает определённые навыки персонажа
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-2">{steps[step].title}</h3>
              <p className="text-gray-400 mb-6">{steps[step].description}</p>

              <div className="bg-green-900/20 border border-green-500/50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="text-green-400" size={20} />
                  <span className="font-bold text-green-400">
                    Готово к старту!
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  Мы создали 4 стартовые задачи. Выполни их, чтобы освоиться в
                  системе и получить первые XP!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Футер */}
        <div className="flex gap-3 p-6 border-t border-gray-800">
          {step > 0 && (
            <button
              onClick={() => setStep(step - 1)}
              className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition flex items-center gap-2"
              disabled={loading}
            >
              <ArrowLeft size={18} />
              Назад
            </button>
          )}
          <button
            onClick={handleContinue}
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Загрузка...</span>
            ) : step === totalSteps - 1 ? (
              <>
                <Check size={18} />
                Начать приключение!
              </>
            ) : (
              <>
                Продолжить
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
