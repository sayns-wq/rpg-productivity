import { useState } from "react";

export function AuthForm({
  authMode,
  authError,
  authLoading,
  onSignIn,
  onSignUp,
  onToggleMode,
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (authMode === "register") {
      await onSignUp(email, password, username);
    } else {
      await onSignIn(email, password);
    }
  };

  return (
    <div className="glass rounded-2xl p-8 w-full max-w-md animate-fade-in">
      <h1 className="text-4xl font-bold text-white text-center mb-2 gradient-text">
        ️ RPG Productivity
      </h1>
      <p className="text-gray-400 text-center mb-8">Прокачай свою жизнь</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        {authMode === "register" && (
          <div>
            <label className="block text-gray-300 text-sm mb-2">
              Имя персонажа
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
              placeholder="Герой"
              required
            />
          </div>
        )}

        <div>
          <label className="block text-gray-300 text-sm mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
            placeholder="hero@example.com"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 text-sm mb-2">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-800/50 text-white px-4 py-3 rounded-lg border border-gray-700 focus:border-purple-500 focus:outline-none transition"
            placeholder="Минимум 6 символов"
            required
            minLength={6}
          />
        </div>

        {authError && (
          <p className="text-red-400 text-sm bg-red-900/30 p-3 rounded-lg">
            {authError}
          </p>
        )}

        <button
          type="submit"
          disabled={authLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition transform hover:scale-105"
        >
          {authLoading
            ? "Загрузка..."
            : authMode === "register"
              ? "Создать персонажа"
              : "Войти"}
        </button>
      </form>

      <button
        onClick={onToggleMode}
        className="w-full text-gray-400 hover:text-white text-sm mt-6 transition"
      >
        {authMode === "login"
          ? "Нет аккаунта? Создать персонажа"
          : "Уже есть аккаунт? Войти"}
      </button>
    </div>
  );
}
