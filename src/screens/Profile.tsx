import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Bell, Shield, LogOut, ChevronRight, User, Palette, Ruler, X, Check, MapPin, Camera } from 'lucide-react';
import { useStore } from '../store';
import { UserProfile } from '../types';

export const Profile = () => {
  const { profile, updateProfile, signOut } = useStore();
  const [editingField, setEditingField] = useState<keyof UserProfile | 'privacy' | null>(null);
  const [tempValue, setTempValue] = useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateProfile({ ...profile, avatarUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const menuItems = [
    { id: 'name' as keyof UserProfile, icon: User, label: 'Personal Info', value: profile.name },
    { id: 'style' as keyof UserProfile, icon: Palette, label: 'Style Profile', value: profile.style },
    { id: 'bodyType' as keyof UserProfile, icon: Ruler, label: 'Body Type', value: `${profile.gender}, ${profile.height}, ${profile.weight}` },
    { id: 'location' as keyof UserProfile, icon: MapPin, label: 'Location', value: profile.location },
    { id: 'notifications' as any, icon: Bell, label: 'Notifications', value: profile.notificationsEnabled ? 'Enabled' : 'Disabled' },
    { id: 'privacy' as any, icon: Shield, label: 'Privacy & Security', value: 'Protected' },
  ];

  const handleEdit = (id: any, currentVal: string) => {
    if (!id) return;
    if (id === 'notifications') {
      updateProfile({ ...profile, notificationsEnabled: !profile.notificationsEnabled });
      return;
    }
    setEditingField(id);
    setTempValue(currentVal);
  };

  const handleSave = () => {
    if (editingField) {
      updateProfile({ ...profile, [editingField]: tempValue });
      setEditingField(null);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 space-y-8"
    >
      <header className="flex flex-col items-center space-y-4 py-4">
        <div className="relative group">
          <div className="w-24 h-24 rounded-full bg-brand-olive flex items-center justify-center text-white text-3xl font-serif italic shadow-xl overflow-hidden">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
            ) : (
              profile.name[0]
            )}
          </div>
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="absolute bottom-0 right-0 bg-white p-2 rounded-full shadow-lg text-brand-olive hover:bg-brand-cream transition-colors border border-brand-ink/5"
          >
            <Camera size={16} />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleAvatarChange} 
          />
        </div>
        <div className="text-center">
          <h1 className="text-2xl font-medium">{profile.name}</h1>
          <p className="text-xs text-brand-ink/40 uppercase tracking-widest">{profile.location}</p>
        </div>
      </header>

      <div className="space-y-6">
        <section className="bg-white rounded-3xl overflow-hidden shadow-sm border border-brand-ink/5">
          {menuItems.map((item, i) => (
            <button 
              key={i}
              onClick={() => handleEdit(item.id, item.value)}
              className={`w-full flex items-center justify-between p-5 hover:bg-brand-cream transition-colors text-left ${
                i !== menuItems.length - 1 ? 'border-b border-brand-ink/5' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="text-brand-olive">
                  <item.icon size={20} />
                </div>
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  {item.value && <p className="text-xs text-brand-ink/40">{item.value}</p>}
                </div>
              </div>
              {item.id && item.id !== 'notifications' && <ChevronRight size={16} className="text-brand-ink/20" />}
            </button>
          ))}
        </section>

        <button 
          onClick={signOut}
          className="w-full py-4 bg-white text-red-500 rounded-2xl font-medium uppercase tracking-widest text-xs flex items-center justify-center gap-2 border border-red-100 shadow-sm"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>

      <footer className="text-center space-y-2 pb-8">
        <p className="text-[10px] text-brand-ink/20 uppercase tracking-[0.3em]">Dressify v1.0.4</p>
        <p className="text-[10px] text-brand-ink/20">Crafted for a sustainable future</p>
      </footer>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingField && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingField(null)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] max-w-md mx-auto"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="fixed bottom-0 left-0 right-0 bg-brand-cream rounded-t-[40px] z-[70] p-8 space-y-6 max-w-md mx-auto shadow-2xl"
            >
              <div className="flex justify-center">
                <div className="w-12 h-1.5 bg-brand-ink/10 rounded-full" />
              </div>
              
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-medium capitalize">Edit {editingField.replace(/([A-Z])/g, ' $1')}</h2>
                <button onClick={() => setEditingField(null)} className="p-2 bg-white rounded-full shadow-sm">
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {editingField === 'bodyType' ? (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Gender</label>
                      <select 
                        value={profile.gender}
                        onChange={(e) => updateProfile({ ...profile, gender: e.target.value })}
                        className="w-full bg-white border border-brand-ink/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-binary">Non-binary</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Height</label>
                      <input 
                        value={profile.height}
                        onChange={(e) => updateProfile({ ...profile, height: e.target.value })}
                        placeholder="e.g. 175 cm"
                        className="w-full bg-white border border-brand-ink/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">Weight</label>
                      <input 
                        value={profile.weight}
                        onChange={(e) => updateProfile({ ...profile, weight: e.target.value })}
                        placeholder="e.g. 70 kg"
                        className="w-full bg-white border border-brand-ink/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
                      />
                    </div>
                  </div>
                ) : editingField === 'privacy' ? (
                  <div className="space-y-4 bg-white p-6 rounded-2xl border border-brand-ink/5">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-sm font-medium">End-to-End Encryption</p>
                      </div>
                      <p className="text-xs text-brand-ink/40 leading-relaxed">
                        Your wardrobe data and personal style preferences are encrypted and stored locally on your device.
                      </p>
                    </div>
                    <div className="space-y-3 pt-2 border-t border-brand-ink/5">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <p className="text-sm font-medium">Data Portability</p>
                      </div>
                      <p className="text-xs text-brand-ink/40 leading-relaxed">
                        You can export or delete your entire wardrobe history at any time from the settings menu.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest text-brand-ink/40 font-bold">New Value</label>
                    <input 
                      autoFocus
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full bg-white border border-brand-ink/5 rounded-2xl px-5 py-4 text-sm focus:ring-2 focus:ring-brand-olive outline-none"
                    />
                  </div>
                )}
              </div>

              <button 
                onClick={handleSave}
                className="w-full py-4 bg-brand-olive text-white rounded-2xl font-medium uppercase tracking-widest text-xs shadow-lg flex items-center justify-center gap-2"
              >
                <Check size={18} />
                {editingField === 'bodyType' || editingField === 'privacy' ? 'Done' : 'Save Changes'}
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
