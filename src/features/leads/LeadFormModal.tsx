import { useState, useEffect } from 'react';
import { X, Save, Tag } from 'lucide-react';
import { useLeads } from '../../context/LeadsContext';
import { Lead } from '../../types';

interface LeadFormModalProps {
    onClose: () => void;
    initialData?: Lead;
}

export function LeadFormModal({ onClose, initialData }: LeadFormModalProps) {
    const { addLead, updateLead } = useLeads();
    const [tagInput, setTagInput] = useState('');
    const [formData, setFormData] = useState<Partial<Lead>>({
        name: '',
        phone: '',
        place: '',
        enquiredVehicle: '',
        leadType: 'cold',
        status: 'new',
        notes: '',
        tags: [],
        followupDate: new Date().toISOString().split('T')[0],
        followupNote: '',
        followupCount: 0
    });

    useEffect(() => {
        if (initialData) {
            setFormData(initialData);
            setTagInput(initialData.tags?.join(', ') || '');
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.phone) return;

        // Process tags
        const tags = tagInput.split(',').map(tag => tag.trim()).filter(tag => tag !== '');
        const finalData = { ...formData, tags };

        if (initialData) {
            updateLead(initialData.id, finalData);
        } else {
            addLead(finalData as Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'followupCount'>);
        }
        onClose();
    };

    const isEdit = !!initialData;

    return (
        <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <h2 className="text-xl font-bold text-gray-900">{isEdit ? 'Edit Lead' : 'Add New Lead'}</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6 overflow-y-auto max-h-[80vh]">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Name *</label>
                        <input
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            required
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Phone *</label>
                            <input
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                required
                                placeholder="e.g. 555-0123"
                            />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Place</label>
                            <input
                                name="place"
                                value={formData.place}
                                onChange={handleChange}
                                className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                                placeholder="City/Area"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <Tag size={14} className="text-gray-400" />
                            Tags (comma separated)
                        </label>
                        <input
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            placeholder="e.g. priority, web-lead, urgent"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Enquired Vehicle</label>
                        <input
                            name="enquiredVehicle"
                            value={formData.enquiredVehicle}
                            onChange={handleChange}
                            className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            placeholder="e.g. SUV Model X"
                        />
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Lead Type</label>
                            <select
                                name="leadType"
                                value={formData.leadType}
                                onChange={handleChange}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            >
                                <option value="hot">Hot</option>
                                <option value="warm">Warm</option>
                                <option value="cold">Cold</option>
                            </select>
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            >
                                <option value="new">New</option>
                                <option value="contacted">Contacted</option>
                                <option value="followed_up">Followed Up</option>
                                <option value="closed">Closed</option>
                                <option value="lost">Lost</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Notes</label>
                        <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            rows={3}
                            placeholder="Any additional details..."
                        />
                    </div>

                    <div className="flex flex-col gap-5 sm:flex-row">
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Follow-up Date</label>
                            <input
                                type="date"
                                name="followupDate"
                                value={formData.followupDate}
                                onChange={handleChange}
                                className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <label className="text-sm font-semibold text-gray-700">Number of Times Followed</label>
                            <input
                                type="number"
                                name="followupCount"
                                value={formData.followupCount}
                                onChange={handleChange}
                                className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-semibold text-gray-700">Follow-up Note</label>
                        <input
                            name="followupNote"
                            value={formData.followupNote}
                            onChange={handleChange}
                            className="rounded-xl border border-gray-200 px-4 py-3 text-sm transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                            placeholder="Reminder note"
                        />
                    </div>

                    <div className="mt-4 flex justify-end gap-3 border-t border-gray-100 pt-5">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-xl border border-gray-200 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition-all hover:-translate-y-px hover:shadow-lg hover:shadow-indigo-500/40 active:translate-y-px"
                        >
                            <Save size={18} />
                            {isEdit ? 'Update Lead' : 'Save Lead'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
