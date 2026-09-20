import { useMenu } from "../context/MenuContext";
import { X } from "lucide-react";
import Navigation from "../Navigation";

export function GlobalMenu({
  profile,
  level,
  onSignOut,
  notificationsEnabled,
  onEnableNotifications,
}) {
  const { isMenuOpen, closeMenu } = useMenu();

  if (!isMenuOpen) return null;

  return (
    <>
      {/* Затемнение фона */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={closeMenu}
      />

      {/* Само меню */}
      <div className="fixed top-0 right-0 h-full w-80 bg-gray-900 border-l border-gray-800 z-50 shadow-2xl overflow-y-auto">
        <div className="flex justify-end p-4">
          <button
            onClick={closeMenu}
            className="text-gray-400 hover:text-white transition"
          >
            <X size={24} />
          </button>
        </div>

        <Navigation
          profile={profile}
          level={level}
          onSignOut={onSignOut}
          notificationsEnabled={notificationsEnabled}
          onEnableNotifications={onEnableNotifications}
        />
      </div>
    </>
  );
}
