import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
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
    }, []);

    useEffect(() => {
        if (availablePeriods) fetchSalesData();
    }, [year, month, quarter, availablePeriods]);

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
            <div className="grid gap-8 p-6 md:grid-cols-3">
                {/* 🟩 Yearly Sales */}
                <Card className="border-[#1C3694] shadow-lg transition-shadow hover:shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-semibold text-[#1C3694]">Yearly Sales</CardTitle>
                        <Calendar className="h-8 w-8 text-[#1C3694]" />
                    </CardHeader>
                    <CardContent>
                        <Label>Select Year</Label>
                        <Select value={year} onValueChange={setYear}>
                            <SelectTrigger className="mt-2">
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

                        <p className="mt-8 text-5xl font-extrabold tracking-tight text-green-600">
                            {loading ? 'Loading...' : `₱${yearlySales.toLocaleString()}`}
                        </p>
                    </CardContent>
                </Card>

                {/* 🟦 Monthly Sales */}
                <Card className="border-[#1C3694] shadow-lg transition-shadow hover:shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-semibold text-[#1C3694]">Monthly Sales</CardTitle>
                        <BarChart3 className="h-8 w-8 text-[#1C3694]" />
                    </CardHeader>
                    <CardContent>
                        <Label>Select Month</Label>
                        <Select value={month} onValueChange={setMonth}>
                            <SelectTrigger className="mt-2">
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

                        <p className="mt-8 text-5xl font-extrabold tracking-tight text-blue-600">
                            {loading ? 'Loading...' : `₱${monthlySales.toLocaleString()}`}
                        </p>
                    </CardContent>
                </Card>

                {/* 🟨 Quarterly Sales */}
                <Card className="border-[#1C3694] shadow-lg transition-shadow hover:shadow-xl">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-2xl font-semibold text-[#1C3694]">Quarterly Sales</CardTitle>
                        <PieChart className="h-8 w-8 text-[#1C3694]" />
                    </CardHeader>
                    <CardContent>
                        <Label>Select Quarter</Label>
                        <Select value={quarter} onValueChange={setQuarter}>
                            <SelectTrigger className="mt-2">
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

                        <p className="mt-8 text-5xl font-extrabold tracking-tight text-purple-600">
                            {loading ? 'Loading...' : `₱${quarterlySales.toLocaleString()}`}
                        </p>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
