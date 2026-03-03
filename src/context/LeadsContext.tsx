import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lead, SmartList, User, Tag } from '../types';

interface LeadsContextType {
    leads: Lead[];
    users: User[];
    smartLists: SmartList[];
    tags: Tag[];
    loading: boolean;
    error: string | null;
    fetchLeads: () => Promise<void>;
    addLead: (lead: Partial<Lead>) => Promise<void>;
    updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
    deleteLead: (id: string) => Promise<void>;
    addUser: (user: Partial<User>) => Promise<void>;
    addSmartList: (list: Partial<SmartList>) => Promise<void>;
    deleteSmartList: (id: string) => Promise<void>;
    addTag: (tag: Partial<Tag>) => Promise<void>;
    deleteTag: (id: string) => Promise<void>;
    bulkDeleteLeads: (ids: string[]) => Promise<void>;
    bulkAssignLeads: (ids: string[], userId: string) => Promise<void>;
    bulkUpdateLeads: (ids: string[], updates?: Partial<Lead>, addTags?: string[], removeTags?: string[]) => Promise<void>;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [smartLists, setSmartLists] = useState<SmartList[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [leadsRes, usersRes, listsRes, tagsRes] = await Promise.all([
                fetch('/api/leads'),
                fetch('/api/users'),
                fetch('/api/smartlists'),
                fetch('/api/tags')
            ]);

            if (leadsRes.ok) {
                const fetchedLeads = await leadsRes.json();
                setLeads(fetchedLeads.map((l: Record<string, unknown>) => ({
                    ...l,
                    tags: l.tags || [],
                    carDetails: l.carDetails || [],
                    username: l.username || 'Unknown',
                    phone: l.phone || 'Unknown',
                    assignmentHistory: l.assignmentHistory || []
                } as unknown as Lead)));
            }
            if (usersRes.ok) {
                const fetchedUsers = await usersRes.json();
                setUsers(fetchedUsers.map((u: Record<string, unknown>) => ({
                    ...u,
                    username: u.username || u.name || 'User'
                } as User)));
            }
            if (listsRes.ok) setSmartLists(await listsRes.json());
            if (tagsRes.ok) setTags(await tagsRes.json());
            setError(null);
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'An unknown error occurred';
            console.error('Failed to fetch data', message);
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const addLead = async (leadData: Partial<Lead>) => {
        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(leadData)
            });
            if (res.ok) {
                await fetchData(); // Refresh to get populated refs
            }
        } catch (err) { console.error('Error adding lead', err); }
    };

    const updateLead = async (id: string, updates: Partial<Lead>) => {
        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
            });
            if (res.ok) {
                await fetchData();
            }
        } catch (err) { console.error('Error updating lead', err); }
    };

    const deleteLead = async (id: string) => {
        try {
            const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setLeads(prev => prev.filter(l => l._id !== id));
            }
        } catch (err) { console.error('Error deleting lead', err); }
    };

    const addUser = async (userData: Partial<User>) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (res.ok) {
                const newUser = await res.json();
                setUsers(prev => [newUser, ...prev]);
            }
        } catch (err) { console.error('Error adding user', err); }
    };

    const addSmartList = async (listData: Partial<SmartList>) => {
        try {
            const res = await fetch('/api/smartlists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(listData)
            });
            if (res.ok) {
                const newList = await res.json();
                setSmartLists(prev => [newList, ...prev]);
            }
        } catch (err) { console.error('Error adding list', err); }
    };

    const deleteSmartList = async (id: string) => {
        try {
            const res = await fetch(`/api/smartlists/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSmartLists(prev => prev.filter(l => l._id !== id));
            }
        } catch (err) { console.error('Error deleting list', err); }
    };

    const addTag = async (tagData: Partial<Tag>) => {
        try {
            const res = await fetch('/api/tags', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(tagData)
            });
            if (res.ok) {
                const newTag = await res.json();
                setTags(prev => [newTag, ...prev]);
            }
        } catch (err) { console.error('Error adding tag', err); }
    };

    const deleteTag = async (id: string) => {
        try {
            const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setTags(prev => prev.filter(t => t._id !== id));
            }
        } catch (err) { console.error('Error deleting tag', err); }
    };

    const bulkDeleteLeads = async (ids: string[]) => {
        try {
            const res = await fetch('/api/leads/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids })
            });
            if (res.ok) await fetchData();
        } catch (err) { console.error('Error bulk deleting leads', err); }
    };

    const bulkAssignLeads = async (ids: string[], userId: string) => {
        try {
            const res = await fetch('/api/leads/bulk-assign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, userId })
            });
            if (res.ok) await fetchData();
        } catch (err) { console.error('Error bulk assigning leads', err); }
    };

    const bulkUpdateLeads = async (ids: string[], updates?: Partial<Lead>, addTags?: string[], removeTags?: string[]) => {
        try {
            const res = await fetch('/api/leads/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, updates, addTags, removeTags })
            });
            if (res.ok) await fetchData();
        } catch (err) { console.error('Error bulk updating leads', err); }
    };

    return (
        <LeadsContext.Provider value={{
            leads, users, smartLists, tags, loading, error,
            fetchLeads: fetchData, addLead, updateLead, deleteLead,
            addUser, addSmartList, deleteSmartList,
            addTag, deleteTag,
            bulkDeleteLeads, bulkAssignLeads, bulkUpdateLeads
        }}>
            {children}
        </LeadsContext.Provider>
    );
}

export const useLeads = () => {
    const context = useContext(LeadsContext);
    if (!context) throw new Error('useLeads must be used within a LeadsProvider');
    return context;
};
