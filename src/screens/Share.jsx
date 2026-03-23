import { useState, useEffect } from "react";
import { getProfile, getInviteStats } from "../lib/db";

const APP_URL = window.location.origin;

export default function Share({ user, onNext }) {
  const [copied, setCopied] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [stats, setStats] = useState({ invited: 0, joined: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getProfile(user.id), getInviteStats(user.id)])
      .then(([profile, s]) => {
        setInviteCode(profile.invite_code || "");
        setStats(s);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const inviteLink = inviteCode ? `${APP_URL}?ref=${inviteCode}` : APP_URL;
  const shortLink = inviteCode ? `together.app?ref=${inviteCode}` : "together.app";

  function handleCopy() {
    navigator.clipboard.writeText(inviteLink).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleEmail() {
    const subject = encodeURIComponent("Join me on Together");
    const body = encodeURIComponent(
      `I found something that might resonate with you.\n\nJoin me on Together — a place for people who want to do something about it:\n${inviteLink}`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  }

  function handleSMS() {
    const text = encodeURIComponent(`Join me on Together: ${inviteLink}`);
    window.open(`sms:?body=${text}`);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col px-8 py-12">

      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight mb-3">
          Invite someone who needs this.
        </h1>
        <p className="text-gray-500 text-base font-light leading-relaxed">
          Every person you invite could inspire ten more. That's how change spreads.
        </p>
      </div>

      {/* Invite link */}
      <div className="mb-6">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-2">
          Your personal invite link
        </p>
        <div className="flex items-center border border-gray-100 rounded-xl p-4 gap-3 bg-gray-50">
          <span className="flex-1 text-gray-700 text-sm font-mono truncate">
            {loading ? "Loading..." : shortLink}
          </span>
          <button
            onClick={handleCopy}
            disabled={loading}
            className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-all flex-shrink-0 ${
              copied
                ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
            }`}
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* Share via */}
      <div className="mb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Share via
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleEmail}
            className="flex items-center justify-center gap-2 border border-gray-100 hover:border-gray-300 text-gray-600 text-sm py-4 rounded-xl transition-all"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            Email
          </button>
          <button
            onClick={handleSMS}
            className="flex items-center justify-center gap-2 border border-gray-100 hover:border-gray-300 text-gray-600 text-sm py-4 rounded-xl transition-all"
          >
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            SMS
          </button>
        </div>
      </div>

      {/* Impact counter */}
      <div className="mb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
          Your impact
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: loading ? "—" : stats.invited, label: "Invited" },
            { value: loading ? "—" : stats.invited, label: "Reached" },
            { value: loading ? "—" : stats.joined, label: "Joined" },
          ].map((stat) => (
            <div key={stat.label} className="border border-gray-100 rounded-xl py-4 flex flex-col items-center">
              <span className="text-gray-900 text-2xl font-bold">{stat.value}</span>
              <span className="text-gray-400 text-xs mt-1">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quote */}
      <p className="text-gray-400 text-sm italic text-center leading-relaxed mb-8">
        "If you don't like the world you live in, create your own world."
      </p>

      {/* CTA */}
      <button
        onClick={onNext}
        className="w-full bg-gray-900 hover:bg-gray-700 active:bg-black text-white font-medium text-base py-4 rounded-xl transition-all duration-200"
      >
        Let's do it together
      </button>

    </div>
  );
}
