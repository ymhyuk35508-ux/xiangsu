/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Upload, 
  Settings, 
  Grid, 
  CheckCircle2, 
  Zap, 
  Sparkles, 
  Download, 
  RefreshCw,
  Camera,
  Image as ImageIcon,
  Loader2,
  Languages,
  ChevronDown
} from 'lucide-react';
import { generatePixelAvatar } from './services/ai';

type Phase = 'idle' | 'analyzing' | 'synthesizing' | 'complete';
type Language = 'en' | 'zh-CN' | 'zh-TW';

const translations = {
  en: {
    title: 'NYX AVATAR LAB',
    upload: 'Upload & Create',
    processing: 'Processing...',
    description: 'Drop your high-fidelity portrait here to begin the neural pixel synthesis. Our lab transforms your data into a premium handheld relic.',
    phase1: 'Phase 01',
    phase1Label: 'Ready to create!',
    phase2: 'Phase 02',
    phase2Label: 'Analysing photo...',
    phase3: 'Phase 03',
    phase3Label: 'Synthesis complete!',
    awaitingInput: 'Awaiting Input',
    awaitingDesc: 'Upload a portrait to begin the transformation',
    relicChamber: 'Relic Chamber',
    finalRelic: 'FINAL_RELIC_v1.0',
    synthesizedTitle: 'Neural Relic Synthesized',
    synthesizedDesc: 'Your portrait has been successfully synthesized into a high-fidelity pixel relic. The transformation is complete.',
    format: 'Format',
    pixelArt: 'PIXEL ART',
    status: 'Status',
    stable: 'STABLE',
    regenerate: 'Regenerate',
    download: 'Download PNG',
    uploadNew: 'Upload New',
    langName: 'English'
  },
  'zh-CN': {
    title: 'NYX 头像实验室',
    upload: '上传并创建',
    processing: '处理中...',
    description: '在此处放置您的高保真肖像以开始神经像素合成。我们的实验室将您的数据转化为高级手持遗迹。',
    phase1: '阶段 01',
    phase1Label: '准备就绪！',
    phase2: '阶段 02',
    phase2Label: '正在分析照片...',
    phase3: '阶段 03',
    phase3Label: '合成完成！',
    awaitingInput: '等待输入',
    awaitingDesc: '上传肖像以开始转换',
    relicChamber: '遗迹陈列室',
    finalRelic: '最终遗迹_v1.0',
    synthesizedTitle: '神经遗迹已合成',
    synthesizedDesc: '您的肖像已成功合成为高保真像素遗迹。转换已完成。',
    format: '格式',
    pixelArt: '像素艺术',
    status: '状态',
    stable: '稳定',
    regenerate: '重新生成',
    download: '下载照片',
    uploadNew: '上传新照片',
    langName: '简体中文'
  },
  'zh-TW': {
    title: 'NYX 頭像實驗室',
    upload: '上傳並創建',
    processing: '處理中...',
    description: '在此處放置您的高保真肖像以開始神經像素合成。我們的實驗室將您的數據轉化為高級手持遺蹟。',
    phase1: '階段 01',
    phase1Label: '準備就緒！',
    phase2: '階段 02',
    phase2Label: '正在分析照片...',
    phase3: '階段 03',
    phase3Label: '合成完成！',
    awaitingInput: '等待輸入',
    awaitingDesc: '上傳肖像以開始轉換',
    relicChamber: '遺蹟陳列室',
    finalRelic: '最終遺蹟_v1.0',
    synthesizedTitle: '神經遺蹟已合成',
    synthesizedDesc: '您的肖像已成功合成為高保真像素遺蹟。轉換已完成。',
    format: '格式',
    pixelArt: '像素藝術',
    status: '狀態',
    stable: '穩定',
    regenerate: '重新生成',
    download: '下載照片',
    uploadNew: '上傳新照片',
    langName: '繁體中文'
  }
};

