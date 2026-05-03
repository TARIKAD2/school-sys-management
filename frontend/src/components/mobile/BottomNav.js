import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, User, LogOut, Menu as MenuIcon } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export default function BottomNav({ onMenuClick }) {
  const { logout } = useAuth();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 d-md-none z-50 flex items-center justify-around px-2 shadow-lg">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
            isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
          }`
        }
      >
        <Home size={20} className="mb-1" />
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/profile"
        className={({ isActive }) =>
          `flex flex-col items-center justify-center w-full h-full text-xs font-medium transition-colors ${
            isActive ? 'text-primary' : 'text-gray-500 hover:text-gray-900'
          }`
        }
      >
        <User size={20} className="mb-1" />
        <span>Profile</span>
      </NavLink>

      <button
        onClick={onMenuClick}
        className="flex flex-col items-center justify-center w-full h-full text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <MenuIcon size={20} className="mb-1" />
        <span>Menu</span>
      </button>

      <button
        onClick={logout}
        className="flex flex-col items-center justify-center w-full h-full text-xs font-medium text-red-500 hover:text-red-700 transition-colors"
      >
        <LogOut size={20} className="mb-1" />
        <span>Logout</span>
      </button>
    </nav>
  );
}
