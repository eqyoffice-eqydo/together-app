import { useState } from "react";
import { questions as questionData } from "../data/questions";

const categoryColors = {
  "Work & Life": "bg-blue-50 text-blue-600",
  "Education & Health": "bg-emerald-50 text-emerald-600",
  "Economy & Community": "bg-amber-50 text-amber-700",
  "Self & Relations": "bg-purple-50 text-purple-600",
};

const allQuestions = questionData.flatMap((cat) =>
  cat.questions.map((q) => ({ question: q, category: cat.category }))
);

const total = allQuestions.length;

export default function Questions({ onNext }) {
  const [index, setIndex] = useState(0);

  const current = allQuestions[index];
  const progress = ((index + 1) / total) * 100;

  function handleNext() {
    if (index < total - 1) {
      setIndex(index + 1);
    } else {
      onNext();
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 py-12">

      {/* Progress */}
      <div className="mb-10">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>{index + 1} of {total}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-0.5 bg-gray-100 rounded-full">
          <div
            className="h-0.5 bg-gray-900 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Category */}
      <div className="mb-6">
        <span className={`inline-block text-xs font-medium px-3 py-1 rounded-full ${categoryColors[current.category]}`}>
          {current.category}
        </span>
      </div>

      {/* Question */}
      <div className="flex-1 flex flex-col justify-center">
        <p className="text-gray-900 text-3xl font-semibold leading-snug mb-12">
          {current.question}
        </p>

        <p className="text-gray-400 text-sm mb-10">
          Reflect. There's no right or wrong answer.
        </p>
      </div>

      {/* Button */}
      <button
        onClick={handleNext}
        className="w-full bg-gray-900 hover:bg-gray-700 active:bg-black text-white font-medium text-base py-4 rounded-xl transition-all duration-200"
      >
        {index < total - 1 ? "Next" : "Continue"}
      </button>

    </div>
  );
}
