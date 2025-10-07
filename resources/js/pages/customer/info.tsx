import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { calculatePayment } from '@/lib/utils';
import { router } from '@inertiajs/react';
import axios from 'axios';
import { format } from 'date-fns';
import { Archive, CreditCard, Edit2, FileText, Trash2, Undo2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

interface Plan {
    id: number;
    planName: string;
    price: string;
    dueDate?: string;
}

interface Customer {
    id: number;
    fullname: string;
    duedate?: string;
    phone?: string;
    purok?: string;
    sitio?: string;
    barangay: string;
    plan?: Plan;
    credit?: string;
    notes?: string;
    state?: 'active' | 'inactive' | 'archived';
    images?: string | string[];
}
interface History {
    id: number;
    customer_id: number;
    plan_id: number;
    price: string;
    payment_date: string;
}

interface CustomerHistory {
    id: number;
    fullname: string;
    phone: string;
    purok: string;
    sitio: string;
    barangay: string;
    plan_id: number;
    state: string;
    duedate: string;
    histories: History[];
}

export default function Info({ customer }: { customer: Customer }) {
    const [notes, setNotes] = useState<string>(customer.notes || '');
    const [isDialogOpen, setDialogOpen] = useState(false);
    const [customerData, setCustomerData] = useState<Customer>(customer);
    const [customerHistory, setCustomerHistory] = useState<CustomerHistory | null>(null);

    const [actionType, setActionType] = useState<'archive' | 'activate' | 'delete' | null>(null);

    const [confirmOpen, setConfirmOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState(() =>
        calculatePayment(
            Number(customer?.plan?.price) || 0,
            customer?.duedate || new Date().toISOString().split('T')[0],
            Number(customer?.credit) || 0,
        ),
    );
    if (!customer) return <div className="py-10 text-center text-gray-500">Loading customer data...</div>;

    const address = [customer.purok, customer.sitio, customer.barangay].filter(Boolean).join(', ');
    const [selectedImage, setSelectedImage] = useState(null);
    const images = Array.isArray(customerData?.images) ? customerData.images : customerData?.images ? [customerData.images] : [];

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        axios
            .get(`/customers/${customer.id}/history`)
            .then((res) => {
                setCustomerHistory(res.data);
            })
            .catch((err) => {
                console.error('Error fetching history:', err);
            });
    }, [customer.id]);

    const handlePayment = async () => {
        try {
            const response = await axios.post(`/saveHistory`, {
                customer_id: customer.id,
                plan_id: customer?.plan?.id,
                price: paymentAmount,
                payment_date: new Date().toISOString().split('T')[0],
            });

            const newDueDate = response.data.customer?.duedate;
            if (newDueDate) {
                setCustomerData((prev) => ({
                    ...prev,
                    duedate: newDueDate,
                }));
            }
            toast.success('Payment successful!');
            setOpen(false);
        } catch (error) {
            console.error('Payment failed:', error);
            alert('Payment failed!');
        }
    };

    const handleAddNotes = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await axios.put(`/updateNotes/${customerData.id}`, {
                notes: notes.trim(),
            });

            setCustomerData((prev) => ({
                ...prev,
                notes: response.data.notes ?? notes.trim(),
            }));

            setNotes('');
            setDialogOpen(false);
            toast.success('Notes added successfully!');
        } catch (error) {
            console.error('Failed to update notes:', error);
            toast.error('Failed to update notes');
        }
    };
    const handleToggleCustomerState = async () => {
        const newState = customerData.state === 'active' ? 'archived' : 'active';
        try {
            await axios.put(`/updateState/${customerData.id}`, { state: newState });
            setCustomerData((prev) => ({ ...prev, state: newState }));
            toast.success(`Customer ${newState === 'active' ? 'activated' : 'archived'} successfully.`);
            setConfirmOpen(false);
        } catch (error) {
            toast.error('Failed to update customer state.');
            throw error;
        }
    };

    const handleDeleteCustomer = async () => {
        try {
            await axios.delete(`/customers/${customerData.id}`);
            toast.success('Customer deleted permanently.');
            setConfirmOpen(false);
            setTimeout(() => {
                router.visit('/customer');
            }, 1500);
        } catch (error) {
            toast.error('Failed to delete customer.');
            throw error;
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Customer Info', href: '/customer' }]}>
            <div className="flex min-h-screen justify-center bg-gray-50 px-4 py-5">
                <Card className="relative w-full max-w-6xl rounded-xl border-x border-b border-gray-100 bg-white pt-5 shadow-lg">
                    <CardHeader
                        className={`z-10 my-[-1rem] rounded-xl px-8 py-6 text-white shadow-md ${
                            customerData.state === 'archived' ? 'bg-gray-600' : 'bg-blue-900'
                        }`}
                    >
                        <CardTitle className="text-4xl font-extrabold tracking-tight">{customer.fullname}</CardTitle>
                        <CardDescription className={`mt-1 text-lg ${customer.state === 'archived' ? 'text-gray-300' : 'text-blue-200'}`}>
                            Detailed information and history for this customer.
                        </CardDescription>
                    </CardHeader>

                    <CardContent className="space-y-8 px-8">
                        {/* PLAN INFO */}
                        <Card className="mt-3 mb-0 border border-blue-200 bg-blue-50/50 shadow-sm">
                            <CardHeader className="my-[-1rem] flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-semibold text-blue-800">Current Plan Details</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {customer.plan ? (
                                    <div className="grid grid-cols-1 gap-4 text-gray-700 md:grid-cols-3">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Plan Name</p>
                                            <p className="text-lg font-bold">{customer.plan.planName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Price</p>
                                            <p className="text-lg font-bold">₱{customer.plan.price}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Due Date</p>
                                            <p className="text-lg font-bold">
                                                {customerData.duedate
                                                    ? new Intl.DateTimeFormat('en-US', {
                                                          month: 'long',
                                                          day: 'numeric',
                                                          year: 'numeric',
                                                      }).format(new Date(customerData.duedate))
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 italic">No active plan assigned to this customer.</p>
                                )}
                            </CardContent>
                        </Card>

                        {/* ACTION BUTTONS */}
                        <div className="mb-0 flex justify-end gap-3 py-3">
                            {/* Pay Bill Section */}
                            <Dialog open={open} onOpenChange={setOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={`rounded-lg px-6 py-3 text-base shadow-sm ${
                                            customerData.state === 'archived'
                                                ? 'border-gray-500 text-gray-500 hover:bg-gray-100 hover:text-gray-600'
                                                : 'border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                                        }`}
                                    >
                                        <CreditCard size={18} className="mr-2" />
                                        Pay Bill
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                    <DialogHeader>
                                        <DialogTitle>Pay bill</DialogTitle>
                                        <DialogDescription> Enter the payment amount below to process the customer’s bill.</DialogDescription>
                                    </DialogHeader>
                                    <div className="flex items-center gap-2">
                                        <div className="grid flex-1 gap-2">
                                            <Label htmlFor="link" className="sr-only">
                                                Payment
                                            </Label>
                                            <Input
                                                id="paymentAmount"
                                                type="number"
                                                name="paymentAmount"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(Number(e.target.value))}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter className="sm:justify-end">
                                        <DialogClose asChild>
                                            <Button type="button" variant="secondary">
                                                Close
                                            </Button>
                                        </DialogClose>

                                        <Button
                                            type="button"
                                            className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
                                            onClick={handlePayment}
                                        >
                                            Pay bill
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* Generate Receipt Section */}
                            <Button
                                variant="outline"
                                className={`rounded-lg px-6 py-3 text-base shadow-sm ${
                                    customerData.state === 'archived'
                                        ? 'border-gray-500 text-gray-500 hover:bg-gray-100 hover:text-gray-600'
                                        : 'border-blue-600 bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700'
                                }`}
                                onClick={() => toast.info('Generate receipt feature not implemented yet')}
                            >
                                <FileText size={18} className="mr-2" />
                                Generate Receipt
                            </Button>

                            {/* Notes Section */}
                            <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button
                                        onClick={() => setNotes(customerData.notes || '')}
                                        className={`rounded-lg px-6 py-3 text-base shadow-md ${
                                            customerData.state === 'archived'
                                                ? 'bg-gray-500 text-white hover:bg-gray-600'
                                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                    >
                                        <Edit2 size={18} /> {customerData.notes ? 'Edit Notes' : 'Add Notes'}
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md rounded-xl p-6">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-bold text-gray-800">
                                            {customerData.notes ? 'Edit Notes' : 'Add Notes'} for {customer.fullname}
                                        </DialogTitle>
                                        <DialogDescription className="mt-2 text-gray-600">
                                            Provide any relevant remarks or special instructions for this customer.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleAddNotes}>
                                        <Textarea
                                            rows={5}
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Type notes here..."
                                            className="min-h-[120px] resize-y"
                                        />
                                        <DialogFooter className="mt-6 flex justify-end gap-3">
                                            <DialogClose asChild>
                                                <Button variant="outline" className="rounded-md px-5 py-2">
                                                    Cancel
                                                </Button>
                                            </DialogClose>

                                            <Button
                                                type="button"
                                                onClick={() => setNotes('')}
                                                className="rounded-md bg-red-500 px-5 py-2 text-white hover:bg-red-600"
                                            >
                                                Clear Notes
                                            </Button>

                                            <Button type="submit" className="rounded-md bg-blue-600 px-5 py-2 hover:bg-blue-700">
                                                Save Notes
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Separator className="mb-0" />

                        {/* TABS */}
                        <Tabs defaultValue="personal" className="mt-4 w-full">
                            <TabsList>
                                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                                <TabsTrigger value="history">History</TabsTrigger>
                                <TabsTrigger value="home">Home Picture</TabsTrigger>
                            </TabsList>
                            <TabsContent value="home">
                                <Card className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold text-gray-800">Home Picture</CardTitle>
                                        <CardDescription>Picture of the customer's home.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <img
                                            src={
                                                customerData.images
                                                    ? typeof customerData.images === 'string'
                                                        ? customerData.images
                                                        : customerData.images[0]
                                                    : '/placeholder-image.png'
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            </TabsContent>
                            {/* PERSONAL INFO */}
                            <TabsContent value="personal">
                                <Card className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold text-gray-800">Contact & Address Details</CardTitle>
                                        <CardDescription>Essential information about the customer.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 text-gray-600">
                                                    <TableHead>Phone</TableHead>
                                                    <TableHead>Address</TableHead>
                                                    <TableHead>Notes</TableHead>
                                                    <TableHead className="w-[120px] text-center">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                <TableRow>
                                                    <TableCell>{customer.phone ?? 'N/A'}</TableCell>
                                                    <TableCell>{address || 'N/A'}</TableCell>
                                                    <TableCell>{customerData.notes || 'N/A'}</TableCell>
                                                    <TableCell className="flex items-center justify-center gap-2 text-center">
                                                        {/* Archive / Activate */}
                                                        <Button
                                                            onClick={() => {
                                                                setActionType(customerData.state === 'archived' ? 'activate' : 'archive');
                                                                setConfirmOpen(true);
                                                            }}
                                                            className={`rounded-lg p-2 text-sm ${
                                                                customerData.state === 'archived'
                                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                                    : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                                            }`}
                                                            title={customerData.state === 'archived' ? 'Activate' : 'Archive'}
                                                        >
                                                            {customerData.state === 'archived' ? <Undo2 size={18} /> : <Archive size={18} />}
                                                        </Button>

                                                        {/* Permanent Delete */}
                                                        <Button
                                                            onClick={() => {
                                                                setActionType('delete');
                                                                setConfirmOpen(true);
                                                            }}
                                                            className="rounded-lg bg-red-600 p-2 text-sm text-white hover:bg-red-700"
                                                            title="Permanently Delete"
                                                        >
                                                            <Trash2 size={18} />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* HISTORY */}
                            <TabsContent value="history">
                                <Card className="border border-gray-200 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl font-semibold text-gray-800">Payment & Activity History</CardTitle>
                                        <CardDescription>A chronological record of customer interactions.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Table>
                                            <TableHeader>
                                                <TableRow className="bg-gray-50 text-gray-600">
                                                    <TableHead>No.</TableHead>
                                                    <TableHead>Date</TableHead>
                                                    <TableHead>Payment</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {customerHistory?.histories && customerHistory.histories.length > 0 ? (
                                                    customerHistory.histories.map((history: History, index: number) => (
                                                        <TableRow key={history.id}>
                                                            <TableCell>{index + 1}</TableCell>
                                                            <TableCell>
                                                                {' '}
                                                                {history.payment_date
                                                                    ? format(new Date(history.payment_date), 'MMMM d, yyyy')
                                                                    : 'N/A'}
                                                            </TableCell>
                                                            <TableCell>{history.price}</TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={3} className="py-4 text-center text-gray-500 italic">
                                                            No history available.
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                <ConfirmationDialog
                    isOpen={confirmOpen}
                    onClose={() => setConfirmOpen(false)}
                    isLoading={loading}
                    title={
                        actionType === 'delete' ? 'Permanently Delete Customer' : actionType === 'activate' ? 'Activate Customer' : 'Archive Customer'
                    }
                    message={
                        actionType === 'delete'
                            ? 'Are you sure you want to permanently delete this customer? This action cannot be undone.'
                            : actionType === 'activate'
                              ? 'Are you sure you want to activate this customer?'
                              : 'Are you sure you want to archive this customer?'
                    }
                    confirmLabel={actionType === 'delete' ? 'Delete' : actionType === 'activate' ? 'Activate' : 'Archive'}
                    confirmColor={actionType === 'delete' ? 'red' : actionType === 'archive' ? 'gray' : 'blue'}
                    onConfirm={async () => {
                        setLoading(true);
                        try {
                            if (actionType === 'delete') {
                                await handleDeleteCustomer();
                            } else {
                                await handleToggleCustomerState();
                            }
                        } catch (e) {
                            console.error(e);
                        } finally {
                            setLoading(false);
                        }
                    }}
                />
            </div>
        </AppLayout>
    );
}
