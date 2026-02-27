
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import BrandIcon from './BrandIcon';
import { AppLanguage } from '../types';

interface LiveAssistantProps {
  onClose: () => void;
  currentLang: AppLanguage;
}

const LiveAssistant: React.FC<LiveAssistantProps> = ({ onClose, currentLang }) => {
  const isRTL = currentLang === 'ar';
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState(isRTL ? 'جاهز للتحدث...' : 'Ready to talk...');
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const encode = (bytes: Uint8Array) => {
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
  };

  const decode = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
    return bytes;
  };

  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number) => {
    const dataInt16 = new Int16Array(data.buffer);
    const frameCount = dataInt16.length / numChannels;
    const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = buffer.getChannelData(channel);
      for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
    return buffer;
  };

  const startSession = async () => {
    try {
      setStatus(isRTL ? 'جاري الاتصال...' : 'Connecting...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus(isRTL ? 'متصل - تحدث الآن' : 'Connected - Speak now');
            setIsActive(true);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: any) => {
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: () => setStatus(isRTL ? 'خطأ في الاتصال' : 'Connection error')
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: 'You are an expert translation tutor. Help the user improve their linguistic skills via live voice conversation.'
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus(isRTL ? 'تعذر بدء الجلسة' : 'Failed to start session');
    }
  };

  const stopSession = () => {
    setIsActive(false);
    setStatus(isRTL ? 'تم الفصل' : 'Disconnected');
    if (sessionRef.current) sessionRef.current.close();
    if (audioContextRef.current) audioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
  };

  return (
    <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6 text-slate-800 animate-in fade-in duration-500 overflow-hidden" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="w-full max-w-sm flex flex-col items-center gap-12 relative z-10">
        <div className={`w-56 h-56 rounded-[3.5rem] flex items-center justify-center relative transition-all duration-700 ${isActive ? 'bg-white shadow-[0_0_100px_rgba(236,72,153,0.1)] scale-110' : 'bg-slate-50'}`}>
          {isActive && (
            <div className="absolute inset-0 rounded-[3.5rem] border-4 border-purple-200 animate-ping opacity-30"></div>
          )}
          <div className="p-4 bg-white/40 rounded-full backdrop-blur-sm">
             <BrandIcon size={140} />
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black tracking-tight text-[#1E293B]">{isRTL ? 'المساعد الحي' : 'Live Assistant'}</h2>
          <p className={`text-xl font-bold transition-colors duration-500 ${isActive ? 'text-purple-600' : 'text-slate-400'}`}>
            {status}
          </p>
        </div>

        <div className="w-full space-y-5 px-4">
          {!isActive ? (
            <button 
              onClick={startSession} 
              className="w-full bg-[#FF3B5C] hover:bg-rose-600 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-rose-100 active:scale-95 transition flex items-center justify-center gap-3"
            >
               <i className="fa-solid fa-play-circle text-2xl"></i>
               {isRTL ? 'ابدأ التحدث الآن' : 'Start Talking Now'}
            </button>
          ) : (
            <button 
              onClick={stopSession} 
              className="w-full bg-[#9333EA] hover:bg-purple-700 text-white py-6 rounded-[2rem] font-black text-xl shadow-2xl shadow-purple-100 active:scale-95 transition flex items-center justify-center gap-3"
            >
               <i className="fa-solid fa-phone-slash text-2xl"></i>
               {isRTL ? 'إنهاء المكالمة' : 'End Call'}
            </button>
          )}
          
          <button 
            onClick={onClose} 
            className="w-full bg-[#FFD12C] hover:bg-yellow-400 text-[#1E293B] py-5 rounded-[2rem] font-black text-lg shadow-xl shadow-yellow-50 active:scale-95 transition"
          >
             {isRTL ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveAssistant;
