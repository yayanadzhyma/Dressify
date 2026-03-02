import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Shirt, PlusCircle, ShoppingBag, User } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Navigation = () => {
  const navItems = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Shirt, label: 'Wardrobe', path: '/wardrobe' },
    { icon: PlusCircle, label: 'Add', path: '/add' },
    { icon: ShoppingBag, label: 'Shop', path: '/shop' },
    { icon: User, label: 'Profile', path: '/profile' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-brand-ink/5 safe-area-bottom z-50 max-w-md mx-auto">
      <div className="flex justify-around items-center h-16 px-4">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 transition-all duration-300",
                isActive ? "text-brand-olive scale-110" : "text-brand-ink/40 hover:text-brand-ink/60"
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium uppercase tracking-widest">{label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
