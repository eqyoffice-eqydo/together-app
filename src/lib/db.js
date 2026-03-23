import { supabase } from './supabase'

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function createUser(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password })
  if (error) throw error
  return data
}

export async function loginUser(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function logoutUser() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

// ─── PROFILE ─────────────────────────────────────────────────────────────────

export async function updateProfile(userId, fields) {
  const { data, error } = await supabase
    .from('profiles')
    .update(fields)
    .eq('id', userId)
  if (error) throw error
  return data
}

export async function getNearbyUsers(currentUserId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, lat, lng, interests, created_at')
    .neq('id', currentUserId)
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .limit(50)
  if (error) throw error
  return data || []
}

// ─── ANSWERS ─────────────────────────────────────────────────────────────────

export async function saveAnswers(userId, answers) {
  const { data, error } = await supabase
    .from('answers')
    .upsert(
      { user_id: userId, answers, updated_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )
  if (error) throw error
  return data
}

// ─── GROUPS ──────────────────────────────────────────────────────────────────

export async function findOrCreateGroup(lat, lng) {
  // 1. Cauta toate grupurile existente
  const { data: groups, error } = await supabase
    .from('groups')
    .select('id, name, lat, lng, member_count')

  if (error) throw error

  // 2. Gaseste cel mai apropiat grup in raza de 50km
  let nearest = null
  let nearestDist = Infinity

  for (const g of groups || []) {
    if (g.lat && g.lng) {
      const d = getDistanceKm(lat, lng, g.lat, g.lng)
      if (d < 50 && d < nearestDist) {
        nearest = g
        nearestDist = d
      }
    }
  }

  if (nearest) return nearest

  // 3. Nu exista grup in apropiere — creeaza unul nou
  const cityName = await getCityName(lat, lng)
  const { data: newGroup, error: createError } = await supabase
    .from('groups')
    .insert({ name: cityName, lat, lng, member_count: 0 })
    .select()
    .single()

  if (createError) throw createError
  return newGroup
}

export async function joinGroup(groupId, userId) {
  // Verifica daca e deja membru
  const { data: existing } = await supabase
    .from('group_members')
    .select('group_id')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  if (existing) return // deja in grup

  const { error } = await supabase
    .from('group_members')
    .insert({ group_id: groupId, user_id: userId })

  if (error) throw error

  // Incrementeaza member_count
  await supabase.rpc('increment_member_count', { group_id: groupId })
}

export async function getUserGroup(userId) {
  const { data, error } = await supabase
    .from('group_members')
    .select('group_id, groups(id, name, lat, lng, member_count)')
    .eq('user_id', userId)
    .order('joined_at', { ascending: false })
    .limit(1)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data?.groups || null
}

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export async function getGroupMessages(groupId) {
  const { data, error } = await supabase
    .from('messages')
    .select('id, text, created_at, user_id, profiles(display_name)')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(50)

  if (error) throw error
  return data || []
}

export async function sendMessage(groupId, userId, text) {
  const { data, error } = await supabase
    .from('messages')
    .insert({ group_id: groupId, user_id: userId, text })
    .select('id, text, created_at, user_id, profiles(display_name)')
    .single()

  if (error) throw error
  return data
}

export function subscribeToMessages(groupId, onMessage) {
  return supabase
    .channel(`messages:${groupId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupId}` },
      (payload) => onMessage(payload.new)
    )
    .subscribe()
}

// ─── INVITE & IMPACT ─────────────────────────────────────────────────────────

export async function getProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, display_name, invite_code, invited_by, interests, lat, lng')
    .eq('id', userId)
    .single()
  if (error) throw error
  return data
}

export async function getProfileByInviteCode(code) {
  const { data } = await supabase
    .from('profiles')
    .select('id')
    .eq('invite_code', code)
    .single()
  return data || null
}

export async function getInviteStats(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('invited_by', userId)
  if (error) return { invited: 0, joined: 0 }
  const invited = data?.length || 0
  return { invited, joined: invited }
}

export async function setInvitedBy(userId, inviterId) {
  const { error } = await supabase
    .from('profiles')
    .update({ invited_by: inviterId })
    .eq('id', userId)
  if (error) throw error
}

// ─── CONNECTIONS ─────────────────────────────────────────────────────────────

export async function sendConnectionRequest(requesterId, receiverId) {
  const { data, error } = await supabase
    .from('connections')
    .insert({ requester_id: requesterId, receiver_id: receiverId })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMyConnections(userId) {
  const { data, error } = await supabase
    .from('connections')
    .select('id, requester_id, receiver_id, status')
    .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`)
  if (error) throw error
  return data || []
}

export async function acceptConnection(connectionId) {
  const { error } = await supabase
    .from('connections')
    .update({ status: 'accepted' })
    .eq('id', connectionId)
  if (error) throw error
}

// ─── UTILS ───────────────────────────────────────────────────────────────────

export function getDistanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2)
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function getUserLocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'))
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => reject(new Error('Location denied')),
      { timeout: 8000 }
    )
  })
}

async function getCityName(lat, lng) {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    )
    const data = await res.json()
    const city =
      data.address?.city ||
      data.address?.town ||
      data.address?.village ||
      data.address?.county ||
      'Local Group'
    const country = data.address?.country_code?.toUpperCase() || ''
    return country ? `${city}, ${country}` : city
  } catch {
    return 'Local Group'
  }
}
