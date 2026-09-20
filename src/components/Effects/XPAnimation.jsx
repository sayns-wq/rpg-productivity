export function XPAnimation({ animations }) {
  return (
    <>
      {animations.map((anim) => (
        <div
          key={anim.id}
          className={`fixed top-20 right-10 text-4xl font-bold animate-xp-gain z-40 ${
            anim.type === "milestone"
              ? "text-purple-400"
              : anim.type === "feat"
                ? "text-red-400"
                : "text-blue-400"
          } ${anim.isReduced ? "opacity-50" : ""}`}
        >
          +{anim.xp} XP {anim.isReduced && "(усталость)"}
        </div>
      ))}
    </>
  );
}