export default function App() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('zh-CN');
  const [showLangMenu, setShowLangMenu] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);

  const t = translations[lang];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSourceImage(base64);
      setSourceMimeType(file.type);
      handleGenerate(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async (base64: string, mimeType: string) => {
    try {
      setError(null);
      setPhase('analyzing');
      setResultImage(null);
      
      const base64Data = base64.split(',')[1];
      const result = await generatePixelAvatar(base64Data, mimeType);
      
      setPhase('synthesizing');
      setResultImage(result);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPhase('complete');
      
    } catch (err) {
      console.error(err);
      setError("Synthesis failed. Please try again.");
      setPhase('idle');
    }
  };

  const handleRegenerate = () => {
    if (sourceImage && sourceMimeType) {
      handleGenerate(sourceImage, sourceMimeType);
    }
  };

  const downloadImage = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = `nyx-avatar-${Date.now()}.png`;
    link.click();
  };

  const reset = () => {
    setSourceImage(null);
    setSourceMimeType(null);
    setResultImage(null);
    setPhase('idle');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-background text-on-background font-body selection:bg-primary selection:text-black overflow-x-hidden pixel-bg">
      {/* Top Bar */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-surface/80 backdrop-blur-xl border-b border-white/5">
        <div className="flex items-center gap-4">
          <button className="p-2 text-primary/50 hover:bg-surface-bright transition-colors rounded-lg">
            <Grid size={20} />
          </button>
          <h1 className="text-xl font-headline font-bold tracking-tighter uppercase text-primary drop-shadow-[0_0_8px_rgba(143,245,255,0.5)]">
            {t.title}
          </h1>
        </div>
        <div className="flex items-center gap-4">
          {/* Language Selector */}
          <div className="relative" ref={langMenuRef}>
            <button 
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all text-xs font-headline font-bold uppercase tracking-widest text-primary"
            >
              <Languages size={16} />
              <span className="hidden sm:inline">{t.langName}</span>
              <ChevronDown size={14} className={`transition-transform ${showLangMenu ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showLangMenu && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-40 bg-surface border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[60]"
                >
                  {(Object.keys(translations) as Language[]).map((l) => (
                    <button
                      key={l}
                      onClick={() => {
                        setLang(l);
                        setShowLangMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left text-xs font-headline font-bold uppercase tracking-widest transition-colors hover:bg-white/5 ${lang === l ? 'text-primary' : 'text-on-surface-variant'}`}
                    >
                      {translations[l].langName}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="hidden md:flex gap-1">
            <div className="w-2 h-2 bg-primary"></div>
            <div className="w-2 h-2 bg-secondary opacity-50"></div>
            <div className="w-2 h-2 bg-tertiary opacity-30"></div>
          </div>
          <button className="p-2 text-primary/50 hover:bg-surface-bright transition-colors rounded-lg">
            <Settings size={20} />
          </button>
        </div>
      </header>

      <main className="pt-24 pb-32 px-6 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
        {/* Top Section: The Relic Chamber (Result Window) */}
        <AnimatePresence>
          {(phase === 'complete' || resultImage) && (
            <motion.section 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-20"
            >
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-6 py-2 bg-primary text-black font-headline font-black uppercase tracking-[0.2em] text-xs rounded-full z-20 shadow-[0_0_20px_rgba(143,245,255,0.5)]">
                  {t.relicChamber}
                </div>

                <div className="bg-surface-bright/30 backdrop-blur-xl border border-white/10 rounded-[3rem] p-8 md:p-12 overflow-hidden relative">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Result Viewport */}
                    <div className="relative aspect-square w-full max-w-md mx-auto bg-black rounded-3xl overflow-hidden border-4 border-white/5 shadow-2xl">
                      <div className="absolute inset-0 pixel-bg opacity-20 pointer-events-none"></div>
                      
                      <AnimatePresence mode="wait">
                        {resultImage ? (
                          <motion.img 
                            key="result-img"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={resultImage}
                            className="w-full h-full object-cover [image-rendering:pixelated]"
                            alt="Pixel Avatar"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Loader2 className="text-primary animate-spin" size={48} />
                          </div>
                        )}
                      </AnimatePresence>

                      {/* HUD Overlays */}
                      <div className="absolute top-6 left-6 flex flex-col gap-2">
                        <div className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-headline font-bold text-primary flex items-center gap-2 border border-white/10">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                          {t.finalRelic}
                        </div>
                      </div>
                    </div>

                    {/* Info & Actions */}
                    <div className="flex flex-col space-y-8">
                      <div>
                        <h2 className="text-3xl md:text-4xl font-headline font-bold tracking-tighter uppercase text-primary mb-2">
                          {t.synthesizedTitle}
                        </h2>
                        <p className="text-on-surface-variant leading-relaxed">
                          {t.synthesizedDesc}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="block text-[10px] font-headline font-bold text-secondary uppercase tracking-widest mb-1">{t.format}</span>
                          <span className="text-xl font-headline font-bold">{t.pixelArt}</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                          <span className="block text-[10px] font-headline font-bold text-tertiary uppercase tracking-widest mb-1">{t.status}</span>
                          <span className="text-xl font-headline font-bold">{t.stable}</span>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button 
                          onClick={handleRegenerate}
                          className="flex-1 py-4 bg-white/5 text-on-background font-headline font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/5"
                        >
                          <RefreshCw size={18} />
                          {t.regenerate}
                        </button>
                        <button 
                          onClick={downloadImage}
                          className="flex-1 py-4 bg-primary text-black font-headline font-extrabold uppercase tracking-widest rounded-2xl shadow-[0_0_20px_rgba(143,245,255,0.3)] hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-2"
                        >
                          <Download size={20} />
                          {t.download}
                        </button>
                        <button 
                          onClick={() => fileInputRef.current?.click()}
                          className="flex-1 py-4 bg-white/5 text-on-background font-headline font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all flex items-center justify-center gap-2 border border-white/5"
                        >
                          <Upload size={18} />
                          {t.uploadNew}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: Controls */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center space-y-8 order-2 lg:order-1">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative group cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-64 h-64 rounded-full bg-surface bezel-glow flex flex-col items-center justify-center border-4 border-white/5 relative z-10 hover:border-primary/50 transition-all duration-300">
                <Upload className="text-primary mb-4" size={48} />
                <span className="font-headline font-bold text-sm tracking-widest uppercase text-on-surface-variant text-center px-4">
                  {phase === 'idle' ? t.upload : t.processing}
                </span>
                <div className="absolute inset-0 rounded-full bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
              
              <div className="absolute -top-4 -right-4 w-6 h-6 bg-secondary opacity-60 blur-sm"></div>
              <div className="absolute -bottom-2 -left-6 w-4 h-4 bg-tertiary opacity-40 blur-sm"></div>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />
            </motion.div>

            <div className="w-full bg-surface/50 p-6 rounded-2xl border border-white/5 backdrop-blur-sm">
              <p className="text-on-surface-variant text-sm leading-relaxed">
                {t.description}
              </p>
            </div>

            {error && (
              <div className="text-red-400 text-sm font-medium bg-red-400/10 px-4 py-2 rounded-lg border border-red-400/20">
                {error}
              </div>
            )}
          </div>

          {/* Center: Status & Info */}
          <div className="lg:col-span-8 order-1 lg:order-2">
            <div className="flex flex-col space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatusItem 
                  phase={t.phase1} 
                  label={t.phase1Label} 
                  active={phase !== 'idle'} 
                  icon={<CheckCircle2 size={20} />} 
                  color="secondary"
                />
                <StatusItem 
                  phase={t.phase2} 
                  label={t.phase2Label} 
                  active={phase === 'analyzing' || phase === 'synthesizing' || phase === 'complete'} 
                  icon={<Zap size={20} />} 
                  color="primary"
                  loading={phase === 'analyzing'}
                />
                <StatusItem 
                  phase={t.phase3} 
                  label={t.phase3Label} 
                  active={phase === 'complete'} 
                  icon={<Sparkles size={20} />} 
                  color="tertiary"
                  loading={phase === 'synthesizing'}
                />
              </div>

              <AnimatePresence>
                {phase !== 'idle' && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex justify-end"
                  >
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="px-6 py-2 bg-white/5 hover:bg-white/10 text-primary font-headline font-bold text-xs uppercase tracking-widest rounded-full border border-white/10 transition-all flex items-center gap-2"
                    >
                      <RefreshCw size={14} />
                      {t.uploadNew}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {phase === 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="p-8 border-2 border-dashed border-white/10 rounded-3xl flex flex-col items-center justify-center text-center space-y-4"
                  >
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-primary/30">
                      <ImageIcon size={32} />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-lg uppercase tracking-widest text-primary">{t.awaitingInput}</h3>
                      <p className="text-on-surface-variant text-sm">{t.awaitingDesc}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-8 pb-8 pt-4 bg-surface/90 backdrop-blur-2xl border-t border-white/5 rounded-t-[2.5rem]">
        <NavButton active icon={<ImageIcon size={24} />} />
        <NavButton icon={<Camera size={24} />} />
        <NavButton icon={<Sparkles size={24} />} />
        <NavButton icon={<RefreshCw size={24} />} />
      </nav>
    </div>
  );
}

function StatusItem({ phase, label, active, icon, color, loading }: { 
  phase: string; 
  label: string; 
  active: boolean; 
  icon: React.ReactNode; 
  color: 'primary' | 'secondary' | 'tertiary';
  loading?: boolean;
}) {
  const colorMap = {
    primary: 'text-primary bg-primary/10 border-primary/20 shadow-[0_0_15px_rgba(143,245,255,0.2)]',
    secondary: 'text-secondary bg-secondary/10 border-secondary/20 shadow-[0_0_15px_rgba(143,246,208,0.2)]',
    tertiary: 'text-tertiary bg-tertiary/10 border-tertiary/20 shadow-[0_0_15px_rgba(255,205,252,0.2)]'
  };

  return (
    <div className={`flex items-center gap-4 transition-all duration-500 ${active ? 'opacity-100' : 'opacity-20 grayscale'}`}>
      <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${active ? colorMap[color] : 'bg-white/5 border-white/10'} ${loading ? 'animate-pulse' : ''}`}>
        {loading ? <Loader2 className="animate-spin" size={20} /> : icon}
      </div>
      <div className="flex flex-col">
        <span className={`font-headline font-bold text-xs uppercase tracking-tighter ${active ? `text-${color}` : 'text-on-surface-variant'}`}>
          {phase}
        </span>
        <span className="text-on-surface text-sm font-medium">{label}</span>
      </div>
    </div>
  );
}

function NavButton({ icon, active }: { icon: React.ReactNode; active?: boolean }) {
  return (
    <button className={`p-4 rounded-2xl transition-all active:scale-90 ${active ? 'bg-primary/10 text-primary shadow-[0_0_20px_rgba(143,245,255,0.2)]' : 'text-on-surface-variant hover:text-on-background'}`}>
      {icon}
    </button>
  );
}
