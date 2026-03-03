import { useLeads } from '../../context/LeadsContext';
import { isSameDay, parseISO, startOfDay } from 'date-fns';
import { User, PieChart, TrendingUp, AlertCircle } from 'lucide-react';

export function WorkingReport() {
    const { leads, users } = useLeads();

    const reportData = users.map(user => {
        const userLeads = leads.filter(l => {
            const assignedToId = typeof l.assignedTo === 'object' ? l.assignedTo._id : l.assignedTo;
            return assignedToId === user._id;
        });

        const today = startOfDay(new Date());

        const missedFollowups = userLeads.filter(l => {
            if (!l.followupDate || l.status === 'closed' || l.status === 'lost') return false;
            const fDate = parseISO(l.followupDate);
            return startOfDay(fDate) < today && !isSameDay(fDate, today);
        }).length;

        const followupsToday = userLeads.filter(l => {
            if (!l.followupDate) return false;
            return isSameDay(parseISO(l.followupDate), today);
        }).length;

        const closedLeads = userLeads.filter(l => l.status === 'closed').length;

        return {
            ...user,
            totalAssigned: userLeads.length,
            missed: missedFollowups,
            dueToday: followupsToday,
            closed: closedLeads
        };
    });

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm uppercase tracking-wider">
                        <TrendingUp size={16} />
                        Team Capacity
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{leads.length} <span className="text-sm font-normal text-gray-400">Leads total</span></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-wider">
                        <AlertCircle size={16} />
                        Critical Issues
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{reportData.reduce((acc, curr) => acc + curr.missed, 0)} <span className="text-sm font-normal text-gray-400">Missed follow-ups</span></div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                    <PieChart size={20} className="text-indigo-600" />
                    <h3 className="font-bold text-gray-900">User Performance Metrics</h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4 text-center">Total Assigned</th>
                                <th className="px-6 py-4 text-center">Due Today</th>
                                <th className="px-6 py-4 text-center">Missed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reportData.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                                <User size={16} />
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{user.username}</span>
                                                <span className="text-xs text-gray-500">{user.email}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-700">{user.totalAssigned}</td>
                                    <td className="px-6 py-4 text-center font-bold text-amber-600">{user.dueToday}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`inline-flex items-center justify-center px-2 py-1 rounded-md text-xs font-bold ${user.missed > 0 ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-emerald-50 text-emerald-600 border border-emerald-100'}`}>
                                            {user.missed}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-sm text-gray-400 italic">
                                        No users found to generate report.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
