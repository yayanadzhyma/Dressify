import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, Upload, X, Check, Loader2, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { scanClothingItem } from '../services/gemini';
import { ClothingItem } from '../types';

export const AddClothes = () => {
  const { addItem } = useStore();
  const [image, setImage] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<Partial<ClothingItem> | null>(null);
  const [price, setPrice] = useState('50');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startScan = async () => {
    if (!image) return;
    setScanning(true);
    try {
      const base64 = image.split(',')[1];
      const data = await scanClothingItem(base64);
      setResult(data);
    } catch (error) {
      console.error(error);
      // Fallback for demo if API fails
      setResult({
        name: 'New Item',
        category: 'tops',
        color: 'Black'
      });
    } finally {
      setScanning(false);
    }
  };

  const handleSave = () => {
    if (!result || !image) return;
    const newItem: ClothingItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: result.name || 'New Item',
      category: (result.category as any) || 'tops',
      color: result.color || 'Unknown',
      imageUrl: image,
      price: parseFloat(price) || 0,
      timesWorn: 0,
      createdAt: new Date().toISOString()
    };
    addItem(newItem);
    reset();
  };

  const reset = () => {
    setImage(null);
    setScanning(false);
    setResult(null);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-6 space-y-6"
    >
      <header>
        <h1 className="text-3xl font-light">Add to Wardrobe</h1>
        <p className="text-sm text-brand-ink/40">AI will scan and catalog your item</p>
      </header>

      <div className="space-y-6">
        {!image ? (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[3/4] border-2 border-dashed border-brand-ink/10 rounded-3xl flex flex-col items-center justify-center gap-4 bg-white/50 cursor-pointer hover:bg-white transition-colors"
          >
            <div className="bg-brand-cream p-6 rounded-full">
              <Camera size={40} className="text-brand-olive" />
            </div>
            <div className="text-center">
              <p className="font-medium">Take a photo</p>
              <p className="text-xs text-brand-ink/40">or tap to upload</p>
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
            <div className="aspect-[3/4] relative rounded-3xl overflow-hidden shadow-lg">
              <img src={image} alt="Preview" className="w-full h-full object-cover" />
              {!result && !scanning && (
                <button 
                  onClick={reset}
                  className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full backdrop-blur-sm"
                >
                  <X size={20} />
                </button>
              )}
              
              {scanning && (
                <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px] flex flex-col items-center justify-center text-white gap-4">
                  <Loader2 size={40} className="animate-spin" />
                  <p className="font-serif italic text-xl">Analyzing Style...</p>
                  <motion.div 
                    className="absolute inset-x-0 h-1 bg-brand-clay/50"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  />
                </div>
              )}
            </div>

            {!result && !scanning && (
              <button 
                onClick={startScan}
                className="w-full py-4 bg-brand-olive text-white rounded-2xl font-medium uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg"
              >
                <Sparkles size={20} />
                Scan with AI
              </button>
            )}

            {result && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl p-6 shadow-sm border border-brand-ink/5 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-medium">AI Analysis</h2>
                  <Check className="text-emerald-500" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Name</label>
                    <input 
                      value={result.name} 
                      onChange={e => setResult({...result, name: e.target.value})}
                      className="w-full bg-brand-cream px-3 py-2 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-olive"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Category</label>
                    <select 
                      value={result.category} 
                      onChange={e => setResult({...result, category: e.target.value as any})}
                      className="w-full bg-brand-cream px-3 py-2 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-olive"
                    >
                      <option value="tops">Tops</option>
                      <option value="bottoms">Bottoms</option>
                      <option value="shoes">Shoes</option>
                      <option value="outerwear">Outerwear</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Price (CHF)</label>
                    <input 
                      type="number"
                      value={price} 
                      onChange={e => setPrice(e.target.value)}
                      className="w-full bg-brand-cream px-3 py-2 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-olive"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Color</label>
                    <input 
                      value={result.color} 
                      onChange={e => setResult({...result, color: e.target.value})}
                      className="w-full bg-brand-cream px-3 py-2 rounded-xl text-sm border-none focus:ring-1 focus:ring-brand-olive"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={reset}
                    className="flex-1 py-4 bg-brand-cream text-brand-ink rounded-2xl font-medium uppercase tracking-widest text-xs"
                  >
                    Discard
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-2 py-4 bg-brand-olive text-white rounded-2xl font-medium uppercase tracking-widest text-xs shadow-lg"
                  >
                    Add to Wardrobe
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};
