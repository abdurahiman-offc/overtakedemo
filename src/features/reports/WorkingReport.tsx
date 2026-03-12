import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import { isSameDay, parseISO, startOfDay, format } from 'date-fns';
import { PieChart, TrendingUp, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

export function WorkingReport() {
    const { leads, users } = useLeads();

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const reportData = users.map(user => {
        const userLeads = leads.filter(l => {
            const assignedToId = typeof l.assignedTo === 'object' ? l.assignedTo._id : l.assignedTo;
            return assignedToId === user._id;
        });

        const today = startOfDay(new Date());
        const filterDate = startOfDay(parseISO(selectedDate));
        const isToday = isSameDay(filterDate, today);

        // All history for this user
        const userHistory = leads.flatMap(l => (l.followupHistory || []).filter(h => h.userId === user._id));

        // Handled on filterDate (Activity on that day)
        const handledOnDate = userHistory.filter(h => isSameDay(parseISO(h.completedDate), filterDate));
        const completedOnDate = handledOnDate.filter(h => h.result === 'responded').length;
        const noResponseOnDate = handledOnDate.filter(h => h.result === 'not_responded').length;
        const rescheduledOnDate = handledOnDate.filter(h => h.result === 'rescheduled').length;

        // Due on filterDate (Items still in the queue for that date)
        const dueOnDate = userLeads.filter(l => {
            if (!l.followupDate) return false;
            return isSameDay(parseISO(l.followupDate), filterDate);
        }).length;

        // Missed (Items due BEFORE filterDate and still pending)
        const missedOnDate = userLeads.filter(l => {
            if (!l.followupDate || l.status === 'sold' || l.status === 'deal_closed') return false;
            const fDate = parseISO(l.followupDate);
            return startOfDay(fDate) < filterDate;
        }).length;

        // Total = Everything handled + Everything still due (including missed)
        const total = completedOnDate + noResponseOnDate + rescheduledOnDate + dueOnDate + (isToday ? missedOnDate : 0);

        return {
            ...user,
            total,
            completed: completedOnDate,
            noResponse: noResponseOnDate,
            rescheduled: rescheduledOnDate,
            missed: missedOnDate
        };
    });

    const totalStats = {
        total: reportData.reduce((acc, curr) => acc + curr.total, 0),
        completed: reportData.reduce((acc, curr) => acc + curr.completed, 0),
        noResponse: reportData.reduce((acc, curr) => acc + curr.noResponse, 0),
        missed: reportData.reduce((acc, curr) => acc + curr.missed, 0),
        rescheduled: reportData.reduce((acc, curr) => acc + curr.rescheduled, 0)
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-indigo-500 font-bold text-sm uppercase tracking-wider">
                        <TrendingUp size={16} />
                        Total Followups
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{totalStats.total} <span className="text-sm font-normal text-gray-400">Items</span></div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-emerald-500 font-bold text-sm uppercase tracking-wider">
                        <TrendingUp size={16} />
                        Completed
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{totalStats.completed}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-orange-500 font-bold text-sm uppercase tracking-wider">
                        <AlertCircle size={16} />
                        No Response
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{totalStats.noResponse}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-500 font-bold text-sm uppercase tracking-wider">
                        <AlertCircle size={16} />
                        Missed
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{totalStats.missed}</div>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-blue-500 font-bold text-sm uppercase tracking-wider">
                        <TrendingUp size={16} />
                        Rescheduled
                    </div>
                    <div className="text-3xl font-bold text-gray-900">{totalStats.rescheduled}</div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <PieChart size={20} className="text-indigo-600" />
                        <h3 className="font-bold text-gray-900">User Follow-up Performance</h3>
                    </div>

                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                        <CalendarIcon size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-sm font-medium text-gray-700 outline-none"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="px-6 py-4">User</th>
                                <th className="px-6 py-4 text-center">Total</th>
                                <th className="px-6 py-4 text-center">Completed</th>
                                <th className="px-6 py-4 text-center">No Response</th>
                                <th className="px-6 py-4 text-center">Missed</th>
                                <th className="px-6 py-4 text-center">Rescheduled</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {reportData.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold uppercase">
                                                {user.username.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{user.username}</span>
                                                <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-700">{user.total}</td>
                                    <td className="px-6 py-4 text-center font-bold text-emerald-600">{user.completed}</td>
                                    <td className="px-6 py-4 text-center font-bold text-orange-600">{user.noResponse}</td>
                                    <td className="px-6 py-4 text-center font-bold text-red-600">{user.missed}</td>
                                    <td className="px-6 py-4 text-center font-bold text-blue-600">{user.rescheduled}</td>
                                </tr>
                            ))}
                            {reportData.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-400 italic">
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
