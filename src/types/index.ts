export interface Lead {
    id: string;
    name: string;
    phone: string;
    place: string;
    enquiredVehicle: string;
    leadType: 'hot' | 'warm' | 'cold';
    status: 'new' | 'contacted' | 'followed_up' | 'closed' | 'lost';
    notes: string;
    tags: string[];
    followupDate: string; // ISO Date string
    followupNote: string;
    followupCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SmartList {
    id: string;
    name: string;
    filters: LeadFilter;
}

export interface LeadFilter {
    search?: string;
    name?: string;
    phone?: string;
    place?: string;
    tag?: string;
    leadType?: 'hot' | 'warm' | 'cold' | 'all';
    status?: string;
    dateRange?: { start: string; end: string };
    isFollowup?: boolean;
}
