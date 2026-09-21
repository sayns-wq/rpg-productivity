import { CLASSES } from "../../constants";
import Navigation from "../../Navigation";

export function ProfileHeader({
  profile,
  level,
  onSignOut,
  notificationsEnabled,
  onEnableNotifications,
}) {
  const avatarClass = profile?.avatar_class || "warrior";
  const classInfo = CLASSES[avatarClass];

  return (
    <div className="flex justify-between items-center gap-3 mb-4 sm:mb-6">
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-3xl font-bold flex items-center gap-2 sm:gap-3">
          <span className="text-2xl sm:text-4xl flex-shrink-0">
            {classInfo?.icon}
          </span>
          <div className="min-w-0">
            <div className="truncate">{profile?.username || "Герой"}</div>
            <div className="text-xs sm:text-sm text-gray-400 font-normal">
              {classInfo?.name}
            </div>
          </div>
        </h1>
        <p className="text-yellow-400 font-semibold text-base sm:text-xl mt-1">
          Уровень {level}
        </p>
      </div>

      <div className="flex-shrink-0">
        <Navigation
          profile={profile}
          onSignOut={onSignOut}
          notificationsEnabled={notificationsEnabled}
          onEnableNotifications={onEnableNotifications}
        />
      </div>
    </div>
  );
}
