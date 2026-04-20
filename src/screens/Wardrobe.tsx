import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Filter, Plus, Minus, X, TrendingDown, Calendar, Edit2, Check, Camera, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { ClothingItem } from '../types';

export const Wardrobe = () => {
  const { wardrobe, updateItem } = useStore();
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', price: 0, imageUrl: '' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const categories = ['all', 'tops', 'bottoms', 'dresses', 'jumpsuits', 'shoes', 'outerwear', 'accessories'];

  const filteredItems = wardrobe.filter(item => {
    const matchesFilter = filter === 'all' || item.category === filter;
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleIncrementWear = (item: ClothingItem) => {
    const newCount = (item.timesWorn || 0) + 1;
    updateItem(item.id, { 
      timesWorn: newCount,
      lastWorn: new Date().toISOString()
    });
    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...item, timesWorn: newCount });
    }
  };

  const handleDecrementWear = (item: ClothingItem) => {
    if ((item.timesWorn || 0) <= 0) return;
    const newCount = item.timesWorn - 1;
    updateItem(item.id, { timesWorn: newCount });
    if (selectedItem?.id === item.id) {
      setSelectedItem({ ...item, timesWorn: newCount });
    }
  };

  const startEditing = () => {
    if (!selectedItem) return;
    setEditForm({
      name: selectedItem.name,
      price: selectedItem.price,
      imageUrl: selectedItem.imageUrl
    });
    setIsEditing(true);
  };

  const saveEdits = () => {
    if (!selectedItem) return;
    updateItem(selectedItem.id, editForm);
    setSelectedItem({ ...selectedItem, ...editForm });
    setIsEditing(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setEditForm(prev => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-6"
    >
      <header className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-light">Wardrobe</h1>
          <div className="bg-brand-olive/10 p-2 rounded-full">
            <Sparkles size={20} className="text-brand-olive" />
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-ink/20" size={18} />
          <input 
            type="text"
            placeholder="Search your wardrobe..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-brand-ink/5 rounded-2xl pl-12 pr-4 py-3 text-sm outline-none focus:ring-2 focus:ring-brand-olive transition-all shadow-sm"
          />
          {search && (
            <button 
              onClick={() => setSearch('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-ink/20 hover:text-brand-ink/40"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </header>

      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium uppercase tracking-widest transition-all ${
                filter === cat 
                  ? 'bg-brand-olive text-white shadow-md' 
                  : 'bg-white text-brand-ink/60 border border-brand-ink/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {filteredItems.map((item) => (
            <motion.div
              layout
              key={item.id}
              onClick={() => {
                setSelectedItem(item);
                setIsEditing(false);
              }}
              className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-ink/5 group cursor-pointer"
            >
              <div className="aspect-[3/4] relative overflow-hidden bg-brand-cream">
                <img 
                  src={item.imageUrl} 
                  alt={item.name} 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tighter shadow-sm">
                  CHF {(item.price / (item.timesWorn || 1)).toFixed(1)}/wear
                </div>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">{item.category}</p>
                <h3 className="text-sm font-medium truncate">{item.name}</h3>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-brand-ink/40">{item.timesWorn} wears</span>
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color.toLowerCase() }} />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Item Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                setSelectedItem(null);
                setIsEditing(false);
              }}
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
                <div className="space-y-1 flex-1 mr-4">
                  {isEditing ? (
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Item Name</label>
                      <input 
                        value={editForm.name}
                        onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-white border border-brand-ink/5 rounded-xl px-4 py-2 text-sm outline-none focus:ring-1 focus:ring-brand-olive"
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-xs uppercase tracking-widest text-brand-clay font-bold">{selectedItem.category}</p>
                      <h2 className="text-2xl font-medium">{selectedItem.name}</h2>
                    </>
                  )}
                </div>
                <div className="flex gap-2">
                  {!isEditing && (
                    <button 
                      onClick={startEditing}
                      className="bg-white p-2 rounded-full shadow-sm text-brand-olive"
                    >
                      <Edit2 size={20} />
                    </button>
                  )}
                  <button 
                    onClick={() => {
                      setSelectedItem(null);
                      setIsEditing(false);
                    }}
                    className="bg-white p-2 rounded-full shadow-sm"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="flex gap-6">
                <div className="w-32 h-40 rounded-2xl overflow-hidden shadow-md relative group">
                  <img src={isEditing ? editForm.imageUrl : selectedItem.imageUrl} alt={selectedItem.name} className="w-full h-full object-cover" />
                  {isEditing && (
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Camera size={24} />
                    </button>
                  )}
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleFileChange} 
                  />
                </div>
                <div className="flex-1 space-y-4">
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-ink/5">
                    <div className="flex items-center gap-2 text-brand-ink/40 mb-1">
                      <TrendingDown size={14} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Cost per Wear</span>
                    </div>
                    <p className="text-xl font-serif italic text-brand-olive">
                      CHF {( (isEditing ? editForm.price : selectedItem.price) / (selectedItem.timesWorn || 1)).toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl shadow-sm border border-brand-ink/5">
                    <div className="flex items-center gap-2 text-brand-ink/40 mb-1">
                      <Calendar size={14} />
                      <span className="text-[10px] uppercase tracking-widest font-bold">Total Investment</span>
                    </div>
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium">CHF</span>
                        <input 
                          type="number"
                          value={editForm.price}
                          onChange={e => setEditForm(prev => ({ ...prev, price: Number(e.target.value) }))}
                          className="w-full bg-brand-cream rounded-lg px-2 py-1 text-sm outline-none"
                        />
                      </div>
                    ) : (
                      <p className="text-lg font-medium">CHF {selectedItem.price.toFixed(2)}</p>
                    )}
                  </div>
                </div>
              </div>

              {!isEditing && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-center">Track Usage</h3>
                  <div className="flex items-center justify-center gap-8">
                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDecrementWear(selectedItem)}
                      className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md border border-brand-ink/5 text-brand-ink/40"
                    >
                      <Minus size={24} />
                    </motion.button>
                    
                    <div className="text-center">
                      <span className="text-5xl font-serif italic">{selectedItem.timesWorn}</span>
                      <p className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold mt-1">Wears</p>
                    </div>

                    <motion.button 
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleIncrementWear(selectedItem)}
                      className="w-14 h-14 bg-brand-olive rounded-full flex items-center justify-center shadow-md text-white"
                    >
                      <Plus size={24} />
                    </motion.button>
                  </div>
                </div>
              )}

              <button 
                onClick={isEditing ? saveEdits : () => setSelectedItem(null)}
                className="w-full py-4 bg-brand-ink text-white rounded-2xl font-medium uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2"
              >
                {isEditing ? <Check size={18} /> : null}
                {isEditing ? 'Save Changes' : 'Done'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
