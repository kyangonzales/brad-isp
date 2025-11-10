import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import axios, { AxiosError } from 'axios';
import { Loader2, X } from 'lucide-react';
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
    images?: (File | string)[];
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
            images: [],
        },
    );
    const [preview1, setPreview1] = useState<string | null>(null);
    const [preview2, setPreview2] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [file1, setFile1] = useState<File | null>(null);
    const [file2, setFile2] = useState<File | null>(null);
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
        if (isEditing && customerData?.images) {
            // assuming images is array of URLs from backend
            if (customerData.images[0]) {
                setPreview1(customerData.images[0] as unknown as string); // if it's a URL
            }
            if (customerData.images[1]) {
                setPreview2(customerData.images[1] as unknown as string);
            }
        }
    }, [isEditing, customerData]);

    useEffect(() => {
        fetchPlans();
    }, []);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, which: 'image1' | 'image2') => {
        const file = e.target.files?.[0];
        if (!file) return;

        const previewUrl = URL.createObjectURL(file);

        if (which === 'image1') {
            setFile1(file);
            setPreview1(previewUrl);
        } else {
            setFile2(file);
            setPreview2(previewUrl);
        }

        setFormData((prev) => {
            // Force the array to be File[] for uploading
            const updatedImages: File[] = [];

            if (which === 'image1') {
                updatedImages[0] = file;
                if (file2) updatedImages[1] = file2;
            } else {
                updatedImages[1] = file;
                if (file1) updatedImages[0] = file1;
            }

            return {
                ...prev,
                images: updatedImages,
            };
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const form = new FormData();

        form.append('fullname', formData.fullname);
        form.append('phone', formData.phone || '');
        form.append('purok', formData.purok || '');
        form.append('sitio', formData.sitio || '');
        form.append('barangay', formData.barangay);
        form.append('branch', formData.branch || '');
        form.append('notes', formData.notes || '');
        form.append('plan_id', formData.plan_id.toString());
        form.append('duedate', formData.duedate || '');

        if (formData.images && formData.images.length > 0) {
            formData.images.forEach((file) => {
                if (file instanceof File) {
                    form.append('images[]', file);
                }
            });
        }

        try {
            const url = isEditing ? `../updateCustomer/${customerData?.id}` : '../insertCustomer';
            const response = await axios.post(url, form, {
                headers: {
                    // ✅ Let Axios set the correct boundary
                    'Content-Type': 'multipart/form-data',
                },
            });

            console.log('✅ Saved:', response.data);
            onSave(response.data.customer);
            onClose();
        } catch (error) {
            console.error('❌ Error saving customer:', error);
        } finally {
            setIsSubmitting(false);
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
                            required
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

                <div className="mt-6 w-full bg-[#2B6CA3] p-2 font-bold text-white">II. UPLOAD IMAGES FOR HOUSE ADDRESS</div>
                <div className="mt-4 flex gap-10">
                    {/* IMAGE 1 */}
                    <div className="grid w-full max-w-sm items-start gap-1.5">
                        <Label htmlFor="image1">Upload Image 1</Label>

                        {!preview1 && <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'image1')} />}

                        {preview1 && (
                            <div className="mt-2 inline-block">
                                <div className="relative h-40 w-40">
                                    <img src={preview1} alt="Preview 1" className="h-full w-full rounded-lg border object-cover shadow-md" />
                                    {/* ❌ Button now sticks *inside* the image */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (preview2) {
                                                // ✅ Shift image2 into image1
                                                setPreview1(preview2);
                                                setFile1(file2);
                                                setPreview2(null);
                                                setFile2(null);
                                            } else {
                                                // ✅ No image2, just clear image1
                                                setPreview1(null);
                                                setFile1(null);
                                            }
                                        }}
                                        className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white shadow hover:bg-red-600"
                                        title="Remove image"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* IMAGE 2 */}
                    {preview1 && (
                        <div className="grid w-full max-w-sm items-start gap-1.5">
                            <Label htmlFor="image2">Upload Image 2</Label>

                            {!preview2 && <Input type="file" accept="image/*" onChange={(e) => handleImageChange(e, 'image2')} />}

                            {preview2 && (
                                <div className="mt-2 inline-block">
                                    <div className="relative h-40 w-40">
                                        <img src={preview2} alt="Preview 2" className="h-full w-full rounded-lg border object-cover shadow-md" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setPreview2(null);
                                                setFile2(null);
                                            }}
                                            className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white shadow hover:bg-red-600"
                                            title="Remove image"
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="mx-4 flex gap-4 pt-10">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="text-md border-1 border-[#1D3795] bg-[#1D3795] p-5 font-bold transition duration-300 hover:bg-[#255a88]"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="h-5 w-5 animate-spin text-white" />
                                Submitting...
                            </>
                        ) : (
                            'Proceed to Submit'
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
