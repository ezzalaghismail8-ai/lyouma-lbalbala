
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

interface FloatingAssistantProps {
  context: string;
}

const FloatingAssistant: React.FC<FloatingAssistantProps> = ({ context }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await geminiService.getAssistantResponse(input, context);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {isOpen ? (
        <div className="glass w-80 sm:w-96 h-[500px] rounded-[2.5rem] shadow-3xl flex flex-col overflow-hidden border border-purple-500/20 animate-in zoom-in duration-300">
          <div className="gradient-btn p-6 text-white flex justify-between items-center">
            <div className="flex items-center gap-3">
              <i className="fa-solid fa-sparkles text-sm"></i>
              <span className="font-black italic text-xs uppercase tracking-widest">Linguistic AI</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 w-8 h-8 rounded-xl flex items-center justify-center transition">
              <i className="fa-solid fa-times text-xs"></i>
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
            {messages.length === 0 && (
              <div className="text-center text-slate-500 mt-20 space-y-4 opacity-50">
                <i className="fa-solid fa-language text-4xl mb-2 gradient-text"></i>
                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Ask about nuances, grammar, or cultural context.</p>
              </div>
            )}
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] p-4 rounded-[1.5rem] text-xs leading-relaxed shadow-lg ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-br-none' 
                    : 'bg-white/10 text-slate-200 rounded-bl-none border border-white/5'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/5 p-4 rounded-[1.5rem] flex gap-1.5 items-center border border-white/5">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              </div>
            )}
          </div>

          <div className="p-6 border-t border-white/[0.03] bg-[#0F172A]/40">
            <div className="flex gap-3">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask your tutor..."
                className="flex-1 glass border-white/5 rounded-2xl px-5 py-4 text-xs focus:ring-2 focus:ring-purple-500 outline-none text-white placeholder:text-slate-600 font-medium"
              />
              <button 
                onClick={handleSend}
                className="gradient-btn text-white w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform active:scale-90"
              >
                <i className="fa-solid fa-paper-plane text-sm"></i>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setIsOpen(true)}
          className="gradient-btn text-white w-16 h-16 rounded-[2rem] shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-purple-600/30"
        >
          <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
        </button>
      )}
    </div>
  );
};

export default FloatingAssistant;
