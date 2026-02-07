import React, { createContext, useContext, useEffect, useState } from 'react';
import { Lead, SmartList } from '../types';

interface LeadsContextType {
    leads: Lead[];
    addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'followupCount'>) => void;
    updateLead: (id: string, updates: Partial<Lead>) => void;
    deleteLead: (id: string) => void;
    smartLists: SmartList[];
    addSmartList: (list: Omit<SmartList, 'id'>) => void;
    deleteSmartList: (id: string) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export function LeadsProvider({ children }: { children: React.ReactNode }) {
    const [leads, setLeads] = useState<Lead[]>(() => {
        const saved = localStorage.getItem('crm_leads');
        if (saved) return JSON.parse(saved);
        return [
            {
                id: '1',
                name: 'John Smith',
                phone: '1234567890',
                place: 'New York',
                enquiredVehicle: 'Tesla Model 3',
                leadType: 'hot',
                status: 'new',
                notes: 'Interested in test drive next week.',
                tags: ['priority', 'EV'],
                followupDate: new Date().toISOString().split('T')[0],
                followupNote: 'Call to confirm appointment',
                followupCount: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            },
            {
                id: '2',
                name: 'Jane Smith',
                phone: '9876543210',
                place: 'California',
                enquiredVehicle: 'Ford Mustang',
                leadType: 'warm',
                status: 'contacted',
                notes: 'Waiting for finance approval.',
                tags: ['finance-pending'],
                followupDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                followupNote: '',
                followupCount: 1,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }
        ];
    });

    const [smartLists, setSmartLists] = useState<SmartList[]>(() => {
        const saved = localStorage.getItem('crm_smartLists');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('crm_leads', JSON.stringify(leads));
    }, [leads]);

    useEffect(() => {
        localStorage.setItem('crm_smartLists', JSON.stringify(smartLists));
    }, [smartLists]);

    const addLead = (lead: Omit<Lead, 'id' | 'createdAt' | 'updatedAt' | 'followupCount'>) => {
        const newLead: Lead = {
            ...lead,
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            followupCount: 0,
            tags: lead.tags || [],
        };
        setLeads((prev) => [newLead, ...prev]);
    };

    const updateLead = (id: string, updates: Partial<Lead>) => {
        setLeads((prev) =>
            prev.map((lead) => (lead.id === id ? { ...lead, ...updates, updatedAt: new Date().toISOString() } : lead))
        );
    };

    const deleteLead = (id: string) => {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
    };

    const addSmartList = (list: Omit<SmartList, 'id'>) => {
        const newList: SmartList = { ...list, id: crypto.randomUUID() };
        setSmartLists((prev) => [...prev, newList]);
    };

    const deleteSmartList = (id: string) => {
        setSmartLists((prev) => prev.filter((list) => list.id !== id));
    };

    return (
        <LeadsContext.Provider value={{ leads, addLead, updateLead, deleteLead, smartLists, addSmartList, deleteSmartList }}>
            {children}
        </LeadsContext.Provider>
    );
}

export const useLeads = () => {
    const context = useContext(LeadsContext);
    if (!context) throw new Error('useLeads must be used within a LeadsProvider');
    return context;
};
