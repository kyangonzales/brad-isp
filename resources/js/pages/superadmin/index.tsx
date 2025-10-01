import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirstLetter, formatDate } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { Archive, Edit } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs = [{ title: 'Account List', href: '/user-management' }];

export default function Index() {
    // --- State ---
    const [accounts, setAccounts] = useState<any[]>([]);
    const [editingAccount, setEditingAccount] = useState<any>(null);
    const [formData, setFormData] = useState({ name: '', email: '', status: '', role: '', duedate: '' });
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);

    // --- Fetch accounts from server ---
    useEffect(() => {
        // Replace with your API endpoint to get accounts
        axios.get('/users').then((res) => setAccounts(res.data));
    }, []);

    // --- Handlers ---
    const handleEdit = (account: any) => {
        setEditingAccount(account);
        setFormData({
            name: account.name,
            email: account.email,
            status: account.status.toLowerCase(),
            role: account.role || 'user',
            duedate: account.duedate || '',
        });
    };

    const saveEdit = async (id: number) => {
        try {
            const res = await axios.put(`/userUpdate/${id}`, formData);
            // Update local state
            setAccounts((prev) => prev.map((acc) => (acc.id === id ? { ...acc, ...res.data.user } : acc)));
            setEditingAccount(null);
        } catch (err: any) {
            console.error(err.response?.data || err);
            alert('Failed to update account.');
        }
    };

    const handleArchive = (account: any) => {
        setSelectedAccount(account);
        setOpenDialog(true);
    };

    const confirmArchive = async () => {
        try {
            await axios.delete(`/userUpdate/${selectedAccount.id}`);
            setAccounts((prev) => prev.filter((acc) => acc.id !== selectedAccount.id));
            setOpenDialog(false);
            setSelectedAccount(null);
        } catch (err: any) {
            console.error(err.response?.data || err);
            alert('Failed to archive account.');
        }
    };

    // --- JSX ---
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="List of Accounts" />
            <Card className="mx-4 mt-6 shadow-md">
                <CardHeader className="border-b pb-4">
                    <CardTitle className="text-3xl font-extrabold tracking-wide" style={{ color: '#1C3694', fontFamily: 'Poppins, sans-serif' }}>
                        Manage Accounts
                    </CardTitle>
                    <p className="mt-1 text-sm text-gray-500">Manage all admin accounts.</p>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>No.</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Duedate</TableHead>
                                <TableHead>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {accounts.map((account, index) => (
                                <TableRow key={account.id}>
                                    <TableCell>{index + 1}</TableCell>

                                    {/* Name */}
                                    <TableCell>
                                        {editingAccount?.id === account.id ? (
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="rounded border px-2 py-1"
                                            />
                                        ) : (
                                            account.name
                                        )}
                                    </TableCell>

                                    {/* Email */}
                                    <TableCell>
                                        {editingAccount?.id === account.id ? (
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="rounded border px-2 py-1"
                                            />
                                        ) : (
                                            account.email
                                        )}
                                    </TableCell>

                                    {/* Status */}
                                    <TableCell>
                                        {editingAccount?.id === account.id ? (
                                            <select
                                                value={formData.status}
                                                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                                className="rounded border px-2 py-1"
                                            >
                                                <option value="active">Active</option>
                                                <option value="inactive">Inactive</option>
                                            </select>
                                        ) : (
                                            <span
                                                className={`rounded-full px-3 py-1 text-sm font-medium ${
                                                    account.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                }`}
                                            >
                                                {capitalizeFirstLetter(account.status)}
                                            </span>
                                        )}
                                    </TableCell>

                                    {/* Role */}
                                    <TableCell>
                                        {editingAccount?.id === account.id ? (
                                            <select
                                                value={formData.role}
                                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                                className="rounded border px-2 py-1"
                                            >
                                                <option value="superadmin">Superadmin</option>
                                                <option value="admin">Admin</option>
                                                <option value="user">User</option>
                                            </select>
                                        ) : (
                                            capitalizeFirstLetter(account.role)
                                        )}
                                    </TableCell>

                                    {/* Duedate */}
                                    <TableCell>
                                        {editingAccount?.id === account.id ? (
                                            <input
                                                type="date"
                                                value={formData.duedate}
                                                onChange={(e) => setFormData({ ...formData, duedate: e.target.value })}
                                                className="rounded border px-2 py-1"
                                            />
                                        ) : (
                                            formatDate(account.duedate)
                                        )}
                                    </TableCell>

                                    {/* Actions */}
                                    <TableCell className="space-x-2">
                                        {editingAccount?.id === account.id ? (
                                            <>
                                                <Button size="sm" variant="default" onClick={() => saveEdit(account.id)}>
                                                    Save
                                                </Button>
                                                <Button size="sm" variant="outline" onClick={() => setEditingAccount(null)}>
                                                    Cancel
                                                </Button>
                                            </>
                                        ) : (
                                            <>
                                                <Button variant="ghost" size="sm" className="p-2" onClick={() => handleEdit(account)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="p-2 hover:bg-red-100"
                                                    onClick={() => handleArchive(account)}
                                                >
                                                    <Archive className="h-4 w-4" />
                                                </Button>
                                            </>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Archive Dialog */}
            <Dialog open={openDialog} onOpenChange={setOpenDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Archive Account</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to archive <strong>{selectedAccount?.name}</strong>?
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpenDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={confirmArchive}>
                            Archive
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
