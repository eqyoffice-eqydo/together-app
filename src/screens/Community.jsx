import { useState, useEffect, useRef } from "react";
import { getGroupMessages, sendMessage, subscribeToMessages, getGroupProjects, getGroupEvents, createProject, createEvent, getProjectMemberships, getProjectMembers, joinProject, leaveProject } from "../lib/db";

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

function formatEventDate(dateStr) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString("en", { weekday: "short" }).toUpperCase(),
    date: d.getDate(),
    time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
  };
}

function NewProjectModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [neededHelp, setNeededHelp] = useState("");
  const [status, setStatus] = useState("planning");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 px-4 pb-8">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">New Project</h2>
        <input
          type="text"
          placeholder="Project title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
        />
        <textarea
          placeholder="Short description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400 resize-none"
        />
        <input
          type="text"
          placeholder="What kind of help do you need? (optional)"
          value={neededHelp}
          onChange={(e) => setNeededHelp(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400 bg-white"
        >
          <option value="planning">Planning</option>
          <option value="active">Active</option>
        </select>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-500 text-sm py-3 rounded-xl hover:border-gray-400 transition-all">Cancel</button>
          <button
            onClick={() => title.trim() && onSave({ title: title.trim(), description: description.trim(), needed_help: neededHelp.trim(), status })}
            disabled={!title.trim()}
            className="flex-1 bg-gray-900 text-white text-sm py-3 rounded-xl disabled:opacity-30 hover:bg-gray-700 transition-all"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function NewEventModal({ onSave, onClose }) {
  const [title, setTitle] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  function handleSave() {
    if (!title.trim() || !date || !time) return;
    const event_date = new Date(`${date}T${time}`).toISOString();
    onSave({ title: title.trim(), location: location.trim(), event_date });
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 px-4 pb-8">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-4">
        <h2 className="text-lg font-bold text-gray-900">New Event</h2>
        <input type="text" placeholder="Event title" value={title} onChange={(e) => setTitle(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400" />
        <input type="text" placeholder="Location (optional)" value={location} onChange={(e) => setLocation(e.target.value)}
          className="border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-gray-400" />
        <div className="flex gap-3">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400" />
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none focus:border-gray-400" />
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-500 text-sm py-3 rounded-xl hover:border-gray-400 transition-all">Cancel</button>
          <button onClick={handleSave} disabled={!title.trim() || !date || !time}
            className="flex-1 bg-gray-900 text-white text-sm py-3 rounded-xl disabled:opacity-30 hover:bg-gray-700 transition-all">
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

function ProjectDetailModal({ project, user, onClose, onMembershipChange }) {
  const [members, setMembers] = useState([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);

  useEffect(() => {
    getProjectMembers(project.id)
      .then((m) => {
        setMembers(m);
        setIsMember(m.some((pm) => pm.user_id === user?.id));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [project.id, user?.id]);

  async function handleJoin() {
    if (!user?.id || acting) return;
    setActing(true);
    try {
      await joinProject(project.id, user.id);
      setMembers((prev) => [...prev, { user_id: user.id, profiles: { display_name: null } }]);
      setIsMember(true);
      onMembershipChange();
    } catch (err) { console.error(err); }
    finally { setActing(false); }
  }

  async function handleLeave() {
    if (!user?.id || acting) return;
    setActing(true);
    try {
      await leaveProject(project.id, user.id);
      setMembers((prev) => prev.filter((m) => m.user_id !== user.id));
      setIsMember(false);
      onMembershipChange();
    } catch (err) { console.error(err); }
    finally { setActing(false); }
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 px-4 pb-8">
      <div className="bg-white rounded-2xl w-full max-w-md p-6 flex flex-col gap-5 max-h-[85vh] overflow-y-auto">

        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 mb-1">{project.title}</h2>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${project.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
              {project.status === "active" ? "Active" : "Planning"}
            </span>
          </div>
          <button onClick={onClose} className="text-gray-300 hover:text-gray-500 transition-colors flex-shrink-0 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {project.description && (
          <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
        )}

        {/* Needed help */}
        {project.needed_help && (
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider mb-1">Help needed</p>
            <p className="text-sm text-amber-800 leading-relaxed">{project.needed_help}</p>
          </div>
        )}

        {/* Members */}
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
            {loading ? "Loading..." : `${members.length} ${members.length === 1 ? "person" : "people"} involved`}
          </p>
          {!loading && members.length === 0 && (
            <p className="text-gray-400 text-sm">No one yet. Be the first.</p>
          )}
          {!loading && members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map((m, i) => (
                <div key={m.user_id || i} className="flex items-center gap-1.5 bg-gray-50 rounded-full pl-1 pr-3 py-1">
                  <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs text-gray-600 font-medium">
                    {getInitials(m.profiles?.display_name)}
                  </div>
                  <span className="text-xs text-gray-700">
                    {m.profiles?.display_name?.split(" ")[0] || "Someone"}
                    {m.user_id === user?.id ? " (you)" : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action button */}
        {user && (
          isMember ? (
            <button
              onClick={handleLeave}
              disabled={acting}
              className="w-full border border-gray-200 text-gray-500 text-sm py-3 rounded-xl hover:border-gray-400 transition-all disabled:opacity-40"
            >
              {acting ? "..." : "Leave project"}
            </button>
          ) : (
            <button
              onClick={handleJoin}
              disabled={acting}
              className="w-full bg-gray-900 text-white text-sm font-medium py-3.5 rounded-xl hover:bg-gray-700 transition-all disabled:opacity-40"
            >
              {acting ? "Joining..." : "I'm in"}
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default function Community({ group, user, onNext }) {
  const [messages, setMessages] = useState([]);
  const [projects, setProjects] = useState([]);
  const [events, setEvents] = useState([]);
  const [projectMembers, setProjectMembers] = useState({});
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNewProject, setShowNewProject] = useState(false);
  const [showNewEvent, setShowNewEvent] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const bottomRef = useRef(null);

  async function loadProjectMembers(projs) {
    if (!projs.length) return;
    try {
      const map = await getProjectMemberships(projs.map((p) => p.id));
      setProjectMembers(map);
    } catch (err) { console.error(err); }
  }

  useEffect(() => {
    if (!group?.id) { setLoading(false); return; }

    Promise.all([
      getGroupMessages(group.id),
      getGroupProjects(group.id),
      getGroupEvents(group.id),
    ]).then(([msgs, projs, evts]) => {
      setMessages(msgs);
      setProjects(projs);
      setEvents(evts);
      loadProjectMembers(projs);
    }).catch(console.error).finally(() => setLoading(false));

    const channel = subscribeToMessages(group.id, (newMsg) => {
      setMessages((prev) => {
        if (prev.find((m) => m.id === newMsg.id)) return prev;
        return [...prev, { ...newMsg, profiles: { display_name: null } }];
      });
    });

    return () => { channel.unsubscribe(); };
  }, [group?.id]);

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
      setMessages((prev) => [...prev, sent]);
    } catch (err) {
      console.error(err);
      setMessageText(text);
    } finally { setSending(false); }
  }

  async function handleNewProject(data) {
    try {
      const proj = await createProject(group.id, user.id, data);
      setProjects((prev) => [proj, ...prev]);
      setShowNewProject(false);
    } catch (err) { console.error(err); }
  }

  async function handleNewEvent(data) {
    try {
      const evt = await createEvent(group.id, data);
      setEvents((prev) => [...prev, evt].sort((a, b) => new Date(a.event_date) - new Date(b.event_date)));
      setShowNewEvent(false);
    } catch (err) { console.error(err); }
  }

  function refreshProjectMembers() {
    loadProjectMembers(projects);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="px-8 pt-12 pb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-0.5">{group?.name || "Your Local Group"}</h1>
          <p className="text-gray-400 text-sm">{group ? `${group.member_count} member${group.member_count !== 1 ? "s" : ""}` : "No group yet"}</p>
        </div>
        <button onClick={onNext} className="text-xs font-medium text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg hover:border-gray-400 transition-all mt-1">
          + Invite
        </button>
      </div>

      {!group && !loading && (
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <p className="text-gray-400 text-sm">You're not in a local group yet.</p>
        </div>
      )}

      {group && (
        <>
          {/* Projects */}
          <div className="px-8 mb-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Active Projects</p>
              <button onClick={() => setShowNewProject(true)} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">+ New</button>
            </div>
            {loading ? (
              <div className="h-16 flex items-center justify-center">
                <div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
              </div>
            ) : projects.length === 0 ? (
              <button onClick={() => setShowNewProject(true)} className="w-full border border-dashed border-gray-200 rounded-xl py-5 text-gray-400 text-sm hover:border-gray-400 transition-all">
                No projects yet. Start one.
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                {projects.map((p) => {
                  const members = projectMembers[p.id] || [];
                  const isJoined = members.some((m) => m.user_id === user?.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className="border border-gray-100 rounded-xl p-4 text-left hover:border-gray-300 transition-all w-full"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-gray-900 text-sm font-medium">{p.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 font-medium ${p.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                          {p.status === "active" ? "Active" : "Planning"}
                        </span>
                      </div>
                      {p.description && <p className="text-gray-400 text-xs leading-relaxed mb-2">{p.description}</p>}
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-gray-400 text-xs">
                          {members.length > 0 ? `${members.length} involved` : "Be the first"}
                        </span>
                        {isJoined ? (
                          <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">Joined</span>
                        ) : (
                          <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">I'm in →</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Events */}
          <div className="px-8 mb-7">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Upcoming Events</p>
              <button onClick={() => setShowNewEvent(true)} className="text-xs text-gray-500 hover:text-gray-900 transition-colors">+ New</button>
            </div>
            {!loading && events.length === 0 ? (
              <button onClick={() => setShowNewEvent(true)} className="w-full border border-dashed border-gray-200 rounded-xl py-5 text-gray-400 text-sm hover:border-gray-400 transition-all">
                No events yet. Create one.
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                {events.map((e) => {
                  const { day, date, time } = formatEventDate(e.event_date);
                  return (
                    <div key={e.id} className="flex items-center gap-4 border border-gray-100 rounded-xl p-4">
                      <div className="flex flex-col items-center w-8 flex-shrink-0">
                        <span className="text-gray-400 text-xs font-medium">{day}</span>
                        <span className="text-gray-900 text-lg font-bold leading-none">{date}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-900 text-sm font-medium truncate">{e.title}</p>
                        <p className="text-gray-400 text-xs">{e.location || "Location TBD"} · {time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Chat */}
          <div className="px-8 mb-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Group Chat</p>
            <div className="border border-gray-100 rounded-xl p-4 flex flex-col gap-4 max-h-64 overflow-y-auto">
              {loading && <div className="flex justify-center py-4"><div className="w-5 h-5 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" /></div>}
              {!loading && messages.length === 0 && <p className="text-gray-300 text-sm text-center py-4">No messages yet. Say something.</p>}
              {messages.map((msg) => {
                const isMe = msg.user_id === user?.id;
                const name = msg.profiles?.display_name || "Someone";
                return (
                  <div key={msg.id} className={`flex items-start gap-3 ${isMe ? "flex-row-reverse" : ""}`}>
                    <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium flex-shrink-0">
                      {getInitials(name)}
                    </div>
                    <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? "items-end" : ""}`}>
                      {!isMe && <span className="text-gray-400 text-xs">{name}</span>}
                      <div className={`px-3 py-2 rounded-2xl text-sm ${isMe ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-800"}`}>
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
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                disabled={sending}
                className="flex-1 bg-gray-50 border border-gray-100 text-gray-800 text-sm placeholder-gray-400 rounded-xl px-4 py-3 outline-none focus:border-gray-300 transition-colors"
              />
              <button onClick={handleSend} disabled={!messageText.trim() || sending} className="bg-gray-900 hover:bg-gray-700 disabled:opacity-30 text-white p-3 rounded-xl transition-all flex-shrink-0">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}

      {showNewProject && <NewProjectModal onSave={handleNewProject} onClose={() => setShowNewProject(false)} />}
      {showNewEvent && <NewEventModal onSave={handleNewEvent} onClose={() => setShowNewEvent(false)} />}
      {selectedProject && (
        <ProjectDetailModal
          project={selectedProject}
          user={user}
          onClose={() => setSelectedProject(null)}
          onMembershipChange={refreshProjectMembers}
        />
      )}
    </div>
  );
}
