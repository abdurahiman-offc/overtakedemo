import { useState, useEffect, useMemo } from 'react';
import { X, Save, Tag, Plus, Trash2, Car } from 'lucide-react';
import { useLeads } from '../../context/LeadsContext';
import { Lead, CarDetail } from '../../types';
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

    const [formData, setFormData] = useState<Partial<Lead>>({
        name: '',
        phone: '',
        place: '',
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
        followupCount: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData({
                ...initialData,
                assignedTo: initialData.assignedTo // Handle populated vs ID
            });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCarDetailChange = (index: number, field: keyof CarDetail, value: string) => {
        const newCarDetails = [...(formData.carDetails || [])];
        newCarDetails[index] = { ...newCarDetails[index], [field]: value };
        setFormData(prev => ({ ...prev, carDetails: newCarDetails }));
    };

    const addCarDetail = () => {
        const newCar: CarDetail = {
            brandName: '',
            modelName: '',
            fuelType: '',
            kmDriven: '',
            additionalReqs: '',
            intent: 'buying'
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
        if (!formData.name || !formData.phone) return;
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
        <form onSubmit={handleSubmit} className={inline ? "flex flex-col gap-6 p-6 lg:p-8" : "flex flex-col gap-6 p-6 overflow-y-auto max-h-[85vh]"}>
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Name *</label>
                    <input
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        required
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Phone *</label>
                    <input
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                        required
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Place</label>
                    <input name="place" value={formData.place} onChange={handleChange} className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Lead Origin</label>
                    <select name="leadOrigin" value={formData.leadOrigin} onChange={handleChange} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
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
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Assign To</label>
                    <select
                        name="assignedTo"
                        value={typeof formData.assignedTo === 'object' ? formData.assignedTo._id : formData.assignedTo}
                        onChange={handleChange}
                        className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm"
                    >
                        <option value="">Select User</option>
                        {users.map(user => (
                            <option key={user._id} value={user._id}>{user.username}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Lead Type</label>
                    <select name="leadType" value={formData.leadType} onChange={handleChange} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                        <option value="hot">Hot</option>
                        <option value="warm">Warm</option>
                        <option value="cold">Cold</option>
                    </select>
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Status</label>
                    <select name="status" value={formData.status} onChange={handleChange} className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm">
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="followed_up">Followed Up</option>
                        <option value="closed">Closed</option>
                        <option value="lost">Lost</option>
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
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Brand</label>
                            <input value={car.brandName} onChange={(e) => handleCarDetailChange(idx, 'brandName', e.target.value)} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Model</label>
                            <input value={car.modelName} onChange={(e) => handleCarDetailChange(idx, 'modelName', e.target.value)} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Fuel</label>
                            <input value={car.fuelType} onChange={(e) => handleCarDetailChange(idx, 'fuelType', e.target.value)} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm" />
                        </div>
                        <div className="flex flex-col gap-1.5">
                            <label className="text-[10px] font-bold uppercase text-gray-400">KM</label>
                            <input value={car.kmDriven} onChange={(e) => handleCarDetailChange(idx, 'kmDriven', e.target.value)} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm" />
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-2">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Intent</label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleCarDetailChange(idx, 'intent', 'buying')}
                                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold border transition-all ${car.intent === 'buying' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                > buying </button>
                                <button
                                    type="button"
                                    onClick={() => handleCarDetailChange(idx, 'intent', 'selling')}
                                    className={`flex-1 rounded-lg py-1.5 text-xs font-bold border transition-all ${car.intent === 'selling' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-50 text-gray-500 border-gray-200'}`}
                                > selling </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 md:col-span-3">
                            <label className="text-[10px] font-bold uppercase text-gray-400">Requirements</label>
                            <input value={car.additionalReqs} onChange={(e) => handleCarDetailChange(idx, 'additionalReqs', e.target.value)} className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-sm" />
                        </div>
                    </div>
                ))}

                {(!formData.carDetails || formData.carDetails.length === 0) && (
                    <div className="py-4 text-center text-sm text-indigo-400 italic">No car details added yet.</div>
                )}
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-700">Notes</label>
                <div className="flex flex-col gap-3">
                    {formData.notes?.map((note, idx) => (
                        <div key={idx} className="flex gap-2 items-start relative group">
                            <textarea
                                value={note}
                                onChange={(e) => {
                                    const newNotes = [...(formData.notes || [])];
                                    newNotes[idx] = e.target.value;
                                    setFormData(prev => ({ ...prev, notes: newNotes }));
                                }}
                                placeholder="Write a note..."
                                className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm min-h-[80px]"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newNotes = formData.notes?.filter((_, i) => i !== idx);
                                    setFormData(prev => ({ ...prev, notes: newNotes }));
                                }}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all border border-transparent hover:border-red-100 absolute top-2 right-2"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, notes: [...(prev.notes || []), `${format(new Date(), 'EEEE, do MMMM yyyy')} - `] }))}
                        className="self-start flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                    >
                        <Plus size={14} /> Add Note
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Follow-up Date</label>
                    <input type="date" name="followupDate" value={formData.followupDate ? formData.followupDate.split('T')[0] : ''} onChange={handleChange} className="rounded-xl border border-gray-200 px-4 py-3 text-sm" />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-semibold text-gray-700">Follow-up Notes</label>
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
                                    className="flex-1 rounded-xl border border-gray-200 px-4 py-3 text-sm min-h-[60px]"
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        const newNotes = formData.followupNote?.filter((_, i) => i !== idx);
                                        setFormData(prev => ({ ...prev, followupNote: newNotes }));
                                    }}
                                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all absolute top-2 right-2"
                                >
                                    <Trash2 size={14} />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, followupNote: [...(prev.followupNote || []), `${format(new Date(), 'EEEE, do MMMM yyyy')} - `] }))}
                            className="self-start flex items-center gap-1.5 rounded-lg bg-gray-50 px-3 py-1.5 text-xs font-bold border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                        >
                            <Plus size={14} /> Add Follow-up Note
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
            <div className="w-full flex-1 animate-fadeIn pb-10 max-w-7xl mx-auto">
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
            <div className="flex w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl animate-fadeIn">
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
