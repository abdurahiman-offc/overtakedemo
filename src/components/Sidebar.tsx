import { LayoutDashboard, Users, GitMerge, CalendarCheck, BarChart3, UserCog } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.jpg';

interface SidebarProps {
    isOpen: boolean;
    setSidebarOpen: (isOpen: boolean) => void;
}

export function Sidebar({ isOpen, setSidebarOpen }: SidebarProps) {
    const location = useLocation();
    const navigate = useNavigate();
    const { isAdmin, logout } = useAuth();
    const activeTab = location.pathname.substring(1) || 'dashboard';

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'contacts', label: 'Contacts', icon: Users },
        { id: 'pipeline', label: 'Pipeline', icon: GitMerge },
        { id: 'followups', label: 'Follow-ups', icon: CalendarCheck },
    ];

    if (isAdmin) {
        menuItems.push({ id: 'report', label: 'Working Report', icon: BarChart3 });
        menuItems.push({ id: 'users', label: 'Users', icon: UserCog });
    }

    const handleLogout = () => {
        logout();
        setSidebarOpen(false);
        navigate('/admin-login');
    };

    return (
        <aside className={clsx(
            "fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-white border-r border-gray-200 p-6 shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="mb-10 flex items-center gap-4 px-2">
                <img
                    src={logo}
                    alt="Overtake Logo"
                    className="h-16 w-16 rounded-full object-cover border-2 border-indigo-50 shadow-md"
                />
                <span className="text-2xl font-black text-gray-900 tracking-tighter uppercase italic">overtake</span>
            </div>

            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Main Menu</div>
                {menuItems.map((item) => (
                    <Link
                        key={item.id}
                        to={isAdmin ? `/admin/${item.id}` : `/${item.id}`}
                        className={clsx(
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                            activeTab === item.id || (item.id === 'contacts' && activeTab === 'smartlist') || (isAdmin && location.pathname.includes(`/admin/${item.id}`))
                                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                        )}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </Link>
                ))}

            </nav>

            <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-2">
                {isAdmin ? (
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 text-red-500 hover:bg-red-50 hover:text-red-700"
                    >
                        <Users size={18} />
                        <span>Logout</span>
                    </button>
                ) : (
                    <Link
                        to="/admin-login"
                        className={clsx(
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                            activeTab === 'admin-login'
                                ? "bg-slate-800 text-white shadow-md shadow-slate-800/20"
                                : "text-gray-500 hover:bg-slate-50 hover:text-slate-700"
                        )}
                        onClick={() => setSidebarOpen(false)}
                    >
                        <Users size={18} />
                        <span>Login as Admin</span>
                    </Link>
                )}
            </div>
        </aside>
    );
}
