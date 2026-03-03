import { LayoutDashboard, Calendar, Settings, Users } from 'lucide-react';
import { clsx } from 'clsx';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
}

export function Sidebar({ activeTab, setActiveTab, isOpen }: SidebarProps) {
    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'contacts', label: 'Contacts', icon: LayoutDashboard }, // Will change icon shortly
        { id: 'pipeline', label: 'Pipeline', icon: LayoutDashboard },
        { id: 'followups', label: 'Follow-ups', icon: Calendar },
        { id: 'report', label: 'Working Report', icon: Settings },
        { id: 'users', label: 'Users', icon: Users },
    ];

    return (
        <aside className={clsx(
            "fixed left-0 top-0 z-50 flex h-screen w-[260px] flex-col bg-white border-r border-gray-200 p-6 shadow-lg transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full"
        )}>
            <div className="mb-10 flex items-center gap-3 px-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 text-lg font-bold text-white shadow-md shadow-indigo-500/40">
                    CRM
                </div>
                <span className="text-xl font-bold text-gray-900 tracking-tight">Demo</span>
            </div>

            <nav className="flex flex-1 flex-col gap-2 overflow-y-auto pr-1">
                <div className="mb-2 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Main Menu</div>
                {menuItems.map((item) => (
                    <button
                        key={item.id}
                        className={clsx(
                            "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                            activeTab === item.id && activeTab !== 'smartlist'
                                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
                        )}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <item.icon size={18} />
                        <span>{item.label}</span>
                    </button>
                ))}


            </nav>
        </aside>
    );
}
