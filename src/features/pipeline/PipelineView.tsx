import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Lead } from '../../types';
import { Zap, PhoneCall, Users, Edit3, Eye, Plus, MapPin, Phone, User, Tag } from 'lucide-react';
import { LeadPage } from '../leads/LeadPage';
import { LeadFormModal } from '../leads/LeadFormModal';

export function PipelineView() {
    const { leads, updateLead } = useLeads();
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const columns = [
        { id: 'hot', title: 'Hot Leads', icon: Zap, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
        { id: 'warm', title: 'Warm Leads', icon: PhoneCall, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
        { id: 'cold', title: 'Cold Leads', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    ];

    const handleDragEnd = (leadId: string, newType: Lead['leadType']) => {
        updateLead(leadId, { leadType: newType });
    };

    if (selectedLead) {
        return (
            <div className="w-full flex-1 animate-fadeIn">
                <LeadPage
                    lead={selectedLead}
                    onBack={() => setSelectedLead(null)}
                    onEdit={(l) => {
                        setSelectedLead(null);
                        setEditingLead(l);
                    }}
                />
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-250px)]">
                {columns.map((column) => (
                    <div
                        key={column.id}
                        className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 overflow-hidden min-w-[320px]"
                    >
                        <div className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-1.5 rounded-lg ${column.bg} ${column.color}`}>
                                    <column.icon size={18} />
                                </div>
                                <h3 className="font-bold text-gray-900">{column.title}</h3>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                    {leads.filter(l => l.leadType === column.id).length}
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                            <AnimatePresence mode="popLayout" initial={false}>
                                {leads.filter(l => l.leadType === column.id).map((lead) => (
                                    <motion.div
                                        key={lead._id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        whileHover={{ y: -3 }}
                                        className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md cursor-grab active:cursor-grabbing flex flex-col gap-3"
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <h4 className="font-bold text-gray-900 truncate leading-tight">{lead.name}</h4>
                                                <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gray-500 mt-1">
                                                    <span className="flex items-center gap-1"><Phone size={10} /> {lead.phone}</span>
                                                    {lead.place && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="flex items-center gap-1"><MapPin size={10} /> {lead.place}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => setEditingLead(lead)}
                                                    className="p-1.5 text-gray-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100"
                                                >
                                                    <Edit3 size={14} />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between border-y border-gray-50 py-2">
                                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">{lead.leadOrigin}</span>

                                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-gray-600">
                                                <User size={12} className="text-gray-400" />
                                                {typeof lead.assignedTo === 'object' ? lead.assignedTo?.username : 'Unassigned'}
                                            </div>
                                        </div>

                                        {lead.tags && lead.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1">
                                                {lead.tags.slice(0, 3).map((tag, idx) => (
                                                    <span key={idx} className="flex items-center gap-1 text-[9px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded-md border border-gray-200">
                                                        <Tag size={8} className="text-gray-400" /> {tag}
                                                    </span>
                                                ))}
                                                {lead.tags.length > 3 && (
                                                    <span className="text-[9px] font-bold text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded-md border border-gray-200">+{lead.tags.length - 3}</span>
                                                )}
                                            </div>
                                        )}

                                        {lead.carDetails?.[0] && (
                                            <div className="text-[10px] text-gray-500 bg-gray-50/50 p-2 rounded-lg border border-gray-100/50 flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                                                <span className="truncate"><b>{lead.carDetails[0].brandName}</b> {lead.carDetails[0].modelName}</span>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-2 mt-1">
                                            {columns.filter(c => c.id !== column.id).map(c => (
                                                <button
                                                    key={c.id}
                                                    onClick={() => handleDragEnd(lead._id, c.id as Lead['leadType'])}
                                                    className={`text-[9px] font-bold uppercase tracking-widest py-1.5 rounded-lg border transition-all ${c.bg} ${c.color} border-transparent hover:border-current active:scale-95`}
                                                >
                                                    {c.id}
                                                </button>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => setSelectedLead(lead)}
                                            className="w-full mt-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 rounded-xl border border-indigo-100 transition-colors"
                                        >
                                            <Eye size={14} /> View Lead
                                        </button>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                            {leads.filter(l => l.leadType === column.id).length === 0 && (
                                <div className="flex flex-col items-center justify-center py-12 text-gray-300">
                                    <div className="h-10 w-10 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-2">
                                        <Plus size={20} />
                                    </div>
                                    <span className="text-[10px] font-bold uppercase tracking-widest">No Leads</span>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>            {editingLead && (
                <LeadFormModal
                    initialData={editingLead}
                    onClose={() => setEditingLead(null)}
                />
            )}
        </div>
    );
}
