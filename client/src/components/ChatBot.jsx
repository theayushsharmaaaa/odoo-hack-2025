import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const ChatBot = () => {
  const { token } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! Ask me anything about Skill Swap 🤖' },
  ]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { from: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      setMessages(prev => [...prev, { from: 'bot', text: data.reply }]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { from: 'bot', text: 'Sorry, something went wrong. 😕' },
      ]);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {isOpen ? (
        <div className="bg-white w-80 rounded shadow-lg border flex flex-col">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-t flex justify-between items-center">
            <span>ChatBot</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>
          <div className="p-3 h-64 overflow-y-auto text-sm space-y-2">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded ${
                  msg.from === 'bot'
                    ? 'bg-gray-100 text-left'
                    : 'bg-blue-100 text-right'
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="flex border-t p-2">
            <input
              type="text"
              className="flex-1 px-2 py-1 border rounded-l"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Ask a question..."
            />
            <button
              onClick={sendMessage}
              className="bg-blue-600 text-white px-3 py-1 rounded-r"
            >
              ➤
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white rounded-full px-4 py-2 shadow hover:bg-blue-700"
        >
          💬
        </button>
      )}
    </div>
  );
};

export default ChatBot;

