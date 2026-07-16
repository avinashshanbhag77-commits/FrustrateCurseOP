const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const api = {
  // Health & Rules
  getHealth: () => fetch(`${API_BASE}/api/health`).then(r => r.json()),
  getRules: () => fetch(`${API_BASE}/api/rules`).then(r => r.json()),

  // Queue
  joinQueue: (nickname) =>
    fetch(`${API_BASE}/api/queue/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    }).then(r => r.json()),

  // Rooms
  createRoom: (nickname) =>
    fetch(`${API_BASE}/api/rooms/create`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname }),
    }).then(r => r.json()),

  joinRoom: (roomCode, nickname) =>
    fetch(`${API_BASE}/api/rooms/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, nickname }),
    }).then(r => r.json()),

  getRoom: (roomCode) =>
    fetch(`${API_BASE}/api/rooms/${roomCode}`).then(r => r.json()),

  // Messages
  sendMessage: (roomCode, sender, text) =>
    fetch(`${API_BASE}/api/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roomCode, sender, text }),
    }).then(r => r.json()),

  // Stats
  getLeaderboard: () =>
    fetch(`${API_BASE}/api/leaderboard`).then(r => r.json()),

  getUser: (nickname) =>
    fetch(`${API_BASE}/api/users/${nickname}`).then(r => r.json()),
};
