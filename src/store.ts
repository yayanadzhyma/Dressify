import React, { useState, useEffect } from 'react';
import { ClothingItem, UserProfile, ShopHistoryItem } from './types';

const STORAGE_KEY = 'dressify_wardrobe';
const PROFILE_KEY = 'dressify_profile';
const HISTORY_KEY = 'dressify_history';

const INITIAL_WARDROBE: ClothingItem[] = [
  {
    id: '1',
    name: 'White Cotton T-Shirt',
    category: 'tops',
    color: 'White',
    imageUrl: 'https://picsum.photos/seed/shirt1/400/600',
    price: 25,
    timesWorn: 12,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Blue Slim Jeans',
    category: 'bottoms',
    color: 'Blue',
    imageUrl: 'https://picsum.photos/seed/jeans1/400/600',
    price: 80,
    timesWorn: 45,
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Beige Trench Coat',
    category: 'outerwear',
    color: 'Beige',
    imageUrl: 'https://picsum.photos/seed/coat1/400/600',
    price: 150,
    timesWorn: 5,
    createdAt: new Date().toISOString(),
  }
];

const INITIAL_PROFILE: UserProfile = {
  name: 'Alex',
  style: 'Minimalist & Elegant',
  bodyType: 'Athletic',
  gender: 'Not specified',
  height: '180 cm',
  weight: '75 kg',
  location: 'Zurich, Switzerland',
  notificationsEnabled: true,
  avatarUrl: ''
};

export const useStore = () => {
  const [wardrobe, setWardrobe] = React.useState<ClothingItem[]>([]);
  const [profile, setProfile] = React.useState<UserProfile>(INITIAL_PROFILE);
  const [shopHistory, setShopHistory] = React.useState<ShopHistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setWardrobe(JSON.parse(saved));
    } else {
      setWardrobe(INITIAL_WARDROBE);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_WARDROBE));
    }

    const savedProfile = localStorage.getItem(PROFILE_KEY);
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }

    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedHistory) {
      setShopHistory(JSON.parse(savedHistory));
    }
  }, []);

  const addItem = (item: ClothingItem) => {
    const newWardrobe = [...wardrobe, item];
    setWardrobe(newWardrobe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWardrobe));
  };

  const updateItem = (id: string, updates: Partial<ClothingItem>) => {
    const newWardrobe = wardrobe.map(item => item.id === id ? { ...item, ...updates } : item);
    setWardrobe(newWardrobe);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newWardrobe));
  };

  const updateProfile = (newProfile: UserProfile) => {
    setProfile(newProfile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(newProfile));
  };

  const addHistoryItem = (item: ShopHistoryItem) => {
    const newHistory = [item, ...shopHistory].slice(0, 10);
    setShopHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  return { wardrobe, profile, shopHistory, addItem, updateItem, updateProfile, addHistoryItem };
};
