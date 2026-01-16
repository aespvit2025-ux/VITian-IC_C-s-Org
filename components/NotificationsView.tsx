import React from 'react';
import { ArrowLeft, Bell, Info, CheckCircle, AlertTriangle, XCircle, Trash2 } from 'lucide-react';
import { NotificationItem } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onBack: () => void;
  onClearAll: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onBack, onClearAll }) => {
  const getIcon = (type: string) => {
    switch(type) {
      case 'success': return <CheckCircle size={20} className="text-green-500" />;
      case 'warning': return <AlertTriangle size={20} className="text-orange-500" />;
      case 'error': return <XCircle size={20} className="text-red-500" />;
      default: return <Info size={20} className="text-blue-500" />;
    }
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen flex flex-col">
      <div className="bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 flex items-center justify-between">
         <div className="flex items-center gap-3">
             <button onClick={onBack} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                 <ArrowLeft size={24} />
             </button>
             <h1 className="text-lg font-bold text-[#0ea5e9] dark:text-white flex items-center gap-2">
                 Notifications
             </h1>
         </div>
         {notifications.length > 0 && (
             <button onClick={onClearAll} className="text-xs text-red-500 font-medium hover:text-red-600 flex items-center gap-1">
                 <Trash2 size={14} /> Clear All
             </button>
         )}
      </div>

      <div className="flex-1 p-4 overflow-y-auto">
        {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-4">
                <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                    <Bell size={32} />
                </div>
                <p>No notifications yet.</p>
            </div>
        ) : (
            <div className="space-y-3 pb-10">
                {notifications.map(notification => (
                    <div key={notification.id} className={`bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border ${notification.read ? 'border-gray-100 dark:border-gray-700' : 'border-blue-100 dark:border-blue-900 bg-blue-50/30 dark:bg-blue-900/10'}`}>
                        <div className="flex gap-3">
                            <div className="mt-1 flex-shrink-0">
                                {getIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${notification.read ? 'text-gray-900 dark:text-white' : 'text-[#0ea5e9] dark:text-blue-300'}`}>
                                    {notification.title}
                                </h4>
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-relaxed">
                                    {notification.message}
                                </p>
                                <p className="text-[10px] text-gray-400 mt-2">
                                    {new Date(notification.timestamp).toLocaleString()}
                                </p>
                            </div>
                            {!notification.read && (
                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};