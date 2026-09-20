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
    <div className="flex justify-between items-start mb-4">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <span className="text-4xl">{classInfo?.icon}</span>
          <div>
            <div>{profile?.username || "Герой"}</div>
            <div className="text-sm text-gray-400 font-normal">
              {classInfo?.name}
            </div>
          </div>
        </h1>
        <p className="text-yellow-400 font-semibold text-xl mt-1">
          Уровень {level}
        </p>
      </div>
      <Navigation
        profile={profile}
        onSignOut={onSignOut}
        notificationsEnabled={notificationsEnabled}
        onEnableNotifications={onEnableNotifications}
      />
    </div>
  );
}
