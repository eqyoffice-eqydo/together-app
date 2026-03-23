# Together App — Document de viziune și specificații tehnice
"Read the file TOGETHER_APP_DOCUMENT.md and use it as the design and vision reference for all future changes to this project."

> "Verba volant, scripta manent." — Cuvintele zboară, ce e scris rămâne.

---

## 1. Viziunea aplicației

### Originea ideii

Această aplicație s-a născut dintr-o conversație despre Benjamin Franklin și epitaful său scris la vârsta de 22 de ani, în care și-a comparat corpul cu coperta unei cărți vechi — uzată, dar cu promisiunea unei noi ediții mai bine. Această metaforă a dus la o discuție despre "walk-ins" — conceptul lui Ruth Montgomery despre suflete avansate care intră în corpuri umane pentru a-și îndeplini misiunea umanitară — și despre figuri istorice precum Gandhi și Lincoln ca exemple de oameni cu o misiune care transcende individul.

Din această reflecție a apărut o întrebare simplă: **cum poți inspira oamenii obișnuiți de astăzi să acționeze, la fel cum Gandhi a inspirat milioane?**

### Mesajul central
```
"You are not alone. Let's do it together."
```

Aplicația nu critică, nu acuză, nu se luptă cu nimeni. Pornește de la frustrarea reală a oamenilor — muncă fără sens, educație ruptă de realitate, izolare socială, lipsă de putere economică — și transformă această frustrare în acțiune colectivă.

### Principiile fundamentale (modelul Gandhi)

1. **Fără acuzații** — nu atacăm sisteme sau persoane, ci trezim conștiința individuală
2. **Putere personală** — "Everything you want to do is in your power"
3. **Acțiune colectivă** — schimbarea vine din grupuri mici, locale, reale
4. **Mesaj viral** — ca epitaful lui Franklin, cuvintele se răspândesc singure când sunt puternice
5. **Tangibil și local** — nu like-uri și followeri, ci oameni care se întâlnesc și construiesc

---

## 2. Arhitectura aplicației — 6 ecrane

Aplicația are 6 ecrane care formează o călătorie completă: de la trezire → decizie → acțiune → comunitate → răspândire.
```
Welcome → Questions → Call to Action → Connect → Community → Share → (înapoi la Welcome)
```

---

## 3. Specificațiile fiecărui ecran

### Ecran 1: Welcome

**Scopul:** Prima impresie. Trebuie să oprească omul în loc și să îl facă să simtă că cineva îl înțelege.

**Design:**
- Fundal alb/închis, centrat, full-screen
- Logo mic sus: "together" — litere mici, spacing mare
- Titlu mare: **"You are not alone."**
- Subtitlu: "Millions of people feel what you feel. It's time to do something about it — together."
- Buton principal: "Let's do it together"
- Citat jos, italic: *"If you don't like the world you live in, create your own world."*

**Ton:** Cald, empatic, fără judecată. Nu politic. Nu agresiv.

---

### Ecran 2: Questions Journey

**Scopul:** Oglinda. Utilizatorul răspunde la întrebări care îl fac să realizeze că situația lui nu e unică și că are puterea să o schimbe.

**Mecanism:**
- O întrebare pe rând, full-screen
- Progress bar în sus (ex: "3 din 31")
- Categoria afișată deasupra întrebării
- Buton "Next" pentru a avansa
- Când toate întrebările sunt parcurse → merge la Call to Action

**Cele 4 categorii și întrebările:**

#### Work & Life (7 întrebări)
1. Do you feel like your daily work aligns with what truly matters to you?
2. Are you living the life you imagined, or are you settling for what was handed to you?
3. If you could change one thing about how you spend your days, what would it be?
4. What's stopping you from taking that first step?
5. Do you believe your skills and talents are being wasted in your current situation?
6. What would happen if you and others like you decided to build something together instead?
7. Are you living the life you wish, or the life expected of you?

