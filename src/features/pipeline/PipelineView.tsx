import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lead } from '../../types';
import { Zap, PhoneCall, Users, Eye, Phone, User, Briefcase } from 'lucide-react';
import { clsx } from 'clsx';

export function PipelineView() {
    const { leads, updateLead } = useLeads();
    const navigate = useNavigate();
    const [activeStatus, setActiveStatus] = useState<Lead['status']>('new');

    const statuses = [
        { id: 'new', title: 'New', icon: Users, color: 'text-gray-500', bg: 'bg-gray-50' },
        { id: 'contacted', title: 'Contacted', icon: PhoneCall, color: 'text-blue-500', bg: 'bg-blue-50' },
        { id: 'sold', title: 'Sold', icon: Zap, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'deal_closed', title: 'Deal Closed', icon: Briefcase, color: 'text-indigo-500', bg: 'bg-indigo-50' },
    ];

    const typeColumns = [
        { id: 'hot', title: 'Hot Leads', icon: Zap, color: 'text-red-500', bg: 'bg-red-50' },
        { id: 'warm', title: 'Warm Leads', icon: PhoneCall, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'cold', title: 'Cold Leads', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50' },
    ];

    const handleUpdate = (leadId: string, data: Partial<Lead>) => {
        updateLead(leadId, data);
    };

    return (
        <div className="flex flex-col gap-6">
            {/* Status Tabs */}
            <div className="flex border-b border-gray-100 pb-2">
                <div className="flex gap-2 w-full">
                    {statuses.map((status) => (
                        <button
                            key={status.id}
                            onClick={() => setActiveStatus(status.id as Lead['status'])}
                            className={clsx(
                                "flex-1 px-6 py-3 rounded-t-2xl text-sm font-bold transition-all flex items-center justify-center gap-2 border-b-2 relative",
                                activeStatus === status.id
                                    ? "text-indigo-600 border-indigo-600 bg-indigo-50/30"
                                    : "text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-50/50"
                            )}
                        >
                            <status.icon size={16} />
                            {status.title}
                            <span className={clsx(
                                "ml-2 text-[10px] px-2 py-0.5 rounded-full",
                                activeStatus === status.id ? "bg-indigo-100 text-indigo-600" : "bg-gray-100 text-gray-500"
                            )}>
                                {leads.filter(l => l.status === status.id).length}
                            </span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Type Kanban */}
            <div className="flex gap-6 h-[calc(100vh-320px)] pb-4 no-scrollbar">
                {typeColumns.map((column) => (
                    <div
                        key={column.id}
                        className="flex-1 flex flex-col gap-4 rounded-2xl border border-gray-200/50 bg-white/40 p-4 h-full overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${column.bg} ${column.color}`}>
                                    <column.icon size={18} />
                                </div>
                                <h3 className="font-bold text-gray-900">{column.title}</h3>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                    {leads.filter((l: Lead) => l.status === activeStatus && l.leadType === column.id).length}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {leads
                                    .filter((l: Lead) => l.status === activeStatus && l.leadType === column.id)
                                    .map((lead) => (
                                        <motion.div
                                            key={lead._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            whileHover={{ y: -3 }}
                                            className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md cursor-pointer flex flex-col gap-3"
                                        >
                                            <div className="flex justify-between items-start">
                                                <div className="flex flex-col pr-8">
                                                    <h4 className="font-bold text-gray-900 truncate leading-tight">{lead.name}</h4>
                                                    <div className="flex items-center gap-2 text-[10px] font-semibold text-gray-500 mt-1">
                                                        <Phone size={10} className="text-gray-400" />
                                                        <span>{lead.phone}</span>
                                                    </div>
                                                </div>
                                                {/* Edit action removed from pipeline cards */}
                                            </div>

                                            <div className="flex items-center justify-between border-y border-gray-50 py-2">
                                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">{lead.leadOrigin}</span>
                                                <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                                                    <User size={12} className="text-gray-400" />
                                                    <span className="truncate max-w-[80px]">{typeof lead.assignedTo === 'object' ? lead.assignedTo?.username : 'Unassigned'}</span>
                                                </div>
                                            </div>

                                            {/* Transition Actions */}
                                            <div className="flex flex-col gap-2 mt-1">
                                                {/* Change Type */}
                                                <div className="flex gap-1">
                                                    {typeColumns.filter(c => c.id !== column.id).map(c => (
                                                        <button
                                                            key={c.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdate(lead._id, { leadType: c.id as Lead['leadType'] });
                                                            }}
                                                            className={`flex-1 text-[8px] font-bold uppercase tracking-tight py-1.5 rounded-lg border transition-all ${c.bg} ${c.color} border-transparent hover:border-current active:scale-95`}
                                                        >
                                                            {c.id}
                                                        </button>
                                                    ))}
                                                </div>

                                                {/* Change Status */}
                                                <div className="flex gap-1">
                                                    {statuses.filter(s => s.id !== activeStatus).map(s => (
                                                        <button
                                                            key={s.id}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleUpdate(lead._id, { status: s.id as Lead['status'] });
                                                            }}
                                                            className={`flex-1 text-[8px] font-bold uppercase tracking-tight py-1.5 rounded-lg border transition-all ${s.bg} ${s.color} border-transparent hover:border-current active:scale-95`}
                                                        >
                                                            {s.id.replace('_', ' ')}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <button
                                                onClick={(e) => { e.stopPropagation(); navigate(`/contact/${lead._id}`); }}
                                                className="w-full mt-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold py-2 rounded-xl border border-indigo-100 transition-colors"
                                            >
                                                <Eye size={12} /> View Lead
                                            </button>
                                        </motion.div>
                                    ))}
                            </AnimatePresence>
                            {leads.filter((l: Lead) => l.status === activeStatus && l.leadType === column.id).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No {column.id} Leads</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
