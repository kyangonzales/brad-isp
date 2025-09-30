import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios, { AxiosError } from 'axios';
import React, { useEffect, useState } from 'react';
interface Customer {
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

interface CustomerFormProps {
    customerData?: Customer; // Para kapag edit, may existing data
    onClose: () => void; // Para ma-close ang modal
    onSave: (data: Customer) => void; // Function to handle saving
}
interface CustomerApiResponse {
    message: string;
    customer: Customer;
}

export default function CustomerForm({ customerData, onClose, onSave }: CustomerFormProps) {
    const isEditing = !!customerData;
    const [plans, setPlans] = useState<{ id: number; planName: string; price: number }[]>([]);

    const [formData, setFormData] = useState<Customer>(
        customerData || {
            fullname: '',
            phone: '',
            purok: '',
            sitio: '',
            barangay: '',
            plan_id: '',
            notes: '',
            duedate: '',
            branch: '',
        },
    );

    const fetchPlans = async () => {
        try {
            const response = await axios.get('/showPlans');
            if (Array.isArray(response.data)) {
                setPlans(response.data);
            } else {
                setPlans([]);
            }
        } catch (err) {
            const error = err as AxiosError<{ errors: { [key: string]: string[] } }>;
            console.error('Failed to fetch plans:', error.message);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const dataToSend = {
            ...formData,
        };

        try {
            const response = isEditing
                ? await axios.put<CustomerApiResponse>(`../updateCustomer/${customerData?.id}`, dataToSend)
                : await axios.post<CustomerApiResponse>('../insertCustomer', dataToSend);
            console.log(response.data);
            onSave(response.data.customer);
            onClose();
        } catch (error) {
            console.error('Error saving customer:', error);
        }
    };

    return (
        <div className="relative flex min-h-[11in] w-[12in] flex-col rounded-lg border border-gray-300 bg-white pt-2 shadow-xl">
            <div className="mx-auto flex items-center justify-center">
                <img src="/storage/logo.png" alt="Logo" className="mr-2 h-18 w-18" />
                <div className="text-md text-center">
                    <p className="font-bold">Ulyces Internet Service Provider</p>
                    <p className="font-bold">Rio Chico, General Tinio, Nueva Ecija</p>
                    <p className="font-bold">INTAKE SHEET</p>
                </div>
            </div>
            <p className="mb-6 w-full text-center text-xl font-bold text-red-500">New Application</p>

            <small className="px-5 text-justify">
                Please ensure that all required fields are filled out accurately to avoid any delays in processing your request. If a particular field
                does not apply to you, kindly leave it blank. Required fields are marked with an asterisk (
                <span className="font-bold text-red-500">*</span>). Double-check the information you provide to ensure correctness, as inaccurate
                details may lead to issues with your submission. If you have any questions or need assistance, feel free to ask for help before
                proceeding.
            </small>

            <p className="mt-3 px-5 text-sm font-bold text-red-500">* Items with an asterisk (*) are required. </p>
            <div className="mt-4 w-full bg-[#2B6CA3] p-2 font-bold text-white">I. IDENTIFYING INFORMATION</div>

            <form className="mt-5 flex w-full flex-col px-5" onSubmit={handleSubmit}>
                <div className="flex gap-4">
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="fullname">
                            Full Name<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="fullname"
                            name="fullname"
                            placeholder="Full Name"
                            value={formData.fullname}
                            onChange={handleChange}
                            required
                        />
                    </div>{' '}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="first_name">Cellphone Number</Label>
                        <Input type="text" id="phone" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="plan">
                            Plan <span className="text-red-500">*</span>
                        </Label>
                        <Select
                            disabled={plans.length === 0}
                            value={String(formData.plan_id)}
                            onValueChange={(value) => setFormData({ ...formData, plan_id: value })}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a plan" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Plan</SelectLabel>
                                    {plans.map((plan) => (
                                        <SelectItem key={plan.id} value={String(plan.id)}>
                                            {plan.planName} — ₱{plan.price}
                                        </SelectItem>
                                    ))}
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="Location">
                            Branch Location <span className="text-red-500">*</span>
                        </Label>
                        <Select value={formData.branch} onValueChange={(value) => setFormData({ ...formData, branch: value })}>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select Branch Location" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectGroup>
                                    <SelectLabel>Branch Location</SelectLabel>
                                    <SelectItem value="General Tinio">General Tinio</SelectItem>
                                    <SelectItem value="Peñaranda">Peñaranda</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="mt-4 flex gap-4">
                    {isEditing && (
                        <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="duedate">Duedate</Label>
                            <Input
                                type="date"
                                id="duedate"
                                name="duedate"
                                placeholder="Duedate"
                                value={formData.duedate || ''}
                                onChange={handleChange}
                            />
                        </div>
                    )}

                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="purok">Purok</Label>
                        <Input type="text" id="purok" name="purok" placeholder="Purok" value={formData.purok || ''} onChange={handleChange} />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="sitio">Sitio</Label>
                        <Input type="text" id="sitio" name="sitio" placeholder="Sitio" value={formData.sitio || ''} onChange={handleChange} />
                    </div>
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="barangay">
                            Barangay<span className="text-red-500">*</span>
                        </Label>
                        <Input
                            type="text"
                            id="barangay"
                            name="barangay"
                            placeholder="Barangay"
                            value={formData.barangay}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="mt-4 flex gap-4">
                    <Textarea
                        name="notes"
                        value={formData.notes || ''}
                        onChange={handleChange}
                        rows={4}
                        className="w-full"
                        placeholder="Type notes here..."
                    />
                </div>
                <div className="mx-4 flex gap-4 pt-10">
                    <Button
                        type="submit"
                        className="text-md border-1 border-[#1D3795] bg-[#1D3795] p-5 font-bold transition duration-300 hover:bg-[#255a88]"
                    >
                        Proceed to Submit
                    </Button>
                </div>
            </form>
        </div>
    );
}
