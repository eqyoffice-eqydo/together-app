import { useState, useEffect } from "react";
import { getUser, logoutUser, saveAnswers, updateProfile, getUserLocation, findOrCreateGroup, joinGroup, getUserGroup, getProfileByInviteCode, setInvitedBy } from "./lib/db";
import Auth from "./screens/Auth";
import Welcome from "./screens/Welcome";
import Questions from "./screens/Questions";
import CallToAction from "./screens/CallToAction";
import Commitment from "./screens/Commitment";
import Connect from "./screens/Connect";
import Community from "./screens/Community";
import Share from "./screens/Share";
import Home from "./screens/Home";

const SCREENS = ["welcome", "questions", "calltoaction", "connect", "community", "share"];

export default function App() {
  const [screen, setScreen] = useState("welcome");
  const [user, setUser] = useState(null);
  const [group, setGroup] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [userSelections, setUserSelections] = useState(null);
  const [refCode] = useState(() => new URLSearchParams(window.location.search).get("ref"));

  useEffect(() => {
    async function init() {
      const u = await getUser();
      setUser(u);
      if (u) {
        const g = await getUserGroup(u.id).catch(() => null);
        setGroup(g);
        setScreen("home"); // Deja logat — sari direct la app
      }
      setAuthChecked(true);
    }
    init();
  }, []);

  function goTo(name) {
    setScreen(name);
  }

  function goNext() {
    const idx = SCREENS.indexOf(screen);
    if (SCREENS[idx + 1] === "connect" && !user) {
      setScreen("auth");
      return;
    }
    if (idx < SCREENS.length - 1) {
      setScreen(SCREENS[idx + 1]);
    }
  }

  function handleCallToActionNext(selections) {
    setUserSelections(selections);
    setScreen("commitment");
  }

  function handleCommitmentNext(commitmentText) {
    const selectionsWithCommitment = { ...userSelections, commitment: commitmentText };
    setUserSelections(selectionsWithCommitment);
    if (!user) {
      setScreen("auth");
    } else {
      saveAnswers(user.id, selectionsWithCommitment).catch(console.error);
      setScreen("connect");
    }
  }

  async function handleAuth(loggedInUser, displayName) {
    setUser(loggedInUser);

    // Salveaza raspunsurile
    if (userSelections) {
      await saveAnswers(loggedInUser.id, userSelections).catch(console.error);
    }

    // Daca a venit printr-un link de invitatie, salveaza invited_by
    if (refCode) {
      try {
        const inviter = await getProfileByInviteCode(refCode);
        if (inviter && inviter.id !== loggedInUser.id) {
          await setInvitedBy(loggedInUser.id, inviter.id);
        }
      } catch (err) {
        console.error("Failed to set invited_by:", err);
      }
    }

    // Salveaza locatia si interesele, apoi gaseste/creeaza grup
    try {
      const { lat, lng } = await getUserLocation();

      const profileUpdate = { lat, lng };
      if (displayName) profileUpdate.display_name = displayName;
      if (userSelections?.topics?.length > 0) {
        profileUpdate.interests = userSelections.topics;
      }
      await updateProfile(loggedInUser.id, profileUpdate);

      // Gaseste sau creeaza grup local
      const foundGroup = await findOrCreateGroup(lat, lng);
      await joinGroup(foundGroup.id, loggedInUser.id);
      setGroup(foundGroup);

    } catch (err) {
      console.error("Location/group setup failed:", err);
      // Continua fara locatie
    }

    setScreen("home");
  }

  async function handleLogout() {
    await logoutUser();
    setUser(null);
    setGroup(null);
    setUserSelections(null);
    setScreen("welcome");
  }

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-gray-200 border-t-gray-900 animate-spin" />
      </div>
    );
  }

  const showBottomNav = ["home", "connect", "community", "share"].includes(screen);

  return (
    <div className="min-h-dvh bg-white flex flex-col w-full max-w-md mx-auto relative overflow-x-hidden">

      {user && showBottomNav && (
        <button
          onClick={handleLogout}
          className="absolute top-4 right-4 z-50 text-gray-300 hover:text-gray-500 text-xs transition-colors"
        >
          Log out
        </button>
      )}

      <div className={showBottomNav ? "pb-20" : ""}>
        {screen === "welcome" && <Welcome onNext={goNext} />}
        {screen === "questions" && <Questions onNext={goNext} />}
        {screen === "calltoaction" && <CallToAction onNext={handleCallToActionNext} />}
        {screen === "commitment" && <Commitment onNext={handleCommitmentNext} onSkip={() => handleCommitmentNext("")} />}
        {screen === "auth" && <Auth onAuth={handleAuth} />}
        {screen === "home" && <Home user={user} group={group} onGoToShare={() => goTo("share")} />}
        {screen === "connect" && <Connect onNext={goNext} user={user} />}
        {screen === "community" && <Community onNext={goNext} group={group} user={user} />}
        {screen === "share" && <Share onNext={() => goTo("connect")} user={user} />}
      </div>

      {showBottomNav && (
        <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-white/95 backdrop-blur border-t border-gray-100 px-6 py-3 flex justify-around z-50">
          <button
            onClick={() => goTo("home")}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all ${screen === "home" ? "text-gray-900" : "text-gray-300"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            <span className="text-xs font-medium">Home</span>
          </button>

          <button
            onClick={() => goTo("connect")}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all ${screen === "connect" ? "text-gray-900" : "text-gray-300"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs font-medium">Connect</span>
          </button>

          <button
            onClick={() => goTo("community")}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all ${screen === "community" ? "text-gray-900" : "text-gray-300"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <span className="text-xs font-medium">Community</span>
          </button>

          <button
            onClick={() => goTo("share")}
            className={`flex flex-col items-center gap-1 px-4 py-1 transition-all ${screen === "share" ? "text-gray-900" : "text-gray-300"}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
            <span className="text-xs font-medium">Share</span>
          </button>
        </div>
      )}
    </div>
  );
}
