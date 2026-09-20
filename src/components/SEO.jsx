import { useEffect } from "react";

export function SEO({ title, description, noIndex = false }) {
  useEffect(() => {
    // Обновляем title
    if (title) {
      document.title = `${title} | RPG Productivity`;
    } else {
      document.title =
        "RPG Productivity — Прокачай свою жизнь через геймификацию";
    }

    // Обновляем description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        "content",
        description ||
          "Геймифицированный трекер задач и привычек. Преврати жизнь в RPG-игру.",
      );
    }

    // Обновляем OG теги
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute("content", title || "RPG Productivity");

    const ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc)
      ogDesc.setAttribute(
        "content",
        description || "Прокачай свою жизнь через геймификацию",
      );

    // Управление индексацией для приватных страниц
    const robots = document.querySelector('meta[name="robots"]');
    if (robots) {
      robots.setAttribute(
        "content",
        noIndex ? "noindex, nofollow" : "index, follow",
      );
    }

    // Возвращаем старые значения при размонтировании
    return () => {
      document.title =
        "RPG Productivity — Прокачай свою жизнь через геймификацию";
      if (metaDesc)
        metaDesc.setAttribute(
          "content",
          "RPG Productivity — геймифицированный трекер задач и привычек.",
        );
    };
  }, [title, description, noIndex]);

  return null;
}
