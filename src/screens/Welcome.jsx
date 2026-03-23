export default function Welcome({ onNext }) {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-between px-8 py-16">

      {/* Logo */}
      <p className="text-gray-400 text-sm tracking-[0.3em] uppercase font-light">
        together
      </p>

      {/* Center */}
      <div className="flex flex-col items-center text-center gap-8 max-w-xs w-full">
        <div className="flex flex-col gap-4">
          <h1 className="text-5xl font-bold text-gray-900 leading-tight tracking-tight">
            You are not alone.
          </h1>
          <p className="text-gray-500 text-lg leading-relaxed font-light">
            Millions of people feel what you feel. It's time to do something about it — together.
          </p>
        </div>

        <button
          onClick={onNext}
          className="w-full bg-gray-900 hover:bg-gray-700 active:bg-black text-white font-medium text-base py-4 px-8 rounded-xl transition-all duration-200"
        >
          Let's do it together
        </button>
      </div>

      {/* Quote */}
      <p className="text-gray-400 text-sm text-center italic leading-relaxed max-w-xs">
        "If you don't like the world you live in, create your own world."
      </p>

    </div>
  );
}
