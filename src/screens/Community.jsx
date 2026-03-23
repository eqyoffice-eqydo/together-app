import { useState, useEffect, useRef } from "react";
import { getGroupMessages, sendMessage, subscribeToMessages } from "../lib/db";

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

const projects = [
  { id: 1, title: "Free skill-sharing circle", description: "Teaching each other what we know — free, open, weekly.", status: "active", members: 14 },
  { id: 2, title: "Community garden", description: "Grow food together. Share the harvest. Build trust.", status: "planning", members: 7 },
];

const events = [
  { id: 1, day: "TUE", date: "25", title: "Community Meetup", location: "Central Park", attendees: 23 },
  { id: 2, day: "THU", date: "10", title: "Neighborhood Clean-up", location: "Riverside", attendees: 18 },
];

export default function Community({ group, user, onNext }) {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!group?.id) {
      setLoading(false);
      return;
    }

    // Incarca mesajele existente
    getGroupMessages(group.id)
      .then((msgs) => {
        setMessages(msgs);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Subscribie real-time la mesaje noi
    const channel = subscribeToMessages(group.id, (newMsg) => {
      setMessages((prev) => {
        // Evita duplicate daca mesajul e deja in lista (trimis de noi)
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        // newMsg din real-time nu are profiles joined — il adaugam simplu
        return [...prev, { ...newMsg, profiles: { display_name: null } }];
      });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [group?.id]);

  // Scroll la ultimul mesaj
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const text = messageText.trim();
    if (!text || !group?.id || !user?.id || sending) return;

    setSending(true);
    setMessageText("");

    try {
      const sent = await sendMessage(group.id, user.id, text);
      // Adauga mesajul trimis direct (nu asteptam real-time)
      setMessages((prev) => [...prev, sent]);
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessageText(text); // restaureaza textul daca a esuat
    } finally {
      setSending(false);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="px-8 pt-12 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0.5">
            {group?.name || "Your Local Group"}
          </h1>
          <p className="text-gray-400 text-sm">
            {group ? `${group.member_count} member${group.member_count !== 1 ? "s" : ""}` : "Join a group to connect locally"}
          </p>
        </div>
        <button
          onClick={onNext}
          className="text-xs font-medium text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-all mt-1"
        >
          + Invite
        </button>
      </div>

      {/* No group state */}
      {!group && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <p className="text-gray-400 text-sm mb-1">You're not in a local group yet.</p>
          <p className="text-gray-300 text-xs">Make sure location access is enabled and log in again.</p>
        </div>
      )}

      {group && (
        <>
          {/* Projects */}
          <div className="px-8 mb-7">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Active Projects</p>
            <div className="flex flex-col gap-3">
              {projects.map((p) => (
                <div key={p.id} className="border border-gray-100 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <p className="text-gray-900 text-sm font-medium">{p.title}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${
                      p.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                    }`}>
                      {p.status === "active" ? "Active" : "Planning"}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs leading-relaxed mb-1">{p.description}</p>
                  <p className="text-gray-300 text-xs">{p.members} members</p>
                </div>
              ))}
            </div>
          </div>

          {/* Events */}
          <div className="px-8 mb-7">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Upcoming Events</p>
            <div className="flex flex-col gap-3">
              {events.map((e) => (
                <div key={e.id} className="flex items-center gap-4 border border-gray-100 rounded-xl p-4">
                  <div className="flex flex-col items-center w-8 flex-shrink-0">
                    <span className="text-gray-400 text-xs font-medium">{e.day}</span>
                    <span className="text-gray-900 text-lg font-bold leading-none">{e.date}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-900 text-sm font-medium truncate">{e.title}</p>
                    <p className="text-gray-400 text-xs">{e.location} · {e.attendees} going</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div className="px-8 mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Group Chat</p>

            <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-4 max-h-64 overflow-y-auto">
              {loading && (
                <div className="flex justify-center py-4">
                  <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
                </div>
              )}

              {!loading && messages.length === 0 && (
                <p className="text-gray-300 text-sm text-center py-4">
                  No messages yet. Say something.
                </p>
              )}

              {messages.map((msg) => {
                const isMe = msg.user_id === user?.id;
                const name = msg.profiles?.display_name || "Someone";
                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium flex-shrink-0">
                      {getInitials(name)}
                    </div>
                    <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : ""}`}>
                      {!isMe && (
                        <span className="text-gray-400 text-xs">{name}</span>
                      )}
                      <div className={`px-3 py-2 rounded-2xl text-sm ${
                        isMe ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"
                      }`}>
                        {msg.text}
                      </div>
                      <span className="text-gray-300 text-xs">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Message input */}
          <div className="px-8 mb-8">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Say something to the group..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={sending}
                className="flex-1 bg-gray-50 border border-gray-100 text-gray-800 text-sm placeholder-gray-400 rounded-xl px-4 py-3 outline-none focus:border-gray-300 transition-colors disabled:opacity-50"
              />
              <button
                onClick={handleSend}
                disabled={!messageText.trim() || sending}
                className="bg-gray-900 hover:bg-gray-700 disabled:opacity-30 text-white p-3 rounded-xl transition-all flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
