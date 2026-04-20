import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Search, ExternalLink, Info, Sparkles, Recycle, Camera, X, Loader2, Trash2 } from 'lucide-react';
import { useStore } from '../store';
import { analyzeProductImageCompatibility } from '../services/gemini';

export const ShopSmart = () => {
  const { wardrobe, shopHistory, addHistoryItem, removeHistoryItem } = useStore();
  const [image, setImage] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [combinations, setCombinations] = useState<string[] | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setCombinations(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setAnalyzing(true);
    try {
      const base64 = image.split(',')[1];
      const result = await analyzeProductImageCompatibility(base64, wardrobe);
      setCombinations(result.combinations);
      addHistoryItem({
        id: Math.random().toString(36).substr(2, 9),
        userId: '', // Will be set by the store
        query: result.itemName,
        combinations: result.combinations,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error(error);
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setImage(null);
    setCombinations(null);
    setAnalyzing(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-8"
    >
      <header className="space-y-1">
        <h1 className="text-3xl font-light">Shop Smart</h1>
        <p className="text-sm text-brand-ink/40">Check compatibility before you buy</p>
      </header>

      <div className="bg-white rounded-3xl p-6 shadow-sm border border-brand-ink/5 space-y-6">
        <div className="space-y-6">
          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-brand-ink/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-brand-cream/50 cursor-pointer hover:bg-white transition-colors"
            >
              <div className="bg-white p-6 rounded-full shadow-sm">
                <Camera size={40} className="text-brand-olive" />
              </div>
              <div className="text-center">
                <p className="font-medium">Photo of new item</p>
                <p className="text-xs text-brand-ink/40">Tap to upload or take photo</p>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                accept="image/*" 
                className="hidden" 
              />
            </div>
          ) : (
            <div className="space-y-6">
              <div className="aspect-square relative rounded-3xl overflow-hidden shadow-sm group">
                <img src={image} alt="Preview" className="w-full h-full object-cover" />
                {!analyzing && (
                  <button 
                    onClick={reset}
                    className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm hover:bg-black/70 transition-colors"
                  >
                    <X size={20} />
                  </button>
                )}
                
                {analyzing && (
                  <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-4">
                    <Loader2 size={40} className="animate-spin" />
                    <p className="font-serif italic text-xl">Consulting Stylist...</p>
                    <motion.div 
                      className="absolute inset-x-0 h-1 bg-brand-clay/50"
                      animate={{ top: ['0%', '100%', '0%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                  </div>
                )}
              </div>

              {!combinations && !analyzing && (
                <button 
                  onClick={handleAnalyze}
                  className="w-full py-4 bg-brand-olive text-white rounded-2xl font-medium uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
                >
                  <Sparkles size={20} />
                  Analyze Compatibility
                </button>
              )}
            </div>
          )}
        </div>

        {combinations && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-6 pt-6 border-t border-brand-ink/5"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-brand-olive">
                <Sparkles size={16} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-emerald-800">High Match Score</h3>
              </div>
              <button onClick={reset} className="text-xs text-brand-ink/40 underline">New scan</button>
            </div>
            
            <ul className="space-y-4">
              {combinations.map((c, i) => (
                <li key={i} className="flex gap-4 text-sm leading-relaxed bg-brand-cream/30 p-4 rounded-2xl border border-brand-ink/5">
                  <span className="text-brand-clay font-serif italic text-lg leading-none">{i + 1}</span>
                  <span className="text-brand-ink/80">{c}</span>
                </li>
              ))}
            </ul>
            
            <div className="bg-emerald-50 p-6 rounded-[32px] border border-emerald-100 flex items-start gap-4">
              <div className="bg-emerald-100 p-2 rounded-xl">
                <Recycle className="text-emerald-700" size={24} />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Better for your wallet & planet</p>
                <p className="text-[13px] text-emerald-700 leading-relaxed font-medium">
                  You'd be better off having a look at a similar one on <span className="text-emerald-900 font-bold decoration-emerald-500/30 underline underline-offset-4">Ricardo</span> or <span className="text-emerald-900 font-bold decoration-emerald-500/30 underline underline-offset-4">Marco</span>.
                </p>
                <div className="flex gap-6 pt-2">
                  <a 
                    href="https://www.ricardo.ch/de/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-800 transition-colors uppercase tracking-widest"
                  >
                    Ricardo <ExternalLink size={12} />
                  </a>
                  <a 
                    href="https://marko.ch/de" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 hover:text-emerald-800 transition-colors uppercase tracking-widest"
                  >
                    Marko <ExternalLink size={12} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-medium px-1">Recent Insights</h2>
        <div className="space-y-3">
          {shopHistory.length === 0 ? (
            <p className="text-sm text-brand-ink/40 italic px-2">Your style insights will appear here.</p>
          ) : (
            [...shopHistory].reverse().map(item => (
              <div 
                key={item.id} 
                onClick={() => {
                  setCombinations(item.combinations);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="group flex items-center justify-between p-5 bg-white rounded-[32px] border border-brand-ink/5 cursor-pointer hover:border-brand-olive/20 hover:shadow-md transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 bg-brand-cream rounded-2xl flex items-center justify-center group-hover:bg-brand-olive/10 transition-colors shrink-0">
                    <ShoppingBag size={22} className="text-brand-olive/40" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-sm font-medium block truncate pr-2">{item.query}</span>
                    <span className="text-[10px] text-brand-ink/40 font-bold uppercase tracking-wider">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-brand-cream p-2 rounded-full shrink-0">
                    <Info size={16} className="text-brand-ink/20" />
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      removeHistoryItem(item.id);
                    }}
                    className="p-2 hover:bg-red-50 rounded-full transition-colors group/delete"
                    title="Delete insight"
                  >
                    <Trash2 size={16} className="text-brand-ink/10 group-hover/delete:text-red-400 transition-colors" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};
