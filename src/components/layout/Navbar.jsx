import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext.jsx';
import { formatDistanceToNow } from 'date-fns';

const Navbar = () => {
  const { unreadCount, notifications, markAllRead } = useNotification();
  const [showDropdown, setShowDropdown] = useState(false);

  return (
    <div className="h-16 bg-white border-b border-[#E2E8F0] flex items-center justify-end px-8 sticky top-0 z-10">
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none relative"
        >
          <Bell size={24} />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 bg-[#DC2626] text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
            <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs text-[#2563EB] hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto">
              {!notifications || notifications.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-500 text-center">
                  No new notifications
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`px-4 py-3 border-b border-gray-50 text-sm ${
                      !notif.is_read ? 'bg-blue-50' : ''
                    }`}
                  >
                    <p className="text-gray-800">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatDistanceToNow(new Date(notif.created_at), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
