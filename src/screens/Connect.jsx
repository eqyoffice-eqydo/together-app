import { useState, useEffect } from "react";
import { getNearbyUsers, getDistanceKm, getMyConnections, sendConnectionRequest, acceptConnection } from "../lib/db";
import { supabase } from "../lib/supabase";

const filters = ["All", "Community", "Work", "Education", "Health", "Peace"];

function getInitials(name) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? parts[0][0].toUpperCase() + parts[1][0].toUpperCase()
    : name.slice(0, 2).toUpperCase();
}

function formatDistance(km) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}

function formatJoined(dateStr) {
  const days = Math.floor((Date.now() - new Date(dateStr)) / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function getConnectionStatus(connections, myId, theirId) {
  const conn = connections.find(
    (c) =>
      (c.requester_id === myId && c.receiver_id === theirId) ||
      (c.requester_id === theirId && c.receiver_id === myId)
  );
  if (!conn) return null;
  if (conn.status === "accepted") return "accepted";
  if (conn.requester_id === myId) return "sent";
  return "received";
}

export default function Connect({ user, onNext }) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("All");
  const [people, setPeople] = useState([]);
  const [connections, setConnections] = useState([]);
  const [myLocation, setMyLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null); // id in curs de conectare

  useEffect(() => {
    if (!user?.id) return;

    async function load() {
      try {
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("lat, lng")
          .eq("id", user.id)
          .single();

        if (myProfile?.lat && myProfile?.lng) {
          setMyLocation({ lat: myProfile.lat, lng: myProfile.lng });
        }

        const [users, conns] = await Promise.all([
          getNearbyUsers(user.id),
          getMyConnections(user.id),
        ]);

        setPeople(users);
        setConnections(conns);
      } catch (err) {
        console.error("Failed to load:", err);
      } finally {
        setLoading(false);
      }
    }

    load();

    // Real-time: cand cineva accepta cererea mea
    const channel = supabase
      .channel(`connections:requester:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connections",
          filter: `requester_id=eq.${user.id}`,
        },
        (payload) => {
          const updated = payload.new;
          setConnections((prev) =>
            prev.map((c) => (c.id === updated.id ? { ...c, status: updated.status } : c))
          );
        }
      )
      // Real-time: cand cineva imi trimite o cerere
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "connections",
          filter: `receiver_id=eq.${user.id}`,
        },
        (payload) => {
          const newConn = payload.new;
          setConnections((prev) => {
            if (prev.find((c) => c.id === newConn.id)) return prev;
            return [...prev, newConn];
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user?.id]);

  async function handleConnect(personId) {
    if (!user?.id || connecting) return;
    setConnecting(personId);
    try {
      const newConn = await sendConnectionRequest(user.id, personId);
      setConnections((prev) => [...prev, newConn]);
    } catch (err) {
      console.error("Failed to connect:", err);
    } finally {
      setConnecting(null);
    }
  }

  async function handleAccept(personId) {
    if (!user?.id || connecting) return;
    const conn = connections.find(
      (c) => c.requester_id === personId && c.receiver_id === user.id
    );
    if (!conn) return;
    setConnecting(personId);
    try {
      await acceptConnection(conn.id);
      // Actualizam starea local fara sa asteptam raspuns de la DB
      setConnections((prev) =>
        prev.map((c) => (c.id === conn.id ? { ...c, status: 'accepted' } : c))
      );
    } catch (err) {
      console.error("Failed to accept:", err);
    } finally {
      setConnecting(null);
    }
  }

  const peopleWithDistance = people
    .map((p) => ({
      ...p,
      distanceKm:
        myLocation && p.lat && p.lng
          ? getDistanceKm(myLocation.lat, myLocation.lng, p.lat, p.lng)
          : null,
    }))
    .sort((a, b) => {
      if (a.distanceKm === null) return 1;
      if (b.distanceKm === null) return -1;
      return a.distanceKm - b.distanceKm;
    });

  const filtered = peopleWithDistance.filter((p) => {
    const tags = p.interests || [];
    const matchFilter =
      activeFilter === "All" ||
      tags.some((t) => t.toLowerCase().includes(activeFilter.toLowerCase()));
    const matchSearch =
      (p.display_name || "").toLowerCase().includes(search.toLowerCase()) ||
      tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* Header */}
      <div className="px-8 pt-12 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          People near you who feel the same.
        </h1>
        <p className="text-gray-400 text-sm font-light">
          You don't have to start alone.
        </p>
      </div>

      {/* Search */}
      <div className="px-8 mb-4">
        <div className="flex items-center bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 gap-3">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by name or interest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-gray-800 text-sm placeholder-gray-400 outline-none w-full"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="px-8 mb-6 overflow-x-auto">
        <div className="flex gap-2" style={{ width: "max-content" }}>
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                activeFilter === f
                  ? "bg-gray-900 border-gray-900 text-white"
                  : "bg-white border-gray-200 text-gray-500 hover:border-gray-400"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* People list */}
      <div className="flex-1 px-8 flex flex-col gap-3 mb-6">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400 text-sm mb-1">No one nearby yet.</p>
            <p className="text-gray-300 text-xs">Be the first to invite someone from your area.</p>
          </div>
        )}

        {!loading && filtered.map((person) => {
          const status = getConnectionStatus(connections, user?.id, person.id);

          return (
            <div key={person.id} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-700 font-medium text-sm flex-shrink-0">
                {getInitials(person.display_name)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className="font-medium text-gray-900 text-sm">
                    {status === "accepted" ? person.display_name : `${person.display_name?.split(" ")[0] || "Someone"}`}
                  </p>
                  {person.distanceKm !== null && (
                    <span className="text-gray-400 text-xs">{formatDistance(person.distanceKm)}</span>
                  )}
                </div>
                <p className="text-xs text-gray-400 truncate">
                  {person.interests?.length > 0 ? person.interests.join(" · ") : "No interests yet"}
                  {" · joined "}{formatJoined(person.created_at)}
                </p>
              </div>

              {/* Connect button */}
              <div className="flex-shrink-0 ml-1">
                {status === "accepted" && (
                  <span className="text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-full">
                    Connected
                  </span>
                )}
                {status === "sent" && (
                  <span className="text-xs text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                    Sent
                  </span>
                )}
                {status === "received" && (
                  <button
                    onClick={() => handleAccept(person.id)}
                    disabled={connecting === person.id}
                    className="text-xs text-white font-medium bg-emerald-600 hover:bg-emerald-500 px-2.5 py-1 rounded-full transition-all disabled:opacity-40"
                  >
                    {connecting === person.id ? "..." : "Accept"}
                  </button>
                )}
                {status === null && (
                  <button
                    onClick={() => handleConnect(person.id)}
                    disabled={connecting === person.id}
                    className="text-xs text-gray-700 font-medium border border-gray-200 hover:border-gray-400 px-2.5 py-1 rounded-full transition-all disabled:opacity-40"
                  >
                    {connecting === person.id ? "..." : "Connect"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Global counter */}
      <div className="mx-8 mb-6 p-5 border border-gray-100 rounded-xl">
        <p className="text-2xl font-bold text-gray-900 mb-0.5">14,302</p>
        <p className="text-gray-400 text-sm mb-4">people in 47 countries. Growing every day.</p>
        <button
          onClick={onNext}
          className="w-full bg-gray-900 hover:bg-gray-700 text-white font-medium text-sm py-3 rounded-xl transition-all"
        >
          Start a local group
        </button>
      </div>

    </div>
  );
}
