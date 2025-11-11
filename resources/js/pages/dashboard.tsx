import DashboardSkeleton from '@/components/DashboardSkeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { capitalizeFirstLetter, formatDate } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import { BarChart3, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function getQuarter(month: number) {
    if (month <= 3) return 1;
    if (month <= 6) return 2;
    if (month <= 9) return 3;
    return 4;
}
interface MonthlyData {
    month: number;
    total: number;
}

interface QuarterlyData {
    [key: number]: number;
}

interface YearlyData {
    yearlyTotal: number;
    monthly: MonthlyData[];
    quarterly: QuarterlyData;
}

interface SalesData {
    [year: string]: YearlyData;
}

export default function Dashboard() {
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
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
    const [yearlySales, setYearlySales] = useState(0);
    const [monthlySales, setMonthlySales] = useState(0);
    const [quarterlySales, setQuarterlySales] = useState(0);
    const [loading, setLoading] = useState(false);
    const [salesByQuarter, setSalesByQuarter] = useState<any[]>([]);
    const [monthlyPerformance, setMonthlyPerformance] = useState<any[]>([]);
    const [yearData, setYearData] = useState<any>(null);
    const [allCustomers, setAllCustomers] = useState([]);
    const [dueCustomersList, setDueCustomersList] = useState([]);
    const [branchData, setBranchData] = useState<any[]>([]);

    const toggleTable = (type: 'all' | 'due') => {
        setShowTable((prev) => {
            const next = prev === type ? null : type;
            setCustomers(next === 'all' ? allCustomers : next === 'due' ? dueCustomersList : []);
            return next;
        });
    };

    useEffect(() => {
        if (!yearData) return;

        const yearObj = yearData[year];
        setYearlySales(yearObj.yearlyTotal);

        const monthObj = yearObj.monthly.find((m: any) => m.month == Number(month));
        setMonthlySales(monthObj?.total ?? 0);

        setQuarterlySales(yearObj.quarterly[Number(quarter)] ?? 0);

        const computedMonthlyData = yearObj.monthly.map((m: any) => ({
            month: monthNames[m.month - 1].slice(0, 3),
            sales: m.total,
        }));
        setMonthlyPerformance(computedMonthlyData);

        const computedQuarterData = Object.entries(yearObj.quarterly).map(([q, value]) => ({
            quarter: 'Q' + q,
            value,
        }));
        setSalesByQuarter(computedQuarterData);
    }, [year, month, quarter, yearData]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const res = await axios.get('/dashboard-data');

                // SALES
                setYearData(res.data.salesData);
                const years = Object.keys(res.data.salesData);
                const defaultYear = years.includes(currentYear.toString()) ? currentYear.toString() : years[0];
                setYear(defaultYear);

                const months: MonthlyData[] = res.data.salesData[defaultYear].monthly;
                const defaultMonth = months.find((m) => m.month === currentMonth)?.month || months[0].month;
                setMonth(defaultMonth.toString());
                setQuarter(getQuarter(defaultMonth).toString());

                setYearlySales(res.data.salesData[defaultYear].yearlyTotal);
                setMonthlySales((res.data.salesData[defaultYear].monthly as MonthlyData[]).find((m) => m.month === defaultMonth)?.total || 0);
                setQuarterlySales(res.data.salesData[defaultYear].quarterly[Number(getQuarter(defaultMonth))] || 0);

                // CUSTOMERS
                setAllCustomers(res.data.customers);
                setTotalCustomers(res.data.summary.total_customers);
                setDueCustomers(res.data.summary.due_customers);

                // DUE LIST + BRANCH DATA
                const dueCustomersLocal = res.data.customers.filter((c: any) => new Date(c.duedate) <= new Date());
                setDueCustomersList(dueCustomersLocal);

                const branchCounts = res.data.customers.reduce((acc: Record<string, number>, c: any) => {
                    const branch = (c.branch || 'Unknown').trim();
                    acc[branch] = (acc[branch] || 0) + 1;
                    return acc;
                }, {});
                setBranchData(Object.entries(branchCounts).map(([name, value]) => ({ name, value })));
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    return (
        <AppLayout breadcrumbs={[{ title: 'Dashboard', href: '/dashboard' }]}>
            <Head title="Dashboard" />
            {loading ? (
                <DashboardSkeleton />
            ) : (
                <>
                    {' '}
                    <div className="grid gap-4 p-4 md:grid-cols-5">
                        {/* 🟩 Yearly Sales */}
                        <Card className="flex h-40 flex-col justify-between">
                            <CardHeader className="flex flex-row items-center justify-between pb-0">
                                <CardTitle className="text-xl font-bold text-[#1C3694]">Yearly Sales</CardTitle>
                                <Calendar className="h-9 w-9 text-[#1C3694]" />
                            </CardHeader>

                            <CardContent className="relative -top-3 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-gray-600">Select Year</Label>
                                    <Select
                                        value={year}
                                        onValueChange={(y) => {
                                            setYear(y);

                                            // kapag binago ang year, i-reset month & quarter
                                            const months: MonthlyData[] = yearData[y]?.monthly || [];

                                            if (months.length) {
                                                // default month: current month if available, else first month ng year
                                                const defaultMonth = months.find((m) => m.month === currentMonth)?.month || months[0].month;
                                                setMonth(defaultMonth.toString());

                                                // calculate quarter from month
                                                setQuarter(getQuarter(defaultMonth).toString());
                                            }
                                        }}
                                    >
                                        <SelectTrigger className="h-7 w-24 text-xs">
                                            <SelectValue placeholder="Year" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearData &&
                                                Object.keys(yearData).map((y) => (
                                                    <SelectItem key={y} value={y}>
                                                        {y}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <p className="text-4xl font-extrabold tracking-tight text-green-600">
                                    {loading
                                        ? 'Loading...'
                                        : `₱${Number(yearlySales).toLocaleString('en-PH', {
                                              minimumFractionDigits: 0,
                                              maximumFractionDigits: 2,
                                          })}`}
                                </p>
                            </CardContent>
                        </Card>

                        {/* 🟦 Monthly Sales */}
                        <Card className="flex h-40 flex-col justify-between">
                            <CardHeader className="flex flex-row items-center justify-between pb-1">
                                <CardTitle className="text-lg font-bold text-[#1C3694]">Monthly Sales</CardTitle>
                                <BarChart3 className="h-6 w-6 text-[#1C3694]" />
                            </CardHeader>
                            <CardContent className="relative -top-3 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-gray-600">Select Month</Label>
                                    <Select
                                        value={month}
                                        onValueChange={(m) => {
                                            setMonth(m);
                                            setQuarter(getQuarter(Number(m)).toString());
                                        }}
                                    >
                                        <SelectTrigger className="h-7 w-30 text-xs">
                                            <SelectValue placeholder="Select month" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearData &&
                                                year &&
                                                yearData[year]?.monthly?.map((m: any) => (
                                                    <SelectItem key={m.month} value={m.month.toString()}>
                                                        {monthNames[m.month - 1]}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-4xl leading-none font-extrabold tracking-tight text-blue-600">
                                    {loading
                                        ? 'Loading...'
                                        : `₱${Number(monthlySales).toLocaleString('en-PH', {
                                              minimumFractionDigits: 0,
                                              maximumFractionDigits: 2,
                                          })}`}
                                </p>
                            </CardContent>
                        </Card>

                        {/* 🟨 Quarterly Sales */}
                        <Card className="flex h-40 flex-col justify-between">
                            <CardHeader className="flex flex-row items-center justify-between pb-1">
                                <CardTitle className="text-lg font-bold text-[#1C3694]">Quarterly Sales</CardTitle>
                                <PieChart className="h-6 w-6 text-[#1C3694]" />
                            </CardHeader>
                            <CardContent className="relative -top-3 flex flex-col justify-between">
                                <div className="flex items-center justify-between">
                                    <Label className="text-sm text-gray-600">Select Quarter</Label>
                                    <Select value={quarter} onValueChange={(q) => setQuarter(q)}>
                                        <SelectTrigger className="h-7 w-35 text-xs">
                                            <SelectValue placeholder="Select quarter" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {yearData &&
                                                year &&
                                                Object.keys(yearData[year]?.quarterly || {}).map((q) => (
                                                    <SelectItem key={q} value={q}>
                                                        Q{q} ({['Jan - Mar', 'Apr - Jun', 'Jul - Sep', 'Oct - Dec'][parseInt(q) - 1]})
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <p className="text-4xl leading-none font-extrabold tracking-tight text-purple-600">
                                    {loading
                                        ? 'Loading...'
                                        : `₱${Number(quarterlySales).toLocaleString('en-PH', {
                                              minimumFractionDigits: 0,
                                              maximumFractionDigits: 2,
                                          })}`}
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
                    {/* 📊 Sales Analytics Section */}
                    <div className="grid grid-cols-1 gap-5 p-6 md:grid-cols-4">
                        {/* 🥧 Left Column – Three Pie Charts side by side on desktop */}
                        <div className="flex flex-col gap-2 md:col-span-1">
                            {/* Pie Chart 1 - Sales Distribution */}
                            <Card className="p-4 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-[#1C3694]">Sales Distribution by Quarter</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={185}>
                                        <PieChart>
                                            <Pie data={salesByQuarter} dataKey="value" nameKey="quarter" outerRadius={70} label>
                                                {salesByQuarter.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Pie Chart 2 - Payment Status */}
                            <Card className="p-4 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-[#1C3694]">Payment Status Overview</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={180}>
                                        <PieChart>
                                            <Pie
                                                data={[
                                                    { name: 'Paid', value: totalCustomers - dueCustomers },
                                                    { name: 'Due', value: dueCustomers },
                                                ]}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={70}
                                                label
                                            >
                                                <Cell fill="#16a34a" />
                                                <Cell fill="#dc2626" />
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* 📈 Right Column – Monthly Sales Bar Chart */}
                        <div className="flex flex-col gap-7 md:col-span-3 md:flex-row">
                            {/* Pie Chart - Customers per Branch (smaller) */}
                            <Card className="flex-1 p-4 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-[#1C3694]">Customers per Branch</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <PieChart>
                                            <Pie data={branchData} dataKey="value" nameKey="name" outerRadius={80} label>
                                                {branchData.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                            {/* Bar Chart - Monthly Sales Performance (wider) */}
                            <Card className="flex-[3] p-4 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-lg font-semibold text-[#1C3694]">Monthly Sales Performance ({year})</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={300}>
                                        <BarChart data={monthlyPerformance}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="month" />
                                            <YAxis />
                                            <Tooltip />
                                            <Legend />
                                            <Bar dataKey="sales" fill="#2563eb" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </>
            )}
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
                                {loading ? (
                                    // 🩶 Responsive table skeleton rows
                                    Array.from({ length: 6 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell>
                                                <Skeleton className="h-4 w-6" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-[120px] animate-pulse md:w-[160px]" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-[120px] animate-pulse md:w-[160px]" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-[120px] animate-pulse md:w-[160px]" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-[120px] animate-pulse md:w-[160px]" />
                                            </TableCell>
                                            <TableCell>
                                                <Skeleton className="h-4 w-[120px] animate-pulse md:w-[160px]" />
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : customers.length === 0 ? (
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
