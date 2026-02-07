import { X, Phone, MapPin, MessageSquare, Calendar, History, Trash2, Edit3, Tag } from 'lucide-react';
import { Lead } from '../../types';
import { format } from 'date-fns';
import { useLeads } from '../../context/LeadsContext';

interface LeadDetailsModalProps {
    lead: Lead;
    onClose: () => void;
    onEdit: (lead: Lead) => void;
}

export function LeadDetailsModal({ lead, onClose, onEdit }: LeadDetailsModalProps) {
    const { deleteLead } = useLeads();

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            deleteLead(lead.id);
            onClose();
        }
    };

    const typeStyles = {
        hot: "bg-red-50 text-red-700 border-red-200",
        warm: "bg-amber-50 text-amber-700 border-amber-200",
        cold: "bg-blue-50 text-blue-700 border-blue-200",
    };

    return (
        <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-[2px] p-4"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl animate-fadeIn">
                <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">{lead.name}</h2>
                        <span className={`rounded-full border px-3 py-0.5 text-xs font-bold uppercase tracking-wider ${typeStyles[lead.leadType]}`}>
                            {lead.leadType}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-900"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col gap-6 p-6 overflow-y-auto max-h-[75vh]">
                    {/* Tags */}
                    {lead.tags && lead.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {lead.tags.map((tag, idx) => (
                                <span key={idx} className="flex items-center gap-1.5 rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-600 border border-gray-200">
                                    <Tag size={12} className="text-gray-400" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Contact Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Phone Number</span>
                            <div className="flex items-center gap-2 text-gray-900">
                                <Phone size={16} className="text-indigo-500" />
                                <span className="font-semibold">{lead.phone}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Location</span>
                            <div className="flex items-center gap-2 text-gray-900">
                                <MapPin size={16} className="text-indigo-500" />
                                <span className="font-semibold">{lead.place || "N/A"}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Enquired Vehicle</span>
                        <div className="flex items-center gap-2 text-gray-900">
                            <MessageSquare size={16} className="text-indigo-500" />
                            <span className="font-semibold">{lead.enquiredVehicle || "None specified"}</span>
                        </div>
                    </div>

                    <div className="h-px bg-gray-100 w-full" />

                    {/* Follow-up Details */}
                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Next Follow-up</span>
                            <div className="flex items-center gap-2 text-gray-900">
                                <Calendar size={16} className="text-indigo-500" />
                                <span className="font-semibold">{format(new Date(lead.followupDate), 'MMM d, yyyy')}</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Follow-up Times</span>
                            <div className="flex items-center gap-2 text-gray-900">
                                <History size={16} className="text-indigo-500" />
                                <span className="font-semibold">{lead.followupCount} times</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Follow-up Note</span>
                        <div className="rounded-lg bg-indigo-50/50 p-3 text-sm text-gray-700 italic border border-indigo-100/50">
                            {lead.followupNote || "No follow-up notes yet."}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Notes / History</span>
                        <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                            {lead.notes || "No additional notes."}
                        </p>
                    </div>
                </div>

                <div className="flex justify-between items-center bg-gray-50 px-6 py-4 border-t border-gray-100">
                    <button
                        onClick={handleDelete}
                        className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                    >
                        <Trash2 size={16} />
                        Delete Lead
                    </button>

                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="rounded-xl px-4 py-2 text-sm font-semibold text-gray-500 hover:bg-gray-100"
                        >
                            Close
                        </button>
                        <button
                            onClick={() => onEdit(lead)}
                            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 transition-colors"
                        >
                            <Edit3 size={16} />
                            Edit Lead
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
