import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from './api';

export default function ChatRoom() {
  const { roomCode } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const nickname = localStorage.getItem('nickname');

  useEffect(() => {
    if (!nickname) {
      navigate('/');
      return;
    }

    const fetchRoom = async () => {
      try {
        const data = await api.getRoom(roomCode);
        setRoom(data);
        setMessages(data.messages || []);
      } catch (error) {
        console.error('Failed to load room:', error);
        alert('Room not found!');
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchRoom();
  }, [roomCode, nickname, navigate]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    try {
      const message = await api.sendMessage(roomCode, nickname, input);
      setMessages([...messages, message]);
      setInput('');
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Failed to send message');
    }
  };

  if (loading) return <div className="p-8 text-center">Loading room...</div>;

  return (
    <div className="mx-auto max-w-2xl flex flex-col h-screen p-4">
      <div className="flex-1 overflow-y-auto mb-4 border rounded-lg p-4 bg-slate-900">
        {messages.length === 0 ? (
          <p className="text-center text-slate-400">No messages yet. Start the conversation with "Hi"!</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="mb-3 p-2 bg-slate-800 rounded">
              <strong className="text-crimson">{msg.sender}:</strong> {msg.text}
            </div>
          ))
        )}
      </div>

      <form onSubmit={handleSendMessage} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded text-white"
        />
        <button
          type="submit"
          className="btn-primary px-6"
        >
          Send
        </button>
      </form>
    </div>
  );
}
