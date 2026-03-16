import { useState } from 'react';
import { useLeads } from '../../context/LeadsContext';
import { isSameDay, parseISO, startOfDay, format } from 'date-fns';
import { PieChart, TrendingUp, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';

export function WorkingReport() {
    const { leads, users } = useLeads();

    const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const today = startOfDay(new Date());
    const now = new Date();
    const isAfter6PM = now.getHours() >= 18;

    // 1. Cumulative KPI Data (Historical up to Yesterday)
    const cumulativeData = users.map(user => {
        const userLeads = leads.filter(l => {
            const assignedToId = typeof l.assignedTo === 'object' ? l.assignedTo?._id : l.assignedTo;
            return assignedToId === user._id;
        });

        const userHistory = leads.flatMap(l => (l.followupHistory || []).filter(h => h.userId === user._id));

        // Everything scheduled BEFORE today
        const historicalHandled = userHistory.filter(h => h.scheduledDate && startOfDay(parseISO(h.scheduledDate)) < today);
        const completed = historicalHandled.filter(h => h.result === 'responded').length;
        const noResponse = historicalHandled.filter(h => h.result === 'not_responded').length;

        // Everything STILL PENDING scheduled BEFORE today
        const missed = userLeads.filter(l => {
            if (!l.followupDate) return false;
            return startOfDay(parseISO(l.followupDate as string)) < today;
        }).length;

        const total = historicalHandled.length + missed;

        return { ...user, total, completed, noResponse, missed };
    });

    // 2. Daily Performance Data (Selected Date)
    const dailyData = users.map(user => {
        const userLeads = leads.filter(l => {
            const assignedToId = typeof l.assignedTo === 'object' ? l.assignedTo?._id : l.assignedTo;
            return assignedToId === user._id;
        });

        const filterDate = startOfDay(parseISO(selectedDate));
        const isToday = isSameDay(filterDate, today);
        
        const userHistory = leads.flatMap(l => (l.followupHistory || []).filter(h => h.userId === user._id));

        const dailyHandled = userHistory.filter(h => h.scheduledDate && isSameDay(parseISO(h.scheduledDate), filterDate));
        const completed = dailyHandled.filter(h => h.result === 'responded').length;
        const noResponse = dailyHandled.filter(h => h.result === 'not_responded').length;

        const dailyPending = userLeads.filter(l => {
            if (!l.followupDate) return false;
            return isSameDay(parseISO(l.followupDate as string), filterDate);
        }).length;

        const upcoming = userLeads.filter(l => {
            if (!l.followupDate) return false;
            return startOfDay(parseISO(l.followupDate as string)) > today;
        }).length;

        // Missed logic for the specific day
        const missed = (filterDate < today || (isToday && isAfter6PM)) ? dailyPending : 0;
        const scheduled = dailyHandled.length + dailyPending;

        return { 
            ...user, 
            scheduled, 
            completed, 
            noResponse, 
            missed, 
            upcoming,
            isFinalized: !isToday || isAfter6PM
        };
    });

    return (
        <div className="flex flex-col gap-10">
            {/* Historical KPI Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <TrendingUp size={20} className="text-[#1B1B19]" />
                        <h3 className="font-bold text-gray-900">Historical Performance KPI (Up to Yesterday)</h3>
                    </div>
                    <div className="px-3 py-1 bg-gray-100 text-[#1B1B19] rounded-full text-[10px] font-bold uppercase tracking-wider border border-gray-200">
                        Cumulative Summary
                    </div>
                </div>
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="px-6 py-4">Sales Representative</th>
                                <th className="px-6 py-4 text-center">Total Scheduled</th>
                                <th className="px-6 py-4 text-center">Completed</th>
                                <th className="px-6 py-4 text-center">Not Responded</th>
                                <th className="px-6 py-4 text-center">Total Missed</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {cumulativeData.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[#1B1B19] font-bold uppercase">
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
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view cards for Historical KPI */}
                <div className="sm:hidden divide-y divide-gray-50">
                    {cumulativeData.map(user => (
                        <div key={user._id} className="p-4 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1B1B19] font-bold uppercase border border-gray-100">
                                    {user.username.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900">{user.username}</span>
                                    <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Scheduled</span>
                                    <span className="text-sm font-bold text-gray-700">{user.total}</span>
                                </div>
                                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                    <span className="text-[10px] uppercase text-emerald-600 font-bold block mb-1">Completed</span>
                                    <span className="text-sm font-bold text-emerald-700">{user.completed}</span>
                                </div>
                                <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                                    <span className="text-[10px] uppercase text-orange-600 font-bold block mb-1">No Response</span>
                                    <span className="text-sm font-bold text-orange-700">{user.noResponse}</span>
                                </div>
                                <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                                    <span className="text-[10px] uppercase text-red-600 font-bold block mb-1">Missed</span>
                                    <span className="text-sm font-bold text-red-700">{user.missed}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Daily Performance Section */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center gap-4">
                    <div className="flex items-center gap-3 bg-white px-3 py-1.5 rounded-xl border border-gray-200">
                        <CalendarIcon size={16} className="text-gray-400" />
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            className="text-sm font-medium text-gray-700 outline-none"
                        />
                    </div>

                    <div className="flex items-center gap-2 sm:ml-auto">
                        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                            dailyData[0]?.isFinalized 
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                        }`}>
                            <AlertCircle size={10} />
                            {dailyData[0]?.isFinalized ? 'Report Finalized' : 'Live Report (Finalizes at 6 PM)'}
                        </div>
                            <PieChart size={20} className="text-[#1B1B19]" />
                        <h3 className="font-bold text-gray-900">Daily Performance - {isSameDay(parseISO(selectedDate), today) ? "Today" : format(parseISO(selectedDate), 'dd/MM/yyyy')}</h3>
                    </div>
                </div>

                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-bold uppercase tracking-widest text-gray-400 border-b border-gray-100">
                                <th className="px-6 py-4">Sales Representative</th>
                                <th className="px-6 py-4 text-center">Scheduled</th>
                                <th className="px-6 py-4 text-center">Completed</th>
                                <th className="px-6 py-4 text-center">Not Responded</th>
                                <th className="px-6 py-4 text-center">Missed</th>
                                <th className="px-6 py-4 text-center text-blue-600 font-extrabold">Upcoming</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {dailyData.map(user => (
                                <tr key={user._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-[#1B1B19] font-bold uppercase">
                                                {user.username.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 text-sm">{user.username}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-center font-bold text-gray-700">{user.scheduled}</td>
                                    <td className="px-6 py-4 text-center font-bold text-emerald-600">{user.completed}</td>
                                    <td className="px-6 py-4 text-center font-bold text-orange-600">{user.noResponse}</td>
                                    <td className="px-6 py-4 text-center font-bold text-red-600">{user.missed}</td>
                                    <td className="px-6 py-4 text-center font-bold text-blue-600 bg-blue-50/30">{user.upcoming}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view cards for Daily Performance */}
                <div className="sm:hidden divide-y divide-gray-50">
                    {dailyData.map(user => (
                        <div key={user._id} className="p-4 flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-gray-50 flex items-center justify-center text-[#1B1B19] font-bold uppercase border border-gray-100">
                                    {user.username.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-bold text-gray-900">{user.username}</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-gray-50 p-2 rounded-lg border border-gray-100">
                                    <span className="text-[10px] uppercase text-gray-400 font-bold block mb-1">Scheduled</span>
                                    <span className="text-sm font-bold text-gray-700">{user.scheduled}</span>
                                </div>
                                <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                                    <span className="text-[10px] uppercase text-emerald-600 font-bold block mb-1">Completed</span>
                                    <span className="text-sm font-bold text-emerald-700">{user.completed}</span>
                                </div>
                                <div className="bg-orange-50 p-2 rounded-lg border border-orange-100">
                                    <span className="text-[10px] uppercase text-orange-600 font-bold block mb-1">No Response</span>
                                    <span className="text-sm font-bold text-orange-700">{user.noResponse}</span>
                                </div>
                                <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                                    <span className="text-[10px] uppercase text-red-600 font-bold block mb-1">Missed</span>
                                    <span className="text-sm font-bold text-red-700">{user.missed}</span>
                                </div>
                                <div className="col-span-2 bg-blue-50 p-2 rounded-lg border border-blue-100 flex items-center justify-between">
                                    <span className="text-[10px] uppercase text-blue-600 font-bold">Upcoming Leads</span>
                                    <span className="text-sm font-bold text-blue-700">{user.upcoming}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
