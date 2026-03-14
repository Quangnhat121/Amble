// Booking context and conversation types
export interface BookingContext {
    purpose?: 'date' | 'family' | 'business' | 'celebration' | 'casual';
    date?: string;
    time?: string;
    partySize?: number;
    location?: string;
    budget?: string;
    style?: string;
    tableType?: 'vip' | 'view' | 'regular';
}

export interface BookingSession {
    id: string;
    userId?: string;
    context: BookingContext;
    currentStep: BookingStep;
    isComplete: boolean;
    createdAt: Date;
}

export type BookingStep =
    | 'purpose'
    | 'date'
    | 'time'
    | 'partySize'
    | 'location'
    | 'budget'
    | 'tableType'
    | 'complete';

export interface QuickReply {
    id: string;
    text: string;
    value: any;
}