#### Education & Health (9 întrebări)
1. Does your education prepare you for the life you want to live?
2. Do you feel trapped in a system that wasn't designed for you?
3. Are you teaching your children to think, or to obey?
4. Are you nourishing your body with what it actually needs, or what you're told to consume?
5. Do you have time and space to rest and heal, or are you constantly running?
6. Are you taking care of your body and mind, or just surviving day to day?
7. Do you know what true wellness means, or are you just treating symptoms?
8. Who's making decisions about your health — you or someone else?
9. Is your child learning skills that will actually help them build a meaningful life?

#### Economy & Community (7 întrebări)
1. Do you have enough to live with dignity, or are you constantly struggling?
2. Who benefits from the system you work in — you or someone else?
3. Do you feel connected to the people around you, or isolated?
4. Are you waiting for someone to fix things, or are you ready to fix them yourself?
5. Would you help rebuild your community if you had others to do it with?
6. Do you like to help others? Let's do it. Let's create something together.
7. Stop waiting. Start building.

#### Self & Relations (8 întrebări)
1. Do you know who you are?
2. Are you living as yourself, or as someone you think you should be?
3. Do the people in your life know the real you?
4. Do your relationships help you grow, or keep you small?
5. Are you surrounding yourself with people who lift you up, or drag you down?
6. Can you be vulnerable and honest with the people closest to you?
7. Do you feel truly seen and understood by anyone in your life?
8. If you don't like who you are, now you have the opportunity to become who you want to be.

---

### Ecran 3: Call to Action

**Scopul:** Momentul de transformare. De la reflecție la decizie. Utilizatorul alege cum vrea să acționeze.

**Elemente:**
- Mesaj de confirmare: "You've taken the first step."
- Subtitlu: "Millions of people feel exactly what you feel. The difference is — now you know it."
- **Tag-uri selectabile** (ce îl mișcă cel mai mult):
  - Work & purpose / Education / Health / Community / Economy / Self & identity / Relationships / Peace
- **Radio buttons** — ce vrea să facă:
  - Connect with people near me
  - Start something in my community
  - Share this with someone I care about
  - Just explore for now
- Citat: *"Everything you want to do is in your power. If you don't like who you are — now is your moment."*
- Buton principal: **"Let's do it together"**
- Buton secundar (discret): "I'm not ready yet"

**Principiu de design:** Ușa rămâne deschisă. Nimeni nu e forțat. Invitație, nu presiune.

---

### Ecran 4: Connect

**Scopul:** Utilizatorul vede că nu e singur — există oameni reali în apropierea lui care simt la fel.

**Elemente:**
- Titlu: "People near you who feel the same"
- Subtitlu: "You don't have to start alone."
- Bară de căutare (oraș, interes, nume)
- Filtre rapide: All / Community / Work / Education / Peace
- **Lista de persoane nearby:**
  - Avatar cu inițiale (nu nume complet — protecție privacy)
  - Distanța aproximativă (ex: "2.1 km away")
  - Data înscrierii (ex: "joined 3 days ago")
  - Tag-uri cu interesele lor
- **Counter global** în jos: "14,302 people in 47 countries. Growing every day."
- Buton: "Start a local group"

**Principiu de privacy:**
- Doar inițiale, nu nume complet
- Distanță aproximativă, nu locație exactă
- Trust se construiește gradual, ca în comunități reale

---

### Ecran 5: Community Hub

**Scopul:** Locul unde inspirația devine acțiune reală în lumea fizică.

**Elemente:**
- Header: grupul local (ex: "Barcelona, Spain · 18 members")
- **Proiecte active** — fiecare cu:
  - Titlu și descriere scurtă
  - Status badge (Active / Planning / Done)
  - Avatarele membrilor implicați
  - Număr de participanți
- **Evenimente viitoare** — cu dată, oră, locație fizică
- **Mesaj de grup** — input simplu pentru comunicare
- Buton: "Invite someone to your group" (duce la Share)

**Exemple de proiecte reale:**
- Free skill-sharing circle — "Teaching each other what we know — free, open, weekly."
- Community garden — "Grow food together. Share the harvest. Build trust."

**Principiu fundamental:** Totul e local și tangibil. Nu like-uri. Nu followeri. Oameni care se întâlnesc fizic și construiesc împreună.

