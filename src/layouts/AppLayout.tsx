import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Plus } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';

interface AppLayoutProps {
    children: React.ReactNode;
    onAddLead: () => void;
}

export function AppLayout({ children, onAddLead }: AppLayoutProps) {
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    const currentPath = location.pathname.substring(1) || 'dashboard';

    return (
        <div className="flex h-screen overflow-hidden relative bg-[#f0f2f5]">
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

            <main className="flex flex-1 flex-col transition-all duration-300 ml-0 lg:ml-[260px] w-full min-h-0">
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
                        <button
                            className="flex items-center gap-2 rounded-xl bg-[#1B1B19] px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-gray-200 transition-all hover:-translate-y-px hover:shadow-lg hover:bg-black active:translate-y-px"
                            onClick={onAddLead}
                        >
                            <Plus size={18} />
                            <span className="hidden sm:inline">Add Lead</span>
                        </button>
                    </div>
                </header>

                <div className="w-full flex-1 p-6 overflow-y-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
