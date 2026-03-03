import { useState, useMemo } from 'react';
import { useLeads } from '../../context/LeadsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { format, isSameDay, parseISO, startOfDay, differenceInDays } from 'date-fns';
import { Calendar as CalendarIcon, AlertCircle, Clock, CheckCircle2, Phone, MapPin, User, Tag, Edit3, Eye, Plus, Filter, Zap, PhoneCall, Users } from 'lucide-react';
import { Lead } from '../../types';
import { LeadPage } from '../leads/LeadPage';
import { LeadFormModal } from '../leads/LeadFormModal';

export function FollowupsView() {
    const { leads, users, updateLead } = useLeads();
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    // Filters & Tabs
    const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'missed'>('today');
    const [assigneeFilter, setAssigneeFilter] = useState<string>('all');
    const [specificDateFilter, setSpecificDateFilter] = useState<string>('');
    const [draggedLead, setDraggedLead] = useState<Lead | null>(null);

    const tabs = [
        { id: 'today', title: 'Today', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', activeBg: 'bg-emerald-100' },
        { id: 'upcoming', title: 'Upcoming', icon: Clock, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', activeBg: 'bg-blue-100' },
        { id: 'missed', title: 'Missed', icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100', activeBg: 'bg-red-100' },
    ];

    const leadTypeColumns = [
        { id: 'hot', title: 'Hot', icon: Zap, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-100' },
        { id: 'warm', title: 'Warm', icon: PhoneCall, color: 'text-amber-500', bg: 'bg-amber-50', border: 'border-amber-100' },
        { id: 'cold', title: 'Cold', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100' },
    ];

    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            if (!lead.followupDate || lead.status === 'closed' || lead.status === 'lost') return false;

            // Apply assignee filter
            if (assigneeFilter !== 'all') {
                if (assigneeFilter === 'unassigned') {
                    if (lead.assignedTo) return false;
                } else {
                    const assignedId = typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo;
                    if (assignedId !== assigneeFilter) return false;
                }
            }

            // Apply specific date filter
            if (specificDateFilter) {
                const fDate = startOfDay(parseISO(lead.followupDate as string));
                const filterDate = startOfDay(parseISO(specificDateFilter));
                if (!isSameDay(fDate, filterDate)) return false;
            }

            return true;
        });
    }, [leads, assigneeFilter, specificDateFilter]);

    // First categorize by Time (Tab)
    const categorizedByTime = useMemo(() => {
        const result: Record<string, Lead[]> = { missed: [], today: [], upcoming: [] };
        const today = startOfDay(new Date());

        filteredLeads.forEach(lead => {
            const fDate = startOfDay(parseISO(lead.followupDate as string));

            if (fDate < today) {
                result.missed.push(lead);
            } else if (isSameDay(fDate, today)) {
                result.today.push(lead);
            } else {
                result.upcoming.push(lead);
            }
        });

        // Sort upcoming by closest date first
        result.upcoming.sort((a, b) => new Date(a.followupDate!).getTime() - new Date(b.followupDate!).getTime());
        // Sort missed by oldest first (largest days past)
        result.missed.sort((a, b) => new Date(a.followupDate!).getTime() - new Date(b.followupDate!).getTime());

        return result;
    }, [filteredLeads]);

    // Leads for current active tab
    const currentTabLeads = categorizedByTime[activeTab];

    // Inside the active tab, group leads by LEAD TYPE to form columns
    const columnsData = useMemo(() => {
        const grouped: Record<string, Lead[]> = { hot: [], warm: [], cold: [] };
        currentTabLeads.forEach(lead => {
            if (grouped[lead.leadType]) {
                grouped[lead.leadType].push(lead);
            }
        });
        return grouped;
    }, [currentTabLeads]);

    const handleDragStart = (e: React.DragEvent, lead: Lead) => {
        setDraggedLead(lead);
        e.dataTransfer.setData('text/plain', lead._id);
        e.dataTransfer.effectAllowed = 'move';

        const target = e.target as HTMLElement;
        target.style.opacity = '0.4';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        setDraggedLead(null);
        const target = e.target as HTMLElement;
        target.style.opacity = '1';
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, targetType: string) => {
        e.preventDefault();
        if (!draggedLead || draggedLead.leadType === targetType) return;

        try {
            await updateLead(draggedLead._id, { leadType: targetType as 'hot' | 'warm' | 'cold' });
        } catch (error) {
            console.error('Failed to change lead type:', error);
        }
        setDraggedLead(null);
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

            {/* Top Bar: Tabs & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 rounded-2xl border border-gray-100 shadow-sm">

                {/* Tabs */}
                <div className="flex w-full md:w-auto p-1 bg-gray-50 rounded-xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex flex-1 md:flex-none items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all duration-200 ${activeTab === tab.id
                                ? `bg-white text-gray-900 shadow-sm border border-gray-200`
                                : `text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-transparent`
                                }`}
                        >
                            <tab.icon size={16} className={activeTab === tab.id ? tab.color : 'text-gray-400'} />
                            {tab.title}
                            <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === tab.id ? tab.bg + ' ' + tab.color : 'bg-gray-200 text-gray-500'}`}>
                                {categorizedByTime[tab.id].length}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Global Filters */}
                <div className="flex items-center gap-4 w-full md:w-auto px-2">
                    <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <Filter size={16} /> Filters:
                    </div>

                    <div className="flex items-center gap-2 relative">
                        <input
                            type="date"
                            value={specificDateFilter}
                            onChange={(e) => setSpecificDateFilter(e.target.value)}
                            className="flex-1 md:flex-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-colors"
                        />
                        {specificDateFilter && (
                            <button
                                onClick={() => setSpecificDateFilter('')}
                                className="absolute right-2 text-gray-400 hover:text-red-500"
                                title="Clear Date Filter"
                            >
                                <Plus size={16} className="rotate-45" />
                            </button>
                        )}
                    </div>

                    <select
                        value={assigneeFilter}
                        onChange={(e) => setAssigneeFilter(e.target.value)}
                        className="flex-1 md:flex-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-2 text-sm font-medium focus:border-indigo-500 focus:outline-none transition-colors min-w-[150px]"
                    >
                        <option value="all">Assignee: All</option>
                        <option value="unassigned">Unassigned</option>
                        {users.map(u => (
                            <option key={u._id} value={u._id}>{u.username}</option>
                        ))}
                    </select>
                </div>

            </div>

            {/* Kanban Board Columns (Lead Types) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-280px)]">
                {leadTypeColumns.map((column) => {
                    const columnLeads = columnsData[column.id];

                    return (
                        <div
                            key={column.id}
                            onDragOver={handleDragOver}
                            onDrop={(e) => handleDrop(e, column.id)}
                            className={`flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50/50 p-4 overflow-hidden min-w-[320px] transition-colors ${draggedLead && draggedLead.leadType !== column.id ? 'bg-indigo-50/30 border-dashed border-indigo-200' : ''}`}
                        >
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${column.bg} ${column.color}`}>
                                        <column.icon size={18} />
                                    </div>
                                    <h3 className="font-bold text-gray-900">{column.title} Leads</h3>
                                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                                        {columnLeads.length}
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-1 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
                                {columnLeads.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-gray-300 h-full">
                                        <div className="h-10 w-10 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center mb-2">
                                            <Plus size={20} />
                                        </div>
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-center">Drag leads<br />here</span>
                                    </div>
                                ) : (
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {columnLeads.map((lead) => {
                                            const fDate = parseISO(lead.followupDate as string);
                                            const daysPast = differenceInDays(startOfDay(new Date()), startOfDay(fDate));

                                            return (
                                                <motion.div
                                                    key={lead._id}
                                                    layout
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    whileHover={{ y: -3 }}
                                                    draggable
                                                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                                    onDragStart={(e) => handleDragStart(e as any, lead)}
                                                    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
                                                    onDragEnd={(e) => handleDragEnd(e as any)}
                                                    className="group relative rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all hover:border-indigo-200 hover:shadow-md flex flex-col gap-3 cursor-grab active:cursor-grabbing"
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
                                                                onClick={(e) => { e.stopPropagation(); setEditingLead(lead); }}
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

                                                    <div className="mt-1 flex items-center justify-between">
                                                        {activeTab === 'missed' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-red-50 text-red-700 text-[10px] font-bold border border-red-100">
                                                                <AlertCircle size={10} /> +{daysPast} {daysPast === 1 ? 'Day' : 'Days'} Overdue
                                                            </span>
                                                        ) : activeTab === 'upcoming' ? (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                                                                <CalendarIcon size={10} /> {format(fDate, 'MMM d, yyyy')}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-100">
                                                                <CheckCircle2 size={10} /> Scheduled for Today
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                                                        className="w-full mt-1 flex items-center justify-center gap-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold py-2 rounded-xl border border-indigo-100 transition-colors"
                                                    >
                                                        <Eye size={14} /> View Lead
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </AnimatePresence>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {editingLead && (
                <LeadFormModal
                    initialData={editingLead}
                    onClose={() => setEditingLead(null)}
                />
            )}
        </div>
    );
}
