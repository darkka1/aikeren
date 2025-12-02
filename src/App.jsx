import { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Load riwayat chat
  useEffect(() => {
    const saved = localStorage.getItem('zell_chat');
    if (saved) setMessages(JSON.parse(saved));
  }, []);

  // Auto scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: "user", content: input };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    // Typing indicator
    setMessages(prev => [...prev, { role: "assistant", content: "mengetik" }]);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer sk-or-v1-MASUKIN-KEY-OPENROUTER-KAMU-DI-SINI',
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:5173',
          'X-Title': 'Zell AI'
        },
        body: JSON.stringify({
          model: "google/gemini-flash-1.5",
          messages: [
            { role: "system", content: "Kamu adalah Zell AI — asisten yang cantik, ramah, jenaka, cerdas, dan selalu membantu dengan gaya santai." },
            ...newMessages.map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 1000
        })
      });

      const data = await response.json();
      const aiReply = data.choices?.[0]?.message?.content || "Maaf, aku lagi bingung nih…";

      setMessages(prev => {
        const updated = prev.slice(0, -1);
        updated.push({ role: "assistant", content: aiReply });
        localStorage.setItem('zell_chat', JSON.stringify(updated));
        return updated;
      });

    } catch (error) {
      setMessages(prev => {
        const updated = prev.slice(0, -1);
        updated.push({ role: "assistant", content: "Koneksi error, coba lagi ya!" });
        return updated;
      });
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-800 to-rose-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] bg-black/30 backdrop-blur-2xl rounded-3xl shadow-2xl overflow-hidden border border-white/10 flex flex-col">

        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6 text-center">
          <h1 className="text-5xl font-bold tracking-wider">ZELL AI</h1>
          <p className="mt-2 opacity-90">Unlimited • No Login • Super Ganteng</p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/20">
          {messages.length === 0 && (
            <div className="text-center text-white/70 mt-32">
              <div className="text-8xl mb-6">Wave</div>
              <p className="text-2xl">Halo! Aku Zell. Mau cerita apa hari ini?</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xl px-6 py-4 rounded-3xl shadow-lg animate-fadeIn ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white'
                  : msg.content === 'mengetik'
                    ? 'bg-gray-200'
                    : 'bg-white/90 text-gray-800'
              }`}>
                {msg.content === 'mengetik' ? (
                  <div className="flex space-x-2">
                    <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce delay-100"></div>
                    <div className="w-3 h-3 bg-gray-600 rounded-full animate-bounce delay-200"></div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-6 bg-black/40 border-t border-white/10">
          <div className="flex gap-4 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ketik pesan di sini..."
              className="flex-1 bg-white/20 backdrop-blur border border-white/30 rounded-full px-8 py-5 text-white placeholder-white/50 focus:outline-none focus:ring-4 focus:ring-pink-500/50 text-lg"
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading || !input.trim()}
              className="px-12 py-5 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full font-bold text-white hover:scale-105 transition disabled:opacity-50 shadow-2xl"
            >
              Kirim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;