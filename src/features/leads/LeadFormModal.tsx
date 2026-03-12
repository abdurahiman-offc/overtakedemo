import { useState, useEffect, useMemo } from 'react';
import { Save, X, Plus, Trash2, Car, AlertCircle, Tag, Edit3 } from 'lucide-react';
import { useLeads } from '../../context/LeadsContext';
import { Lead, CarDetail, VehicleInfo } from '../../types';
import { TagInput } from '../../components/TagInput';
import { format } from 'date-fns';

interface LeadFormModalProps {
    onClose: () => void;
    initialData?: Lead;
    inline?: boolean;
}

export function LeadFormModal({ onClose, initialData, inline }: LeadFormModalProps) {
    const { addLead, updateLead, users, leads } = useLeads();

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

    const [formData, setFormData] = useState<Partial<Lead>>({
        name: '',
        phone: '',
        place: '',
        designation: '',
        leadOrigin: 'Other',
        enquiredVehicle: '',
        leadType: 'cold',
        status: 'new',
        notes: [],
        tags: [],
        carDetails: [],
        assignedTo: undefined,
        followupDate: '',
        followupNote: [],
        followupCount: 0,
        paymentStatus: ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                assignedTo: initialData.assignedTo // Handle populated vs ID
            });
        }
    }, [initialData]);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};
        if (!formData.name?.trim()) newErrors.name = 'Name is required';

        const phone = formData.phone?.trim();
        if (!phone) {
            newErrors.phone = 'Phone is required';
        } else if (!/^\d{10}$/.test(phone)) {
            newErrors.phone = 'Phone must be exactly 10 digits';
        } else {
            // Check for duplicate phone
            const isDuplicate = leads.some(l => l.phone === phone && l._id !== initialData?._id);
            if (isDuplicate) {
                newErrors.phone = `A contact with phone ${phone} already exists`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        let { name, value } = e.target;

        // Restrict phone to digits only
        if (name === 'phone') {
            value = value.replace(/\D/g, '').slice(0, 10);
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => {
                const updated = { ...prev };
                delete updated[name];
                return updated;
            });
        }
    };

    const handleCarDetailChange = (index: number, field: keyof CarDetail | `wantedCar.${keyof VehicleInfo}` | `ownedCar.${keyof VehicleInfo}`, value: string) => {
        const newCarDetails = [...(formData.carDetails || [])];
        const currentCar = { ...newCarDetails[index] };

        if ((field as string).startsWith('wantedCar.')) {
            const subField = (field as string).split('.')[1] as keyof VehicleInfo;
            currentCar.wantedCar = { ...(currentCar.wantedCar || {} as VehicleInfo), [subField]: value };
        } else if ((field as string).startsWith('ownedCar.')) {
            const subField = (field as string).split('.')[1] as keyof VehicleInfo;
            currentCar.ownedCar = { ...(currentCar.ownedCar || {} as VehicleInfo), [subField]: value };
        } else {
            /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
            (currentCar as any)[field] = value;
        }

        // Auto-initialize nested objects based on intent
        if (field === 'intent') {
            if (value === 'buying' || value === 'exchange') {
                if (!currentCar.wantedCar) currentCar.wantedCar = { brandName: '', modelName: '', fuelType: '', kmDriven: '', year: '', amount: '' };
            }
            if (value === 'selling' || value === 'exchange') {
                if (!currentCar.ownedCar) currentCar.ownedCar = { brandName: '', modelName: '', fuelType: '', kmDriven: '', year: '', amount: '' };
            }
        }

        newCarDetails[index] = currentCar;
        setFormData(prev => ({ ...prev, carDetails: newCarDetails }));
    };

    const addCarDetail = () => {
        const newCar: CarDetail = {
            additionalReqs: '',
            intent: 'buying',
            wantedCar: { brandName: '', modelName: '', fuelType: '', kmDriven: '', year: '', amount: '' }
        };
        setFormData(prev => ({ ...prev, carDetails: [...(prev.carDetails || []), newCar] }));
    };

    const removeCarDetail = (index: number) => {
        setFormData(prev => ({
            ...prev,
            carDetails: prev.carDetails?.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) return;

        const finalData = { ...formData };

        if (initialData) {
            updateLead(initialData._id, finalData);
        } else {
            addLead(finalData);
        }
        onClose();
    };

    const isEdit = !!initialData;

    const formContent = (
        <form onSubmit={handleSubmit} className={inline ? "flex flex-col gap-6 p-6 lg:p-8" : "flex flex-col gap-6 p-6 overflow-y-auto max-h-[90vh]"}>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1">
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Name <span className="text-red-500">*</span></label>
                    <input
                        name="name"
                        required
                        value={formData.name || ''}
                        onChange={handleChange}
                        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-4 ${errors.name ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10'}`}
                    />
                    {errors.name && <span className="mt-1 text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 flex items-center gap-1.5"><AlertCircle size={12} /> {errors.name}</span>}
                </div>
                <div className="flex flex-col gap-1">
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Phone <span className="text-red-500">*</span></label>
                    <input
                        name="phone"
                        required
                        value={formData.phone || ''}
                        onChange={handleChange}
                        className={`w-full rounded-xl border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-4 ${errors.phone ? 'border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/10' : 'border-gray-200 focus:border-indigo-500 focus:ring-indigo-500/10'}`}
                        placeholder="10 Digits"
                    />
                    {errors.phone && <span className="mt-1 text-[11px] font-bold text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg border border-red-100 flex items-center gap-1.5"><AlertCircle size={12} /> {errors.phone}</span>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="relative">
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Place</label>
                    <input
                        name="place"
                        value={formData.place}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    />
                    {availablePlaces.length > 0 && formData.place && (
                        <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            {availablePlaces
                                .filter(p => p.toLowerCase().includes((formData.place || '').toLowerCase()))
                                .map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onMouseDown={() => setFormData(prev => ({ ...prev, place: p }))}
                                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                    >
                                        {p}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
                <div className="relative">
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Designation</label>
                    <input
                        name="designation"
                        value={formData.designation}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    />
                    {availableDesignations.length > 0 && formData.designation && (
                        <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                            {availableDesignations
                                .filter(d => d.toLowerCase().includes((formData.designation || '').toLowerCase()))
                                .map(d => (
                                    <button
                                        key={d}
                                        type="button"
                                        onMouseDown={() => setFormData(prev => ({ ...prev, designation: d }))}
                                        className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                    >
                                        {d}
                                    </button>
                                ))}
                        </div>
                    )}
                </div>
                <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead Origin</label>
                    <select name="leadOrigin" value={formData.leadOrigin} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium">
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Insta">Insta</option>
                        <option value="FB">FB</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Tele">Tele</option>
                        <option value="Referral">Referral</option>
                        <option value="Web">Web</option>
                        <option value="OLX">OLX</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assign To</label>
                    <select
                        name="assignedTo"
                        value={typeof formData.assignedTo === 'object' ? (formData.assignedTo as { _id: string })._id : formData.assignedTo}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>{user.username}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Status</label>
                    <select
                        name="paymentStatus"
                        value={formData.paymentStatus}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                    >
                        <option value="">None</option>
                        <option value="Advance Payment">Advance Payment</option>
                        <option value="Full Payment">Full Payment</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Lead Type</label>
                    <select name="leadType" value={formData.leadType} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium">
                        <option value="hot">Hot</option>
                        <option value="warm">Warm</option>
                        <option value="cold">Cold</option>
                    </select>
                </div>
                <div>
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium">
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="sold">Sold</option>
                        <option value="deal_closed">Deal Closed</option>
                    </select>
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <Tag size={16} className="text-indigo-500" />
                    Tags
                </label>
                <TagInput
                    selectedTags={formData.tags || []}
                    onTagsChange={(tags) => setFormData(prev => ({ ...prev, tags }))}
                    availableTags={availableTags}
                    placeholder="Add tags (e.g. priority, web-lead)..."
                />
            </div>

            {/* Car Details Section */}
            <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-indigo-50/30 p-5">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 font-bold text-indigo-900">
                        <Car size={20} />
                        Car Details
                    </h3>
                    <button
                        type="button"
                        onClick={addCarDetail}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white transition-all hover:bg-indigo-700"
                    >
                        <Plus size={14} /> Add Car
                    </button>
                </div>

                {formData.carDetails?.map((car, idx) => (
                    <div key={idx} className="relative grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
                        <button
                            type="button"
                            onClick={() => removeCarDetail(idx)}
                            className="absolute -top-2 -right-2 rounded-full bg-red-50 p-1.5 text-red-500 border border-red-200 hover:bg-red-100"
                        >
                            <Trash2 size={14} />
                        </button>
                        <div className="flex flex-col gap-1.5 md:col-span-3">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Intent</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleCarDetailChange(idx, 'intent', 'buying')}
                                    className={`flex - 1 rounded - lg py - 1.5 text - xs font - bold border transition - all ${car.intent === 'buying' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-500 border-gray-200'} `}
                                > buying </button>
                                <button
                                    type="button"
                                    onClick={() => handleCarDetailChange(idx, 'intent', 'selling')}
                                    className={`flex - 1 rounded - lg py - 1.5 text - xs font - bold border transition - all ${car.intent === 'selling' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-500 border-gray-200'} `}
                                > selling </button>
                                <button
                                    type="button"
                                    onClick={() => handleCarDetailChange(idx, 'intent', 'exchange')}
                                    className={`flex - 1 rounded - lg py - 1.5 text - xs font - bold border transition - all ${car.intent === 'exchange' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-500 border-gray-200'} `}
                                > exchange </button>
                            </div>
                        </div>

                        {/* RENDER WANTED CAR IF BUYING OR EXCHANGE */}
                        {(car.intent === 'buying' || car.intent === 'exchange') && (
                            <div className="md:col-span-3 rounded-xl border border-blue-100 bg-blue-50/30 p-3 mt-2">
                                <h4 className="text-xs font-bold text-blue-800 mb-3 border-b border-blue-100 pb-2">Wanted Car (To Buy)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-1 relative">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand Name</label>
                                        <input
                                            value={car.wantedCar?.brandName || ''}
                                            onChange={(e) => handleCarDetailChange(idx, 'wantedCar.brandName', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                        {availableBrandNames.length > 0 && car.wantedCar?.brandName && (
                                            <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                                {availableBrandNames
                                                    .filter(b => b.toLowerCase().includes((car.wantedCar?.brandName || '').toLowerCase()))
                                                    .map(b => (
                                                        <button
                                                            key={b}
                                                            type="button"
                                                            onMouseDown={() => handleCarDetailChange(idx, 'wantedCar.brandName', b)}
                                                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                                        >
                                                            {b}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 relative">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model Name</label>
                                        <input
                                            value={car.wantedCar?.modelName || ''}
                                            onChange={(e) => handleCarDetailChange(idx, 'wantedCar.modelName', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                        {availableModelNames.length > 0 && car.wantedCar?.modelName && (
                                            <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                                {availableModelNames
                                                    .filter(m => m.toLowerCase().includes((car.wantedCar?.modelName || '').toLowerCase()))
                                                    .map(m => (
                                                        <button
                                                            key={m}
                                                            type="button"
                                                            onMouseDown={() => handleCarDetailChange(idx, 'wantedCar.modelName', m)}
                                                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fuel Type</label>
                                        <select value={car.wantedCar?.fuelType || ''} onChange={(e) => handleCarDetailChange(idx, 'wantedCar.fuelType', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium">
                                            <option value="">Select Fuel</option>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="CNG">CNG</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year</label>
                                        <input
                                            value={car.wantedCar?.year || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                handleCarDetailChange(idx, 'wantedCar.year', val);
                                            }}
                                            placeholder="YYYY"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">KM Driven</label>
                                        <input
                                            value={car.wantedCar?.kmDriven || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                handleCarDetailChange(idx, 'wantedCar.kmDriven', val);
                                            }}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Amount / Budget</label>
                                        <input
                                            value={car.wantedCar?.amount || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                handleCarDetailChange(idx, 'wantedCar.amount', val);
                                            }}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* RENDER OWNED CAR IF SELLING OR EXCHANGE */}
                        {(car.intent === 'selling' || car.intent === 'exchange') && (
                            <div className="md:col-span-3 rounded-xl border border-amber-100 bg-amber-50/30 p-3 mt-2">
                                <h4 className="text-xs font-bold text-amber-800 mb-3 border-b border-amber-100 pb-2">Owned Car (To Trade/Sell)</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    <div className="flex flex-col gap-1 relative">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Brand Name</label>
                                        <input
                                            value={car.ownedCar?.brandName || ''}
                                            onChange={(e) => handleCarDetailChange(idx, 'ownedCar.brandName', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                        {availableBrandNames.length > 0 && car.ownedCar?.brandName && (
                                            <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                                {availableBrandNames
                                                    .filter(b => b.toLowerCase().includes((car.ownedCar?.brandName || '').toLowerCase()))
                                                    .map(b => (
                                                        <button
                                                            key={b}
                                                            type="button"
                                                            onMouseDown={() => handleCarDetailChange(idx, 'ownedCar.brandName', b)}
                                                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                                        >
                                                            {b}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1 relative">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Model Name</label>
                                        <input
                                            value={car.ownedCar?.modelName || ''}
                                            onChange={(e) => handleCarDetailChange(idx, 'ownedCar.modelName', e.target.value)}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                        {availableModelNames.length > 0 && car.ownedCar?.modelName && (
                                            <div className="absolute z-40 mt-1 w-full max-h-40 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                                                {availableModelNames
                                                    .filter(m => m.toLowerCase().includes((car.ownedCar?.modelName || '').toLowerCase()))
                                                    .map(m => (
                                                        <button
                                                            key={m}
                                                            type="button"
                                                            onMouseDown={() => handleCarDetailChange(idx, 'ownedCar.modelName', m)}
                                                            className="w-full px-3 py-1.5 text-left text-sm hover:bg-indigo-50"
                                                        >
                                                            {m}
                                                        </button>
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Fuel Type</label>
                                        <select value={car.ownedCar?.fuelType || ''} onChange={(e) => handleCarDetailChange(idx, 'ownedCar.fuelType', e.target.value)} className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium">
                                            <option value="">Select Fuel</option>
                                            <option value="Petrol">Petrol</option>
                                            <option value="Diesel">Diesel</option>
                                            <option value="Electric">Electric</option>
                                            <option value="Hybrid">Hybrid</option>
                                            <option value="CNG">CNG</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Year</label>
                                        <input
                                            value={car.ownedCar?.year || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                handleCarDetailChange(idx, 'ownedCar.year', val);
                                            }}
                                            placeholder="YYYY"
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">KM Driven</label>
                                        <input
                                            value={car.ownedCar?.kmDriven || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                handleCarDetailChange(idx, 'ownedCar.kmDriven', val);
                                            }}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Selling Price / Amount</label>
                                        <input
                                            value={car.ownedCar?.amount || ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '');
                                                handleCarDetailChange(idx, 'ownedCar.amount', val);
                                            }}
                                            className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all font-medium"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-1.5 md:col-span-3">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Additional Requirements</label>
                            <input value={car.additionalReqs} onChange={(e) => handleCarDetailChange(idx, 'additionalReqs', e.target.value)} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm" />
                        </div>
                    </div>
                ))}

                {(!formData.carDetails || formData.carDetails.length === 0) && (
                    <div className="py-4 text-center text-sm text-indigo-400 italic">No car details added yet.</div>
                )}
                <button
                    type="button"
                    onClick={addCarDetail}
                    className="self-start flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all hover:border-gray-300"
                >
                    <Plus size={16} /> Add Car Option
                </button>
            </div>

            <div className="flex flex-col gap-4 bg-gray-50/30 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                    <Tag size={18} className="text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-100">
                            {tag}
                            <button type="button" onClick={() => setFormData(prev => ({ ...prev, tags: prev.tags?.filter((_, i) => i !== idx) }))} className="text-indigo-400 hover:text-indigo-600">
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                    <input
                        placeholder="Add tag..."
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !formData.tags?.includes(val)) {
                                    setFormData(prev => ({ ...prev, tags: [...(prev.tags || []), val] }));
                                    (e.target as HTMLInputElement).value = '';
                                }
                            }
                        }}
                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-4 bg-gray-50/30 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-center gap-2">
                    <Edit3 size={18} className="text-gray-400" />
                    <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">General Notes</h3>
                </div>
                <div className="flex flex-col gap-4">
                    {formData.notes?.map((note, idx) => (
                        <div key={idx} className="flex gap-2 items-start relative">
                            <textarea
                                value={note}
                                onChange={(e) => {
                                    const newNotes = [...(formData.notes || [])];
                                    newNotes[idx] = e.target.value;
                                    setFormData(prev => ({ ...prev, notes: newNotes }));
                                }}
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm min-h-[80px] focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, notes: prev.notes?.filter((_, i) => i !== idx) }))}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all absolute top-2 right-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, notes: [...(prev.notes || []), `${format(new Date(), 'EEEE, do MMMM yyyy')} - `] }))}
                        className="self-start flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all hover:border-gray-300"
                    >
                        <Plus size={16} /> Add Note
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div className="flex flex-col gap-3">
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Follow-up Date</label>
                    <input type="date" name="followupDate" value={formData.followupDate ? formData.followupDate.split('T')[0] : ''} onChange={handleChange} className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all" />
                </div>
                <div className="flex flex-col gap-3">
                    <label className="mb-1.5 block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Follow-up Notes</label>
                    <div className="flex flex-col gap-3">
                        {formData.followupNote?.map((note, idx) => (
                            <div key={idx} className="flex gap-2 items-start relative group">
                                <textarea
                                    value={note}
                                    onChange={(e) => {
                                        const newNotes = [...(formData.followupNote || [])];
                                        newNotes[idx] = e.target.value;
                                        setFormData(prev => ({ ...prev, followupNote: newNotes }));
                                    }}
                                    placeholder="Write a follow-up note..."
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm min-h-[60px] focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newNotes = formData.followupNote?.filter((_, i) => i !== idx);
                                        setFormData(prev => ({ ...prev, followupNote: newNotes }));
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all absolute top-2 right-2"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, followupNote: [...(prev.followupNote || []), `${format(new Date(), 'EEEE, do MMMM yyyy')} - `] }))}
                            className="self-start flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5 text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all hover:border-gray-300"
                        >
                            <Plus size={16} /> Add Follow-up Note
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-6">
                <button type="button" onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-600 hover:bg-gray-50 shadow-sm transition-all">Cancel</button>
                <button type="submit" className="flex items-center gap-2 rounded-xl bg-indigo-600 px-8 py-3 text-sm font-bold text-white shadow-md hover:bg-indigo-700 transition-all active:scale-95">
                    <Save size={18} /> {isEdit ? 'Update Contact' : 'Save Contact'}
                </button>
            </div>
        </form>
    );

    if (inline) {
        return (
            <div className="w-full h-full flex-1 animate-fadeIn pb-10">
                <div className="flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                        <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Contact' : 'Add New Contact'}</h2>
                        <button onClick={onClose} className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900">
                            Cancel
                        </button>
                    </div>
                    {formContent}
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="flex w-full max-w-[95%] max-h-[95vh] flex-col overflow-hidden rounded-2xl bg-white shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Contact' : 'Add New Contact'}</h2>
                    <button onClick={onClose} className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900 shadow-sm border">
                        <X size={24} />
                    </button>
                </div>
                {formContent}
            </div>
        </div>
    );
}
