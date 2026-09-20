import { useState, useEffect } from "react";
import { supabase } from "./supabaseClient";
import { THEMES } from "./constants";

export function useTheme() {
  const [themeColor, setThemeColor] = useState("purple");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTheme = async () => {
      // Сначала пробуем из localStorage (быстро)
      const cached = localStorage.getItem("theme_color");
      if (cached && THEMES[cached]) {
        setThemeColor(cached);
        setLoading(false);
      }

      // Затем загружаем актуальную из БД
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        const { data } = await supabase
          .from("profiles")
          .select("theme_color")
          .eq("id", session.user.id)
          .single();

        if (data?.theme_color && THEMES[data.theme_color]) {
          setThemeColor(data.theme_color);
          localStorage.setItem("theme_color", data.theme_color);
        }
      }
      setLoading(false);
    };

    loadTheme();
  }, []);

  const theme = THEMES[themeColor] || THEMES.purple;

  return { theme, themeColor, loading };
}
