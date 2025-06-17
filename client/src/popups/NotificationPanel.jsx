import { useSelector, useDispatch } from 'react-redux';
import { markAsRead, markAllAsRead } from '../store/slices/notificationSlice';
import { Bell, CheckCheck } from 'lucide-react';

const NotificationPanel = ({ closePanel }) => {
    const dispatch = useDispatch();
    const { notifications, unreadCount, loading } = useSelector(state => state.notifications);

    const handleMarkAsRead = (id) => {
        dispatch(markAsRead(id));
    };
    
    const handleMarkAll = () => {
        dispatch(markAllAsRead());
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-white rounded-md shadow-lg border z-20">
            <div className="p-4 flex justify-between items-center border-b">
                <h3 className="font-semibold">Notifications</h3>
                {unreadCount > 0 && (
                    <button onClick={handleMarkAll} className="text-sm text-blue-600 hover:underline">Mark all as read</button>
                )}
            </div>
            <div className="max-h-96 overflow-y-auto">
                {loading && <p className="p-4 text-center text-gray-500">Loading...</p>}
                {!loading && notifications.length === 0 && (
                    <div className="p-6 text-center text-gray-500">
                        <Bell className="mx-auto h-12 w-12 text-gray-400"/>
                        <p className="mt-2">You have no notifications.</p>
                    </div>
                )}
                {!loading && notifications.map(notification => (
                    <div key={notification._id} className={`p-4 border-b hover:bg-gray-50 flex items-start gap-3 ${notification.status === 'unread' ? 'bg-blue-50' : ''}`}>
                        <div className="flex-shrink-0 mt-1">
                            {notification.status === 'read' 
                                ? <CheckCheck className="h-5 w-5 text-gray-400"/>
                                : <span className="h-5 w-5 flex items-center justify-center"><span className="h-2 w-2 bg-blue-500 rounded-full"></span></span>
                            }
                        </div>
                        <div className="flex-grow">
                            <p className="text-sm text-gray-700" dangerouslySetInnerHTML={{ __html: notification.message_content }}></p>
                            <p className="text-xs text-gray-400 mt-1">
                                {new Date(notification.created_at).toLocaleString()}
                            </p>
                            {notification.status === 'unread' && (
                                <button onClick={() => handleMarkAsRead(notification._id)} className="text-xs text-blue-500 hover:underline mt-1">Mark as read</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NotificationPanel;