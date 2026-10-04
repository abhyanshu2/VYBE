export const TYPES = {
  Photo: '#0E9F6E', Project: '#4F46E5', Achievement: '#D97706', Tutorial: '#DB2777', Normal: '#64748B',
}
const G = [['#4F46E5', '#06B6D4'], ['#DB2777', '#F59E0B'], ['#0E9F6E', '#3B82F6'], ['#7C3AED', '#EC4899'], ['#0F766E', '#84CC16']]
export const grad = (i) => `linear-gradient(135deg, ${G[i % 5][0]}, ${G[i % 5][1]})`

// Stable gradient index from any string (uid) so every user keeps the same colour
export const gi = (str = '') => [...str].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % 5

// NOTE: USERS (except 'you') and NOTIFS are still demo data for Activity/Messages (Phase 6 / 8)
export const USERS = {
  aarav: { name: 'Aarav Mehta', g: 0 },
  sana: { name: 'Sana Khan', g: 1 },
  rohan: { name: 'Rohan Verma', g: 3 },
  ishita: { name: 'Ishita Rao', g: 4 },
  you: { name: 'You', g: 2, handle: 'you' },
}

// Fills 'you' with the signed-in user's details (Avatar, Nav and Profile read from here)
export function setYou(u) {
  USERS.you = u
    ? { name: u.name, g: 2, handle: u.handle, photo: u.photo }
    : { name: 'You', g: 2, handle: 'you' }
}

export const NOTIFS = [
  { user: 'sana', text: 'liked your post', unread: true },
  { user: 'aarav', text: 'started following you', unread: true },
  { user: 'rohan', text: 'commented: "Great work!"', unread: true },
  { user: 'ishita', text: 'mentioned you in a comment', unread: false },
]