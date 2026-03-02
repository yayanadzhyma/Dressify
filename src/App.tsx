import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import { Dashboard } from './screens/Dashboard';
import { Wardrobe } from './screens/Wardrobe';
import { AddClothes } from './screens/AddClothes';
import { ShopSmart } from './screens/ShopSmart';
import { Profile } from './screens/Profile';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
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
}
