import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../../context/LeadsContext';
import { Search, Filter, X, Briefcase, Bookmark, MoreHorizontal, Trash2, UserPlus, CheckCircle2 } from 'lucide-react';
import { isSameDay, parseISO, format } from 'date-fns';
import { LeadFilter } from '../../types';
import { TagInput } from '../../components/TagInput';

interface LeadListProps {
    initialFilter?: 'all' | 'followup';
}

export function LeadList({ initialFilter = 'all' }: LeadListProps) {
    const { leads, addSmartList, users, bulkDeleteLeads, bulkAssignLeads, bulkUpdateLeads, smartLists, deleteSmartList } = useLeads();

    const [currentMode, setCurrentMode] = useState<'all' | 'followup' | 'smartlist'>(initialFilter);
    const [activeSmartListId, setActiveSmartListId] = useState<string | null>(null);

    // Selection state
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [nameFilter, setNameFilter] = useState('');
    const [phoneFilter, setPhoneFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [leadTypeFilter, setLeadTypeFilter] = useState('all');
    const [leadOriginFilter, setLeadOriginFilter] = useState('all');
    const [placeFilter, setPlaceFilter] = useState('');
    const [designationFilter, setDesignationFilter] = useState('');
    const [tagFilterTags, setTagFilterTags] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState('');
    const [assignedToFilter, setAssignedToFilter] = useState('all');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [intentFilter, setIntentFilter] = useState('all');
    const [brandFilter, setBrandFilter] = useState('');
    const [modelFilter, setModelFilter] = useState('');
    const [fuelTypeFilter, setFuelTypeFilter] = useState('all');
    const [yearFilter, setYearFilter] = useState('');
    const [kmDrivenFilter, setKmDrivenFilter] = useState('');
    const [kmDrivenOp, setKmDrivenOp] = useState<'eq' | 'gt' | 'lt'>('eq');
    const [amountFilter, setAmountFilter] = useState('');
    const [amountOp, setAmountOp] = useState<'eq' | 'gt' | 'lt'>('eq');

    const [placeFocused, setPlaceFocused] = useState(false);
    const [designationFocused, setDesignationFocused] = useState(false);
    const [brandFilterFocused, setBrandFilterFocused] = useState(false);
    const [modelFilterFocused, setModelFilterFocused] = useState(false);

    const [isSmartListModalOpen, setIsSmartListModalOpen] = useState(false);
    const [smartListName, setSmartListName] = useState('');

    const navigate = useNavigate();
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
    const [showBulkAssignPanel, setShowBulkAssignPanel] = useState(false);
    const [showBulkUpdatePanel, setShowBulkUpdatePanel] = useState(false);
    const [bulkUpdateType, setBulkUpdateType] = useState<'status' | 'type' | 'tags' | 'date' | null>(null);
    const [bulkTagUpdateType, setBulkTagUpdateType] = useState<'add' | 'remove'>('add');
    const [bulkTags, setBulkTags] = useState<string[]>([]);

    // Get unique tags from all leads for suggestions
    const availableTags = useMemo(() => {
        const tags = new Set<string>();
        leads.forEach(l => l.tags?.forEach(t => tags.add(t)));
        return Array.from(tags);
    }, [leads]);

    const availablePlaces = useMemo(() => {
        const places = new Set<string>();
        leads.forEach(l => {
            if (l.place) places.add(l.place);
        });
        return Array.from(places);
    }, [leads]);

    const availableDesignations = useMemo(() => {
        const designations = new Set<string>();
        leads.forEach(l => {
            if (l.designation) designations.add(l.designation);
        });
        return Array.from(designations);
    }, [leads]);

    const availableBrandNames = useMemo(() => {
        const brands = new Set<string>();
        leads.forEach(l => {
            l.carDetails?.forEach(c => {
                if (c.brandName) brands.add(c.brandName);
                if (c.wantedCar?.brandName) brands.add(c.wantedCar.brandName);
                if (c.ownedCar?.brandName) brands.add(c.ownedCar.brandName);
            });
        });
        return Array.from(brands);
    }, [leads]);

    const availableModelNames = useMemo(() => {
        const models = new Set<string>();
        leads.forEach(l => {
            l.carDetails?.forEach(c => {
                if (c.modelName) models.add(c.modelName);
                if (c.wantedCar?.modelName) models.add(c.wantedCar.modelName);
                if (c.ownedCar?.modelName) models.add(c.ownedCar.modelName);
            });
        });
        return Array.from(models);
    }, [leads]);

    // Apply filters
    const filteredLeads = useMemo(() => {
        const activeSmartList = smartLists.find(l => l._id === activeSmartListId);
        const smartListFilter = activeSmartList?.filters;

        return leads.filter(lead => {
            // Priority: Quick Search
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    lead.name.toLowerCase().includes(searchLower) ||
                    lead.phone.includes(searchLower) ||
                    (lead.place && lead.place.toLowerCase().includes(searchLower)) ||
                    lead.tags.some(t => t.toLowerCase().includes(searchLower)) ||
                    lead.carDetails?.some(c => `${c.brandName} ${c.modelName}`.toLowerCase().includes(searchLower))
                );
            }

            // Mode: Follow-up
            if (currentMode === 'followup') {
                if (!lead.followupDate) return false;
                const today = new Date();
                const leadDate = parseISO(lead.followupDate as string);
                if (!isSameDay(today, leadDate)) return false;
            }

            // Mode: Smart List (Saved Filters)
            if (currentMode === 'smartlist' && smartListFilter) {
                if (smartListFilter.selectedIds && smartListFilter.selectedIds.length > 0) {
                    if (!smartListFilter.selectedIds.includes(lead._id)) return false;
                }
                if (smartListFilter.name && !lead.name.toLowerCase().includes(smartListFilter.name.toLowerCase())) return false;
                if (smartListFilter.phone && !lead.phone.includes(smartListFilter.phone)) return false;
                if (smartListFilter.place && (!lead.place || !lead.place.toLowerCase().includes(smartListFilter.place.toLowerCase()))) return false;
                if (smartListFilter.designation && (!lead.designation || !lead.designation.toLowerCase().includes(smartListFilter.designation.toLowerCase()))) return false;
                if (smartListFilter.tag && !lead.tags.some(t => t.toLowerCase().includes(smartListFilter.tag!.toLowerCase()))) return false;
                if (smartListFilter.status && smartListFilter.status !== 'all' && lead.status !== smartListFilter.status) return false;
                if (smartListFilter.leadType && smartListFilter.leadType !== 'all' && lead.leadType !== smartListFilter.leadType) return false;
                if (smartListFilter.leadOrigin && smartListFilter.leadOrigin !== 'all' && lead.leadOrigin !== smartListFilter.leadOrigin) return false;

                if (smartListFilter.paymentStatus && smartListFilter.paymentStatus !== 'all' && lead.paymentStatus !== smartListFilter.paymentStatus) return false;

                // Car / intent based filters for smart lists
                if (
                    smartListFilter.intent ||
                    smartListFilter.brandName ||
                    smartListFilter.modelName ||
                    smartListFilter.fuelType ||
                    smartListFilter.year ||
                    smartListFilter.kmDrivenValue ||
                    smartListFilter.amountValue
                ) {
                    if (!lead.carDetails || lead.carDetails.length === 0) return false;

                    const matchesCarFilters = lead.carDetails.some(car => {
                        // Intent
                        if (smartListFilter.intent && smartListFilter.intent !== 'all' && car.intent !== smartListFilter.intent) {
                            return false;
                        }

                        const brandTerm = smartListFilter.brandName?.toLowerCase().trim();
                        if (brandTerm) {
                            const brandCandidates = [
                                car.brandName,
                                car.wantedCar?.brandName,
                                car.ownedCar?.brandName
                            ].filter(Boolean).map(v => (v as string).toLowerCase());

                            if (!brandCandidates.some(b => b.includes(brandTerm))) {
                                return false;
                            }
                        }

                        const modelTerm = smartListFilter.modelName?.toLowerCase().trim();
                        if (modelTerm) {
                            const modelCandidates = [
                                car.modelName,
                                car.wantedCar?.modelName,
                                car.ownedCar?.modelName
                            ].filter(Boolean).map(v => (v as string).toLowerCase());

                            if (!modelCandidates.some(m => m.includes(modelTerm))) {
                                return false;
                            }
                        }

                        const fuelFilter = smartListFilter.fuelType?.trim();
                        if (fuelFilter) {
                            const fuelCandidates = [
                                car.fuelType,
                                car.wantedCar?.fuelType,
                                car.ownedCar?.fuelType
                            ].filter(Boolean);

                            if (!fuelCandidates.some(f => f === fuelFilter)) {
                                return false;
                            }
                        }

                        const yearFilterValue = smartListFilter.year?.trim();
                        if (yearFilterValue) {
                            const yearCandidates = [
                                car.wantedCar?.year,
                                car.ownedCar?.year
                            ].filter(Boolean);

                            if (!yearCandidates.some(y => y === yearFilterValue)) {
                                return false;
                            }
                        }

                        const kmValue = smartListFilter.kmDrivenValue?.trim();
                        if (kmValue) {
                            const target = Number(kmValue);
                            if (!Number.isFinite(target)) return false;

                            const kmCandidates = [
                                car.kmDriven,
                                car.wantedCar?.kmDriven,
                                car.ownedCar?.kmDriven
                            ]
                                .map(v => (v ? Number(v) : NaN))
                                .filter(v => Number.isFinite(v));

                            if (kmCandidates.length === 0) return false;

                            const op = smartListFilter.kmDrivenOp || 'eq';
                            const kmMatches = kmCandidates.some(v => {
                                if (op === 'gt') return v > target;
                                if (op === 'lt') return v < target;
                                return v === target;
                            });

                            if (!kmMatches) return false;
                        }

                        const amountValue = smartListFilter.amountValue?.trim();
                        if (amountValue) {
                            const target = Number(amountValue);
                            if (!Number.isFinite(target)) return false;

                            const amountCandidates = [
                                car.wantedCar?.amount,
                                car.ownedCar?.amount
                            ]
                                .map(v => (v ? Number(v) : NaN))
                                .filter(v => Number.isFinite(v));

                            if (amountCandidates.length === 0) return false;

                            const op = smartListFilter.amountOp || 'eq';
                            const amountMatches = amountCandidates.some(v => {
                                if (op === 'gt') return v > target;
                                if (op === 'lt') return v < target;
                                return v === target;
                            });

                            if (!amountMatches) return false;
                        }

                        return true;
                    });

                    if (!matchesCarFilters) return false;
                }

                if (smartListFilter.assignedTo && smartListFilter.assignedTo !== 'all') {
                    const leadAssignedId = typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo;
                    if (smartListFilter.assignedTo === 'unassigned') {
                        if (leadAssignedId) return false;
                    } else if (leadAssignedId !== smartListFilter.assignedTo) {
                        return false;
                    }
                }
            }

            // Ad-hoc Filters (Local state)
            if (nameFilter && !lead.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
            if (phoneFilter && !lead.phone.includes(phoneFilter)) return false;
            if (placeFilter && (!lead.place || !lead.place.toLowerCase().includes(placeFilter.toLowerCase()))) return false;
            if (designationFilter && (!lead.designation || !lead.designation.toLowerCase().includes(designationFilter.toLowerCase()))) return false;
            if (tagFilterTags.length > 0) {
                const leadTagsLower = lead.tags.map(t => t.toLowerCase());
                const selectedLower = tagFilterTags.map(t => t.toLowerCase());
                const hasMatch = selectedLower.some(sel => leadTagsLower.includes(sel));
                if (!hasMatch) return false;
            }
            if (leadOriginFilter !== 'all' && lead.leadOrigin !== leadOriginFilter) return false;

            if (paymentStatusFilter !== 'all' && lead.paymentStatus !== paymentStatusFilter) return false;

            // Ad-hoc car / intent filters
            if (
                intentFilter !== 'all' ||
                brandFilter ||
                modelFilter ||
                (fuelTypeFilter !== 'all' && fuelTypeFilter) ||
                yearFilter ||
                kmDrivenFilter ||
                amountFilter
            ) {
                if (!lead.carDetails || lead.carDetails.length === 0) return false;

                const matchesCarFilters = lead.carDetails.some(car => {
                    if (intentFilter !== 'all' && car.intent !== intentFilter) {
                        return false;
                    }

                    const brandTerm = brandFilter.toLowerCase().trim();
                    if (brandTerm) {
                        const brandCandidates = [
                            car.brandName,
                            car.wantedCar?.brandName,
                            car.ownedCar?.brandName
                        ].filter(Boolean).map(v => (v as string).toLowerCase());

                        if (!brandCandidates.some(b => b.includes(brandTerm))) {
                            return false;
                        }
                    }

                    const modelTerm = modelFilter.toLowerCase().trim();
                    if (modelTerm) {
                        const modelCandidates = [
                            car.modelName,
                            car.wantedCar?.modelName,
                            car.ownedCar?.modelName
                        ].filter(Boolean).map(v => (v as string).toLowerCase());

                        if (!modelCandidates.some(m => m.includes(modelTerm))) {
                            return false;
                        }
                    }

                    if (fuelTypeFilter !== 'all' && fuelTypeFilter) {
                        const fuelCandidates = [
                            car.fuelType,
                            car.wantedCar?.fuelType,
                            car.ownedCar?.fuelType
                        ].filter(Boolean);

                        if (!fuelCandidates.some(f => f === fuelTypeFilter)) {
                            return false;
                        }
                    }

                    const yearTerm = yearFilter.trim();
                    if (yearTerm) {
                        const yearCandidates = [
                            car.wantedCar?.year,
                            car.ownedCar?.year
                        ].filter(Boolean);

                        if (!yearCandidates.some(y => y === yearTerm)) {
                            return false;
                        }
                    }

                    const kmTerm = kmDrivenFilter.trim();
                    if (kmTerm) {
                        const target = Number(kmTerm);
                        if (!Number.isFinite(target)) return false;

                        const kmCandidates = [
                            car.kmDriven,
                            car.wantedCar?.kmDriven,
                            car.ownedCar?.kmDriven
                        ]
                            .map(v => (v ? Number(v) : NaN))
                            .filter(v => Number.isFinite(v));

                        if (kmCandidates.length === 0) return false;

                        const kmMatches = kmCandidates.some(v => {
                            if (kmDrivenOp === 'gt') return v > target;
                            if (kmDrivenOp === 'lt') return v < target;
                            return v === target;
                        });

                        if (!kmMatches) return false;
                    }

                    const amountTerm = amountFilter.trim();
                    if (amountTerm) {
                        const target = Number(amountTerm);
                        if (!Number.isFinite(target)) return false;

                        const amountCandidates = [
                            car.wantedCar?.amount,
                            car.ownedCar?.amount
                        ]
                            .map(v => (v ? Number(v) : NaN))
                            .filter(v => Number.isFinite(v));

                        if (amountCandidates.length === 0) return false;

                        const amountMatches = amountCandidates.some(v => {
                            if (amountOp === 'gt') return v > target;
                            if (amountOp === 'lt') return v < target;
                            return v === target;
                        });

                        if (!amountMatches) return false;
                    }

                    return true;
                });

                if (!matchesCarFilters) return false;
            }

            if (assignedToFilter !== 'all') {
                const leadAssignedId = typeof lead.assignedTo === 'object' ? lead.assignedTo?._id : lead.assignedTo;
                if (assignedToFilter === 'unassigned') {
                    if (leadAssignedId) return false;
                } else if (leadAssignedId !== assignedToFilter) {
                    return false;
                }
            }

            if (statusFilter !== 'all' && lead.status !== statusFilter) return false;
            if (leadTypeFilter !== 'all' && lead.leadType !== leadTypeFilter) return false;
            if (dateFilter && currentMode === 'all' && lead.followupDate?.split('T')[0] !== dateFilter) return false;

            return true;
        });
    }, [leads, currentMode, activeSmartListId, smartLists, searchTerm, nameFilter, phoneFilter, placeFilter, designationFilter, tagFilterTags, dateFilter, statusFilter, leadTypeFilter, leadOriginFilter, assignedToFilter, paymentStatusFilter, intentFilter, brandFilter, modelFilter, fuelTypeFilter, yearFilter, kmDrivenFilter, kmDrivenOp, amountFilter, amountOp]);

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(filteredLeads.map(l => l._id!));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectLead = (id: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(i => i !== id));
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to delete ${selectedIds.length} contacts?`)) {
            await bulkDeleteLeads(selectedIds);
            setSelectedIds([]);
        }
    };

    const handleBulkAssign = async (userId: string) => {
        await bulkAssignLeads(selectedIds, userId);
        setSelectedIds([]);
        setShowBulkAssignPanel(false);
    };

    const handleSaveSmartList = () => {
        if (!smartListName) return;
        addSmartList({
            name: smartListName,
            filters: {
                name: nameFilter,
                phone: phoneFilter,
                place: placeFilter,
                designation: designationFilter,
                tag: tagFilterTags[0],
                status: statusFilter,
                leadType: leadTypeFilter as LeadFilter['leadType'],
                leadOrigin: leadOriginFilter as LeadFilter['leadOrigin'],
                assignedTo: assignedToFilter,
                selectedIds: selectedIds.length > 0 ? selectedIds : undefined,
                paymentStatus: paymentStatusFilter === 'all' ? '' : paymentStatusFilter,
                intent: intentFilter,
                brandName: brandFilter,
                modelName: modelFilter,
                fuelType: fuelTypeFilter === 'all' ? '' : fuelTypeFilter,
                year: yearFilter,
                kmDrivenValue: kmDrivenFilter,
                kmDrivenOp,
                amountValue: amountFilter,
                amountOp
            }
        });
        setIsSmartListModalOpen(false);
        setSmartListName('');
    };

    const hasActiveFilters =
        searchTerm ||
        nameFilter ||
        phoneFilter ||
        placeFilter ||
        designationFilter ||
        tagFilterTags.length > 0 ||
        dateFilter ||
        statusFilter !== 'all' ||
        leadTypeFilter !== 'all' ||
        leadOriginFilter !== 'all' ||
        assignedToFilter !== 'all' ||
        paymentStatusFilter !== 'all' ||
        intentFilter !== 'all' ||
        !!brandFilter ||
        !!modelFilter ||
        (fuelTypeFilter !== 'all' && !!fuelTypeFilter) ||
        !!yearFilter ||
        !!kmDrivenFilter ||
        !!amountFilter;


    return (
        <div className="flex w-full flex-col bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Button Navigation */}
            <div className="flex items-center gap-3 border-b border-gray-100 p-4 bg-white overflow-x-auto no-scrollbar">
                <button
                    onClick={() => { setCurrentMode('all'); setActiveSmartListId(null); }}
                    className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg transition-all border ${currentMode === 'all'
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                        : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                >
                    All Contacts
                </button>
                {smartLists.map(list => (
                    <div key={list._id} className="relative group">
                        <button
                            onClick={() => { setCurrentMode('smartlist'); setActiveSmartListId(list._id!); }}
                            className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded-lg transition-all flex items-center gap-2 border ${currentMode === 'smartlist' && activeSmartListId === list._id
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            {list.name}
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); if (list._id && window.confirm('Delete this smart list?')) deleteSmartList(list._id); }}
                            className="absolute -top-1 -right-1 hidden group-hover:flex h-4 w-4 bg-red-500 text-white rounded-full items-center justify-center text-[10px] shadow-sm z-10"
                        >
                            <X size={10} />
                        </button>
                    </div>
                ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-col gap-4 p-4 border-b border-gray-100 bg-white">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-gray-500">
                        Total Contacts: <span className="text-indigo-600">{filteredLeads.length}</span>
                        {selectedIds.length > 0 && <span className="ml-2 px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs">{selectedIds.length} Selected</span>}
                    </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2 flex-1 max-w-lg">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Quick search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full rounded-lg border border-gray-200 bg-gray-50/50 py-2 pl-9 pr-4 text-sm focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                            className={`p-2 rounded-lg border transition-all ${showAdvancedFilters ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-white border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        >
                            <Filter size={20} />
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <button
                                onClick={() => setIsSmartListModalOpen(true)}
                                className="flex items-center gap-2 px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-100 transition-all border border-indigo-100 mr-2"
                            >
                                <Bookmark size={16} /> Save Selection
                            </button>
                        )}
                        {selectedIds.length > 0 ? (
                            <div className="flex items-center gap-2 animate-fadeIn">
                                {/* ... existing buttons ... */}
                                <button
                                    onClick={() => { setShowBulkAssignPanel(!showBulkAssignPanel); setShowBulkUpdatePanel(false); }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${showBulkAssignPanel ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                >
                                    <UserPlus size={16} /> Assign
                                </button>
                                <button
                                    onClick={() => { setShowBulkUpdatePanel(!showBulkUpdatePanel); setShowBulkAssignPanel(false); setBulkUpdateType(null); }}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${showBulkUpdatePanel ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                >
                                    <MoreHorizontal size={16} /> Update
                                </button>
                                <button
                                    onClick={handleBulkDelete}
                                    className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition-all"
                                >
                                    <Trash2 size={16} /> Delete
                                </button>
                            </div>
                        ) : (
                            hasActiveFilters && (
                                <button
                                    onClick={() => setIsSmartListModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-indigo-700 transition-all"
                                >
                                    <Bookmark size={16} /> Save Smart List
                                </button>
                            )
                        )}
                    </div>
                </div>

                {showBulkAssignPanel && (
                    <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-slideDown">
                        <span className="text-sm font-bold text-indigo-700">Assign selection to:</span>
                        <div className="flex flex-wrap gap-2">
                            {users.map(user => (
                                <button
                                    key={user._id}
                                    onClick={() => handleBulkAssign(user._id!)}
                                    className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-xs font-bold text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                >
                                    {user.username}
                                </button>
                            ))}
                        </div>
                        <button onClick={() => setShowBulkAssignPanel(false)} className="ml-auto text-indigo-400 hover:text-indigo-600"><X size={18} /></button>
                    </div>
                )}

                {showBulkUpdatePanel && (
                    <div className="flex flex-col gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100 animate-slideDown">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-bold text-indigo-700 whitespace-nowrap">Bulk Update:</span>
                            <div className="flex gap-2">
                                <button onClick={() => setBulkUpdateType('status')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${bulkUpdateType === 'status' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>Status</button>
                                <button onClick={() => setBulkUpdateType('type')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${bulkUpdateType === 'type' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>Lead Type</button>
                                <button onClick={() => setBulkUpdateType('tags')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${bulkUpdateType === 'tags' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>Tags</button>
                                <button onClick={() => setBulkUpdateType('date')} className={`px-3 py-1 rounded-full text-xs font-bold transition-all border ${bulkUpdateType === 'date' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-indigo-600 border-indigo-200 hover:bg-indigo-50'}`}>Follow-up</button>
                            </div>
                            <button onClick={() => setShowBulkUpdatePanel(false)} className="ml-auto text-indigo-400 hover:text-indigo-600"><X size={18} /></button>
                        </div>

                        {bulkUpdateType === 'status' && (
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100 animate-fadeIn">
                                {['new', 'contacted', 'sold', 'deal_closed'].map(s => (
                                    <button
                                        key={s}
                                        onClick={async () => { await bulkUpdateLeads(selectedIds, { status: s as 'new' | 'contacted' | 'sold' | 'deal_closed' }); setSelectedIds([]); setShowBulkUpdatePanel(false); }}
                                        className="px-3 py-1 bg-gray-50 hover:bg-indigo-600 hover:text-white rounded text-xs font-bold capitalize transition-all"
                                    >
                                        {s.replace('_', ' ')}
                                    </button>
                                ))}
                            </div>
                        )}

                        {bulkUpdateType === 'type' && (
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100 animate-fadeIn">
                                {['hot', 'warm', 'cold'].map(t => (
                                    <button
                                        key={t}
                                        onClick={async () => { await bulkUpdateLeads(selectedIds, { leadType: t as 'hot' | 'warm' | 'cold' }); setSelectedIds([]); setShowBulkUpdatePanel(false); }}
                                        className="px-3 py-1 bg-gray-50 hover:bg-indigo-600 hover:text-white rounded text-xs font-bold capitalize transition-all"
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        )}

                        {bulkUpdateType === 'tags' && (
                            <div className="flex flex-col gap-3 p-3 bg-white rounded-lg border border-indigo-100 animate-fadeIn">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setBulkTagUpdateType('add')}
                                        className={`flex-1 py-1 rounded-md text-xs font-bold border transition-all ${bulkTagUpdateType === 'add' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                    > Add Tags </button>
                                    <button
                                        onClick={() => setBulkTagUpdateType('remove')}
                                        className={`flex-1 py-1 rounded-md text-xs font-bold border transition-all ${bulkTagUpdateType === 'remove' ? 'bg-red-600 text-white border-red-600' : 'bg-gray-50 text-gray-500 border-gray-100'}`}
                                    > Remove Tags </button>
                                </div>

                                <TagInput
                                    selectedTags={bulkTags}
                                    onTagsChange={setBulkTags}
                                    availableTags={availableTags}
                                    placeholder={bulkTagUpdateType === 'add' ? "Select tags to add..." : "Select tags to remove..."}
                                />

                                <div className="flex justify-end gap-2 mt-1">
                                    <button
                                        onClick={() => { setBulkTags([]); setBulkUpdateType(null); setShowBulkUpdatePanel(false); }}
                                        className="text-xs font-bold text-gray-400 hover:text-gray-600 px-3 py-1"
                                    > Cancel </button>
                                    <button
                                        disabled={bulkTags.length === 0}
                                        onClick={async () => {
                                            if (bulkTagUpdateType === 'add') {
                                                await bulkUpdateLeads(selectedIds, undefined, bulkTags);
                                            } else {
                                                await bulkUpdateLeads(selectedIds, undefined, undefined, bulkTags);
                                            }
                                            setBulkTags([]);
                                            setSelectedIds([]);
                                            setShowBulkUpdatePanel(false);
                                        }}
                                        className={`px-4 py-1.5 rounded-md text-xs font-bold text-white transition-all ${bulkTags.length > 0 ? (bulkTagUpdateType === 'add' ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-red-600 hover:bg-red-700') : 'bg-gray-300 cursor-not-allowed'}`}
                                    >
                                        {bulkTagUpdateType === 'add' ? 'Add Tags' : 'Remove Tags'}
                                    </button>
                                </div>
                            </div>
                        )}

                        {bulkUpdateType === 'date' && (
                            <div className="flex items-center gap-2 p-2 bg-white rounded-lg border border-indigo-100 animate-fadeIn">
                                <input
                                    type="date"
                                    className="flex-1 text-sm border-0 focus:ring-0 p-2 outline-none"
                                    onChange={async (e) => {
                                        const date = e.target.value;
                                        if (date) {
                                            await bulkUpdateLeads(selectedIds, { followupDate: new Date(date).toISOString() });
                                            setSelectedIds([]);
                                            setShowBulkUpdatePanel(false);
                                        }
                                    }}
                                />
                                <span className="text-[10px] text-gray-400 px-2 italic">Select date to apply</span>
                            </div>
                        )}
                    </div>
                )}

                {showAdvancedFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <input value={nameFilter} onChange={e => setNameFilter(e.target.value)} placeholder="By Name" className="text-sm px-3 py-2 rounded-lg border border-gray-200" />
                        <input value={phoneFilter} onChange={e => setPhoneFilter(e.target.value)} placeholder="By Phone" className="text-sm px-3 py-2 rounded-lg border border-gray-200" />
                        <div className="relative">
                            <input
                                value={placeFilter}
                                onChange={e => setPlaceFilter(e.target.value)}
                                onFocus={() => setPlaceFocused(true)}
                                onBlur={() => setTimeout(() => setPlaceFocused(false), 100)}
                                placeholder="By Place"
                                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200"
                            />
                            {placeFocused && availablePlaces.length > 0 && (
                                <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {availablePlaces
                                        .filter(p => !placeFilter || p.toLowerCase().includes(placeFilter.toLowerCase()))
                                        .map(p => (
                                            <button
                                                key={p}
                                                type="button"
                                                onMouseDown={() => setPlaceFilter(p)}
                                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                            >
                                                {p}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                value={designationFilter}
                                onChange={e => setDesignationFilter(e.target.value)}
                                onFocus={() => setDesignationFocused(true)}
                                onBlur={() => setTimeout(() => setDesignationFocused(false), 100)}
                                placeholder="By Designation"
                                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200"
                            />
                            {designationFocused && availableDesignations.length > 0 && (
                                <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {availableDesignations
                                        .filter(d => !designationFilter || d.toLowerCase().includes(designationFilter.toLowerCase()))
                                        .map(d => (
                                            <button
                                                key={d}
                                                type="button"
                                                onMouseDown={() => setDesignationFilter(d)}
                                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                            >
                                                {d}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200">
                            <option value="all">Any Status</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="sold">Sold</option>
                            <option value="deal_closed">Deal Closed</option>
                        </select>
                        <select value={leadTypeFilter} onChange={e => setLeadTypeFilter(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200">
                            <option value="all">Any Type</option>
                            <option value="hot">Hot</option>
                            <option value="warm">Warm</option>
                            <option value="cold">Cold</option>
                        </select>
                        <select value={leadOriginFilter} onChange={e => setLeadOriginFilter(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200">
                            <option value="all">Any Origin</option>
                            <option value="WhatsApp">WhatsApp</option>
                            <option value="Insta">Instagram</option>
                            <option value="FB">Facebook</option>
                            <option value="Walk-in">Walk-in</option>
                            <option value="Tele">Tele Caller</option>
                            <option value="Referral">Referral</option>
                            <option value="Web">Website</option>
                            <option value="OLX">OLX</option>
                            <option value="Other">Other</option>
                        </select>
                        <select value={assignedToFilter} onChange={e => setAssignedToFilter(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200">
                            <option value="unassigned">Unassigned</option>
                            {users.map(u => <option key={u._id} value={u._id}>{u.username}</option>)}
                        </select>
                        <TagInput
                            selectedTags={tagFilterTags}
                            onTagsChange={setTagFilterTags}
                            availableTags={availableTags}
                            placeholder="Filter by Tag"
                        />
                        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200" />
                        <select value={paymentStatusFilter} onChange={e => setPaymentStatusFilter(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200">
                            <option value="all">Any Payment</option>
                            <option value="">None</option>
                            <option value="Advance Payment">Advance Payment</option>
                            <option value="Full Payment">Full Payment</option>
                        </select>
                        <select value={intentFilter} onChange={e => setIntentFilter(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200">
                            <option value="all">Any Intent</option>
                            <option value="buying">Buying</option>
                            <option value="selling">Selling</option>
                            <option value="exchange">Exchange</option>
                        </select>
                        <div className="relative">
                            <input
                                value={brandFilter}
                                onChange={e => setBrandFilter(e.target.value)}
                                onFocus={() => setBrandFilterFocused(true)}
                                onBlur={() => setTimeout(() => setBrandFilterFocused(false), 100)}
                                placeholder="By Brand Name"
                                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200"
                            />
                            {brandFilterFocused && availableBrandNames.length > 0 && (
                                <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {availableBrandNames
                                        .filter(b => !brandFilter || b.toLowerCase().includes(brandFilter.toLowerCase()))
                                        .map(b => (
                                            <button
                                                key={b}
                                                type="button"
                                                onMouseDown={() => setBrandFilter(b)}
                                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                            >
                                                {b}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <input
                                value={modelFilter}
                                onChange={e => setModelFilter(e.target.value)}
                                onFocus={() => setModelFilterFocused(true)}
                                onBlur={() => setTimeout(() => setModelFilterFocused(false), 100)}
                                placeholder="By Model Name"
                                className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200"
                            />
                            {modelFilterFocused && availableModelNames.length > 0 && (
                                <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                    {availableModelNames
                                        .filter(m => !modelFilter || m.toLowerCase().includes(modelFilter.toLowerCase()))
                                        .map(m => (
                                            <button
                                                key={m}
                                                type="button"
                                                onMouseDown={() => setModelFilter(m)}
                                                className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                            >
                                                {m}
                                            </button>
                                        ))}
                                </div>
                            )}
                        </div>
                        <select value={fuelTypeFilter} onChange={e => setFuelTypeFilter(e.target.value)} className="text-sm px-3 py-2 rounded-lg border border-gray-200">
                            <option value="all">Any Fuel</option>
                            <option value="Petrol">Petrol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="Electric">Electric</option>
                            <option value="Hybrid">Hybrid</option>
                            <option value="CNG">CNG</option>
                        </select>
                        <input
                            value={yearFilter}
                            onChange={e => setYearFilter(e.target.value.replace(/\D/g, ''))}
                            placeholder="By Year (YYYY)"
                            className="text-sm px-3 py-2 rounded-lg border border-gray-200"
                        />
                        <div className="flex items-center gap-2">
                            <select value={kmDrivenOp} onChange={e => setKmDrivenOp(e.target.value as 'eq' | 'gt' | 'lt')} className="text-sm px-2 py-2 rounded-lg border border-gray-200">
                                <option value="eq">Equal to</option>
                                <option value="gt">Greater than</option>
                                <option value="lt">Less than</option>
                            </select>
                            <input
                                value={kmDrivenFilter}
                                onChange={e => setKmDrivenFilter(e.target.value.replace(/\D/g, ''))}
                                placeholder="KM Driven"
                                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200"
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select value={amountOp} onChange={e => setAmountOp(e.target.value as 'eq' | 'gt' | 'lt')} className="text-sm px-2 py-2 rounded-lg border border-gray-200">
                                <option value="eq">Equal to</option>
                                <option value="gt">Greater than</option>
                                <option value="lt">Less than</option>
                            </select>
                            <input
                                value={amountFilter}
                                onChange={e => setAmountFilter(e.target.value.replace(/\D/g, ''))}
                                placeholder="Amount"
                                className="flex-1 text-sm px-3 py-2 rounded-lg border border-gray-200"
                            />
                        </div>
                        <button
                            onClick={() => {
                                setNameFilter(''); setPhoneFilter(''); setPlaceFilter(''); setDesignationFilter('');
                                setTagFilterTags([]); setDateFilter('');
                                setStatusFilter('all'); setLeadTypeFilter('all'); setLeadOriginFilter('all');
                                setAssignedToFilter('all');
                                setPaymentStatusFilter('all');
                                setIntentFilter('all');
                                setBrandFilter('');
                                setModelFilter('');
                                setFuelTypeFilter('all');
                                setYearFilter('');
                                setKmDrivenFilter('');
                                setAmountFilter('');
                            }}
                            className="text-xs font-bold text-red-500 uppercase"
                        >
                            Reset
                        </button>
                    </div>
                )}
            </div>

            {/* Table Layout */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="p-4 w-10 border-r border-gray-100 text-center">
                                <input
                                    type="checkbox"
                                    checked={selectedIds.length === filteredLeads.length && filteredLeads.length > 0}
                                    onChange={e => handleSelectAll(e.target.checked)}
                                    className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                />
                            </th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Name</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Assigned To</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Tags</th>
                            <th className="p-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Created</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {filteredLeads.map(lead => (
                            <tr key={lead._id} className="hover:bg-indigo-50/30 transition-all group">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(lead._id!)}
                                        onChange={e => handleSelectLead(lead._id!, e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-col">
                                        <button
                                            onClick={() => navigate(`/contact/${lead._id}`)}
                                            className="font-bold text-sm text-gray-900 hover:text-indigo-600 text-left"
                                        >
                                            {lead.name}
                                        </button>
                                        <span className="text-[10px] text-gray-400">
                                            {lead.place || 'None'}
                                        </span>
                                        <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                                            <Briefcase size={10} />
                                            <span>{lead.designation || 'None'}</span>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-sm text-gray-600">{lead.phone}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${lead.leadType === 'hot' ? 'bg-orange-50 text-orange-600 border border-orange-100' :
                                        lead.leadType === 'warm' ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                                            'bg-blue-50 text-blue-600 border border-blue-100'
                                        }`}>
                                        {lead.leadType}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${lead.status === 'sold' || lead.status === 'deal_closed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' :
                                        'bg-gray-100 text-gray-600 border border-gray-200'
                                        }`}>
                                        {lead.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                                            {typeof lead.assignedTo === 'object' ? lead.assignedTo?.username?.charAt(0) : '?'}
                                        </div>
                                        <span className="text-xs font-medium text-gray-700">
                                            {typeof lead.assignedTo === 'object' ? lead.assignedTo?.username : 'Unassigned'}
                                        </span>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex flex-wrap gap-1 max-w-[150px]">
                                        {lead.tags.length > 0 ? lead.tags.map((tag, i) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded text-[9px] font-medium">
                                                {tag}
                                            </span>
                                        )) : <span className="text-[9px] text-gray-300 italic">No tags</span>}
                                    </div>
                                </td>
                                <td className="p-4 text-[10px] text-gray-500 whitespace-nowrap">
                                    {lead.createdAt ? format(parseISO(lead.createdAt), 'MMM d, yyyy') : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {/* Empty State */}
            {filteredLeads.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/30">
                    <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 mb-4">
                        <CheckCircle2 size={40} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">No Contacts Found</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your filters or add a new lead.</p>
                </div>
            )}

            {/* Modals */}
            {isSmartListModalOpen && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4 text-left">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl animate-fadeIn">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Save Smart List</h3>
                            <button onClick={() => setIsSmartListModalOpen(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        <input
                            autoFocus
                            placeholder="e.g. Hot Leads"
                            value={smartListName}
                            onChange={(e) => setSmartListName(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 outline-none"
                        />
                        <div className="flex justify-end gap-3 mt-6">
                            <button onClick={() => setIsSmartListModalOpen(false)} className="px-4 py-2 font-semibold text-gray-500 hover:text-gray-900">Cancel</button>
                            <button onClick={handleSaveSmartList} disabled={!smartListName} className="rounded-xl bg-indigo-600 px-6 py-2.5 font-bold text-white shadow-md hover:bg-indigo-700 disabled:opacity-50 transition-all active:scale-95">Save List</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
