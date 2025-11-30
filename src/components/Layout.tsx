import { NavLink, Outlet } from 'react-router-dom';
import { Home, BarChart2, Bell, User, LogOut } from 'lucide-react';
import { AlertModal } from './AlertModal';
import { Toaster } from 'sonner';
import { useAuth } from '../context/AuthContext';
import React from 'react';

const Layout = ({ children }: { children: React.ReactNode }) => {
  const { logout } = useAuth();
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="pb-20">
        {children || <Outlet />}
      </main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 shadow-t-lg flex justify-around p-2">
        <NavLink to="/dashboard" className={({ isActive }) => `flex flex-col items-center text-gray-500 dark:text-gray-400 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`}>
          <Home size={24} />
          <span className="text-xs">Home</span>
        </NavLink>
        <NavLink to="/history" className={({ isActive }) => `flex flex-col items-center text-gray-500 dark:text-gray-400 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`}>
          <BarChart2 size={24} />
          <span className="text-xs">History</span>
        </NavLink>
        <NavLink to="/notifications" className={({ isActive }) => `flex flex-col items-center text-gray-500 dark:text-gray-400 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`}>
          <Bell size={24} />
          <span className="text-xs">Alerts</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center text-gray-500 dark:text-gray-400 ${isActive ? 'text-blue-500 dark:text-blue-400' : ''}`}>
          <User size={24} />
          <span className="text-xs">Profile</span>
        </NavLink>
        <button onClick={logout} className="flex flex-col items-center text-gray-500 dark:text-gray-400">
            <LogOut size={24} />
            <span className="text-xs">Logout</span>
        </button>
      </nav>
      <AlertModal isOpen={false} onClose={() => {}} />
      <Toaster />
    </div>
  );
};

export default Layout;