
import React, { useState, useEffect, useRef } from 'react';
import { MediaFile, TranslationExercise, Project, TranscriptionStep, AppLanguage, User, AppView, ThemeMode, ExerciseMode, Subtitle } from './types';
import { geminiService } from './services/geminiService';
import { authService } from './services/authService';
import { UI_STRINGS } from './constants';
import ChatView from './components/ChatView';
import BrandIcon from './components/BrandIcon';
import SettingsModal from './components/SettingsModal';
import LiveAssistant from './components/LiveAssistant';

const TARGET_LANGUAGES_DATA = [
  { name: "English", flag: "🇺🇸" },
  { name: "French", flag: "🇫🇷" },
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Spanish", flag: "🇪🇸" },
  { name: "German", flag: "🇩🇪" },
  { name: "Italian", flag: "🇮🇹" },
  { name: "Turkish", flag: "🇹🇷" },
  { name: "Chinese", flag: "🇨🇳" },
  { name: "Japanese", flag: "🇯🇵" },
  { name: "Korean", flag: "🇰🇷" },
  { name: "Russian", flag: "🇷🇺" },
  { name: "Portuguese", flag: "🇵🇹" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Dutch", flag: "🇳🇱" }
];

const ONBOARDING_STEPS = [
  {
    title: "Welcome to TransLearn Studio",
    desc: "Your professional gateway to mastering video and audio translation using cutting-edge AI technology.",
    icon: "fa-solid fa-wand-magic-sparkles",
    color: "from-rose-500 to-purple-600"
  },
  {
    title: "Easy File Upload",
    desc: "Upload your video or audio files directly, or practice with our curated training series.",
    icon: "fa-solid fa-cloud-arrow-up",
    color: "from-blue-500 to-indigo-600"
  },
  {
    title: "Two Training Modes",
    desc: "Choose 'Manual Training' to challenge yourself, or use 'AI Assistance' for real-time model translations.",
    icon: "fa-solid fa-keyboard",
    color: "from-orange-500 to-rose-500"
  },
  {
    title: "Listen and Translate",
    desc: "Hear every word clearly in our specialized player while you refine your translation skills.",
    icon: "fa-solid fa-headphones-simple",
    color: "from-purple-500 to-blue-500"
  },
  {
    title: "Intelligent Analysis",
    desc: "Our AI highlights errors and provides a professional score to measure your translation accuracy.",
    icon: "fa-solid fa-chart-pie",
    color: "from-green-500 to-teal-600"
  },
  {
    title: "10 Pro Tips",
    desc: "Get 10 personalized expert tips after every session to fast-track your linguistic improvement.",
    icon: "fa-solid fa-lightbulb",
    color: "from-yellow-500 to-orange-600"
  },
  {
    title: "Private Cloud Library",
    desc: "Securely store all your projects and translations in the cloud to track your learning journey.",
    icon: "fa-solid fa-box-archive",
    color: "from-rose-600 to-purple-700"
  },
  {
    title: "Ready to Begin?",
    desc: "Launch your training session now and become a professional translator with TransLearn Studio!",
    icon: "fa-solid fa-rocket",
    color: "from-purple-600 to-indigo-700"
  }
];

const SHARED_THUMB = 'https://i.ytimg.com/vi/KNwMiydCYA4/sddefault.jpg';

const DEMO_PROJECTS: Project[] = [
  {
    id: 'demo-mj-1',
    name: 'Human history part 1',
    mediaType: 'video/mp4',
    targetLanguage: 'Arabic',
    score: 100,
    timestamp: Date.now(),
    userTranslation: '',
    thumbnail: SHARED_THUMB, 
    isDemo: true,
    downloadUrl: 'https://www.mediafire.com/file/2n8mjzwwjl87u6p/WhatsApp_Video_2026-01-29_at_11.51.01_AM.mp4/file',
    exerciseData: { id: 'mj1', originalTranscription: '', sourceText: '', userTranslation: '', sourceLanguage: '', targetLanguage: '' }
  },
  {
    id: 'demo-mj-2',
    name: 'Human history part 2',
    mediaType: 'video/mp4',
    targetLanguage: 'Arabic',
    score: 100,
    timestamp: Date.now(),
    userTranslation: '',
    thumbnail: SHARED_THUMB, 
    isDemo: true,
    downloadUrl: 'https://www.mediafire.com/file/qw4czjvjk1vaa3k/VID-20260129-WA0049.mp4/file',
    exerciseData: { id: 'mj2', originalTranscription: '', sourceText: '', userTranslation: '', sourceLanguage: '', targetLanguage: '' }
  },
  {
    id: 'demo-mj-3',
    name: 'Human history part 3',
    mediaType: 'video/mp4',
    targetLanguage: 'Arabic',
    score: 100,
    timestamp: Date.now(),
    userTranslation: '',
    thumbnail: SHARED_THUMB, 
    isDemo: true,
    downloadUrl: 'https://www.mediafire.com/file/d74mr7nj8i7lgv1/VID-20260129-WA0041.mp4/file',
    exerciseData: { id: 'mj3', originalTranscription: '', sourceText: '', userTranslation: '', sourceLanguage: '', targetLanguage: '' }
  },
  {
    id: 'demo-mj-4',
    name: 'Human history part 4',
    mediaType: 'video/mp4',
    targetLanguage: 'Arabic',
    score: 100,
    timestamp: Date.now(),
    userTranslation: '',
    thumbnail: SHARED_THUMB, 
    isDemo: true,
    downloadUrl: 'https://www.mediafire.com/file/d74mr7nj8i7lgv1/VID-20260129-WA0041.mp4/file',
    exerciseData: { id: 'mj4', originalTranscription: '', sourceText: '', userTranslation: '', sourceLanguage: '', targetLanguage: '' }
  },
  {
    id: 'demo-mj-5',
    name: 'Human history part 5',
    mediaType: 'video/mp4',
    targetLanguage: 'Arabic',
    score: 100,
    timestamp: Date.now(),
    userTranslation: '',
    thumbnail: SHARED_THUMB, 
    isDemo: true,
    downloadUrl: 'https://www.mediafire.com/file/nh4k0b8rjz5nxmr/VID-20260129-WA0038.mp4/file',
    exerciseData: { id: 'mj5', originalTranscription: '', sourceText: '', userTranslation: '', sourceLanguage: '', targetLanguage: '' }
  }
];

const App: React.FC = () => {
  const [isSplash, setIsSplash] = useState(true);
  const [progress, setProgress] = useState(0);
  const [lang, setLang] = useState<AppLanguage>('en'); 
  const [theme, setTheme] = useState<ThemeMode>('light');
  const [fontSize, setFontSize] = useState(16);
  const [user, setUser] = useState<User | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  
  const [authEmail, setAuthEmail] = useState('');
  const [authPass, setAuthPass] = useState('');
  const [authUsername, setAuthUsername] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState('');

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingIndex, setOnboardingIndex] = useState(0);

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [transStep, setTransStep] = useState<TranscriptionStep>('idle');
  const [exerciseMode, setExerciseMode] = useState<ExerciseMode>('manual');
  const [activeMedia, setActiveMedia] = useState<MediaFile | null>(null);
  const [mediaDuration, setMediaDuration] = useState(0); 
  const [targetLang, setTargetLang] = useState('English');
  const [userText, setUserText] = useState('');
  const [activeExercise, setActiveExercise] = useState<TranslationExercise | null>(null);
  const [dateTime, setDateTime] = useState(new Date());
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [webViewUrl, setWebViewUrl] = useState<string | null>(null);

  const videoInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const videoPlayerRef = useRef<HTMLVideoElement>(null);

  const t = UI_STRINGS[lang];
  const isRTL = lang === 'ar';

  useEffect(() => {
    const duration = 2000;
    const interval = 50;
    const step = 100 / (duration / interval);
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(() => setIsSplash(false), 300);
          return 100;
        }
        return prev + step;
      });
    }, interval);

    const checkSession = async () => {
      try {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const up = await authService.getUserProjects(currentUser.id);
          setProjects(up);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAuth(false);
      }
    };
    
    checkSession();
    const clock = setInterval(() => setDateTime(new Date()), 1000);
    return () => {
      clearInterval(timer);
      clearInterval(clock);
    };
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setLoadingAuth(true);
    try {
      if (isSignUp) {
        const u = await authService.signUp(authEmail, authPass, authUsername);
        if (u) {
          setUser(u as User);
          setShowOnboarding(true); 
        }
      } else {
        const u = await authService.signIn(authEmail, authPass);
        if (u) {
          setUser(u as User);
          const up = await authService.getUserProjects(u.id);
          setProjects(up);
          setCurrentView('home');
        }
      }
    } catch (err: any) {
      setAuthError(err.message || (isRTL ? 'Error in Auth' : 'Authentication error'));
    } finally {
      setLoadingAuth(false);
    }
  };

  const handleNextOnboarding = () => {
    if (onboardingIndex < ONBOARDING_STEPS.length - 1) {
      setOnboardingIndex(prev => prev + 1);
    } else {
      setShowOnboarding(false);
      setCurrentView('home');
    }
  };

  const handleSkipOnboarding = () => {
    setShowOnboarding(false);
    setCurrentView('home');
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    setCurrentView('home');
    setProjects([]);
    setShowOnboarding(false);
    setOnboardingIndex(0);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'video' | 'audio') => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      const tempElement = document.createElement(type);
      tempElement.src = url;
      tempElement.onloadedmetadata = () => {
        setMediaDuration(tempElement.duration);
      };

      const r = new FileReader();
      r.onload = () => {
        setActiveMedia({ 
          name: file.name, 
          type: file.type, 
          size: file.size, 
          url: url, 
          base64: (r.result as string).split(',')[1] 
        });
        setTransStep('choice'); 
        setCurrentView('studio');
      };
      r.readAsDataURL(file);
    }
  };

  const formatDuration = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}m ${sec}s`;
  };

  const getWaitEstimate = (seconds: number) => {
    const estimate = Math.ceil((15 + (seconds * 0.2)) / 60);
    return estimate;
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && user) {
      const reader = new FileReader();
      reader.onload = () => {
        // FIXED: Renamed 'new avatar' to 'newAvatar' to fix syntax and reference error
        const newAvatar = reader.result as string;
        const updatedUser = { ...user, avatar: newAvatar };
        setUser(updatedUser);
        localStorage.setItem('tl_session', JSON.stringify(updatedUser));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStartFinal = async () => {
    if (!activeMedia) return;
    setTransStep('processing');
    try {
      let transcription = await geminiService.transcribe(activeMedia.base64!, activeMedia.type);
      let subtitles: Subtitle[] = [];
      let aiFullTranslation = "";

      if (exerciseMode === 'auto') {
        aiFullTranslation = await geminiService.translateText(transcription, targetLang);
        subtitles = await geminiService.getSubtitles(activeMedia.base64!, activeMedia.type, targetLang);
      }

      const exercise: TranslationExercise = {
        id: Date.now().toString(),
        originalTranscription: transcription,
        sourceText: transcription,
        userTranslation: '',
        sourceLanguage: 'Auto',
        targetLanguage: targetLang,
        subtitles: subtitles,
        aiTranslation: aiFullTranslation 
      };
      
      setActiveExercise(exercise);
      setUserText('');
      setTransStep(exerciseMode === 'auto' ? 'auto_workspace' : 'manual_workspace');
    } catch (e) {
      console.error("AI Error:", e);
      setTransStep('choice');
    }
  };

  const handleSaveToLibrary = async () => {
    if (!activeExercise || !activeMedia || !user) return;
    try {
      const newProject: Project = {
        id: activeExercise.id,
        name: activeMedia.name,
        mediaType: activeMedia.type,
        targetLanguage: targetLang,
        score: activeExercise.feedback?.score || 0,
        timestamp: Date.now(),
        userTranslation: userText,
        exerciseData: activeExercise,
        mediaUrl: activeMedia.url
      };
      await authService.saveProject(user.id, newProject);
      setProjects(prev => [newProject, ...prev]);
      alert("Saved successfully");
    } catch (err) {
      alert("Error saving project");
    }
  };

  const handleDownloadMedia = () => {
    if (!activeMedia) return;
    const link = document.createElement('a');
    link.href = activeMedia.url;
    link.download = `translated_${activeMedia.name}`;
    link.click();
  };

  const handleSubmitAnalysis = async () => {
    if (!activeExercise || !userText.trim()) return;
    setTransStep('processing');
    try {
      const feedback = await geminiService.analyzeTranslation({ ...activeExercise, userTranslation: userText }, targetLang);
      setActiveExercise({ ...activeExercise, userTranslation: userText, feedback });
      setTransStep(exerciseMode === 'auto' ? 'auto_workspace' : 'manual_workspace');
      setTimeout(() => {
        const el = document.getElementById('analysis-result');
        el?.scrollIntoView({ behavior: 'smooth' });
      }, 500);
    } catch (err) {
      setTransStep(exerciseMode === 'auto' ? 'auto_workspace' : 'manual_workspace');
    }
  };

  const getActiveSubtitle = () => {
    if (!activeExercise?.subtitles) return "";
    const sub = activeExercise.subtitles.find(s => currentTime >= s.start && currentTime <= s.end);
    return sub ? sub.text : "";
  };

  if (isSplash) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[1000] px-10">
        <BrandIcon size={130} className="animate-in zoom-in duration-700" />
        <div className="mt-20 w-full max-w-xs h-3 bg-slate-50 rounded-full overflow-hidden relative border border-slate-100 shadow-inner">
          <div className="h-full bg-gradient-to-r from-[#EF4444] via-[#9333EA] to-[#3B82F6] transition-all duration-300 ease-linear rounded-full" style={{ width: `${progress}%` }} />
        </div>
        <p className="mt-8 text-[12px] font-black text-slate-400 uppercase tracking-[0.5em] animate-pulse text-center">
          Welcome to TransLearn Studio
        </p>
      </div>
    );
  }

  if (showOnboarding && user) {
    const currentOnboarding = ONBOARDING_STEPS[onboardingIndex];
    return (
      <div className="fixed inset-0 bg-white z-[500] flex flex-col p-8 items-center justify-center text-center animate-in fade-in" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="w-full max-w-sm space-y-12">
           <div className={`w-32 h-32 mx-auto rounded-[2.5rem] bg-gradient-to-br ${currentOnboarding.color} flex items-center justify-center text-white text-5xl shadow-2xl animate-bounce duration-1000`}>
              <i className={currentOnboarding.icon}></i>
           </div>
           
           <div className="space-y-4">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">{currentOnboarding.title}</h2>
              <p className="text-base font-bold text-slate-500 leading-relaxed">{currentOnboarding.desc}</p>
           </div>

           <div className="flex justify-center gap-2">
              {ONBOARDING_STEPS.map((_, i) => (
                <div key={i} className={`h-2 rounded-full transition-all duration-300 ${i === onboardingIndex ? 'w-8 bg-rose-500' : 'w-2 bg-slate-200'}`}></div>
              ))}
           </div>

           <div className="w-full flex flex-col gap-3">
             <button 
               onClick={handleNextOnboarding}
               className="w-full bg-rose-500 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-rose-100 active:scale-95 transition-all flex items-center justify-center gap-3"
             >
                {onboardingIndex === ONBOARDING_STEPS.length - 1 ? 'Start Studio' : 'Next'}
                <i className={`fa-solid fa-arrow-right`}></i>
             </button>
             
             {onboardingIndex < ONBOARDING_STEPS.length - 1 && (
               <button 
                onClick={handleSkipOnboarding}
                className="py-3 text-[11px] font-black text-slate-300 uppercase tracking-widest hover:text-rose-500 transition"
               >
                 Skip
               </button>
             )}
           </div>
        </div>
      </div>
    );
  }

  if (!user && !loadingAuth) {
    return (
      <div className="app-container bg-white overflow-y-auto w-full flex flex-col p-8 items-center" dir={isRTL ? 'rtl' : 'ltr'}>
        <div className="flex flex-col items-center gap-8 py-10 w-full max-w-sm">
           <BrandIcon size={120} />
           <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-800">{isSignUp ? 'Sign Up' : 'Sign In'}</h2>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Master Video Translation</p>
           </div>

           <form onSubmit={handleAuthSubmit} className="w-full space-y-4">
              {isSignUp && (
                <div className="relative group">
                  <i className="fa-solid fa-user absolute top-1/2 -translate-y-1/2 left-5 text-rose-300"></i>
                  <input required value={authUsername} onChange={(e) => setAuthUsername(e.target.value)} type="text" placeholder="Username" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-5 font-bold outline-none focus:border-rose-400 focus:bg-white transition-all text-sm" />
                </div>
              )}
              <div className="relative group">
                <i className="fa-solid fa-envelope absolute top-1/2 -translate-y-1/2 left-5 text-rose-300"></i>
                <input required value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-5 font-bold outline-none focus:border-rose-400 focus:bg-white transition-all text-sm" />
              </div>
              <div className="relative group">
                <i className="fa-solid fa-lock absolute top-1/2 -translate-y-1/2 left-5 text-purple-300"></i>
                <input required value={authPass} onChange={(e) => setAuthPass(e.target.value)} type="password" placeholder="Password" className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-5 font-bold outline-none focus:border-purple-400 focus:bg-white transition-all text-sm" />
              </div>

              {authError && <p className="text-rose-500 text-[11px] font-black text-center animate-bounce">{authError}</p>}

              <button type="submit" disabled={loadingAuth} className="w-full relative group mt-4">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-purple-600 rounded-[1.8rem] blur opacity-30"></div>
                <div className="relative bg-[#F43F5E] text-white py-5 rounded-[1.8rem] font-black text-lg active:scale-95 transition-all flex items-center justify-center gap-2 border border-rose-400/20 shadow-xl shadow-rose-100">
                  {loadingAuth ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </div>
              </button>
           </form>

           <div className="flex flex-col gap-4 w-full text-center mt-6">
              <button 
                onClick={() => { setIsSignUp(!isSignUp); setAuthError(''); }} 
                className="w-full py-4 rounded-2xl border-2 border-purple-100 text-purple-600 text-[12px] font-black hover:bg-purple-50 transition active:scale-95"
              >
                {isSignUp ? 'Have an account? Sign In' : 'No account? Sign Up'}
              </button>
           </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container bg-white overflow-hidden h-screen w-full flex flex-col ${theme === 'dark' ? 'dark' : ''}`} style={{ fontSize: `${fontSize}px` }} dir={isRTL ? 'rtl' : 'ltr'}>
      <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => handleFileUpload(e, 'video')} />
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(e, 'audio')} />
      <input type="file" ref={avatarInputRef} className="hidden" accept="image/*" onChange={handleAvatarChange} />
      {showLiveChat && <LiveAssistant onClose={() => setShowLiveChat(false)} currentLang={lang} />}
      
      {webViewUrl && (
        <div className="fixed inset-0 z-[500] bg-white animate-in slide-in-from-bottom-full duration-500 flex flex-col">
          <div className="bg-slate-900 px-4 py-6 flex justify-between items-center text-white shrink-0 shadow-2xl">
            <button onClick={() => setWebViewUrl(null)} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center active:scale-90 transition">
              <i className="fa-solid fa-xmark text-2xl"></i>
            </button>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-rose-400">Media Navigator</span>
              <span className="text-xs font-bold truncate max-w-[180px] opacity-60">Save Video to Device</span>
            </div>
            <div className="w-12"></div>
          </div>
          
          <div className="flex-1 w-full bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-8 text-center space-y-12">
             <div className="relative group">
                <div className="absolute inset-0 bg-blue-500/10 blur-3xl rounded-full scale-150 animate-pulse"></div>
                <div className="relative w-32 h-32 bg-white rounded-[3rem] shadow-2xl flex items-center justify-center border-4 border-blue-50 ring-8 ring-blue-50/50">
                   <i className="fa-solid fa-cloud-arrow-down text-5xl text-blue-600"></i>
                </div>
             </div>
             
             <div className="space-y-6 max-w-sm">
                <div className="space-y-2">
                   <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-tight">Ready to download?</h3>
                   <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full"></div>
                </div>
                
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 text-left space-y-4">
                   <p className="text-sm font-bold text-slate-600 leading-relaxed">
                     Please follow these instructions carefully:
                   </p>
                   <ul className="space-y-4 text-[13px] font-black text-slate-500">
                      <li className="flex items-center gap-3">
                         <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">1</span>
                         <span>Click "Install File" to download video to your device.</span>
                      </li>
                      <li className="flex items-center gap-3">
                         <span className="w-8 h-8 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center shrink-0">2</span>
                         <span>Once download finishes, close this window.</span>
                      </li>
                      <li className="flex items-center gap-3">
                         <span className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center shrink-0">3</span>
                         <span>Click "Upload Video" in the Studio and select the file.</span>
                      </li>
                   </ul>
                </div>
             </div>

             <div className="w-full max-w-xs space-y-4">
                <button 
                  onClick={() => window.open(webViewUrl, '_blank')}
                  className="w-full bg-blue-600 text-white py-6 rounded-[2.5rem] font-black shadow-2xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-4 text-xl border-b-4 border-blue-900"
                >
                   <i className="fa-solid fa-download text-2xl"></i>
                   Install File Now
                </button>
                <button 
                  onClick={() => setWebViewUrl(null)}
                  className="w-full py-4 text-[13px] font-black text-rose-500 uppercase tracking-widest hover:underline transition-all"
                >
                   Downloaded, Back to Studio
                </button>
             </div>
          </div>

          <div className="p-6 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center justify-center gap-2 opacity-30 grayscale pointer-events-none">
               <BrandIcon size={24} />
               <span className="text-[10px] font-black uppercase tracking-widest">Internal Media Hub v2.0</span>
            </div>
          </div>
        </div>
      )}

      <header className="flex justify-between items-center w-full px-4 py-2 bg-white z-20 shrink-0 relative min-h-[70px]">
        <div className={`flex items-center gap-3`}>
          <div className="flex flex-col items-center">
            <p className="text-[15px] font-black text-blue-600 tracking-tighter leading-tight">
              {dateTime.getHours().toString().padStart(2, '0')}:{dateTime.getMinutes().toString().padStart(2, '0')}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">
              {dateTime.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
            </p>
          </div>
          <button onClick={() => setCurrentView('settings')} className="w-8 h-8 bg-slate-50 rounded-lg flex items-center justify-center text-purple-600 border border-slate-100 transition active:scale-90">
            <i className="fa-solid fa-gear text-xs"></i>
          </button>
        </div>

        <div className="cursor-pointer shrink-0 flex items-center justify-center" onClick={() => {setCurrentView('home'); setTransStep('idle');}}>
          <BrandIcon size={38} />
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-purple-500 via-rose-500 to-purple-500 shadow-[0_0_8px_rgba(147,51,234,0.5)]"></div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32 px-5 bg-white relative">
        {currentView === 'home' && (
          <div className="space-y-7 animate-in pt-6 pb-10 text-center">
            <div className="space-y-1">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Hello, <span className="text-rose-500">{user?.username}</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Welcome to TransLearn Studio</p>
            </div>

            <div onClick={() => {setExerciseMode('manual'); setTransStep('idle'); setCurrentView('studio');}} className="h-28 bg-rose-500 rounded-[2.2rem] p-7 flex flex-row-reverse items-center justify-between shadow-xl shadow-rose-100 active:scale-95 transition cursor-pointer group">
               <div className="text-left">
                  <h3 className="text-lg font-black text-white">Manual Training</h3>
                  <p className="text-[9px] text-white/80 font-bold">Challenge your skills now</p>
               </div>
               <i className="fa-solid fa-graduation-cap text-3xl text-white/30 group-hover:scale-110 transition-transform"></i>
            </div>

            <div onClick={() => setCurrentView('library')} className="h-28 bg-purple-600 rounded-[2.2rem] p-7 flex flex-row-reverse items-center justify-between shadow-xl shadow-purple-100 active:scale-95 transition cursor-pointer group">
               <div className="text-left">
                  <h3 className="text-lg font-black text-white">Private Library</h3>
                  <p className="text-[9px] text-white/80 font-bold">{projects.length} saved items</p>
               </div>
               <i className="fa-solid fa-folder-open text-3xl text-white/30 group-hover:scale-110 transition-transform"></i>
            </div>

            <div className="space-y-4 pt-2">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Videos that can be translated</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {DEMO_PROJECTS.map((demo, idx) => (
                  <div key={demo.id} 
                    onClick={() => {
                      if (demo.downloadUrl) {
                        setWebViewUrl(demo.downloadUrl);
                      } else {
                        setActiveMedia({ name: demo.name, type: 'video/mp4', size: 0, url: demo.thumbnail, base64: "" });
                        setTransStep('choice');
                        setCurrentView('studio');
                      }
                    }}
                    className={`bg-white p-2 rounded-[1.8rem] flex flex-col items-center text-center shadow-md active:scale-95 transition ring-4 relative group overflow-hidden ${idx === 0 ? 'ring-rose-500 shadow-rose-100' : (idx % 2 === 0 ? 'ring-rose-50' : 'ring-purple-50')}`}
                  >
                    <div className="relative w-full aspect-video rounded-[1.2rem] overflow-hidden">
                        <img src={demo.thumbnail} className="w-full h-full object-cover" alt="thumb" />
                    </div>
                    {/* Updated logic: Show title for all videos including part 1 */}
                    <h4 className="font-black text-slate-800 text-[10px] truncate w-full px-1 mt-2">{demo.name}</h4>
                    <span className="text-[8px] font-black text-rose-500 mt-1">Install & Train</span>
                    {demo.downloadUrl && (
                      <div className="absolute top-2 left-2 w-6 h-6 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center text-white text-[10px]">
                        <i className="fa-solid fa-download"></i>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-loose">
                 Install to your device then upload in the Studio
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
               <button onClick={() => audioInputRef.current?.click()} className="h-32 bg-orange-500 rounded-[2.2rem] flex flex-col items-center justify-center gap-3 text-white shadow-xl shadow-orange-100 active:scale-95 transition">
                  <i className="fa-solid fa-microphone text-2xl"></i>
                  <span className="font-black text-[11px]">Upload Audio</span>
               </button>
               <button onClick={() => videoInputRef.current?.click()} className="h-32 bg-blue-600 rounded-[2.2rem] flex flex-col items-center justify-center gap-3 text-white shadow-xl shadow-blue-100 active:scale-95 transition">
                  <i className="fa-solid fa-clapperboard text-2xl"></i>
                  <span className="font-black text-[11px]">Upload Video</span>
               </button>
            </div>
          </div>
        )}

        {currentView === 'studio' && (
          <div className="pt-8 animate-in space-y-8 text-center">
            {transStep === 'idle' && (
              <div className="flex flex-col items-center space-y-10 animate-in pb-10">
                 <div className="p-8 bg-slate-50 rounded-[3.5rem] shadow-inner">
                    <BrandIcon size={100} />
                 </div>
                 <h2 className="text-3xl font-black text-slate-800 tracking-tight">Translation Studio</h2>
                 <div className="w-full space-y-4 px-2">
                    <button onClick={() => videoInputRef.current?.click()} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-blue-100 active:scale-95 transition flex items-center justify-center gap-4">
                       <i className="fa-solid fa-clapperboard"></i> Upload Video
                    </button>
                    <button onClick={() => audioInputRef.current?.click()} className="w-full bg-orange-500 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-orange-100 active:scale-95 transition flex items-center justify-center gap-4">
                       <i className="fa-solid fa-microphone"></i> Upload Audio
                    </button>
                    <button onClick={() => setCurrentView('home')} className="w-full bg-rose-500 text-white py-6 rounded-[2rem] font-black text-lg shadow-xl shadow-rose-100 active:scale-95 transition flex items-center justify-center gap-4 mt-4">
                       <i className="fa-solid fa-house"></i> Back to Home
                    </button>
                 </div>
              </div>
            )}

            {transStep === 'choice' && (
              <div className="space-y-6 animate-in py-5 pb-20">
                <div className="bg-slate-50 p-6 rounded-[2rem] flex flex-col items-center gap-4 border border-slate-100">
                   {activeMedia?.type.includes('video') ? <i className="fa-solid fa-file-video text-3xl text-blue-500"></i> : <i className="fa-solid fa-file-audio text-3xl text-orange-500"></i>}
                   <p className="font-black text-slate-800 text-[11px] truncate w-full text-center">{activeMedia?.name}</p>
                </div>

                <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block text-center mb-2">Target Language</label>
                  <div className="grid grid-cols-3 gap-3">
                    {TARGET_LANGUAGES_DATA.map((l) => (
                      <button 
                        key={l.name}
                        onClick={() => setTargetLang(l.name)}
                        className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                          targetLang === l.name 
                          ? 'border-blue-500 bg-blue-50 text-blue-600 shadow-md ring-2 ring-blue-100' 
                          : 'border-slate-50 bg-slate-50 text-slate-400 opacity-60'
                        }`}
                      >
                        <span className="text-2xl mb-1">{l.flag}</span>
                        <span className="text-[10px] font-black whitespace-nowrap">{l.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button onClick={() => setExerciseMode('auto')} className={`p-5 rounded-2xl border-2 font-black text-xs transition-all ${exerciseMode === 'auto' ? 'border-purple-500 bg-purple-50 text-purple-600 shadow-inner' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                    <i className="fa-solid fa-magic mb-2 text-xl block"></i> AI Assisted
                  </button>
                  <button onClick={() => setExerciseMode('manual')} className={`p-5 rounded-2xl border-2 font-black text-xs transition-all ${exerciseMode === 'manual' ? 'border-rose-500 bg-rose-50 text-rose-600 shadow-inner' : 'border-slate-50 bg-slate-50 text-slate-400'}`}>
                    <i className="fa-solid fa-keyboard mb-2 text-xl block"></i> Manual Training
                  </button>
                </div>
                
                <button onClick={handleStartFinal} className="w-full bg-blue-600 text-white py-6 rounded-[2rem] font-black shadow-xl active:scale-95 transition-all mt-4 text-xl">
                  Start Session
                </button>
              </div>
            )}

            {transStep === 'processing' && (
              <div className="flex flex-col items-center justify-center gap-8 py-20 animate-in">
                 <div className="relative">
                    <div className="w-20 h-20 border-4 border-slate-100 border-t-rose-500 rounded-full animate-spin"></div>
                    <i className="fa-solid fa-hourglass-half absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-purple-500 text-xl animate-bounce"></i>
                 </div>
                 
                 <div className="text-center space-y-4 max-w-xs">
                    <h3 className="font-black text-xl text-slate-800">Processing Media...</h3>
                    
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 space-y-3 shadow-inner">
                       <div className="flex flex-row-reverse items-center justify-between text-[11px] font-black">
                          <span className="text-rose-500">{formatDuration(mediaDuration)}</span>
                          <span className="text-slate-400 uppercase">Duration:</span>
                       </div>
                       <div className="h-[2px] bg-slate-200 rounded-full"></div>
                       <div className="text-[10px] font-bold text-slate-500 leading-relaxed">
                          Please wait about {getWaitEstimate(mediaDuration)} minutes for full AI analysis.
                       </div>
                    </div>
                    
                    <p className="text-[9px] font-black text-purple-400 uppercase tracking-widest animate-pulse">
                        Do not close the application
                    </p>
                 </div>
              </div>
            )}

            {(transStep === 'manual_workspace' || transStep === 'auto_workspace') && activeExercise && (
              <div className="space-y-6 animate-in py-4 pb-20">
                <div className="relative w-full aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl">
                   {activeMedia?.type.includes('video') ? (
                     <video ref={videoPlayerRef} src={activeMedia.url} className="w-full h-full object-contain" controls onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} />
                   ) : (
                     <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 p-8 text-white space-y-4">
                        <i className="fa-solid fa-microphone text-5xl text-rose-500 animate-pulse"></i>
                        <audio controls src={activeMedia?.url} className="w-full" onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)} />
                     </div>
                   )}
                   {exerciseMode === 'auto' && getActiveSubtitle() && (
                     <div className="absolute bottom-12 left-0 right-0 px-4 text-center pointer-events-none">
                        <span className="bg-black/70 text-white px-4 py-2 rounded-lg text-sm font-bold border border-white/10 shadow-lg">{getActiveSubtitle()}</span>
                     </div>
                   )}
                </div>

                {exerciseMode === 'auto' && activeExercise.aiTranslation && (
                  <div className="bg-blue-50 p-6 rounded-[2.2rem] border-2 border-blue-100 space-y-3 animate-in fade-in">
                     <div className="flex flex-row-reverse items-center gap-2">
                        <h4 className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">AI Model Translation</h4>
                        <i className="fa-solid fa-sparkles text-blue-500"></i>
                     </div>
                     <p className="text-sm font-bold text-blue-900 leading-relaxed max-h-48 overflow-y-auto pr-2 custom-scrollbar whitespace-pre-wrap text-left">{activeExercise.aiTranslation}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleSaveToLibrary} className="flex-1 bg-purple-600 text-white py-4 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                      <i className="fa-solid fa-cloud-arrow-up"></i> Save to Library
                   </button>
                   <button onClick={handleDownloadMedia} className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition flex items-center justify-center gap-2">
                      <i className="fa-solid fa-download"></i> Save to Device
                   </button>
                </div>

                <div className="space-y-4 pt-2">
                   <div className="flex flex-row-reverse justify-between items-center px-2">
                      <span className="text-[9px] font-black text-slate-300">{userText.length} chars</span>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Translation</h4>
                   </div>
                   <textarea value={userText} onChange={(e) => setUserText(e.target.value)} placeholder="Type your translation here..." className="w-full bg-slate-50 border-2 border-slate-100 rounded-[2.2rem] p-6 h-48 text-sm font-bold outline-none focus:border-rose-400 focus:bg-white transition-all shadow-inner custom-scrollbar text-left" />
                </div>

                <button onClick={handleSubmitAnalysis} disabled={!userText.trim()} className="w-full bg-rose-500 text-white py-6 rounded-[2rem] font-black text-xl shadow-xl shadow-rose-100 disabled:opacity-50 transition-all flex items-center justify-center gap-3">
                  <i className="fa-solid fa-chart-line"></i> Analyze Accuracy
                </button>

                {activeExercise.feedback && (
                  <div id="analysis-result" className="space-y-6 animate-in py-8 border-t-4 border-rose-50 mt-4">
                    <div className="text-center space-y-2">
                       <div className="text-7xl font-black text-rose-500 drop-shadow-sm">%{activeExercise.feedback.score}</div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Accuracy Score</p>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-[2.2rem] border-2 border-slate-100 space-y-3">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">Your Text (Error Map)</h4>
                       <div className="text-sm font-bold text-slate-800 leading-relaxed text-left">
                          {userText.split(' ').map((word, i) => {
                            const isError = activeExercise.feedback?.incorrectWords.some(ew => word.toLowerCase().includes(ew.toLowerCase()));
                            return <span key={i} className={isError ? "text-red-500 underline decoration-wavy underline-offset-4" : ""}>{word}{' '}</span>;
                          })}
                       </div>
                    </div>

                    <div className="bg-green-50 p-6 rounded-[2.2rem] border-2 border-green-100 space-y-3 shadow-sm">
                       <h4 className="text-[10px] font-black text-green-600 uppercase tracking-widest text-left">Reference Translation</h4>
                       <p className="text-sm font-bold text-green-900 leading-relaxed italic whitespace-pre-wrap text-left">{activeExercise.feedback.aiReference}</p>
                    </div>

                    <div className="space-y-4">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase px-2 text-left">10 Professional Tips</h4>
                       <div className="grid grid-cols-1 gap-2">
                          {activeExercise.feedback.suggestions.slice(0, 10).map((tip, i) => (
                            <div key={i} className="bg-white border border-slate-100 p-4 rounded-2xl flex flex-row-reverse items-start gap-3 shadow-sm">
                               <p className="text-[11px] font-bold text-slate-700 leading-tight flex-1 text-left">{tip}</p>
                               <span className="w-6 h-6 bg-rose-100 text-rose-500 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0">{i+1}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {currentView === 'profile' && (
          <div className="p-4 flex flex-col items-center gap-6 text-center animate-in pt-8 pb-20">
            <div className="relative group cursor-pointer" onClick={() => avatarInputRef.current?.click()}>
              <div className="absolute inset-0 bg-rose-100 blur-2xl opacity-40 rounded-full scale-125"></div>
              <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-lg relative z-10 border-4 border-rose-50 overflow-hidden">
                 {user?.avatar ? (
                   <img src={user.avatar} className="w-full h-full object-cover" alt="Avatar" />
                 ) : (
                   <i className="fa-solid fa-user-astronaut text-4xl text-rose-400"></i>
                 )}
                 <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                   <i className="fa-solid fa-camera text-white text-xl"></i>
                 </div>
              </div>
            </div>
            <div className="w-full space-y-5 px-2">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">{user?.username}</h2>
              <p className="text-xs font-bold text-slate-400">{user?.email}</p>
              
              <div className="space-y-4 pt-6">
                <button onClick={() => avatarInputRef.current?.click()} className="w-full bg-slate-50 border border-slate-100 py-4 rounded-2xl font-black text-xs text-slate-600 active:scale-95 transition">
                    Edit Profile Photo
                </button>
                <button onClick={handleLogout} className="w-full bg-rose-500 text-white py-5 rounded-[1.8rem] font-black text-lg active:scale-95 transition-all shadow-xl shadow-rose-100">
                    Sign Out
                </button>
              </div>
            </div>
          </div>
        )}

        {currentView === 'library' && (
          <div className="pt-6 animate-in space-y-6">
             <h2 className="text-2xl font-black text-slate-800 text-left">Private Cloud Library</h2>
             {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-200">
                   <i className="fa-solid fa-folder-open text-7xl mb-4"></i>
                   <p className="font-bold">No cloud projects yet</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 gap-4">
                   {projects.map(p => (
                      <div key={p.id} onClick={() => {
                        setActiveMedia({ name: p.name, type: p.mediaType, size: 0, url: p.mediaUrl || "" });
                        setActiveExercise(p.exerciseData);
                        setTargetLang(p.targetLanguage);
                        setUserText(p.userTranslation);
                        setTransStep(p.exerciseData.subtitles && p.exerciseData.subtitles.length > 0 ? 'auto_workspace' : 'manual_workspace');
                        setCurrentView('studio');
                      }} className="bg-white p-4 rounded-[1.8rem] flex flex-row-reverse items-center gap-4 border border-slate-100 shadow-md active:scale-95 transition cursor-pointer">
                         <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center shadow-inner shrink-0">
                            <i className="fa-solid fa-file-video text-rose-500 text-xl"></i>
                         </div>
                         <div className="flex-1 text-left overflow-hidden">
                            <h4 className="font-black text-xs text-slate-800 truncate">{p.name}</h4>
                            <span className="text-[9px] font-bold text-slate-400">{p.targetLanguage}</span>
                         </div>
                         <div className="text-rose-500 font-black text-lg">%{p.score}</div>
                      </div>
                   ))}
                </div>
             )}
          </div>
        )}

        {currentView === 'chat' && <ChatView lang={lang} context="User is practicing translation." onOpenLive={() => setShowLiveChat(true)} />}
        {currentView === 'settings' && (
          <SettingsModal 
            isOpen={true} 
            onClose={() => setCurrentView('home')} 
            lang={lang} 
            setLang={setLang} 
            theme={theme} 
            setTheme={setTheme} 
            fontSize={fontSize} 
            setFontSize={setFontSize} 
            isInstalled={false} 
            onInstall={() => {}} 
            canInstall={false} 
            projects={projects}
          />
        )}
      </main>

      <footer className="flex justify-around items-center h-20 fixed bottom-0 w-full max-w-[450px] mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 z-[100] pb-2 px-4 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
        <button onClick={() => setCurrentView('home')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentView === 'home' ? 'text-purple-600 scale-105' : 'text-orange-400'}`}>
          <i className="fa-solid fa-house-chimney text-xl"></i>
          <span className="text-[8px] font-black uppercase tracking-widest">{t.home}</span>
        </button>
        <button onClick={() => setCurrentView('studio')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentView === 'studio' ? 'text-purple-600 scale-105' : 'text-orange-400'}`}>
          <i className="fa-solid fa-clapperboard text-xl"></i>
          <span className="text-[8px] font-black uppercase tracking-widest">{t.studio}</span>
        </button>
        <button onClick={() => setCurrentView('chat')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentView === 'chat' ? 'text-purple-600 scale-105' : 'text-orange-400'}`}>
          <i className="fa-solid fa-comment-dots text-xl"></i>
          <span className="text-[8px] font-black uppercase tracking-widest">{t.chat}</span>
        </button>
        <button onClick={() => setCurrentView('profile')} className={`flex-1 flex flex-col items-center gap-1 transition-all ${currentView === 'profile' ? 'text-purple-600 scale-105' : 'text-orange-400'}`}>
          <i className="fa-solid fa-user-circle text-xl"></i>
          <span className="text-[8px] font-black uppercase tracking-widest">{t.profile}</span>
        </button>
      </footer>
    </div>
  );
};

export default App;
