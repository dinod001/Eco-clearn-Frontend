import React, { useState } from 'react';
import { BellIcon, SearchIcon, MenuIcon, UserIcon, LogOutIcon, SettingsIcon, KeyIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext';
import Modal from '../common/Modal';
import Button from '../common/Button';
interface TopNavbarProps {
  toggleSidebar: () => void;
}
const TopNavbar = ({
  toggleSidebar
}: TopNavbarProps) => {
  const {
    user,
    logout
  } = useAuth();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  return <header className="bg-white shadow-sm z-10">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <button onClick={toggleSidebar} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none">
            <MenuIcon size={20} />
          </button>
          <div className="relative hidden md:block">
            <input type="text" placeholder="Search..." className="w-64 pl-10 pr-4 py-2 rounded-lg text-sm border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent" />
            <SearchIcon size={18} className="absolute left-3 top-2.5 text-gray-400" />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 focus:outline-none">
            <BellIcon size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
          </button>
          <div className="relative">
            <button onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none">
              {user?.avatar ? <img src={user.avatar} alt={user.name} className="h-8 w-8 rounded-full object-cover" /> : <div className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 focus:outline-none">
                  <UserIcon size={20} className="text-gray-600" />
                </div>}
              <span className="text-sm font-medium text-gray-700 hidden md:block">
                {user?.name || 'Admin User'}
              </span>
            </button>
            {isUserMenuOpen && <motion.div initial={{
            opacity: 0,
            y: 10
          }} animate={{
            opacity: 1,
            y: 0
          }} exit={{
            opacity: 0,
            y: 10
          }} transition={{
            duration: 0.2
          }} className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <SettingsIcon size={16} className="mr-2 text-gray-500" />
                  Settings
                </button>
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => logout()}>
                  <LogOutIcon size={16} className="mr-2 text-gray-500" />
                  Logout
                </button>
              </motion.div>}
          </div>
        </div>
      </div>
    </header>;
};
export default TopNavbar;