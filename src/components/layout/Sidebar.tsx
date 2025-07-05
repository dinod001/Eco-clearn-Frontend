import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboardIcon, TruckIcon, ClipboardCheckIcon, PackageIcon, UsersIcon, UserIcon, MessageSquareIcon, BellIcon, MenuIcon, UserCogIcon, XIcon } from 'lucide-react';
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}
const Sidebar = ({
  isOpen,
  toggleSidebar
}: SidebarProps) => {
  const location = useLocation();
  const sidebarItems = [{
    name: 'Dashboard',
    path: '/dashboard',
    icon: <LayoutDashboardIcon size={20} />
  }, {
    name: 'Pickup Requests',
    path: '/pickup-requests',
    icon: <TruckIcon size={20} />
  }, {
    name: 'Service Requests',
    path: '/service-requests',
    icon: <ClipboardCheckIcon size={20} />
  }, {
    name: 'Services',
    path: '/services',
    icon: <PackageIcon size={20} />
  }, {
    name: 'Staff',
    path: '/staff',
    icon: <UsersIcon size={20} />
  }, {
    name: 'Users',
    path: '/users',
    icon: <UserIcon size={20} />
  }, {
    name: 'Inquiries',
    path: '/inquiries',
    icon: <MessageSquareIcon size={20} />
  }, {
    name: 'Notifications',
    path: '/notifications',
    icon: <BellIcon size={20} />
  }, {
    name: 'Employees',
    path: '/employees',
    icon: <UserCogIcon size={20} />
  }];
  const sidebarVariants = {
    open: {
      width: '240px',
      transition: {
        duration: 0.3
      }
    },
    closed: {
      width: '0px',
      transition: {
        duration: 0.3
      }
    }
  };
  return <>
      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden" onClick={toggleSidebar} />}
      <motion.aside initial={false} animate={isOpen ? 'open' : 'closed'} variants={sidebarVariants} className={`fixed md:relative z-30 h-full overflow-hidden bg-gradient-to-b from-green-700 to-green-900 text-white shadow-lg`}>
        <div className="flex flex-col h-full w-60">
          <div className="flex items-center justify-between p-4 border-b border-green-600">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                <span className="text-green-700 font-bold text-lg">E</span>
              </div>
              <h1 className="font-bold text-lg">EcoClean</h1>
            </div>
            <button onClick={toggleSidebar} className="md:hidden p-1 rounded-full hover:bg-green-600">
              <XIcon size={20} />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {sidebarItems.map(item => <li key={item.path}>
                  <Link to={item.path} className={`flex items-center px-4 py-3 rounded-lg transition-colors ${location.pathname === item.path ? 'bg-green-600 text-white' : 'text-green-100 hover:bg-green-600/50'}`}>
                    <span className="mr-3">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>)}
            </ul>
          </nav>
          <div className="p-4 border-t border-green-600">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
                <UserIcon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">Admin User</p>
                <p className="text-xs text-green-200 truncate">
                  admin@ecoclean.lk
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.aside>
    </>;
};
export default Sidebar;