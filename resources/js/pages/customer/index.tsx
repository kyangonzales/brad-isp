import CustomerForm from '@/components/CustomerForm';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirstLetter } from '@/lib/utils';
import { Head, Link } from '@inertiajs/react';
import axios from 'axios';
import { Edit, Eye, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
interface Plan {
    id: number;
    planName: string;
    price: string;
    created_at?: string;
    updated_at?: string;
}

interface Customer {
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

const breadcrumbs = [{ title: 'Customer List', href: '/customer' }];

export default function Index() {
    const [showAdd, setShowAdd] = useState<boolean>(false);
    const [showEdit, setShowEdit] = useState<boolean>(false);
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string>('All');
    const [searchTerm, setSearchTerm] = useState<string>('');

    useEffect(() => {
        axios
            .get<Customer[]>('/customers')
            .then((response) => {
                setCustomers(response.data);
            })
            .catch((error) => {
                console.error('Error fetching customers:', error);
            });
    }, []);
    const filteredCustomers = customers.filter((customer) => {
        const matchesBranch = selectedBranch === 'All' || customer.branch === selectedBranch;
        const matchesSearch =
            customer.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            `${customer.purok || ''} ${customer.sitio || ''} ${customer.barangay || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (customer.plan?.planName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        return matchesBranch && matchesSearch;
    });
    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowEdit(true);
    };

    if (showAdd) {
        return (
            <div className="flex w-full justify-center bg-zinc-700">
                <div>
                    <div className="mt-4 mb-4 flex w-full cursor-pointer items-center justify-end">
                        <Button variant="outline" className="cursor-pointer" size="icon" onClick={() => setShowAdd(false)}>
                            <X />
                        </Button>
                    </div>
                    <div className="w-5/6">
                        <CustomerForm
                            onSave={(data) => {
                                console.log('Saved customer:', data);
                                setShowAdd(false);
                            }}
                            onClose={() => setShowAdd(false)}
                        />
                    </div>
                </div>
            </div>
        );
    }

    if (showEdit && selectedCustomer) {
        return (
            <div className="flex w-full justify-center bg-zinc-700">
                <div>
                    <div className="mt-4 mb-4 flex w-full cursor-pointer items-center justify-end">
                        <Button variant="outline" className="cursor-pointer" size="icon" onClick={() => setShowEdit(false)}>
                            <X />
                        </Button>
                    </div>
                    <div className="w-5/6">
                        <CustomerForm customerData={selectedCustomer} onSave={() => setShowEdit(false)} onClose={() => setShowEdit(false)} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer List" />

            <div className="relative mx-4 mt-5">
                <Card className="mb-4">
                    <CardHeader className="border-b pb-4">
                        <CardTitle className="text-3xl font-extrabold tracking-wide" style={{ color: '#1C3694', fontFamily: 'Poppins, sans-serif' }}>
                            Customer List
                        </CardTitle>
                        <p className="mt-1 text-sm text-gray-500">Manage and view all registered customers in one place.</p>
                    </CardHeader>

                    <CardContent className="border-b pb-6">
                        <div className="flex flex-col gap-5 px-4 py-5 md:flex-row md:items-end md:justify-between">
                            {/* Branch Filter */}
                            <div className="w-full md:w-1/4">
                                <Label htmlFor="branch" className="text-sm font-semibold text-gray-700">
                                    Branch Location
                                </Label>
                                <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                                    <SelectTrigger id="branch" className="mt-1 w-full">
                                        <SelectValue placeholder="Select Branch Location" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Branch Location</SelectLabel>
                                            <SelectItem value="All">All Branches</SelectItem>
                                            <SelectItem value="General Tinio">General Tinio</SelectItem>
                                            <SelectItem value="Peñaranda">Peñaranda</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Search Input */}
                            <div className="relative w-full md:w-1/3">
                                <Search className="text-muted-foreground absolute top-3 left-3 h-5 w-5" />
                                <Input
                                    placeholder="Search by name, address, or plan..."
                                    className="pl-11"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>

                            {/* Add Button */}
                            <div className="flex w-full justify-end md:w-auto">
                                <Button
                                    onClick={() => setShowAdd(true)}
                                    className="flex items-center gap-2 bg-[#1C3694] text-white hover:bg-[#162C7D]"
                                >
                                    <Plus className="h-5 w-5" />
                                    Add New Customer
                                </Button>
                            </div>
                        </div>

                        <Tabs defaultValue="active">
                            <div className="flex">
                                <TabsList className="grid w-1/2 grid-cols-2">
                                    <TabsTrigger value="active" className="cursor-pointer">
                                        Active
                                    </TabsTrigger>
                                    <TabsTrigger value="archived" className="cursor-pointer">
                                        Inactive
                                    </TabsTrigger>
                                </TabsList>
                            </div>

                            <TabsContent value="active">
                                <p className="text-muted-foreground mb-2 text-sm">
                                    Showing customers from: {selectedBranch === 'All' || !selectedBranch ? 'All Branches' : selectedBranch}
                                </p>

                                <Table>
                                    <TableCaption>A list of your active customers.</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <Checkbox />
                                            </TableHead>
                                            <TableHead>No.</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Plan Name</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCustomers
                                            .filter(
                                                (filteredCustomers) =>
                                                    (selectedBranch === 'All' || !selectedBranch
                                                        ? true
                                                        : filteredCustomers.branch === selectedBranch) && filteredCustomers.state === 'active',
                                            )
                                            .map((customer, index) => (
                                                <TableRow key={customer.id}>
                                                    <TableCell>
                                                        <Checkbox />
                                                    </TableCell>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{capitalizeFirstLetter(customer.fullname)}</TableCell>
                                                    <TableCell>
                                                        {[
                                                            capitalizeFirstLetter(customer.purok || ''),
                                                            capitalizeFirstLetter(customer.sitio || ''),
                                                            capitalizeFirstLetter(customer.barangay || ''),
                                                        ]
                                                            .filter((item) => item.trim() !== '')
                                                            .join(', ')}
                                                    </TableCell>
                                                    <TableCell>{customer.branch}</TableCell>
                                                    <TableCell>{customer.plan?.planName}</TableCell>
                                                    <TableCell>{customer.notes}</TableCell>
                                                    <TableCell className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="cursor-pointer hover:text-blue-600"
                                                            onClick={() => handleEditCustomer(customer)}
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </Button>
                                                        <Link
                                                            href={`/customers/${customer.id}/info`}
                                                            className="border-input bg-background inline-flex h-10 w-10 items-center justify-center rounded-md border p-2 text-sm hover:text-yellow-600"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                            <TabsContent value="archived">
                                <p className="text-muted-foreground mb-2 text-sm">
                                    Showing customers from: {selectedBranch === 'All' || !selectedBranch ? 'All Branches' : selectedBranch}
                                </p>

                                <Table>
                                    <TableCaption>A list of your active customers.</TableCaption>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>
                                                <Checkbox />
                                            </TableHead>
                                            <TableHead>No.</TableHead>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Address</TableHead>
                                            <TableHead>Branch</TableHead>
                                            <TableHead>Plan Name</TableHead>
                                            <TableHead>Notes</TableHead>
                                            <TableHead>Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredCustomers
                                            .filter(
                                                (filteredCustomers) =>
                                                    (selectedBranch === 'All' || !selectedBranch
                                                        ? true
                                                        : filteredCustomers.branch === selectedBranch) && filteredCustomers.state === 'archived',
                                            )
                                            .map((customer, index) => (
                                                <TableRow key={customer.id}>
                                                    <TableCell>
                                                        <Checkbox />
                                                    </TableCell>
                                                    <TableCell>{index + 1}</TableCell>
                                                    <TableCell>{capitalizeFirstLetter(customer.fullname)}</TableCell>
                                                    <TableCell>
                                                        {[
                                                            capitalizeFirstLetter(customer.purok || ''),
                                                            capitalizeFirstLetter(customer.sitio || ''),
                                                            capitalizeFirstLetter(customer.barangay || ''),
                                                        ]
                                                            .filter((item) => item.trim() !== '')
                                                            .join(', ')}
                                                    </TableCell>
                                                    <TableCell>{customer.branch}</TableCell>
                                                    <TableCell>{customer.plan?.planName}</TableCell>
                                                    <TableCell>{customer.notes}</TableCell>
                                                    <TableCell className="flex gap-2">
                                                        <Button
                                                            variant="outline"
                                                            size="icon"
                                                            className="cursor-pointer hover:text-blue-600"
                                                            onClick={() => handleEditCustomer(customer)}
                                                        >
                                                            <Edit className="h-5 w-5" />
                                                        </Button>
                                                        <Link
                                                            href={`/customers/${customer.id}/info`}
                                                            className="border-input bg-background inline-flex h-10 w-10 items-center justify-center rounded-md border p-2 text-sm hover:text-yellow-600"
                                                        >
                                                            <Eye className="h-5 w-5" />
                                                        </Link>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                    </TableBody>
                                </Table>
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
