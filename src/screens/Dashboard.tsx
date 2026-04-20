import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cloud, Sun, Sparkles, TrendingDown, X, Check, ArrowRight, RefreshCw } from 'lucide-react';
import { useStore } from '../store';
import { suggestOutfits, getWeather } from '../services/gemini';
import { Outfit, ClothingItem } from '../types';

export const Dashboard = () => {
  const { wardrobe, profile, updateItem } = useStore();
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState({ temp: '18°C', condition: 'Sunny', note: 'Perfect for light layers' });
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [isWearing, setIsWearing] = useState(false);

  useEffect(() => {
    // Nur beim ersten Laden automatisch ausführen, wenn noch keine Outfits da sind
    if (wardrobe.length > 0 && outfits.length === 0) {
      loadDashboardData();
    }
  }, [wardrobe.length, profile.location]);

  const loadDashboardData = async () => {
    setWeatherLoading(true);
    try {
      // If location is empty or not set, use a default or skip
      const locationToUse = profile.location || 'Zurich, Switzerland';
      const weather = await getWeather(locationToUse);
      setWeatherData(weather);
      setWeatherLoading(false);
      
      if (wardrobe.length > 0) {
        setLoading(true);
        const suggestions = await suggestOutfits(wardrobe, profile, `${weather.condition}, ${weather.temp}`);
        setOutfits(suggestions);
        setLoading(false);
      }
    } catch (error) {
      console.error(error);
      setWeatherLoading(false);
    }
  };

  const handleWearToday = (outfit: Outfit) => {
    setSelectedOutfit(outfit);
  };

  const confirmWear = async () => {
    if (!selectedOutfit) return;
    
    setIsWearing(true);
    
    // Simulate a small delay for the "wearing" animation
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Increment wear count for each item in the outfit
    selectedOutfit.items.forEach(item => {
      updateItem(item.id, { 
        timesWorn: (item.timesWorn || 0) + 1,
        lastWorn: new Date().toISOString()
      });
    });

    setIsWearing(false);
    setSelectedOutfit(null);
    // Show a success toast or message if needed, but for now just close
  };

  const getCostPerWearStats = () => {
    const items = [...wardrobe].sort((a, b) => (a.price / (a.timesWorn || 1)) - (b.price / (b.timesWorn || 1)));
    return items[0];
  };

  const bestValue = getCostPerWearStats();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-8"
    >
      <header className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] font-medium text-brand-ink/40">Good Morning</p>
        <h1 className="text-4xl font-light text-brand-ink">{profile.name}</h1>
      </header>

      {/* Weather Widget */}
      <section className="bg-white rounded-3xl p-6 shadow-sm border border-brand-ink/5 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="bg-brand-cream p-3 rounded-2xl">
            {weatherLoading ? (
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="text-brand-clay" size={24} />
              </motion.div>
            ) : (
              <Sun className="text-brand-clay" size={24} />
            )}
          </div>
          <div>
            {weatherLoading ? (
              <div className="space-y-2">
                <div className="h-4 w-24 bg-brand-cream animate-pulse rounded" />
                <div className="h-3 w-32 bg-brand-cream animate-pulse rounded" />
              </div>
            ) : (
              <>
                <p className="text-sm font-medium">{weatherData.condition}, {weatherData.temp}</p>
                <p className="text-xs text-brand-ink/40">{weatherData.note}</p>
              </>
            )}
          </div>
        </div>
        <a 
          href={`https://www.google.com/search?q=Wetter+${encodeURIComponent(profile.location)}`} 
          target="_blank" 
          rel="noopener noreferrer"
          className="p-2 hover:bg-brand-cream rounded-full transition-colors"
        >
          <Cloud size={20} className="text-brand-ink/20" />
        </a>
      </section>

      {/* Outfit Suggestions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-medium">Daily Picks</h2>
            <Sparkles size={18} className="text-brand-clay" />
          </div>
          <button 
            onClick={loadDashboardData} 
            disabled={loading || weatherLoading}
            className="p-2 bg-brand-cream rounded-full hover:bg-brand-olive/20 transition-colors disabled:opacity-50"
            title="Refresh Outfits"
          >
            <RefreshCw size={16} className={`text-brand-olive ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x no-scrollbar">
          {loading ? (
            [1, 2, 3].map(i => (
              <div key={i} className="min-w-[280px] h-48 bg-white/50 animate-pulse rounded-3xl" />
            ))
          ) : (
            outfits.map((outfit) => (
              <motion.div 
                key={outfit.id}
                whileTap={{ scale: 0.98 }}
                className="min-w-[280px] bg-white rounded-3xl p-5 shadow-sm border border-brand-ink/5 snap-center space-y-4"
              >
                <div className="space-y-1">
                  <p className="text-[10px] uppercase tracking-widest text-brand-clay font-bold">{outfit.occasion}</p>
                  <h3 className="text-lg font-medium leading-tight">{outfit.name}</h3>
                </div>
                <div className="flex -space-x-3">
                  {outfit.items.map((item, i) => (
                    <div key={i} className="w-12 h-12 rounded-full border-2 border-white overflow-hidden bg-brand-cream">
                      <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <button 
                  onClick={() => handleWearToday(outfit)}
                  className="w-full py-3 bg-brand-olive text-white rounded-2xl text-xs font-medium uppercase tracking-widest hover:bg-brand-olive/90 transition-colors"
                >
                  Wear Today
                </button>
              </motion.div>
            ))
          )}
        </div>
      </section>

      {/* Cost Per Wear Highlight */}
      {bestValue && (
        <section className="bg-brand-olive text-white rounded-3xl p-6 space-y-4">
          <div className="flex items-center gap-2">
            <TrendingDown size={20} />
            <h2 className="text-lg font-serif italic">Smart Choice</h2>
          </div>
          <p className="text-sm opacity-90 leading-relaxed">
            Your <span className="font-bold">{bestValue.name}</span> is your best value item at 
            <span className="font-bold"> CHF {(bestValue.price / (bestValue.timesWorn || 1)).toFixed(2)}</span> per wear.
          </p>
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <span className="text-xs opacity-60 uppercase tracking-widest">Efficiency Score</span>
            <span className="text-xl font-serif italic">98%</span>
          </div>
        </section>
      )}

      {/* Outfit Detail Modal */}
      <AnimatePresence>
        {selectedOutfit && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOutfit(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] max-w-md mx-auto"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-brand-cream rounded-t-[40px] z-[70] p-8 space-y-8 max-w-md mx-auto shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-center">
                <div className="w-12 h-1.5 bg-brand-ink/10 rounded-full" />
              </div>

              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-widest text-brand-clay font-bold">{selectedOutfit.occasion}</p>
                  <h2 className="text-2xl font-medium">{selectedOutfit.name}</h2>
                </div>
                <button 
                  onClick={() => setSelectedOutfit(null)}
                  className="bg-white p-2 rounded-full shadow-sm"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-widest text-brand-ink/40">Outfit Components</h3>
                <div className="space-y-3">
                  {selectedOutfit.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white p-3 rounded-2xl border border-brand-ink/5">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-brand-cream">
                        <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs uppercase tracking-widest text-brand-ink/40 font-bold">{item.category}</p>
                        <p className="text-sm font-medium">{item.name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-brand-ink/40 uppercase tracking-widest">Cost/Wear</p>
                        <p className="text-xs font-bold">CHF {(item.price / (item.timesWorn || 1)).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-brand-olive/5 p-6 rounded-3xl space-y-2">
                <div className="flex items-center gap-2 text-brand-olive">
                  <Sparkles size={16} />
                  <p className="text-xs font-bold uppercase tracking-widest">Stylist Note</p>
                </div>
                <p className="text-sm text-brand-ink/80 leading-relaxed italic font-serif">
                  "This combination perfectly balances comfort and elegance for a {selectedOutfit.occasion.toLowerCase()} setting. The {selectedOutfit.items[0]?.color.toLowerCase()} tones complement the current weather beautifully."
                </p>
              </div>

              <button 
                onClick={confirmWear}
                disabled={isWearing}
                className="w-full py-4 bg-brand-olive text-white rounded-2xl font-medium uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2"
              >
                {isWearing ? (
                  <>
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles size={18} />
                    </motion.div>
                    Updating Wardrobe...
                  </>
                ) : (
                  <>
                    <Check size={18} />
                    Confirm & Wear
                  </>
                )}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
