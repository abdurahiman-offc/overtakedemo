import { Phone, MapPin, MessageSquare, Tag } from 'lucide-react';
import { Lead } from '../../types';
import { clsx } from 'clsx';

interface LeadCardProps {
    lead: Lead;
    onClick: (lead: Lead) => void;
    onStatusChange: (id: string, status: Lead['status']) => void;
}

export function LeadCard({ lead, onClick, onStatusChange }: LeadCardProps) {
    const typeConfig = {
        hot: "bg-red-500 shadow-red-500/30",
        warm: "bg-amber-500 shadow-amber-500/30",
        cold: "bg-blue-500 shadow-blue-500/30",
    };

    return (
        <div
            onClick={() => onClick(lead)}
            className="group relative flex cursor-pointer flex-col gap-4 rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-500/10"
        >
            <div className="flex items-start justify-between">
                <div className="flex flex-col gap-2">
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{lead.name}</h3>
                    <div className="flex items-center gap-2">
                        <div className={clsx(
                            "max-w-fit rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md",
                            typeConfig[lead.leadType]
                        )}>
                            {lead.leadType.toUpperCase()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-3">
                    <Phone size={16} className="text-gray-400" />
                    <span className="font-medium text-gray-700">{lead.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                    <MapPin size={16} className="text-gray-400" />
                    <span>{lead.place || "No location"}</span>
                </div>
                <div className="flex items-center gap-3">
                    <MessageSquare size={16} className="text-gray-400" />
                    <span>{lead.enquiredVehicle || "No vehicle"}</span>
                </div>
            </div>

            {lead.tags && lead.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {lead.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-bold text-gray-500 border border-gray-100">
                            <Tag size={10} />
                            {tag}
                        </span>
                    ))}
                    {lead.tags.length > 3 && <span className="text-[10px] text-gray-400">+{lead.tags.length - 3}</span>}
                </div>
            )}

            <div className="mt-auto flex items-center justify-between border-t border-gray-100 pt-4" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs font-semibold text-gray-400 uppercase">Status</span>
                <select
                    value={lead.status}
                    onChange={(e) => onStatusChange(lead.id, e.target.value as Lead['status'])}
                    className="rounded-lg border-0 bg-gray-50 py-1.5 pl-3 pr-8 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-indigo-600 sm:text-sm sm:leading-6"
                >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="followed_up">Followed Up</option>
                    <option value="closed">Closed</option>
                    <option value="lost">Lost</option>
                </select>
            </div>
        </div>
    );
}
