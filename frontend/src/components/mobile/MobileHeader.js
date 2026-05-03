import React from 'react';
import { Menu as MenuIcon, Bell } from 'lucide-react';
import NotificationBell from '../NotificationBell';

export default function MobileHeader({ onMenuClick, title }) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 bg-white border-b border-gray-100 flex items-center justify-between px-4 z-40 d-md-none shadow-sm">
      <div className="flex items-center gap-3">
        <button 
          onClick={onMenuClick}
          className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          style={{ minWidth: 44, minHeight: 44 }}
        >
          <MenuIcon size={24} />
        </button>
        <h1 className="text-lg font-bold text-gray-800 truncate" style={{ maxWidth: '200px' }}>
          {title || 'SchoolSys'}
        </h1>
      </div>
      <div className="flex items-center gap-1">
        <NotificationBell />
      </div>
    </header>
  );
}
