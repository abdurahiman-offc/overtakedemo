import { useState, useMemo } from 'react';
import { useLeads } from '../../context/LeadsContext';
import { LeadCard } from './LeadCard';
import { LeadDetailsModal } from './LeadDetailsModal';
import { LeadFormModal } from './LeadFormModal';
import { Search, Filter, CalendarCheck, Bookmark, X } from 'lucide-react';
import { isSameDay, parseISO } from 'date-fns';
import { Lead, LeadFilter } from '../../types';

interface LeadListProps {
    filterType: 'all' | 'followup' | 'smartlist';
    smartListFilter?: LeadFilter;
}

export function LeadList({ filterType, smartListFilter }: LeadListProps) {
    const { leads, updateLead, addSmartList } = useLeads();
    const [searchTerm, setSearchTerm] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');
    const [placeFilter, setPlaceFilter] = useState('');
    const [tagFilter, setTagFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [leadTypeFilter, setLeadTypeFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('');

    const [isSmartListModalOpen, setIsSmartListModalOpen] = useState(false);
    const [smartListName, setSmartListName] = useState('');

    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [editingLead, setEditingLead] = useState<Lead | null>(null);

    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

    // Apply filters
    const filteredLeads = useMemo(() => {
        return leads.filter(lead => {
            // 1. Search Logic (Global)
            if (searchTerm) {
                const matchesGlobal =
                    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    lead.phone.includes(searchTerm) ||
                    lead.enquiredVehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    lead.place.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    lead.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
                if (!matchesGlobal) return false;
            }

            // 2. Tab Logic (Follow-up vs All)
            if (filterType === 'followup') {
                const today = new Date();
                const leadDate = parseISO(lead.followupDate);
                if (!isSameDay(today, leadDate)) return false;
            }

            // 3. Smart List Filters (if in smartlist mode)
            if (filterType === 'smartlist' && smartListFilter) {
                if (smartListFilter.name && !lead.name.toLowerCase().includes(smartListFilter.name.toLowerCase())) return false;
                if (smartListFilter.phone && !lead.phone.includes(smartListFilter.phone)) return false;
                if (smartListFilter.place && !lead.place.toLowerCase().includes(smartListFilter.place.toLowerCase())) return false;
                if (smartListFilter.tag && !lead.tags.some(t => t.toLowerCase().includes(smartListFilter.tag!.toLowerCase()))) return false;
                if (smartListFilter.status && smartListFilter.status !== 'all' && lead.status !== smartListFilter.status) return false;
                if (smartListFilter.leadType && smartListFilter.leadType !== 'all' && lead.leadType !== smartListFilter.leadType) return false;
            }

            // 4. Manual Advanced Filters
            if (nameFilter && !lead.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
            if (phoneFilter && !lead.phone.includes(phoneFilter)) return false;
            if (placeFilter && !lead.place.toLowerCase().includes(placeFilter.toLowerCase())) return false;
            if (tagFilter && !lead.tags.some(t => t.toLowerCase().includes(tagFilter.toLowerCase()))) return false;

            // 5. Date Filter (Custom date selector)
            if (dateFilter && filterType === 'all') {
                if (lead.followupDate !== dateFilter) return false;
            }

            // 6. Status Filter
            if (statusFilter !== 'all' && lead.status !== statusFilter) return false;

            // 7. Lead Type Filter
            if (leadTypeFilter !== 'all' && lead.leadType !== leadTypeFilter) return false;

            return true;
        });
    }, [leads, filterType, smartListFilter, searchTerm, nameFilter, phoneFilter, placeFilter, tagFilter, dateFilter, statusFilter, leadTypeFilter]);

    const handleEditLead = (lead: Lead) => {
        setSelectedLead(null);
        setEditingLead(lead);
    };

    const handleSaveSmartList = () => {
        if (!smartListName) return;

        const filters: LeadFilter = {
            name: nameFilter,
            phone: phoneFilter,
            place: placeFilter,
            tag: tagFilter,
            status: statusFilter,
            leadType: leadTypeFilter as any,
        };

        addSmartList({
            name: smartListName,
            filters
        });

        setIsSmartListModalOpen(false);
        setSmartListName('');
    };

    const hasActiveFilters = searchTerm || nameFilter || phoneFilter || placeFilter || tagFilter || statusFilter !== 'all' || leadTypeFilter !== 'all' || dateFilter;

    return (
        <div className="flex w-full flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[300px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search leads, tags, or place..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-10 pr-4 text-sm shadow-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                        className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all ${showAdvancedFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-600'}`}
                    >
                        <Filter size={18} />
                        Filters
                    </button>

                    {hasActiveFilters && (
                        <button
                            onClick={() => setIsSmartListModalOpen(true)}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-all"
                        >
                            <Bookmark size={16} />
                            Save as Smart List
                        </button>
                    )}
                </div>
            </div>

            {showAdvancedFilters && (
                <div className="grid grid-cols-1 gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm sm:grid-cols-2 lg:grid-cols-4 animate-fadeIn">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Filter by Name</label>
                        <input
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                            placeholder="Search name..."
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Filter by Phone</label>
                        <input
                            value={phoneFilter}
                            onChange={(e) => setPhoneFilter(e.target.value)}
                            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                            placeholder="Search phone..."
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Filter by Place</label>
                        <input
                            value={placeFilter}
                            onChange={(e) => setPlaceFilter(e.target.value)}
                            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                            placeholder="Search place..."
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Filter by Tag</label>
                        <input
                            value={tagFilter}
                            onChange={(e) => setTagFilter(e.target.value)}
                            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                            placeholder="Search tags..."
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                        >
                            <option value="all">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="followed_up">Followed</option>
                            <option value="closed">Closed</option>
                            <option value="lost">Lost</option>
                        </select>
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] font-bold uppercase text-gray-400">Lead Type</label>
                        <select
                            value={leadTypeFilter}
                            onChange={(e) => setLeadTypeFilter(e.target.value)}
                            className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                        >
                            <option value="all">All Types</option>
                            <option value="hot">Hot</option>
                            <option value="warm">Warm</option>
                            <option value="cold">Cold</option>
                        </select>
                    </div>
                    {filterType === 'all' && (
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Follow-up Date</label>
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm focus:bg-white focus:ring-2 focus:ring-indigo-100 outline-none"
                            />
                        </div>
                    )}
                    <div className="flex items-end pt-2">
                        <button
                            onClick={() => {
                                setSearchTerm(''); setNameFilter(''); setPhoneFilter(''); setPlaceFilter(''); setTagFilter(''); setStatusFilter('all'); setLeadTypeFilter('all'); setDateFilter('');
                            }}
                            className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider"
                        >
                            Clear All Filters
                        </button>
                    </div>
                </div>
            )}

            {filteredLeads.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50/50 py-16 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
                        <CalendarCheck size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">No leads found</h3>
                    <p className="text-gray-500 max-w-xs mx-auto mt-1">
                        Try adjusting your filters or search terms.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {filteredLeads.map(lead => (
                        <LeadCard
                            key={lead.id}
                            lead={lead}
                            onClick={setSelectedLead}
                            onStatusChange={(id, status) => updateLead(id, { status })}
                        />
                    ))}
                </div>
            )}

            {/* Smart List Modal */}
            {isSmartListModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 text-left">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Save Smart List</h3>
                            <button onClick={() => setIsSmartListModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">Save the current filters to quickly access them from the sidebar later.</p>
                        <input
                            autoFocus
                            placeholder="e.g. Hot EV Leads in NY"
                            value={smartListName}
                            onChange={(e) => setSmartListName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsSmartListModalOpen(false)} className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-900">Cancel</button>
                            <button
                                onClick={handleSaveSmartList}
                                className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50"
                                disabled={!smartListName}
                            >
                                Save List
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {selectedLead && (
                <LeadDetailsModal
                    lead={selectedLead}
                    onClose={() => setSelectedLead(null)}
                    onEdit={handleEditLead}
                />
            )}

            {editingLead && (
                <LeadFormModal
                    initialData={editingLead}
                    onClose={() => setEditingLead(null)}
                />
            )}
        </div>
    )
}
