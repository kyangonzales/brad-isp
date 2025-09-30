// types/customer.ts

export interface Plan {
    id: number;
    planName: string;
    price: string;
    created_at?: string;
    updated_at?: string;
}

export interface Customer {
    id?: number;
    fullname: string;
    phone?: string;
    purok?: string;
    sitio?: string;
    barangay: string;
    plan_id: string;
    notes: string;
    branch: string;
    plan?: Plan;
    state?: string;
}

export interface CustomerFormInput {
    id?: number;
    fullname: string;
    duedate?: string;
    phone?: string;
    purok?: string;
    sitio?: string;
    barangay: string;
    notes?: string;
    plan_id: string;
    branch: string;
}