---

### Ecran 6: Share

**Scopul:** Viralitatea organică. Fiecare utilizator devine ambasador.

**Elemente:**
- Titlu: "Invite someone who needs this"
- Subtitlu: "Every person you invite could inspire ten more. That's how change spreads."
- **Link personal de invitație** (unic per utilizator) cu buton Copy
- **Butoane de share direct:** Email / SMS / Share (native)
- **Impact counter personal:**
  - Invited: [număr]
  - Reached: [număr]
  - Joined: [număr]
- Citat de închidere: *"If you don't like the world you live in, create your own world."*
- Buton: "Let's do it together"

**Mecanism de viralitate:** Link-ul personal trackează lanțul de invitații — poți vedea câți oameni ai inspirat tu direct și indirect.

---

## 4. Design system

### Filosofia vizuală

**Curat, uman, sincer.** Fără efecte spectaculoase. Fără agresivitate vizuală. Aplicația trebuie să se simtă ca o conversație cu un prieten înțelept, nu ca o reclamă sau un manifest politic.

### Principii de design

- **Mobile-first** — aplicația trăiește pe telefon
- **Alb și gri** — culori neutre, liniștitoare, nu tribale
- **Typography mare** — întrebările trebuie să lovească, nu să fie citite
- **Spațiu alb generos** — lasă mesajul să respire
- **Fără emoji** — seriozitate și respect
- **Butoane clare** — acțiunea e simplă și evidentă

### Culori principale
```
Background: #FFFFFF (alb pur)
Text principal: #111111 (aproape negru)
Text secundar: #6B7280 (gri mediu)
Accent: #111111 (buton principal — negru)
Border: rgba(0,0,0,0.1) (gri foarte deschis)
Success: #10B981 (verde — pentru badge-uri active)
Warning: #F59E0B (amber — pentru planning)
```

### Componente cheie

**Buton principal:**
```jsx
<button className="w-full bg-gray-900 text-white py-4 rounded-xl text-base font-medium">
  Let's do it together
</button>
```

**Card persoană:**
```jsx
<div className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl">
  <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center text-teal-800 font-medium text-sm">
    MA
  </div>
  <div>
    <p className="font-medium text-gray-900">Maria A.</p>
    <p className="text-xs text-gray-500">2.1 km · Community, Education</p>
  </div>
</div>
```

**Progress bar:**
```jsx
<div className="w-full bg-gray-100 rounded-full h-1">
  <div className="bg-gray-900 h-1 rounded-full transition-all" style={{width: `${progress}%`}} />
</div>
```

---

## 5. Structura tehnică

### Stack ales

| Componentă | Tehnologie | Motiv |
|---|---|---|
| Frontend | React + Vite | Rapid, modern, documentație excelentă |
| Styling | Tailwind CSS | Mobile-first, consistent, rapid |
| Backend/DB | Supabase | Gratuit, real-time, auth inclus |
| Hosting | Vercel | Deploy automat, gratuit, global |
| Navigare | React Router DOM | Standard industrie |

### Structura fișierelor
```
together-app/
├── src/
│   ├── screens/
│   │   ├── Welcome.jsx          ← Ecran 1
│   │   ├── Questions.jsx        ← Ecran 2
│   │   ├── CallToAction.jsx     ← Ecran 3
│   │   ├── Connect.jsx          ← Ecran 4
│   │   ├── Community.jsx        ← Ecran 5
│   │   ├── Share.jsx            ← Ecran 6
│   │   └── Auth.jsx             ← Login/Register
│   ├── components/
│   │   ├── Button.jsx
│   │   ├── Card.jsx
│   │   ├── ProgressBar.jsx
│   │   ├── Avatar.jsx
│   │   └── TagPill.jsx
│   ├── data/
│   │   └── questions.js         ← Toate întrebările
│   ├── lib/
│   │   ├── supabase.js          ← Client Supabase
│   │   └── db.js                ← Funcții DB
│   └── App.jsx                  ← Navigare centrală
├── .env.local                   ← Chei Supabase (nu se commitează)
├── TOGETHER_APP_DOCUMENT.md     ← Acest document
└── package.json
```

