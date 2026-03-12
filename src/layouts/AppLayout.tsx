import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Plus, Clock, X } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useNotifications } from '../context/NotificationContext';
import { formatDistanceToNow } from 'date-fns';
import { clsx } from 'clsx';

interface AppLayoutProps {
    children: React.ReactNode;
    onAddLead: () => void;
}

export function AppLayout({ children, onAddLead }: AppLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [isNotifOpen, setNotifOpen] = useState(false);
    const notificationRef = useRef<HTMLDivElement>(null);
    const location = useLocation();
    const { notifications, unreadCount, markAsRead } = useNotifications();

    const currentPath = location.pathname.substring(1) || 'dashboard';

    // Close notifications when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setNotifOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex min-h-screen relative bg-[#f0f2f5]">
            <Sidebar
                isOpen={isSidebarOpen}
                setSidebarOpen={setSidebarOpen}
            />

            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <main className="flex flex-1 flex-col transition-all duration-300 ml-0 lg:ml-[260px] w-full">
                <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur-md">
                    <div className="flex items-center gap-4">
                        <button
                            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 lg:hidden"
                            onClick={() => setSidebarOpen(true)}
                        >
                            <Menu size={24} />
                        </button>
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl capitalize">
                            {currentPath.includes('contact/') ? 'Contact Details' :
                                currentPath === 'report' ? 'Working Report' :
                                    currentPath === 'followups' ? 'Follow Ups' :
                                        currentPath === 'admin' ? 'Admin Portal' :
                                            currentPath.replace('admin/', '')}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 relative">
                        <div ref={notificationRef}>
                            <button
                                onClick={() => setNotifOpen(!isNotifOpen)}
                                className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600"
                            >
                                <Bell size={20} />
                                {unreadCount > 0 && (
                                    <div className="absolute right-2 top-2 h-4 w-4 rounded-full border-2 border-white bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </div>
                                )}
                            </button>

                            {/* Notifications Sidebar (Right Side) */}
                            {isNotifOpen && (
                                <>
                                    <div
                                        className="fixed inset-0 z-[60] bg-black/20 backdrop-blur-[1px]"
                                        onClick={() => setNotifOpen(false)}
                                    />
                                    <div className="fixed right-0 top-0 z-[70] h-screen w-[320px] sm:w-[400px] overflow-hidden bg-white shadow-2xl animate-slideInRight flex flex-col">
                                        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-5 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 rounded-lg">
                                                    <Bell size={18} className="text-indigo-600" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900">Notifications</h3>
                                            </div>
                                            <button onClick={() => setNotifOpen(false)} className="text-gray-400 hover:text-gray-600">
                                                <X size={20} />
                                            </button>
                                        </div>
                                        <div className="flex-1 overflow-y-auto">
                                            {notifications.length > 0 ? (
                                                <div className="flex flex-col">
                                                    {notifications.map((notif) => (
                                                        <div
                                                            key={notif.id}
                                                            onClick={() => markAsRead(notif.id)}
                                                            className={clsx(
                                                                "flex flex-col gap-1 border-b border-gray-50 p-5 transition-colors cursor-pointer",
                                                                notif.read ? "bg-white opacity-60" : "bg-indigo-50/30 hover:bg-indigo-50/50"
                                                            )}
                                                        >
                                                            <div className="flex justify-between items-start">
                                                                <p className="text-sm font-medium text-gray-800 pr-4 leading-tight">{notif.message}</p>
                                                                {!notif.read && <div className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 mt-1" />}
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 mt-2">
                                                                <Clock size={10} />
                                                                <span>{formatDistanceToNow(new Date(notif.timestamp), { addSuffix: true })}</span>
                                                                {notif.userName && <span className="text-indigo-400 ml-auto">by {notif.userName}</span>}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center h-full py-10 px-4 text-center">
                                                    <div className="h-16 w-16 rounded-full bg-gray-50 flex items-center justify-center mb-4">
                                                        <Bell size={24} className="text-gray-300" />
                                                    </div>
                                                    <p className="text-base font-medium text-gray-500">No notifications yet</p>
                                                    <p className="text-xs text-gray-400 mt-1">We'll let you know when something important happens.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/40 active:translate-y-px"
                            onClick={onAddLead}
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add Lead</span>
                        </button>
                    </div>
                </header>

                <div className="w-full flex-1 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
