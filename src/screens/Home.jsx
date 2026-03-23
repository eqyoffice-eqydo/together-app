import { useState, useEffect } from "react";
import { getAnswers, getThisWeekCheckin, createCheckin, getGroupFeed } from "../lib/db";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr);
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(dateStr).toLocaleDateString("en", { month: "short", day: "numeric" });
}

function formatEventDate(dateStr) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString("en", { weekday: "short" }).toUpperCase(),
    date: d.getDate(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function FeedItem({ item }) {
  const { type, date, data } = item;

  if (type === "member") {
    const name = data.profiles?.display_name?.split(" ")[0] || "Someone";
    return (
      <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium flex-shrink-0">
          {getInitials(data.profiles?.display_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">
            <span className="font-medium">{name}</span> joined your group
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(date)}</p>
        </div>
      </div>
    );
  }

  if (type === "project") {
    return (
      <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">
            New project: <span className="font-medium">{data.title}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(date)}</p>
        </div>
        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${data.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
          {data.status === "active" ? "Active" : "Planning"}
        </span>
      </div>
    );
  }

  if (type === "event") {
    const { day, date: d, time } = formatEventDate(data.event_date);
    return (
      <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 flex flex-col items-center justify-center bg-gray-50 rounded-lg flex-shrink-0">
          <span className="text-gray-400 text-xs font-medium leading-none">{day}</span>
          <span className="text-gray-900 text-sm font-bold leading-tight">{d}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{data.title}</p>
          <p className="text-xs text-gray-400 mt-0.5">{data.location || "Location TBD"} · {time}</p>
        </div>
      </div>
    );
  }

  if (type === "project_join") {
    const name = data.profiles?.display_name?.split(" ")[0] || "Someone";
    return (
      <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs text-gray-500 font-medium flex-shrink-0">
          {getInitials(data.profiles?.display_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">
            <span className="font-medium">{name}</span> joined <span className="font-medium">{data.projects?.title}</span>
          </p>
          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(date)}</p>
        </div>
      </div>
    );
  }

  if (type === "checkin") {
    const name = data.profiles?.display_name?.split(" ")[0] || "Someone";
    const statusText =
      data.status === "done"
        ? "kept their commitment"
        : data.status === "partial"
        ? "made progress this week"
        : "reflected on their commitment";
    return (
      <div className="flex items-start gap-3 py-3.5 border-b border-gray-50 last:border-0">
        <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 text-xs font-medium flex-shrink-0">
          {getInitials(data.profiles?.display_name)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-800">
            <span className="font-medium">{name}</span> {statusText}
          </p>
          {data.reflection && (
            <p className="text-xs text-gray-500 italic mt-0.5 leading-relaxed">
              "{data.reflection.length > 100 ? data.reflection.slice(0, 100) + "…" : data.reflection}"
            </p>
          )}
          <p className="text-xs text-gray-400 mt-0.5">{timeAgo(date)}</p>
        </div>
      </div>
    );
  }

  return null;
}

const STATUS_OPTIONS = [
  { id: "done", label: "Done", active: "bg-emerald-600 border-emerald-600 text-white", idle: "border-gray-200 text-gray-600" },
  { id: "partial", label: "Partially", active: "bg-amber-500 border-amber-500 text-white", idle: "border-gray-200 text-gray-600" },
  { id: "no", label: "Not yet", active: "bg-gray-700 border-gray-700 text-white", idle: "border-gray-200 text-gray-600" },
];

export default function Home({ user, group, onGoToShare }) {
  const [commitment, setCommitment] = useState("");
  const [checkin, setCheckin] = useState(undefined); // undefined=loading, null=none, object=has
  const [feed, setFeed] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [checkinStatus, setCheckinStatus] = useState("");
  const [reflection, setReflection] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      try {
        const [answers, thisWeek] = await Promise.all([
          getAnswers(user.id),
          getThisWeekCheckin(user.id),
        ]);
        setCommitment(answers?.commitment || "");
        setCheckin(thisWeek);

        if (group?.id) {
          const items = await getGroupFeed(group.id);
          setFeed(items);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [user?.id, group?.id]);

  async function handleCheckin() {
    if (!checkinStatus || submitting) return;
    setSubmitting(true);
    try {
      const c = await createCheckin(user.id, {
        commitment,
        status: checkinStatus,
        reflection: reflection.trim(),
      });
      setCheckin(c);
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  }

  const checkinDone = checkin && checkin !== undefined;

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="px-8 pt-12 pb-6">
        <p className="text-gray-400 text-xs tracking-[0.3em] uppercase font-light mb-1">together</p>
        <h1 className="text-2xl font-bold text-gray-900">
          {group?.name || "Your community"}
        </h1>
        {group && (
          <p className="text-gray-400 text-sm">
            {group.member_count} member{group.member_count !== 1 ? "s" : ""}
          </p>
        )}
      </div>

      {/* Check-in card — commitment pending */}
      {!loading && commitment && !checkinDone && (
        <div className="mx-8 mb-6 border border-gray-200 rounded-2xl p-5">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            Your commitment this week
          </p>
          <p className="text-gray-700 text-sm italic leading-relaxed mb-4">
            "{commitment}"
          </p>

          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="text-sm font-medium text-gray-900 border border-gray-200 px-4 py-2 rounded-xl hover:border-gray-400 transition-all"
            >
              Check in
            </button>
          ) : (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-gray-500">Did you do it?</p>
              <div className="flex gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setCheckinStatus(s.id)}
                    className={`flex-1 text-xs font-medium py-2 rounded-xl border transition-all ${
                      checkinStatus === s.id ? s.active : s.idle
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {checkinStatus && (
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="What happened? (optional — shared with your group)"
                  rows={3}
                  className="border border-gray-200 focus:border-gray-400 rounded-xl px-4 py-3 text-sm text-gray-800 placeholder-gray-300 outline-none resize-none transition-colors"
                />
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => { setShowForm(false); setCheckinStatus(""); setReflection(""); }}
                  className="flex-1 text-sm text-gray-400 border border-gray-100 py-2.5 rounded-xl hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCheckin}
                  disabled={!checkinStatus || submitting}
                  className="flex-1 bg-gray-900 text-white text-sm font-medium py-2.5 rounded-xl disabled:opacity-30 hover:bg-gray-700 transition-all"
                >
                  {submitting ? "Saving…" : "Submit"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Check-in card — already done */}
      {!loading && checkinDone && (
        <div className="mx-8 mb-6 border border-emerald-100 bg-emerald-50 rounded-2xl p-5">
          <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider mb-2">
            This week's check-in
          </p>
          <p className="text-emerald-800 text-sm font-medium">
            {checkin.status === "done"
              ? "Done"
              : checkin.status === "partial"
              ? "Partially done"
              : "Not yet — next week"}
          </p>
          {checkin.reflection && (
            <p className="text-emerald-700 text-sm italic mt-1.5 leading-relaxed">
              "{checkin.reflection}"
            </p>
          )}
        </div>
      )}

      {/* Feed */}
      <div className="px-8 flex-1 pb-8">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-4">
          What's happening
        </p>

        {loading && (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
          </div>
        )}

        {!loading && feed.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-400 text-sm mb-1">Your community is just getting started.</p>
            <p className="text-gray-300 text-xs mb-5">Invite someone nearby and get things moving.</p>
            <button
              onClick={onGoToShare}
              className="text-sm font-medium text-gray-900 border border-gray-200 px-5 py-2.5 rounded-xl hover:border-gray-400 transition-all"
            >
              Invite someone
            </button>
          </div>
        )}

        {!loading && feed.length > 0 && (
          <div>
            {feed.map((item, i) => (
              <FeedItem key={`${item.type}-${i}`} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
