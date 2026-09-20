import { useState, useEffect } from "react";
import { TIERS } from "./constants";
import { OnboardingModal } from "./components/OnboardingModal";
import { useTheme } from "./useTheme";
import { useAuth } from "./hooks/useAuth";
import { useTasks } from "./hooks/useTasks";
import { useProfile } from "./hooks/useProfile";
import { getLevelInfo } from "./utils/xpCalculator";
import { AuthForm } from "./components/Auth/AuthForm";
import { ProfileHeader } from "./components/Profile/ProfileHeader";
import { ProgressBar } from "./components/Profile/ProgressBar";
import { FatigueBar } from "./components/Profile/FatigueBar";
import { TaskSection } from "./components/Tasks/TaskSection";
import { TaskModal } from "./components/Tasks/TaskModal";
import { LevelUpModal } from "./components/Effects/LevelUpModal";
import { XPAnimation } from "./components/Effects/XPAnimation";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";
import { SEO } from "./components/SEO";

function App() {
  const { theme } = useTheme();
  const auth = useAuth();
  const profile = useProfile(auth.session?.user?.id);
  const tasks = useTasks(auth.session?.user?.id);

  const [showLevelUp, setShowLevelUp] = useState(false);
  const [xpAnimations, setXpAnimations] = useState([]);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  const [modalType, setModalType] = useState(null);
  const [modalTitle, setModalTitle] = useState("");
  const [modalXp, setModalXp] = useState(20);
  const [modalCategory, setModalCategory] = useState("work");
  const [modalPriority, setModalPriority] = useState("medium");
  const [modalDeadline, setModalDeadline] = useState(null);
  const [modalStats, setModalStats] = useState([]);

  const [expandedSections, setExpandedSections] = useState({
    chores: true,
    feats: true,
    milestones: true,
  });
  const [editingTask, setEditingTask] = useState(null);

  const handleDuplicate = async (task) => {
    try {
      await tasks.duplicateTask(task);
      toast.success("Задача скопирована!");
    } catch (error) {
      console.error("Ошибка копирования:", error);
      toast.error("Не удалось скопировать задачу");
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setModalType(task.tier || "milestone");
    setModalTitle(task.title);
    setModalXp(task.xp);
    setModalCategory(task.category);
    setModalPriority(task.priority || "medium");
    setModalDeadline(task.deadline);
    setModalStats(task.stats || []); // <-- добавь
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!modalTitle.trim() || !editingTask) return;

    try {
      await tasks.updateTask(editingTask.id, modalType, {
        title: modalTitle,
        xp: modalXp,
        category: modalCategory,
        priority: modalPriority,
        deadline: modalDeadline,
        stats: modalStats,
      });
      closeModal();
      setEditingTask(null);
      toast.success("Задача обновлена!");
    } catch (error) {
      console.error("Ошибка обновления:", error);
      toast.error("Ошибка обновления задачи");
    }
  };

  // Проверка левел-апа
  useEffect(() => {
    if (!profile.profile || profile.previousXp === null) return;

    const oldLevel = getLevelInfo(profile.previousXp).level;
    const newLevel = getLevelInfo(profile.profile.total_xp).level;

    if (newLevel > oldLevel) {
      const timeoutId = setTimeout(() => {
        setShowLevelUp(true);

        const duration = 3000;
        const end = Date.now() + duration;

        const frame = () => {
          confetti({
            particleCount: 5,
            angle: 60,
            spread: 55,
            origin: { x: 0 },
            colors: ["#a855f7", "#ec4899", "#fbbf24"],
          });
          confetti({
            particleCount: 5,
            angle: 120,
            spread: 55,
            origin: { x: 1 },
            colors: ["#a855f7", "#ec4899", "#fbbf24"],
          });

          if (Date.now() < end) {
            requestAnimationFrame(frame);
          }
        };
        frame();

        setTimeout(() => setShowLevelUp(false), 3000);
      }, 0);

      // Очистка таймера при размонтировании или повторном срабатывании эффекта
      return () => clearTimeout(timeoutId);
    }
  }, [profile.profile?.total_xp, profile.previousXp]);

  useEffect(() => {
    // Если профиль загрузился и пользователь еще не прошел онбординг
    if (
      profile.profile &&
      profile.profile.is_onboarded === false &&
      !showOnboarding
    ) {
      setShowOnboarding(true);
    }
  }, [profile.profile]);
  const addXpAnimation = (xp, type, isReduced) => {
    const id = crypto.randomUUID();
    setXpAnimations((prev) => [...prev, { id, xp, type, isReduced }]);
    setTimeout(() => {
      setXpAnimations((prev) => prev.filter((a) => a.id !== id));
    }, 1000);
  };

  const handleCompleteTask = async (task) => {
    await tasks.completeTask(task, profile.profile, (xp, type, isReduced) => {
      addXpAnimation(xp, type, isReduced);
    });
    profile.refreshProfile();
  };

  const handleCompleteMilestone = async (milestone) => {
    await tasks.completeMilestone(
      milestone,
      profile.profile,
      (xp, type, isReduced) => {
        addXpAnimation(xp, type, isReduced);
      },
    );
    profile.refreshProfile();
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    const xpValue = parseInt(modalXp, 10);
    if (isNaN(xpValue) || xpValue < 1) {
      toast.error("XP должно быть не меньше 1");
      return;
    }

    try {
      await tasks.createTask(
        modalType,
        modalTitle,
        xpValue,
        modalCategory,
        modalPriority,
        modalDeadline,
        modalStats, // <-- передаём характеристики
      );
      closeModal();
      toast.success("Задача создана!");
    } catch (error) {
      console.error("Ошибка создания:", error);
      toast.error("Ошибка создания задачи");
    }
  };

  const handleFatigueChange = async (delta) => {
    await profile.updateFatigue(delta);
  };

  const openModal = (type) => {
    setModalType(type);
    setModalTitle("");
    setModalXp(TIERS[type].baseXp);
    setModalCategory("work");
  };

  const closeModal = () => {
    setModalType(null);
    setModalTitle("");
    setModalXp(20);
    setModalCategory("work");
    setModalPriority("medium");
    setModalDeadline(null);
    setModalStats([]);
    setEditingTask(null);
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const enableNotifications = async () => {
    setNotificationsEnabled(true);
  };

  // Загрузка
  if (auth.loading || profile.loading) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Загрузка...</p>
        </div>
      </div>
    );
  }

  // Авторизация
  if (!auth.session) {
    return (
      <div
        className={`min-h-screen ${theme.bg} flex items-center justify-center p-4`}
      >
        <SEO
          title="Главная"
          description="Управляй задачами, привычками и достижениями в формате RPG-игры"
        />
        <AuthForm
          authMode={auth.authMode}
          authError={auth.authError}
          authLoading={auth.authLoading}
          onSignIn={auth.signIn}
          onSignUp={auth.signUp}
          onToggleMode={() =>
            auth.setAuthMode(auth.authMode === "login" ? "register" : "login")
          }
        />
      </div>
    );
  }

  const { level, currentXp, xpForNext } = getLevelInfo(
    profile.profile?.total_xp || 0,
  );

  return (
    <div
      className={`min-h-screen ${theme.bg} text-white transition-colors duration-500`}
    >
      {showLevelUp && (
        <LevelUpModal
          level={level}
          username={profile.profile?.username}
          totalXp={profile.profile?.total_xp}
        />
      )}

      <XPAnimation animations={xpAnimations} />

      <div className="max-w-6xl mx-auto p-6">
        <div className="glass rounded-2xl p-6 mb-6 animate-fade-in">
          <ProfileHeader
            profile={profile.profile}
            level={level}
            onSignOut={auth.signOut}
            notificationsEnabled={notificationsEnabled}
            onEnableNotifications={enableNotifications}
          />

          <ProgressBar
            currentXp={currentXp}
            xpForNext={xpForNext}
            totalXp={profile.profile?.total_xp}
            progressSkin={profile.profile?.progress_skin}
          />

          <FatigueBar
            fatigue={profile.profile?.fatigue || 0}
            onFatigueChange={handleFatigueChange}
          />
        </div>

        <TaskSection
          title="Дела"
          icon="📝"
          tasks={tasks.chores}
          expanded={expandedSections.chores}
          onToggle={() => toggleSection("chores")}
          onCreate={() => openModal("chore")}
          onEdit={handleEdit}
          onDuplicate={handleDuplicate}
          onComplete={handleCompleteTask}
          onDelete={(id) => tasks.deleteTask("chore", id)}
          fatigueMultiplier={profile.fatigueMultiplier}
          buttonColor="bg-blue-600 hover:bg-blue-700"
        />

        <TaskSection
          title="Подвиги"
          icon="⚔️"
          tasks={tasks.feats}
          expanded={expandedSections.feats}
          onToggle={() => toggleSection("feats")}
          onCreate={() => openModal("feat")}
          onEdit={handleEdit} // ← добавь
          onDuplicate={handleDuplicate}
          onComplete={handleCompleteTask}
          onDelete={(id) => tasks.deleteTask("feat", id)}
          fatigueMultiplier={profile.fatigueMultiplier}
          buttonColor="bg-red-600 hover:bg-red-700"
        />

        <TaskSection
          title="Достижения"
          icon="🏆"
          tasks={tasks.milestones}
          expanded={expandedSections.milestones}
          onToggle={() => toggleSection("milestones")}
          onCreate={() => openModal("milestone")}
          onEdit={handleEdit} // ← добавь
          onDuplicate={handleDuplicate}
          onComplete={handleCompleteMilestone}
          onDelete={(id) => tasks.deleteTask("milestone", id)}
          fatigueMultiplier={profile.fatigueMultiplier}
          buttonColor="bg-purple-600 hover:bg-purple-700"
        />
      </div>

      {modalType && (
        <TaskModal
          modalType={modalType}
          modalTitle={modalTitle}
          modalXp={modalXp}
          modalCategory={modalCategory}
          modalPriority={modalPriority}
          modalDeadline={modalDeadline}
          modalStats={modalStats}
          isEditing={!!editingTask}
          fatigueMultiplier={profile.fatigueMultiplier}
          onTitleChange={setModalTitle}
          onXpChange={setModalXp}
          onCategoryChange={setModalCategory}
          onPriorityChange={setModalPriority}
          onDeadlineChange={setModalDeadline}
          onStatsChange={setModalStats}
          onSubmit={editingTask ? handleUpdate : handleCreate}
          onClose={closeModal}
        />
      )}
      {showOnboarding && auth.session?.user?.id && (
        <OnboardingModal
          userId={auth.session.user.id}
          onComplete={() => {
            setShowOnboarding(false);
            profile.refreshProfile(); // Обновляем профиль (is_onboarded станет true)
            tasks.loadData(); // Загружаем новые стартовые задачи
            toast.success("Добро пожаловать в систему! 🎮");
          }}
        />
      )}
    </div>
  );
}

export default App;
