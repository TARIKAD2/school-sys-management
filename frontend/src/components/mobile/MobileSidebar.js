import React from 'react';
import { NavLink } from 'react-router-dom';
import { X, LogOut } from 'lucide-react';
import { useAuth } from '../../auth/AuthContext';

export default function MobileSidebar({ isOpen, onClose, links, roleTitle }) {
  const { user, logout } = useAuth();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-[60] d-md-none transition-opacity"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <aside 
        className={`fixed inset-y-0 left-0 w-80 bg-white z-[70] d-md-none transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-primary text-white">
          <div>
            <div className="font-bold text-lg">{roleTitle || 'Panel'}</div>
            <div className="text-xs opacity-80">{user?.email}</div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            style={{ width: 44, height: 44 }}
          >
            <X size={24} />
          </button>
        </div>

        <nav className="flex-grow overflow-y-auto py-4 px-2">
          {links.map((link, idx) => (
            link.type === 'header' ? (
              <div key={idx} className="px-3 mt-4 mb-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                {link.label}
              </div>
            ) : (
              <NavLink
                key={idx}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl transition-all mb-1 font-medium ${
                    isActive 
                      ? 'bg-primary text-white shadow-md shadow-primary/20' 
                      : 'text-gray-600 hover:bg-gray-50'
                  }`
                }
                style={{ minHeight: 48 }}
              >
                {link.icon && <link.icon size={20} />}
                <span>{link.label}</span>
              </NavLink>
            )
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors"
            style={{ minHeight: 48 }}
          >
            <LogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
