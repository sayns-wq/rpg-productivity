import { Link } from "react-router-dom";
import { SEO } from "./components/SEO";
import { useTheme } from "./useTheme";
import {
  Target,
  Trophy,
  TrendingUp,
  Shield,
  Brain,
  Heart,
  Star,
  ArrowRight,
} from "lucide-react";

function LandingPage() {
  const { theme } = useTheme();

  const features = [
    {
      icon: <Target className="w-8 h-8" />,
      title: "Задачи как квесты",
      desc: "Преврати рутину в увлекательные задания с наградами в виде XP",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "7 характеристик",
      desc: "Развивай Силу воли, Интеллект, Харизму, Ловкость и другие навыки",
    },
    {
      icon: <Trophy className="w-8 h-8" />,
      title: "Достижения",
      desc: "Получай ачивки за выполнение целей и отслеживай прогресс",
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Статистика",
      desc: "Наглядные графики роста по всем сферам жизни",
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: "Дерево навыков",
      desc: "Прокачивай умения как в настоящей RPG-игре",
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: "Привычки",
      desc: "Формируй полезные привычки с системой серий и наград",
    },
  ];

  return (
    <div className={`min-h-screen ${theme.bg} text-white`}>
      <SEO
        title="Геймифицированный трекер задач"
        description="RPG Productivity — преврати свою жизнь в RPG-игру. Ставь задачи, получай XP, развивай 7 характеристик персонажа, строй дерево навыков и достигай целей с удовольствием."
      />

      {/* Hero секция */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-transparent to-pink-900/50" />
        <div className="relative max-w-6xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-purple-500/20 border border-purple-500/50 rounded-full px-4 py-2 mb-6">
            <Star className="w-4 h-4 text-yellow-400" />
            <span className="text-sm">Бесплатно • Без рекламы • Навсегда</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-400 via-pink-400 to-yellow-400 bg-clip-text text-transparent">
            Прокачай свою жизнь
          </h1>

          <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Преврати рутину в RPG-приключение. Получай опыт за задачи, развивай
            характеристики персонажа и достигай целей с удовольствием.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/app"
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl font-bold text-lg transition transform hover:scale-105 flex items-center justify-center gap-2"
            >
              Начать приключение
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#features"
              className="bg-gray-800 hover:bg-gray-700 px-8 py-4 rounded-xl font-bold text-lg transition"
            >
              Узнать больше
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-4">
          Всё что нужно для прокачки
        </h2>
        <p className="text-gray-400 text-center mb-12 text-lg">
          Мощные инструменты геймификации в одном приложении
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div
              key={i}
              className="glass rounded-2xl p-6 hover:border-purple-500/50 transition"
            >
              <div className="text-purple-400 mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold mb-2">{f.title}</h3>
              <p className="text-gray-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-4xl font-bold text-center mb-12">
          Как это работает
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Создай персонажа",
              desc: "Выбери класс и имя своего героя",
            },
            {
              step: "02",
              title: "Добавь задачи",
              desc: "Преврати дела в квесты с наградами",
            },
            {
              step: "03",
              title: "Прокачивайся",
              desc: "Получай XP и развивай характеристики",
            },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="text-6xl font-bold text-purple-500/30 mb-4">
                {item.step}
              </div>
              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              <p className="text-gray-400">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <h2 className="text-4xl font-bold mb-6">Готов начать?</h2>
        <p className="text-xl text-gray-400 mb-8">
          Присоединяйся к тысячам людей, которые прокачивают свою жизнь
        </p>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-8 py-4 rounded-xl font-bold text-lg transition"
        >
          Создать персонажа бесплатно
          <ArrowRight className="w-5 h-5" />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8 text-center text-gray-500">
        <p>© 2026 RPG Productivity. Все права защищены.</p>
      </footer>
    </div>
  );
}

export default LandingPage;
