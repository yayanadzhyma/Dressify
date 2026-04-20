import React, { createContext, useContext, useState, useEffect } from 'react';
import { ClothingItem, UserProfile, ShopHistoryItem } from './types';
import { auth, db, signInWithGoogle, logOut } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, doc, onSnapshot, setDoc, updateDoc, query, where, orderBy, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './utils/firestoreErrorHandler';

const INITIAL_PROFILE: UserProfile = {
  userId: '',
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

interface StoreContextType {
  user: User | null;
  loading: boolean;
  wardrobe: ClothingItem[];
  profile: UserProfile;
  shopHistory: ShopHistoryItem[];
  addItem: (item: ClothingItem) => void;
  updateItem: (id: string, updates: Partial<ClothingItem>) => void;
  updateProfile: (newProfile: UserProfile) => void;
  addHistoryItem: (item: ShopHistoryItem) => void;
  removeHistoryItem: (id: string) => void;
  signIn: () => void;
  signOut: () => void;
}

export const StoreContext = createContext<StoreContextType | null>(null);

export const StoreProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [shopHistory, setShopHistory] = useState<ShopHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setWardrobe([]);
      setProfile(INITIAL_PROFILE);
      setShopHistory([]);
      return;
    }

    // Listen to Profile
    const profileRef = doc(db, 'profiles', user.uid);
    const unsubProfile = onSnapshot(profileRef, (docSnap) => {
      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
      } else {
        const newProfile = { ...INITIAL_PROFILE, userId: user.uid, name: user.displayName || 'User' };
        setDoc(profileRef, newProfile).catch(err => handleFirestoreError(err, OperationType.CREATE, 'profiles'));
      }
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'profiles');
    });

    // Listen to Wardrobe
    const wardrobeQuery = query(collection(db, 'wardrobe'), where('userId', '==', user.uid));
    const unsubWardrobe = onSnapshot(wardrobeQuery, (snapshot) => {
      const items: ClothingItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as ClothingItem);
      });
      setWardrobe(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'wardrobe');
    });

    // Listen to ShopHistory
    const historyQuery = query(collection(db, 'shopHistory'), where('userId', '==', user.uid), orderBy('timestamp', 'desc'), limit(10));
    const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
      const items: ShopHistoryItem[] = [];
      snapshot.forEach(doc => {
        items.push({ id: doc.id, ...doc.data() } as ShopHistoryItem);
      });
      setShopHistory(items);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'shopHistory');
    });

    return () => {
      unsubProfile();
      unsubWardrobe();
      unsubHistory();
    };
  }, [user]);

  const addItem = async (item: ClothingItem) => {
    if (!user) return;
    try {
      const itemWithUser = { ...item, userId: user.uid };
      const itemRef = doc(db, 'wardrobe', item.id);
      await setDoc(itemRef, itemWithUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'wardrobe');
    }
  };

  const updateItem = async (id: string, updates: Partial<ClothingItem>) => {
    if (!user) return;
    try {
      const itemRef = doc(db, 'wardrobe', id);
      await updateDoc(itemRef, updates);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'wardrobe');
    }
  };

  const updateProfile = async (newProfile: UserProfile) => {
    if (!user) return;
    try {
      const profileRef = doc(db, 'profiles', user.uid);
      await setDoc(profileRef, { ...newProfile, userId: user.uid });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'profiles');
    }
  };

  const addHistoryItem = async (item: ShopHistoryItem) => {
    if (!user) return;
    try {
      const itemWithUser = { ...item, userId: user.uid };
      const itemRef = doc(db, 'shopHistory', item.id);
      await setDoc(itemRef, itemWithUser);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'shopHistory');
    }
  };

  const removeHistoryItem = async (id: string) => {
    if (!user) return;
    try {
      const { deleteDoc } = await import('firebase/firestore');
      const itemRef = doc(db, 'shopHistory', id);
      await deleteDoc(itemRef);
    } catch (error) {
      const { OperationType: OpType } = await import('./utils/firestoreErrorHandler');
      handleFirestoreError(error, OpType.DELETE, 'shopHistory');
    }
  };

  return (
    <StoreContext.Provider value={{
      user, loading, wardrobe, profile, shopHistory,
      addItem, updateItem, updateProfile, addHistoryItem, removeHistoryItem,
      signIn: signInWithGoogle, signOut: logOut
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
