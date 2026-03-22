import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Upload, BarChart2, FileText, Send, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Violations', path: '/violations', icon: <AlertTriangle size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart2 size={20} /> },
    { name: 'Alerts', path: '/alerts', icon: <Send size={20} /> },
  ];

  if (user?.role !== 'viewer') {
    navItems.splice(2, 0, { name: 'Upload', path: '/upload', icon: <Upload size={20} /> });
    navItems.splice(5, 0, { name: 'Challans', path: '/challans', icon: <FileText size={20} /> });
  }

  return (
    <div className="w-64 bg-[#0F172A] text-white h-screen flex flex-col fixed left-0 top-0">
      <div className="p-6 flex items-center justify-center border-b border-gray-800">
        <h1 className="text-2xl font-bold text-[#FF9933]">CTVDS</h1>
      </div>
      
      <div className="flex-1 py-6 overflow-y-auto">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-gray-800 text-white border-l-4 border-[#FF9933]'
                    : 'text-gray-300 hover:bg-gray-800 hover:text-white border-l-4 border-transparent'
                }`
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center mb-4">
          <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-bold">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-white">{user?.name || 'User'}</p>
            <p className="text-xs text-gray-400 capitalize">{user?.role?.replace('_', ' ') || 'Role'}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-300 rounded-md hover:bg-gray-800 hover:text-white transition-colors"
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
