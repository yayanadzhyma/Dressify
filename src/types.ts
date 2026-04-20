export interface ClothingItem {
  id: string;
  userId: string;
  name: string;
  category: 'tops' | 'bottoms' | 'dresses' | 'jumpsuits' | 'shoes' | 'outerwear' | 'accessories';
  color: string;
  imageUrl: string;
  price: number;
  timesWorn: number;
  lastWorn?: string;
  createdAt: string;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  occasion: string;
  weatherCondition: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  style: string;
  bodyType: string;
  gender: string;
  height: string;
  weight: string;
  location: string;
  notificationsEnabled: boolean;
  avatarUrl?: string;
}

export interface ShopHistoryItem {
  id: string;
  userId: string;
  query: string;
  combinations: string[];
  timestamp: string;
}
