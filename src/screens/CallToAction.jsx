import { useState } from "react";

const topics = [
  "Work & purpose",
  "Education",
  "Health",
  "Community",
  "Economy",
  "Self & identity",
  "Relationships",
  "Peace",
];

const intentions = [
  { id: "connect", label: "Connect with people near me" },
  { id: "start", label: "Start something in my community" },
  { id: "share", label: "Share this with someone I care about" },
  { id: "explore", label: "Just explore for now" },
];

export default function CallToAction({ onNext, onSkip }) {
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [intention, setIntention] = useState("");

  function toggleTopic(topic) {
    setSelectedTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
          You've taken the first step.
        </h1>
        <p className="text-gray-500 text-base leading-relaxed font-light">
          Millions of people feel exactly what you feel. The difference is — now you know it.
        </p>
      </div>

      {/* Topics */}
      <div className="mb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          What moves you most?
        </p>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => {
            const selected = selectedTopics.includes(topic);
            return (
              <button
                key={topic}
                onClick={() => toggleTopic(topic)}
                className={`px-4 py-2 rounded-full text-sm border transition-all duration-150 ${
                  selected
                    ? "bg-gray-900 border-gray-900 text-white"
                    : "bg-white border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {topic}
              </button>
            );
          })}
        </div>
      </div>

      {/* Intentions */}
      <div className="mb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          What do you want to do?
        </p>
        <div className="flex flex-col gap-2">
          {intentions.map((item) => (
            <label
              key={item.id}
              className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all duration-150 ${
                intention === item.id
                  ? "border-gray-900 bg-gray-50"
                  : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <input
                type="radio"
                name="intention"
                value={item.id}
                checked={intention === item.id}
                onChange={() => setIntention(item.id)}
                className="accent-gray-900 w-4 h-4"
              />
              <span className="text-gray-800 text-sm">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quote */}
      <p className="text-gray-400 text-sm italic leading-relaxed mb-8">
        "Everything you want to do is in your power. If you don't like who you are — now is your moment."
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-3">
        <button
          onClick={() => onNext({ topics: selectedTopics, intention })}
          className="w-full bg-gray-900 hover:bg-gray-700 active:bg-black text-white font-medium text-base py-4 rounded-xl transition-all duration-200"
        >
          Let's do it together
        </button>
        <button
          onClick={() => onNext({ topics: [], intention: 'explore' })}
          className="w-full text-gray-400 text-sm py-2 hover:text-gray-600 transition-colors"
        >
          I'm not ready yet
        </button>
      </div>

    </div>
  );
}
