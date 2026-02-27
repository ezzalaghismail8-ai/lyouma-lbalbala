
import React from 'react';
import { AppLanguage, ThemeMode, Project } from '../types';
import { LANGUAGES, UI_STRINGS } from '../constants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: AppLanguage;
  setLang: (lang: AppLanguage) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  fontSize: number;
  setFontSize: (size: number) => void;
  isInstalled: boolean;
  onInstall: () => void;
  canInstall: boolean;
  projects?: Project[];
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  lang, setLang, theme, setTheme, fontSize, setFontSize, onClose, projects = [] 
}) => {
  const isRTL = lang === 'ar';
  const t = UI_STRINGS[lang];
  const allowedLangs = LANGUAGES.filter(l => ['ar', 'en', 'fr'].includes(l.code));

  const averageScore = projects.length > 0 
    ? Math.round(projects.reduce((acc, p) => acc + p.score, 0) / projects.length)
    : 0;

  return (
    <div className={`h-full overflow-y-auto pb-32 animate-in slide-in-from-bottom-10 bg-white dark:bg-slate-900`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="p-6 space-y-8">
        <div className={`flex justify-between items-center ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
          <h2 className="text-2xl font-black uppercase tracking-tighter">{t.settings}</h2>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center border border-slate-100">
            <i className={`fa-solid fa-xmark text-slate-400`}></i>
          </button>
        </div>

        {/* User Stats Summary Section */}
        <section className="bg-gradient-to-br from-purple-600 to-blue-600 p-6 rounded-[2.2rem] text-white shadow-xl shadow-purple-100">
           <div className="grid grid-cols-2 gap-4">
              <div className="text-center space-y-1">
                 <p className="text-[10px] font-black uppercase opacity-60">{isRTL ? 'متوسط الدقة' : 'Avg. Accuracy'}</p>
                 <div className="text-3xl font-black">%{averageScore}</div>
              </div>
              <div className="text-center space-y-1 border-r border-white/10">
                 <p className="text-[10px] font-black uppercase opacity-60">{isRTL ? 'إجمالي المشاريع' : 'Total Projects'}</p>
                 <div className="text-3xl font-black">{projects.length}</div>
              </div>
           </div>
        </section>
        
        <div className="space-y-8">
          <section className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'لغة الواجهة' : 'Interface Language'}</label>
            <div className="grid grid-cols-3 gap-3">
              {allowedLangs.map((l) => (
                <button
                  key={l.code}
                  onClick={() => setLang(l.code as AppLanguage)}
                  className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all ${
                    lang === l.code ? 'border-purple-500 bg-purple-50 text-purple-600' : 'bg-slate-50 border-slate-50 text-slate-400'
                  }`}
                >
                  <span className="text-2xl mb-1">{l.flag}</span>
                  <span className="text-[9px] font-black">{l.label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'نمط العرض' : 'Appearance'}</label>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl gap-2 border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setTheme('light')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition ${theme === 'light' ? 'bg-white text-purple-600 shadow-md' : 'text-slate-400'}`}
              >
                <i className="fa-solid fa-sun text-xs"></i>
                <span className="text-[10px] font-black uppercase">{isRTL ? 'نهاري' : 'Light'}</span>
              </button>
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition ${theme === 'dark' ? 'bg-slate-700 text-white shadow-md' : 'text-slate-400'}`}
              >
                <i className="fa-solid fa-moon text-xs"></i>
                <span className="text-[10px] font-black uppercase">{isRTL ? 'ليلي' : 'Dark'}</span>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{isRTL ? 'حجم النصوص' : 'Text Size'}</label>
            <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
               <input type="range" min="14" max="24" value={fontSize} onChange={(e) => setFontSize(parseInt(e.target.value))} className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none accent-purple-600" />
               <div className="flex justify-between mt-2 text-[10px] font-black text-slate-400 uppercase"><span>Small</span><span>Large</span></div>
            </div>
          </section>
        </div>

        <button onClick={onClose} className="w-full bg-purple-600 py-5 rounded-[1.8rem] font-black text-white shadow-xl shadow-purple-100 active:scale-95 transition-all">
          {isRTL ? 'حفظ وإغلاق' : 'Save & Close'}
        </button>
      </div>
    </div>
  );
};

export default SettingsModal;
