export interface User {
    _id: string;
    username: string;
    email: string;
    role: 'admin' | 'manager' | 'sales';
}

export interface Tag {
    _id: string;
    name: string;
    color: string;
}

export interface CarDetail {
    _id?: string;
    brandName: string;
    modelName: string;
    fuelType: string;
    kmDriven: string;
    additionalReqs: string;
    intent: 'buying' | 'selling';
}

export interface AssignmentRecord {
    _id?: string;
    userId: User;
    assignedAt: string;
    assignedBy: string;
}

export interface Lead {
    _id: string;
    name: string;
    phone: string;
    place: string;
    leadOrigin: 'WhatsApp' | 'Insta' | 'FB' | 'Walk-in' | 'Tele' | 'Referral' | 'Web' | 'OLX' | 'Other';
    enquiredVehicle: string;
    leadType: 'hot' | 'warm' | 'cold';
    status: 'new' | 'contacted' | 'followed_up' | 'closed' | 'lost';
    notes: string[];
    tags: string[];
    carDetails: CarDetail[];
    assignedTo?: User;
    assignmentHistory: AssignmentRecord[];
    followupDate?: string;
    followupNote?: string[];
    followupCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface SmartList {
    _id: string;
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
    leadOrigin?: string;
    assignedTo?: string;
    selectedIds?: string[];
}
