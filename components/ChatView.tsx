
import React, { useState, useRef, useEffect } from 'react';
import { geminiService } from '../services/geminiService';
import { ChatMessage, AppLanguage } from '../types';
import BrandIcon from './BrandIcon';

interface ChatViewProps {
  lang: AppLanguage;
  context: string;
  onOpenLive: () => void;
}

const ChatView: React.FC<ChatViewProps> = ({ lang, context, onOpenLive }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const isRTL = lang === 'ar';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

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

  const HINTS = isRTL 
    ? ['كيف أترجم هذا المصطلح؟', 'صحح لي هذه الجملة', 'ما الفرق بين المعاني؟']
    : ['How to translate this?', 'Correct my sentence', 'Word usage nuances'];

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-52 scroll-smooth" ref={scrollRef}>
        {messages.length === 0 && (
          <div className="min-h-[70%] flex flex-col items-center justify-center text-center py-10 animate-in fade-in duration-1000">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-purple-100 blur-3xl opacity-30 rounded-full scale-150"></div>
              <BrandIcon size={140} className="relative z-10" />
            </div>
            
            <div className="space-y-4 px-8 mt-4">
              <h3 className="text-slate-800 font-black text-4xl tracking-tight leading-tight">{isRTL ? 'اسأل مساعدك الذكي' : 'Ask your AI Tutor'}</h3>
              <p className="text-slate-400 font-bold text-sm max-w-xs mx-auto">
                {isRTL 
                  ? 'أنا هنا لمساعدتك في ترجمة أي مصطلح أو فهم سياق المقاطع الصوتية والمرئية باحترافية.'
                  : 'I am here to help you translate terms or understand the context of audio and video clips professionally.'}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 px-4 mt-10">
              {HINTS.map((hint, i) => (
                <button 
                  key={i} 
                  onClick={() => setInput(hint)}
                  className="bg-slate-50 border border-slate-100 px-5 py-3 rounded-2xl text-[11px] font-black text-slate-500 hover:bg-white hover:border-purple-200 transition shadow-sm"
                >
                  {hint}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
            <div className={`max-w-[85%] group relative`}>
              <div className={`p-5 rounded-[2.2rem] text-sm leading-relaxed shadow-sm transition-all ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-br from-rose-500 to-rose-600 text-white rounded-br-none font-bold' 
                  : 'bg-white border-2 border-slate-50 text-slate-800 rounded-bl-none font-bold shadow-slate-100'
              }`}>
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
              <div className={`text-[9px] font-black text-slate-300 mt-2 px-2 uppercase tracking-widest ${msg.role === 'user' ? (isRTL ? 'text-left' : 'text-right') : (isRTL ? 'text-right' : 'text-left')}`}>
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start animate-in fade-in">
            <div className="bg-slate-50 p-5 rounded-[2rem] rounded-bl-none flex gap-2 items-center">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
            </div>
          </div>
        )}
      </div>

      {/* INPUT AREA */}
      <div className="fixed bottom-28 left-0 right-0 max-w-[450px] mx-auto px-6 z-[90]">
        <div className="relative p-[3px] rounded-[2.8rem] bg-gradient-to-r from-rose-400 via-purple-500 to-blue-400 shadow-2xl shadow-rose-200/50">
          <div className={`flex items-center bg-white rounded-[2.6rem] p-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`flex gap-2`}>
              <button 
                onClick={handleSend}
                disabled={!input.trim() || isTyping}
                className="w-12 h-12 bg-rose-500 text-white rounded-[1.4rem] flex items-center justify-center active:scale-90 transition shadow-lg disabled:opacity-30 disabled:grayscale"
              >
                <i className={`fa-solid fa-paper-plane text-sm ${isRTL ? 'rotate-180' : ''}`}></i>
              </button>

              <button 
                onClick={onOpenLive}
                className="w-12 h-12 bg-purple-600 text-white rounded-[1.4rem] flex items-center justify-center active:scale-90 transition shadow-lg"
              >
                <i className="fa-solid fa-microphone text-sm"></i>
              </button>
            </div>

            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRTL ? "اكتب سؤالك هنا..." : "Type your question..."}
              className="flex-1 bg-transparent px-5 py-4 text-base font-black outline-none text-slate-800 placeholder:text-slate-300"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatView;
