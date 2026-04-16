import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './screens/Dashboard';
import { Wardrobe } from './screens/Wardrobe';
import { AddClothes } from './screens/AddClothes';
import { ShopSmart } from './screens/ShopSmart';
import { Profile } from './screens/Profile';
import { motion, AnimatePresence } from 'motion/react';
import { StoreProvider, useStore } from './store';
import { Sparkles } from 'lucide-react';

const AppContent = () => {
  const { user, loading, signIn } = useStore();

  if (loading) {
    return (
      <div className="mobile-container flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-brand-olive border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mobile-container flex flex-col items-center justify-center p-6 space-y-8 bg-brand-cream text-center">
        <div className="w-24 h-24 bg-brand-olive rounded-full flex items-center justify-center shadow-xl">
          <Sparkles className="text-white" size={40} />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-serif italic text-brand-ink">Dressify</h1>
          <p className="text-brand-ink/60">Your personal AI stylist and sustainable wardrobe manager.</p>
        </div>
        <button 
          onClick={signIn}
          className="w-full py-4 bg-brand-olive text-white rounded-2xl font-medium uppercase tracking-widest text-sm shadow-lg hover:bg-brand-olive/90 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <Router>
      <div className="mobile-container">
        <main className="flex-1 overflow-y-auto pb-20">
          <AnimatePresence mode="wait">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/wardrobe" element={<Wardrobe />} />
              <Route path="/add" element={<AddClothes />} />
              <Route path="/shop" element={<ShopSmart />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </AnimatePresence>
        </main>
        <Navigation />
      </div>
    </Router>
  );
};

export default function App() {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
}
