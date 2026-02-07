import { Users, PhoneCall, Zap, Calendar as CalendarIcon } from 'lucide-react';
import { useLeads } from '../../context/LeadsContext';
import { isSameDay, parseISO } from 'date-fns';
import { LeadList } from '../leads/LeadList';

export function Dashboard() {
    const { leads } = useLeads();

    const totalLeads = leads.length;
    const hotLeads = leads.filter(l => l.leadType === 'hot').length;
    const followupsToday = leads.filter(l => {
        const today = new Date();
        const leadDate = parseISO(l.followupDate);
        return isSameDay(today, leadDate);
    }).length;
    const newLeads = leads.filter(l => l.status === 'new').length;

    const cards = [
        { title: 'Total Leads', value: totalLeads, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { title: 'Hot Leads', value: hotLeads, icon: Zap, color: 'text-red-500', bg: 'bg-red-50' },
        { title: 'Follow-ups Today', value: followupsToday, icon: PhoneCall, color: 'text-amber-500', bg: 'bg-amber-50' },
        { title: 'New Leads', value: newLeads, icon: CalendarIcon, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    ];

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map((card, idx) => (
                    <div key={idx} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-6 shadow-sm transition-transform hover:-translate-y-1 hover:shadow-md">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.bg} ${card.color}`}>
                            <card.icon size={24} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-500">{card.title}</span>
                            <span className="text-2xl font-bold text-gray-900">{card.value}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Leads Overview</h2>
                </div>
                <LeadList filterType="all" />
            </div>
        </div>
    );
}
