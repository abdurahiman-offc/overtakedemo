import { LayoutDashboard, Calendar, Settings, Plus, Bookmark } from 'lucide-react';
import { clsx } from 'clsx';
import { useLeads } from '../context/LeadsContext';
import { SmartList } from '../types';

interface SidebarProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isOpen: boolean;
    activeSmartListId?: string;
    onSmartListSelect: (list: SmartList) => void;
    onAddLead: () => void;
}

export function Sidebar({ activeTab, setActiveTab, isOpen, activeSmartListId, onSmartListSelect, onAddLead }: SidebarProps) {
    const { smartLists } = useLeads();

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'followups', label: 'Follow-ups', icon: Calendar },
        { id: 'settings', label: 'Settings', icon: Settings },
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

                {smartLists.length > 0 && (
                    <>
                        <div className="mb-2 mt-6 px-4 text-[10px] font-bold uppercase tracking-widest text-gray-400">Smart Lists</div>
                        {smartLists.map((list) => (
                            <button
                                key={list.id}
                                className={clsx(
                                    "flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 text-left",
                                    activeSmartListId === list.id
                                        ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                                        : "text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border border-transparent"
                                )}
                                onClick={() => onSmartListSelect(list)}
                            >
                                <Bookmark size={18} className={activeSmartListId === list.id ? "text-white" : "text-indigo-400"} />
                                <span className="truncate">{list.name}</span>
                            </button>
                        ))}
                    </>
                )}
            </nav>

            <div className="mt-auto border-t border-gray-200 pt-6">
                <button
                    onClick={onAddLead}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3.5 font-semibold text-white shadow-md transition-transform hover:-translate-y-px hover:bg-black active:translate-y-px"
                >
                    <Plus size={20} />
                    <span>New Lead</span>
                </button>
            </div>
        </aside>
    );
}
