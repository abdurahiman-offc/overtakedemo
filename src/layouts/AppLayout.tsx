import { useState } from 'react';
import { Menu, Search, Bell, Plus } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { SmartList } from '../types';

interface AppLayoutProps {
    children: React.ReactNode;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onAddLead: () => void;
    onSmartListSelect: (list: SmartList) => void;
    activeSmartListId?: string;
}

export function AppLayout({ children, activeTab, setActiveTab, onAddLead, onSmartListSelect, activeSmartListId }: AppLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        setSidebarOpen(false);
    };

    const handleSmartListSelect = (list: SmartList) => {
        onSmartListSelect(list);
        setSidebarOpen(false);
    };

    return (
        <div className="flex min-h-screen relative bg-gray-50">
            <Sidebar
                activeTab={activeTab}
                setActiveTab={handleTabChange}
                isOpen={isSidebarOpen}
                activeSmartListId={activeSmartListId}
                onSmartListSelect={handleSmartListSelect}
                onAddLead={onAddLead}
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
                        <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">
                            {activeTab === 'dashboard' ? 'Dashboard' :
                                activeTab === 'followups' ? 'Today\'s Follow Ups' :
                                    activeTab === 'smartlist' ? 'Smart List' : 'Settings'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600">
                            <Search size={20} />
                        </button>
                        <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-indigo-100 hover:bg-indigo-50 hover:text-indigo-600">
                            <Bell size={20} />
                            <div className="absolute right-2 top-2 h-2 w-2 rounded-full border border-white bg-red-500" />
                        </button>
                        <button
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/40 active:translate-y-px"
                            onClick={onAddLead}
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add Lead</span>
                        </button>
                    </div>
                </header>

                <div className="mx-auto w-full max-w-[1600px] flex-1 p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
