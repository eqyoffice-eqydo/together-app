import { useState } from "react";

export default function Commitment({ onNext, onSkip }) {
  const [text, setText] = useState("");
  const focused = text.trim().length > 0;

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 py-16">

      {/* Top */}
      <p className="text-gray-400 text-sm tracking-[0.3em] uppercase font-light mb-auto">
        together
      </p>

      {/* Center content */}
      <div className="flex flex-col gap-8 mb-auto mt-16">
        <div className="flex flex-col gap-3">
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            One small step.
          </h1>
          <p className="text-gray-500 text-lg font-light leading-relaxed">
            What's one concrete thing you'll do this week?
          </p>
          <p className="text-gray-300 text-sm">
            Not a goal. Not a dream. One real action.
          </p>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="I will talk to one neighbor about starting a community garden..."
            rows={4}
            className="w-full border border-gray-200 focus:border-gray-400 text-gray-900 text-base placeholder-gray-300 rounded-2xl px-5 py-4 outline-none transition-colors resize-none leading-relaxed"
          />
          <p className="text-gray-300 text-xs text-right">
            {text.length > 0 ? `${text.length} characters` : ""}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3">
          <button
            onClick={() => onNext(text.trim())}
            disabled={!focused}
            className="w-full bg-gray-900 hover:bg-gray-700 active:bg-black disabled:opacity-25 disabled:cursor-not-allowed text-white font-medium text-base py-4 rounded-xl transition-all duration-200"
          >
            I commit to this
          </button>
          <button
            onClick={() => onSkip()}
            className="w-full text-gray-300 text-sm py-2 hover:text-gray-500 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>

      {/* Quote */}
      <p className="text-gray-300 text-xs italic text-center leading-relaxed mt-auto pt-8">
        "An ounce of practice is worth more than tons of preaching."
        <span className="block mt-1 not-italic">— Gandhi</span>
      </p>

    </div>
  );
}
