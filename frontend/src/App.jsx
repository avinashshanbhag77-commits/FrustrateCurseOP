import { Link, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { api } from './api';
import ChatRoom from './ChatRoom';

const nicknames = ['AngryWolf', 'SilentTiger', 'BrokenKing', 'MadPotato', 'DarkFox', 'LostSoul'];

const leaderboardData = [
  { name: 'AngryWolf', rankScore: 982, sessions: 24, hours: 8.4, streak: 11, votes: 19 },
  { name: 'LostSoul', rankScore: 901, sessions: 19, hours: 7.2, streak: 9, votes: 17 },
  { name: 'DarkFox', rankScore: 864, sessions: 18, hours: 6.8, streak: 8, votes: 15 },
  { name: 'MadPotato', rankScore: 810, sessions: 16, hours: 6.1, streak: 7, votes: 13 },
];

const stats = {
  sessions: 12,
  totalChatTime: '3h 24m',
  avgSession: '17m',
  messages: 184,
  streak: 4,
  longestStreak: 9,
  votes: 8,
  rankScore: 742,
};

function HomePage({ nickname, setNickname, onEnter }) {
  const [backendStatus, setBackendStatus] = useState('checking...');

  useEffect(() => {
    const apiUrl = import.meta.env.VITE_API_URL 
      ? `${import.meta.env.VITE_API_URL}/api/health`
      : '/api/health';
    
    fetch(apiUrl)
      .then((response) => response.json())
      .then((data) => setBackendStatus(data.message))
      .catch(() => setBackendStatus('backend offline'));
  }, []);

  const randomize = () => {
    const next = nicknames[Math.floor(Math.random() * nicknames.length)];
    setNickname(next);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col justify-center px-4 py-10 lg:px-8">
      <div className="panel relative overflow-hidden p-8 sm:p-12 lg:p-16">
        <div className="absolute right-4 top-4 h-28 w-28 rounded-full bg-crimson/20 blur-3xl" />
        <div className="absolute bottom-8 left-6 h-20 w-20 rounded-full bg-blush/20 blur-2xl" />

        <div className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full border border-crimson/40 bg-crimson/10 px-3 py-1 text-sm text-crimson">
              Vent. Don&apos;t Harm.
            </p>
            <h1 className="comic-title text-4xl font-black leading-tight sm:text-6xl">
              RationalRage
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-slate-300">
              A cartoonish, anonymous, temporary chat room for two consenting people to vent safely and leave with a little more calm.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button className="btn-primary" onClick={onEnter}>
                Enter RationalRage
              </button>
              <Link to="/rules" className="btn-secondary">
                Read the Rule Book
              </Link>
            </div>
            <div className="mt-4 inline-flex rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
              API: {backendStatus}
            </div>
          </div>

          <div className="bubble p-6 sm:p-8">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-crimson">Anonymous Identity</span>
              <span className="rounded-full border border-crimson/20 bg-crimson/10 px-3 py-1 text-sm">Safe, temporary, silly</span>
            </div>

            <label className="mb-3 block text-sm font-semibold text-slate-700">Choose your nickname</label>
            <div className="flex gap-3">
              <input
                className="w-full rounded-full border border-slate-300 bg-white px-4 py-3 text-sm font-medium text-slate-800 outline-none ring-0"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your anonymous name"
              />
              <button className="btn-primary" onClick={randomize}>
                🎲
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {nicknames.map((name) => (
                <button key={name} className="rounded-full border border-slate-300 px-3 py-1 text-sm text-slate-700" onClick={() => setNickname(name)}>
                  {name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RulesPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 lg:px-8">
      <div className="panel p-8 sm:p-12">
        <h2 className="comic-title text-3xl font-black sm:text-4xl">The Rule Book</h2>
        <p className="mt-3 text-slate-300">Every match begins with a greeting and ends with courtesy.</p>

        <div className="mt-8 space-y-4">
          {[
            ['Rule 1', 'Start every conversation by saying “Hi”'],
            ['Rule 2', 'End every conversation by saying “Bye, it was nice talking to you.”'],
            ['Rule 3', 'Respect anonymity and never share personal info.'],
            ['Rule 4', 'Everything stays inside this room.'],
            ['Rule 5', 'Only text messages are allowed.'],
            ['Rule 6', 'This is a voluntary space, so leave whenever you want.'],
            ['Rule 7', 'The goal is release, not real-world harm.'],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
              <h3 className="font-semibold text-crimson">{title}</h3>
              <p className="mt-1 text-sm text-slate-300">{body}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link className="btn-primary" to="/queue">
            Accept and Join Queue
          </Link>
          <Link className="btn-secondary" to="/">
            Back Home
          </Link>
        </div>
      </div>
    </div>
  );
}

function QueuePage({ nickname }) {
  const navigate = useNavigate();
  const [roomCode, setRoomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleJoinPublicQueue = async () => {
    if (!nickname) {
      alert('Please choose a nickname first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.joinQueue(nickname);
      if (result.matched) {
        localStorage.setItem('nickname', nickname);
        navigate(`/chat/${result.roomCode}`);
      } else {
        alert('Added to queue! Waiting for a match...');
      }
    } catch (err) {
      setError('Failed to join queue: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePrivateRoom = async () => {
    if (!nickname) {
      alert('Please choose a nickname first');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const result = await api.createRoom(nickname);
      localStorage.setItem('nickname', nickname);
      navigate(`/chat/${result.roomCode}`);
    } catch (err) {
      setError('Failed to create room: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinPrivateRoom = async () => {
    if (!nickname) {
      alert('Please choose a nickname first');
      return;
    }
    if (!roomCode) {
      alert('Please enter a room code');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.joinRoom(roomCode, nickname);
      localStorage.setItem('nickname', nickname);
      navigate(`/chat/${roomCode}`);
    } catch (err) {
      setError('Failed to join room: ' + err.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 lg:px-8">
      <div className="panel p-8 sm:p-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-crimson">Queue</p>
            <h2 className="comic-title text-3xl font-black sm:text-4xl">Matchmaking is ready</h2>
          </div>
          <div className="rounded-full border border-crimson/30 bg-crimson/10 px-4 py-2 text-sm text-crimson">
            {nickname} • anonymous
          </div>
        </div>

        {error && <div className="mt-4 p-3 bg-red-900/20 border border-red-500 rounded text-red-300">{error}</div>}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-6">
            <h3 className="text-xl font-semibold">Public Queue</h3>
            <p className="mt-2 text-sm text-slate-300">You will be paired with another anonymous user when someone is available.</p>
            <button 
              className="btn-primary mt-5 disabled:opacity-50" 
              onClick={handleJoinPublicQueue}
              disabled={loading}
            >
              {loading ? 'Joining...' : 'Join Public Queue'}
            </button>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-6">
            <h3 className="text-xl font-semibold">Private Room</h3>
            <p className="mt-2 text-sm text-slate-300">Create or enter a room code for a more controlled match.</p>
            <div className="mt-4 flex gap-3">
              <input 
                className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-sm text-white" 
                placeholder="Room code" 
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              />
              <button 
                className="btn-primary disabled:opacity-50" 
                onClick={handleJoinPrivateRoom}
                disabled={loading}
              >
                {loading ? '...' : 'Join'}
              </button>
            </div>
            <button 
              className="btn-secondary mt-4 disabled:opacity-50" 
              onClick={handleCreatePrivateRoom}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Private Room'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChatPage({ nickname }) {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'GhostFox', text: 'Hi', me: false },
    { id: 2, sender: nickname, text: 'Hi', me: true },
    { id: 3, sender: 'GhostFox', text: 'I needed this. Thanks for being here.', me: false },
  ]);
  const [draft, setDraft] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(600);

  const sendMessage = () => {
    if (!draft.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now(), sender: nickname, text: draft, me: true }]);
    setDraft('');
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-8 lg:px-8">
      <div className="panel overflow-hidden p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 px-2 pb-4">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-crimson">Temporary room</p>
            <h2 className="comic-title text-2xl font-black">Anonymous Vent Room</h2>
          </div>
          <div className="flex gap-3">
            <div className="rounded-full border border-crimson/30 bg-crimson/10 px-4 py-2 text-sm text-crimson">
              ⏳ {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
            </div>
            <button className="btn-secondary" onClick={() => window.history.back()}>
              Leave Room
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Matched with</p>
                <h3 className="font-semibold text-cream">GhostFox</h3>
              </div>
              <div className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-sm text-emerald-300">
                Typing…
              </div>
            </div>

            <div className="space-y-3">
              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.me ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${message.me ? 'bg-crimson text-cream' : 'bg-white/10 text-slate-100'}`}>
                    <p className="text-[11px] uppercase tracking-[0.25em] opacity-70">{message.sender}</p>
                    <p className="mt-1">{message.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5">
              <h3 className="font-semibold text-crimson">Room note</h3>
              <p className="mt-2 text-sm text-slate-300">Start with a greeting, stay respectful, and remember that this room disappears when the timer ends.</p>
            </div>
            <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-5">
              <h3 className="font-semibold text-crimson">Send a message</h3>
              <textarea
                className="mt-3 min-h-[100px] w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-cream outline-none"
                placeholder="Type something honest and brief"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <div className="mt-4 flex flex-wrap gap-3">
                <button className="btn-primary" onClick={sendMessage}>
                  Send
                </button>
                <button className="btn-secondary">Good Fight 👍</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LeaderboardsPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 lg:px-8">
      <div className="panel p-8 sm:p-10">
        <h2 className="comic-title text-3xl font-black sm:text-4xl">Anonymous Leaderboards</h2>
        <p className="mt-3 text-slate-300">Only anonymous nicknames appear here—no real identities, no profile pages.</p>

        <div className="mt-8 grid gap-4">
          {leaderboardData.map((entry, index) => (
            <div key={entry.name} className="flex flex-wrap items-center justify-between rounded-[24px] border border-white/10 bg-slate-950/60 p-4">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-crimson">#{index + 1}</p>
                <h3 className="text-xl font-semibold">{entry.name}</h3>
              </div>
              <div className="flex flex-wrap gap-3 text-sm text-slate-300">
                <span className="rounded-full bg-white/10 px-3 py-1">Rank {entry.rankScore}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Sessions {entry.sessions}</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Time {entry.hours}h</span>
                <span className="rounded-full bg-white/10 px-3 py-1">Streak {entry.streak}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 lg:px-8">
      <div className="panel p-8 sm:p-10">
        <h2 className="comic-title text-3xl font-black sm:text-4xl">Anonymous Profile</h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[24px] border border-white/10 bg-slate-950/60 p-6">
            <p className="text-sm uppercase tracking-[0.3em] text-crimson">Current alias</p>
            <h3 className="mt-2 text-2xl font-semibold">MadPotato</h3>
            <p className="mt-3 text-sm text-slate-300">No real identity is stored. This profile is only a compact record of anonymous session behavior.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {Object.entries(stats).map(([key, value]) => (
              <div key={key} className="rounded-[20px] border border-white/10 bg-white/10 p-4">
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">{key}</p>
                <p className="mt-2 text-xl font-semibold text-cream">{value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-4 py-10 lg:px-8">
      <div className="panel p-8 sm:p-10">
        <h2 className="comic-title text-3xl font-black sm:text-4xl">Settings</h2>
        <div className="mt-8 rounded-[24px] border border-white/10 bg-slate-950/60 p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-cream">Cartoon vibe</h3>
              <p className="mt-1 text-sm text-slate-300">A playful, calm interface with rounded panels and soft crimson highlights.</p>
            </div>
            <button className="btn-primary">Toggle</button>
          </div>
          <div className="mt-4 flex items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-cream">Anonymous mode</h3>
              <p className="mt-1 text-sm text-slate-300">Stay fully private while you vent and leave no lasting footprint.</p>
            </div>
            <button className="btn-secondary">Enabled</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [nickname, setNickname] = useState('AngryWolf');
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-transparent text-cream">
      <header className="mx-auto flex max-w-7xl flex-wrap items-center justify-between px-4 py-6 lg:px-8">
        <Link to="/" className="text-2xl font-black text-cream">
          RationalRage
        </Link>
        <nav className="flex flex-wrap gap-2">
          {[
            ['Home', '/'],
            ['Rules', '/rules'],
            ['Queue', '/queue'],
            ['Chat', '/chat'],
            ['Leaderboards', '/leaderboards'],
            ['Profile', '/profile'],
            ['Settings', '/settings'],
          ].map(([label, path]) => (
            <NavLink key={path} to={path} className={({ isActive }) => `rounded-full px-3 py-2 text-sm transition ${isActive ? 'bg-crimson text-cream' : 'bg-white/10 text-slate-300 hover:bg-white/20'}`}>
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage nickname={nickname} setNickname={setNickname} onEnter={() => navigate('/queue')} />} />
        <Route path="/rules" element={<RulesPage />} />
        <Route path="/queue" element={<QueuePage nickname={nickname} />} />
        <Route path="/chat/:roomCode" element={<ChatRoom />} />
        <Route path="/chat" element={<ChatPage nickname={nickname} />} />
        <Route path="/leaderboards" element={<LeaderboardsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </div>
  );
}

export default App;
