import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Search, ExternalLink, Info, Sparkles, Recycle } from 'lucide-react';
import { useStore } from '../store';

export const ShopSmart = () => {
  const { wardrobe, shopHistory, addHistoryItem } = useStore();
  const [search, setSearch] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [combinations, setCombinations] = useState<string[] | null>(null);

  const handleAnalyze = () => {
    setAnalyzing(true);
    // Simulate AI analysis
    setTimeout(() => {
      const results = [
        "Style with your Blue Slim Jeans and White Sneakers for a casual weekend look.",
        "Layer under your Beige Trench Coat for an elegant evening outfit.",
        "Pair with black trousers and loafers for a professional office vibe.",
        "Add a statement belt and your favorite boots for a chic street style.",
        "Wear with a midi skirt and denim jacket for a soft feminine touch."
      ];
      setCombinations(results);
      addHistoryItem({
        id: Math.random().toString(36).substr(2, 9),
        query: search,
        combinations: results,
        timestamp: new Date().toISOString()
      });
      setAnalyzing(false);
    }, 2000);
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
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/20" size={20} />
            <input 
              placeholder="Paste product link or describe item..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-brand-cream pl-12 pr-4 py-4 rounded-2xl text-sm border-none focus:ring-1 focus:ring-brand-olive"
            />
          </div>
          
          <button 
            onClick={handleAnalyze}
            disabled={!search || analyzing}
            className="w-full py-4 bg-brand-olive text-white rounded-2xl font-medium uppercase tracking-widest flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {analyzing ? <Sparkles className="animate-pulse" /> : <ShoppingBag size={20} />}
            {analyzing ? 'Analyzing Wardrobe...' : 'Check 5 Combinations'}
          </button>
        </div>

        {combinations && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 pt-4 border-t border-brand-ink/5"
          >
            <div className="flex items-center gap-2 text-brand-olive">
              <Sparkles size={16} />
              <h3 className="text-sm font-bold uppercase tracking-widest">Compatibility: High</h3>
            </div>
            <ul className="space-y-3">
              {combinations.map((c, i) => (
                <li key={i} className="flex gap-3 text-sm leading-relaxed">
                  <span className="text-brand-clay font-serif italic">{i + 1}.</span>
                  <span className="text-brand-ink/80">{c}</span>
                </li>
              ))}
            </ul>
            
            <div className="bg-emerald-50 p-4 rounded-2xl flex items-start gap-3">
              <Recycle className="text-emerald-600 mt-1" size={18} />
              <div className="space-y-1">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-widest">Sustainable Alternative</p>
                <p className="text-xs text-emerald-700">Found similar items on <span className="font-bold">Ricardo</span> and <span className="font-bold">Marko</span> starting at CHF 12.00</p>
                <div className="flex gap-4 pt-1">
                  <a 
                    href="https://www.ricardo.ch/de/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"
                  >
                    RICARDO <ExternalLink size={10} />
                  </a>
                  <a 
                    href="https://marko.ch/de" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[10px] font-bold text-emerald-600 flex items-center gap-1"
                  >
                    MARKO <ExternalLink size={10} />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-medium">Recent Searches</h2>
        <div className="space-y-3">
          {shopHistory.length === 0 ? (
            <p className="text-xs text-brand-ink/40 italic">No recent searches yet.</p>
          ) : (
            shopHistory.map(item => (
              <div 
                key={item.id} 
                onClick={() => {
                  setSearch(item.query);
                  setCombinations(item.combinations);
                }}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-brand-ink/5 cursor-pointer hover:bg-brand-cream transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-brand-cream rounded-xl flex items-center justify-center">
                    <ShoppingBag size={18} className="text-brand-ink/20" />
                  </div>
                  <div>
                    <span className="text-sm font-medium block">{item.query}</span>
                    <span className="text-[10px] text-brand-ink/40">{new Date(item.timestamp).toLocaleDateString()}</span>
                  </div>
                </div>
                <Info size={16} className="text-brand-ink/20" />
              </div>
            ))
          )}
        </div>
      </section>
    </motion.div>
  );
};