### Schema bazei de date (Supabase)
```sql
-- Utilizatori (extins din auth.users)
profiles (
  id uuid references auth.users,
  display_name text,
  city text,
  country text,
  lat float,
  lng float,
  interests text[],
  invite_code text unique,
  invited_by uuid,
  created_at timestamp
)

-- Răspunsuri la întrebări
answers (
  id uuid,
  user_id uuid references profiles,
  category text,
  question_index int,
  created_at timestamp
)

-- Grupuri locale
groups (
  id uuid,
  name text,
  city text,
  country text,
  lat float,
  lng float,
  member_count int,
  created_at timestamp
)

-- Membri în grupuri
group_members (
  group_id uuid references groups,
  user_id uuid references profiles,
  joined_at timestamp
)

-- Proiecte
projects (
  id uuid,
  group_id uuid references groups,
  title text,
  description text,
  status text, -- 'active' | 'planning' | 'done'
  created_by uuid references profiles,
  created_at timestamp
)

-- Evenimente
events (
  id uuid,
  group_id uuid references groups,
  title text,
  location text,
  event_date timestamp,
  created_at timestamp
)
```

---

## 6. Planul de dezvoltare

### Phase 1 — Frontend (săptămânile 1-2) ✅ COMPLETAT
- [x] Setup proiect React + Vite + Tailwind
- [x] Toate cele 6 ecrane create
- [x] Navigare cu useState între ecrane
- [x] Întrebările reale integrate în Questions.jsx
- [ ] Rafinare design conform specificațiilor din acest document
- [ ] Test pe telefon mobil

### Phase 2 — Backend (săptămânile 3-4) 🔄 ÎN PROGRES
- [ ] Cont Supabase creat
- [ ] Variabile de mediu configurate (.env.local)
- [ ] Schema DB creată în Supabase
- [ ] Auth.jsx funcțional (register/login)
- [ ] Salvare răspunsuri în DB
- [ ] Profile utilizator

### Phase 3 — Connect (săptămâna 5)
- [ ] Geolocalizare utilizator
- [ ] Matching cu utilizatori din apropiere
- [ ] Link personal de invitație
- [ ] Tracking invitații

### Phase 4 — Community (săptămâna 6)
- [ ] Creare și join grupuri locale
- [ ] Proiecte și evenimente
- [ ] Mesaj de grup (real-time cu Supabase)

### Phase 5 — Launch (săptămâna 7)
- [ ] Deploy pe Vercel
- [ ] Test cu utilizatori reali
- [ ] Share și iterație

---

## 7. Citate și principii de bază

Acestea sunt citate și mesaje care definesc spiritul aplicației. Folosiți-le în UI, în onboarding, în comunicare:

> *"You are not alone. Let's do it together."* — mesajul central

> *"If you don't like the world you live in, create your own world."* — call to action

> *"Everything you want to do is in your power."* — empowerment

> *"If you don't like who you are, now you have the opportunity to become who you want to be."* — transformare

> *"Stop waiting. Start building."* — urgență

> *"Verba volant, scripta manent."* — de ce documentăm

---

## 8. Ce NU este această aplicație

Pentru a păstra direcția corectă, este important să știm ce nu vrem:

- **Nu este o rețea socială** — nu urmărim like-uri, followeri, engagement metrics
- **Nu este politică** — nu atacăm partide, guverne, persoane
- **Nu este o platformă de protest** — nu organizăm demonstrații sau conflicte
- **Nu este o aplicație de dating** — conexiunile sunt bazate pe valori comune, nu pe atracție
- **Nu este un forum** — nu vrem dezbateri interminabile, vrem acțiune

**Este:** O platformă de empowerment personal și acțiune colectivă locală, inspirată de modelul Gandhi — schimbare prin exemplu personal, comunitate mică și acțiuni tangibile.

---

*Document creat în colaborare cu Claude (Anthropic) — March 2026*
*Proiect: together-app | Stack: React + Tailwind + Supabase + Vercel*
