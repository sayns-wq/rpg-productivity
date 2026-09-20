import { ArrowLeft, Menu, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useMenu } from "../context/MenuContext";
import { supabase } from "../supabaseClient";
import { useEffect, useState } from "react";
import { getLevelInfo } from "../utils/xpCalculator";

export function TopBar({ title, showBack = true }) {
  const { openMenu } = useMenu();
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [level, setLevel] = useState(1);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data } = await supabase
        .from("profiles")
        .select("username, total_xp")
        .eq("id", session.user.id)
        .single();

      if (isMounted && data) {
        setProfile(data);
        setLevel(getLevelInfo(data.total_xp || 0).level);
      }
    };

    load();

    return () => {
      isMounted = false;
    };
  }, []);

  // На главной странице не показываем кнопку назад
  const isHome = location.pathname === "/";

  return (
    <div className="glass rounded-xl p-4 mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {!isHome && showBack && (
          <Link
            to="/"
            className="text-gray-400 hover:text-white transition p-2 hover:bg-gray-800 rounded-lg"
            title="На главную"
          >
            <ArrowLeft size={24} />
          </Link>
        )}

        {title && <h1 className="text-xl md:text-2xl font-bold">{title}</h1>}
      </div>

      {/* Кнопка меню с профилем */}
      <button
        onClick={openMenu}
        className="flex items-center gap-3 bg-gray-800/50 hover:bg-gray-800 transition px-3 py-2 rounded-lg border border-gray-700"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-white">
            {profile?.username || "Герой"}
          </p>
          <p className="text-xs text-yellow-400">Уровень {level}</p>
        </div>
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
          <User size={20} className="text-white" />
        </div>
      </button>
    </div>
  );
}
