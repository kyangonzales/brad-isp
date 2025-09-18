import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import axios, { AxiosError } from 'axios';
import { Edit, Plus, Trash2, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const breadcrumbs = [{ title: 'Manage Plan', href: '/plans' }];

// Add customers_count to interface
interface Plan {
    id: number;
    planName: string;
    price: number;
    customers_count: number; // <-- Add this property
}

export default function Plans() {
    const [planName, setPlanName] = useState('');
    const [price, setPrice] = useState('');
    const [errors, setErrors] = useState<{ [key: string]: string[] }>({});
    const [isOpen, setIsOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    const [editId, setEditId] = useState<number | null>(null);
    const [plans, setPlans] = useState<Plan[]>([]); // Use Plan[]
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPlans = async () => {
        setLoading(true);
        try {
            const response = await axios.get<Plan[]>('/showPlans'); // Typing response
            if (Array.isArray(response.data)) {
                setPlans(response.data);
            } else {
                setPlans([]);
                toast.error('Unexpected data format received');
            }
        } catch (err) {
            const error = err as AxiosError<{ errors: { [key: string]: string[] } }>;
            if (error.response?.status === 422 && error.response.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Something went wrong while fetching plans!');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSubscribers = async (planId: number) => {
        try {
            const response = await axios.get(`/plans/${planId}/subscribers`);
            console.log('Subscribers:', response.data); // ✅ Log to console
            toast.success('Fetched subscribers successfully!');
        } catch (error) {
            console.error('Failed to fetch subscribers:', error);
            toast.error('Failed to fetch subscribers.');
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const openAddModal = () => {
        setIsEdit(false);
        setEditId(null);
        setPlanName('');
        setPrice('');
        setErrors({});
        setIsOpen(true);
    };

    const openEditModal = (plan: Plan) => {
        setIsEdit(true);
        setEditId(plan.id);
        setPlanName(plan.planName);
        setPrice(plan.price.toString());
        setErrors({});
        setIsOpen(true);
    };

    const handleModalClose = () => {
        setIsOpen(false);
        setPlanName('');
        setPrice('');
        setErrors({});
        setEditId(null);
        setIsEdit(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setErrors({});

        try {
            if (isEdit && editId !== null) {
                await axios.put(`/plans/${editId}`, {
                    planName: planName.trim(),
                    price: parseFloat(price),
                });
                toast.success('Plan updated successfully!');
            } else {
                await axios.post('/plans', {
                    planName: planName.trim(),
                    price: parseFloat(price),
                });
                toast.success('Plan added successfully!');
            }
            handleModalClose();
            fetchPlans();
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 422) {
                    setErrors(error.response.data.errors);
                } else {
                    toast.error('Something went wrong!');
                }
            } else {
                toast.error('An unexpected error occurred');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedPlanId) return;

        setIsDeleting(true);
        try {
            await axios.delete(`/plans/${selectedPlanId}`);
            toast.success('Plan deleted successfully!');
            fetchPlans();
            setIsDeleteOpen(false);
        } catch (err) {
            const error = err as AxiosError<{ errors: { [key: string]: string[] } }>;
            if (error.response?.status === 422 && error.response.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                toast.error('Something went wrong while deleting!');
            }
        } finally {
            setIsDeleting(false);
            setSelectedPlanId(null);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List of Plans" />

            <div className="mt-5 mr-5 mb-4 flex justify-end">
                <Button
                    variant="outline"
                    className="flex items-center gap-2 rounded-md bg-[#1D3795] px-4 py-2 text-white hover:bg-[#162C7D] hover:text-white"
                    onClick={openAddModal}
                >
                    <Plus className="h-5 w-5" /> Add New Plan
                </Button>
            </div>

            <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
                <DialogContent className="sm:max-w-[600px]">
                    <form onSubmit={handleSubmit}>
                        <DialogHeader>
                            <DialogTitle>{isEdit ? 'Edit Plan' : 'Add New Plan'}</DialogTitle>
                            <DialogDescription>{isEdit ? 'Update your plan details below.' : 'Fill in the plan details below.'}</DialogDescription>
                        </DialogHeader>

                        <div className="mb-6 grid gap-4">
                            <div>
                                <Label htmlFor="planName">Plan Name</Label>
                                <Input id="planName" value={planName} onChange={(e) => setPlanName(e.target.value)} disabled={submitting} />
                                {errors.planName && <p className="text-sm text-red-600">{errors.planName[0]}</p>}
                            </div>

                            <div>
                                <Label htmlFor="price">Price</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    step="0.01"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                    disabled={submitting}
                                />
                                {errors.price && <p className="text-sm text-red-600">{errors.price[0]}</p>}
                            </div>
                        </div>

                        <DialogFooter>
                            <DialogClose asChild>
                                <Button type="button" variant="outline" disabled={submitting}>
                                    Cancel
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? (isEdit ? 'Saving...' : 'Saving...') : isEdit ? 'Update Plan' : 'Save Plan'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteOpen} onOpenChange={(open) => !open && setIsDeleteOpen(false)}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Confirm Delete</DialogTitle>
                        <DialogDescription>Are you sure you want to delete this plan? This action cannot be undone.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" disabled={isDeleting}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="p-5">
                <div className="overflow-x-auto">
                    <Table>
                        <TableCaption>A list of your plans.</TableCaption>
                        <TableHeader className="bg-gray-100">
                            <TableRow>
                                <TableHead className="text-center">Plan Name</TableHead>
                                <TableHead className="text-center">Price</TableHead>
                                <TableHead className="text-center">Customers</TableHead>
                                <TableHead className="text-center">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-5 text-center">
                                        Loading plans...
                                    </TableCell>
                                </TableRow>
                            ) : plans.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="p-5 text-center">
                                        No plans found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                plans.map((plan) => (
                                    <TableRow key={plan.id}>
                                        <TableCell className="text-center">{plan.planName}</TableCell>
                                        <TableCell className="text-center">{plan.price}</TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                onClick={() => fetchSubscribers(plan.id)}
                                                variant="outline"
                                                size="sm"
                                                className="rounded-md bg-[#1D3795] px-4 py-2 text-white hover:bg-[#162C7D] hover:text-white"
                                            >
                                                <Users size={16} /> View all Subscriber{' '}
                                                <span
                                                    className={`ml-2 inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                        plan.customers_count === 0 ? 'bg-red-600 text-white' : 'bg-green-600 text-white'
                                                    }`}
                                                >
                                                    {plan.customers_count}
                                                </span>
                                            </Button>
                                        </TableCell>
                                        <TableCell className="flex justify-center gap-2 text-center">
                                            <Button variant="outline" onClick={() => openEditModal(plan)} title="Edit Plan">
                                                <Edit size={16} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => {
                                                    setSelectedPlanId(plan.id);
                                                    setIsDeleteOpen(true);
                                                }}
                                                title="Delete Plan"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </AppLayout>
    );
}
