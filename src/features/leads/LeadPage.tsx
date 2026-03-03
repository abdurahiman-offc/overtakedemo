import { Phone, MapPin, Calendar, History, Trash2, Edit3, Tag, User, Car, ArrowLeft } from 'lucide-react';
import { Lead } from '../../types';
import { format, isValid } from 'date-fns';
import { useLeads } from '../../context/LeadsContext';

interface LeadPageProps {
    lead: Lead;
    onBack: () => void;
    onEdit: (lead: Lead) => void;
}

export function LeadPage({ lead, onBack, onEdit }: LeadPageProps) {
    const { deleteLead } = useLeads();

    const handleDelete = () => {
        if (window.confirm('Are you sure you want to delete this lead?')) {
            deleteLead(lead._id);
            onBack();
        }
    };

    const typeStyles = {
        hot: "bg-red-50 text-red-700 border-red-200",
        warm: "bg-amber-50 text-amber-700 border-amber-200",
        cold: "bg-blue-50 text-blue-700 border-blue-200",
    };

    const formatDate = (dateStr?: string) => {
        if (!dateStr) return 'N/A';
        const date = new Date(dateStr);
        return isValid(date) ? format(date, 'MMM d, yyyy') : 'N/A';
    };

    return (
        <div className="flex flex-col gap-6 w-full animate-fadeIn pb-10 max-w-7xl mx-auto">
            {/* Header / Back Button */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onBack}
                    className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-600 shadow-sm transition-all hover:bg-gray-50 hover:text-gray-900"
                >
                    <ArrowLeft size={16} />
                    Back to Contacts
                </button>
            </div>

            {/* Top Contact Header (CRM Style) */}
            <div className="flex flex-col lg:flex-row justify-between lg:items-center rounded-2xl border border-gray-200 bg-white shadow-sm p-6 gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-2xl font-bold text-indigo-600 shrink-0">
                        {lead.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-3 flex-wrap">
                            <h2 className="text-2xl font-bold text-gray-900 leading-none">{lead.name}</h2>
                            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeStyles[lead.leadType]}`}>
                                {lead.leadType}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest px-2 py-0.5 border border-gray-200 bg-gray-50 rounded-md">
                                {lead.status.replace('_', ' ')}
                            </span>
                        </div>
                        {/* Contact Info Moved to Top */}
                        <div className="flex flex-wrap items-center gap-4 mt-1">
                            <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                <Phone size={14} className="text-indigo-400" />
                                <span className="text-sm font-medium">{lead.phone}</span>
                            </div>
                            {lead.place && (
                                <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                                    <MapPin size={14} className="text-indigo-400" />
                                    <span className="text-sm font-medium">{lead.place}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full lg:w-auto mt-2 lg:mt-0">
                    <button
                        onClick={() => onEdit(lead)}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-colors hover:bg-indigo-700"
                    >
                        <Edit3 size={16} />
                        Edit Lead
                    </button>
                    <button
                        onClick={handleDelete}
                        className="flex-1 lg:flex-none flex items-center justify-center gap-2 rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-600 shadow-sm transition-colors hover:bg-red-100"
                    >
                        <Trash2 size={16} />
                        Delete
                    </button>
                </div>
            </div>

            {/* Main CRM Grid (2/3 + 1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Left Area (Meta & Vehicle Preferences) */}
                <div className="lg:col-span-2 flex flex-col gap-6">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* About Lead Card */}
                        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3.5 flex items-center gap-2">
                                <User size={16} className="text-gray-500" />
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">About this Lead</h3>
                            </div>
                            <div className="flex flex-col p-5 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Assigned Owner</span>
                                    <div className="font-medium text-sm text-gray-900 flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-bold border border-indigo-200">
                                            {(typeof lead.assignedTo === 'object' ? lead.assignedTo?.username : 'U')?.charAt(0).toUpperCase()}
                                        </div>
                                        {typeof lead.assignedTo === 'object' ? lead.assignedTo?.username : 'Unassigned'}
                                    </div>
                                </div>
                                <div className="w-full h-px bg-gray-100"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Lead Source / Origin</span>
                                    <span className="font-medium text-sm text-gray-900 bg-gray-50 self-start px-2.5 py-1 rounded-md border border-gray-200">{lead.leadOrigin}</span>
                                </div>
                                <div className="w-full h-px bg-gray-100"></div>
                                <div className="flex flex-col gap-1">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Created Date</span>
                                    <span className="font-bold text-sm text-gray-900">{formatDate(lead.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Tags Card */}
                        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden h-full">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3.5 flex items-center gap-2">
                                <Tag size={16} className="text-gray-500" />
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Tags</h3>
                            </div>
                            <div className="p-5">
                                {lead.tags && lead.tags.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {lead.tags.map((tag, idx) => (
                                            <span key={idx} className="flex items-center gap-1.5 rounded-lg bg-indigo-50/80 px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-100 border-dashed">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span className="text-xs text-gray-400 italic">No tags added yet.</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Vehicle Preferences */}
                    <div className="flex flex-col gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center gap-2">
                            <Car size={18} className="text-gray-500" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Vehicle Preferences</h3>
                        </div>
                        <div className="p-6 bg-gray-50/30">
                            {lead.carDetails && lead.carDetails.length > 0 ? (
                                <div className="grid grid-cols-1 gap-4">
                                    {lead.carDetails.map((car, idx) => (
                                        <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm relative overflow-hidden group hover:border-indigo-200 transition-colors">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${car.intent === 'buying' ? 'bg-emerald-400' : 'bg-orange-400'}`}></div>
                                            <div className="flex flex-col gap-1.5 ml-2">
                                                <div className="flex items-center gap-2 font-bold text-gray-900 text-lg">
                                                    {car.brandName} {car.modelName}
                                                </div>
                                                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 font-medium">
                                                    {car.fuelType && <span className="bg-gray-100 px-2 py-1 rounded-md">Fuel: <span className="text-gray-900">{car.fuelType}</span></span>}
                                                    {car.kmDriven && <span className="bg-gray-100 px-2 py-1 rounded-md">KM: <span className="text-gray-900">{car.kmDriven}</span></span>}
                                                </div>
                                                {car.additionalReqs && (
                                                    <div className="mt-2 text-sm text-gray-600 italic border-l-2 border-gray-200 pl-3">
                                                        "{car.additionalReqs}"
                                                    </div>
                                                )}
                                            </div>
                                            <div className="ml-2 sm:ml-0 flex-shrink-0">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg ${car.intent === 'buying' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-sm' : 'bg-orange-50 text-orange-700 border border-orange-200 shadow-sm'}`}>
                                                    {car.intent === 'buying' ? 'Interested in Buying' : 'Looking to Sell'}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500 italic py-8 bg-white rounded-xl border border-dashed border-gray-200 text-center">
                                    No vehicle preferences specified for this lead.
                                </div>
                            )}
                        </div>
                    </div>

                </div>

                {/* Right Area (Notes, Follow-ups, History) */}
                <div className="lg:col-span-1 flex flex-col gap-6">

                    {/* General Notes */}
                    {lead.notes && lead.notes.length > 0 && (
                        <div className="flex flex-col gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center gap-2">
                                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">General Notes</h3>
                            </div>
                            <div className="p-6 flex flex-col gap-4">
                                {lead.notes.map((note, idx) => (
                                    <div key={idx} className="rounded-xl bg-blue-50/30 p-5 text-sm text-gray-800 border border-blue-100 shadow-sm relative">
                                        <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-blue-300 rounded-l-xl"></div>
                                        <p className="leading-relaxed pl-2 whitespace-pre-wrap">{note}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Follow-up Activity & Notes */}
                    <div className="flex flex-col gap-0 rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center gap-2">
                            <History size={18} className="text-gray-500" />
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest">Activity & Follow-ups</h3>
                        </div>
                        <div className="p-6 flex flex-col gap-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                                <div className="flex flex-col gap-2 bg-indigo-50/50 p-5 rounded-xl border border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-500">Next Scheduled Follow-up</span>
                                    <div className="flex items-center gap-2 text-indigo-900">
                                        <Calendar size={20} className="text-indigo-600" />
                                        <span className="font-bold text-xl">{formatDate(lead.followupDate)}</span>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 bg-emerald-50/50 p-5 rounded-xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600">Total Interactions</span>
                                    <div className="flex items-center gap-2 text-emerald-900">
                                        <History size={20} className="text-emerald-600" />
                                        <span className="font-bold text-xl">{lead.followupCount} interactions</span>
                                    </div>
                                </div>
                            </div>

                            {lead.followupNote && lead.followupNote.length > 0 && (
                                <div className="flex flex-col gap-3 mt-2">
                                    <h4 className="text-xs font-bold uppercase tracking-widest text-gray-500">Follow-up Notes</h4>
                                    <div className="flex flex-col gap-3">
                                        {lead.followupNote.map((note, idx) => (
                                            <div key={idx} className="rounded-xl bg-amber-50/50 p-5 text-sm text-gray-800 border border-amber-200/50 shadow-sm relative">
                                                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-amber-400 rounded-l-xl"></div>
                                                <p className="leading-relaxed pl-2 whitespace-pre-wrap">{note}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Assignment History */}
                    {lead.assignmentHistory && lead.assignmentHistory.length > 0 && (
                        <div className="flex flex-col rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                            <div className="border-b border-gray-100 bg-gray-50/50 px-5 py-3.5 flex items-center gap-2">
                                <History size={16} className="text-gray-500" />
                                <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest">Assignment History</h3>
                            </div>
                            <div className="p-5">
                                <div className="flex flex-col gap-0 border-l-2 border-indigo-100 ml-2">
                                    {lead.assignmentHistory.map((record, idx) => (
                                        <div key={idx} className="relative pl-5 pb-6 last:pb-0">
                                            <div className="absolute left-[-5px] top-1 h-2 w-2 rounded-full bg-indigo-500 ring-4 ring-white"></div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm leading-none">{record.userId?.username || 'Unknown User'}</span>
                                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">{formatDate(record.assignedAt)}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}
