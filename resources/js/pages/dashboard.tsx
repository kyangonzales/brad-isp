import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirstLetter, formatDate } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { BarChart3, Calendar, PieChart } from 'lucide-react';
import { useEffect, useState } from 'react';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getQuarter(month: number) {
    if (month <= 3) return 1;
    if (month <= 6) return 2;
    if (month <= 9) return 3;
    return 4;
}

export default function Dashboard() {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    const currentQuarter = getQuarter(currentMonth);
    const [totalCustomers, setTotalCustomers] = useState(0);
    const [dueCustomers, setDueCustomers] = useState(0);
    const [showTable, setShowTable] = useState<'all' | 'due' | null>(null);
    const [customers, setCustomers] = useState<any[]>([]);
    const [year, setYear] = useState(currentYear.toString());
    const [month, setMonth] = useState(currentMonth.toString());
    const [quarter, setQuarter] = useState(currentQuarter.toString());
    const [availablePeriods, setAvailablePeriods] = useState<any>(null);
    const [yearlySales, setYearlySales] = useState(0);
    const [monthlySales, setMonthlySales] = useState(0);
    const [quarterlySales, setQuarterlySales] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchAvailablePeriods();
        fetchCustomerCounts();
    }, []);

    useEffect(() => {
        if (availablePeriods) fetchSalesData();
    }, [year, month, quarter, availablePeriods]);

    useEffect(() => {
        if (showTable === 'all') {
            fetchCustomers('/customers');
        } else if (showTable === 'due') {
            fetchCustomers('/customers?filter=due');
        }
    }, [showTable]);

    const fetchCustomers = async (url: string) => {
        try {
            const res = await axios.get(url);
            setCustomers(res.data);

            console.log('res.data', res.data);
        } catch (err) {
            console.error('Failed to fetch customers:', err);
        }
    };

    const toggleTable = (type: 'all' | 'due') => {
        setShowTable((prev) => (prev === type ? null : type));
    };
    const fetchCustomerCounts = async () => {
        try {
            const res = await axios.get('/countCustomers');
            console.log('result', res.data.due_customers);
            setTotalCustomers(res.data.total_customers);
            setDueCustomers(res.data.due_customers);
        } catch (err) {
            console.error('Failed to fetch customer counts:', err);
        }
    };
    const fetchAvailablePeriods = async () => {
        const res = await axios.get('/sales/periods');
        setAvailablePeriods(res.data);
        const years = Object.keys(res.data);
        if (years.length > 0) {
            setYear(years[0]);
            const firstMonths = res.data[years[0]].months;
            if (firstMonths.length > 0) setMonth(firstMonths[0].toString());
            const firstQuarter = Object.keys(res.data[years[0]].quarters)[0];
            if (firstQuarter) setQuarter(firstQuarter.toString());
        }
    };

    const fetchSalesData = async () => {
        try {
            setLoading(true);
            const [yearly, monthly, quarterly] = await Promise.all([
                axios.get(`/sales/yearly/${year}`),
                axios.get(`/sales/monthly/${year}/${month}`),
                axios.get(`/sales/quarterly/${year}/${quarter}`),
            ]);

            setYearlySales(yearly.data.total ?? 0);
            setMonthlySales(monthly.data.total ?? 0);
            setQuarterlySales(quarterly.data.total ?? 0);
        } catch (error) {
            console.error('Sales fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />
            <div className="grid gap-4 p-4 md:grid-cols-5">
                {/* 🟩 Yearly Sales */}
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle className="text-lg font-bold text-[#1C3694]">Yearly Sales</CardTitle>
                        <Calendar className="h-6 w-6 text-[#1C3694]" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Label className="text-sm text-gray-600">Select Year</Label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select year" />
                            </SelectTrigger>
                            <SelectContent>
                                {availablePeriods &&
                                    Object.keys(availablePeriods).map((y) => (
                                        <SelectItem key={y} value={y}>
                                            {y}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <p className="pt-4 text-3xl font-extrabold tracking-tight text-green-600">
                            {loading ? 'Loading...' : `₱${yearlySales.toLocaleString()}`}
                        </p>
                    </CardContent>
                </Card>

                {/* 🟦 Monthly Sales */}
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle className="text-lg font-bold text-[#1C3694]">Monthly Sales</CardTitle>
                        <BarChart3 className="h-6 w-6 text-[#1C3694]" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Label className="text-sm text-gray-600">Select Month</Label>
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select month" />
                            </SelectTrigger>
                            <SelectContent>
                                {availablePeriods &&
                                    year &&
                                    availablePeriods[year]?.months?.map((m: number) => (
                                        <SelectItem key={m} value={m.toString()}>
                                            {monthNames[m - 1]}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <p className="pt-4 text-3xl font-extrabold tracking-tight text-blue-600">
                            {loading ? 'Loading...' : `₱${monthlySales.toLocaleString()}`}
                        </p>
                    </CardContent>
                </Card>

                {/* 🟨 Quarterly Sales */}
                <Card className="h-full">
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle className="text-lg font-bold text-[#1C3694]">Quarterly Sales</CardTitle>
                        <PieChart className="h-6 w-6 text-[#1C3694]" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Label className="text-sm text-gray-600">Select Quarter</Label>
                        <Select value={quarter} onValueChange={setQuarter}>
                            <SelectTrigger className="text-sm">
                                <SelectValue placeholder="Select quarter" />
                            </SelectTrigger>
                            <SelectContent>
                                {availablePeriods &&
                                    year &&
                                    Object.keys(availablePeriods[year]?.quarters || {}).map((q) => (
                                        <SelectItem key={q} value={q}>
                                            Q{q} ({['Jan - Mar', 'Apr - Jun', 'Jul - Sep', 'Oct - Dec'][parseInt(q) - 1]})
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <p className="pt-4 text-3xl font-extrabold tracking-tight text-purple-600">
                            {loading ? 'Loading...' : `₱${quarterlySales.toLocaleString()}`}
                        </p>
                    </CardContent>
                </Card>

                {/* 👥 All Customers */}
                <Card onClick={() => toggleTable('all')} className="h-full cursor-pointer transition hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle className="text-lg font-bold text-[#1C3694]">All Customers</CardTitle>
                        <BarChart3 className="h-6 w-6 text-[#1C3694]" />
                    </CardHeader>
                    <CardContent>
                        <p className="pt-4 text-4xl font-extrabold tracking-tight text-[#1C3694]">{totalCustomers}</p>
                    </CardContent>
                </Card>

                {/* 📅 Due Customers */}
                <Card onClick={() => toggleTable('due')} className="h-full cursor-pointer transition hover:shadow-lg">
                    <CardHeader className="flex flex-row items-center justify-between pb-1">
                        <CardTitle className="text-lg font-bold text-[#B91C1C]">Due Customers</CardTitle>
                        <Calendar className="h-6 w-6 text-[#B91C1C]" />
                    </CardHeader>
                    <CardContent>
                        <p className="pt-4 text-4xl font-extrabold tracking-tight text-[#B91C1C]">{dueCustomers}</p>
                    </CardContent>
                </Card>
            </div>

            {showTable && (
                <div className="p-6">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-[#1C3694]">{showTable === 'all' ? 'All Customers' : 'Due Customers'}</h2>
                        <button onClick={() => setShowTable(null)} className="rounded-md bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700">
                            Close
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Address</TableHead>
                                    <TableHead>Branch</TableHead>
                                    <TableHead>Duedate</TableHead>
                                    <TableHead>Plan Name</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {customers.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-6 text-center text-gray-500">
                                            No customers found.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    customers.map((c, index) => (
                                        <TableRow key={c.id}>
                                            <TableCell>{index + 1 + '.'}</TableCell>
                                            <TableCell>{c.fullname}</TableCell>
                                            <TableCell>
                                                {[
                                                    capitalizeFirstLetter(c.purok || ''),
                                                    capitalizeFirstLetter(c.sitio || ''),
                                                    capitalizeFirstLetter(c.barangay || ''),
                                                ]
                                                    .filter((item) => item.trim() !== '')
                                                    .join(', ')}
                                            </TableCell>
                                            <TableCell>{c.branch ?? '-'}</TableCell>
                                            <TableCell>{c.duedate ? formatDate(c.duedate) : ''}</TableCell>
                                            <TableCell>{c.plan?.planName ?? '-'}</TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
