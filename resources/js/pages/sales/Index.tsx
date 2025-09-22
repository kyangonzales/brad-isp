import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { FileSpreadsheet, FileText } from 'lucide-react'; // ✅ icons
import { useState } from 'react';
import * as XLSX from 'xlsx';

interface Sale {
    id: number;
    date: string;
    customer: string;
    price: number;
}

export default function Index() {
    const breadcrumbs = [{ title: 'Sales List', href: '/sales' }];

    // Dummy data (replace with API call later)
    const [sales] = useState<Sale[]>([
        { id: 1, date: '2025-09-01', customer: 'John Doe', price: 999 },
        { id: 2, date: '2025-09-05', customer: 'Jane Smith', price: 1500 },
        { id: 3, date: '2025-09-10', customer: 'Michael Johnson', price: 750 },
    ]);

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // Filter sales by date range
    const filteredSales = sales.filter((sale) => {
        if (!startDate || !endDate) return true;
        return sale.date >= startDate && sale.date <= endDate;
    });

    // Compute total sales
    const totalSales = filteredSales.reduce((sum, sale) => sum + sale.price, 0);

    // ✅ Export to PDF
    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text('Sales Report', 14, 15);

        autoTable(doc, {
            head: [['Date', 'Customer', 'Price']],
            body: filteredSales.map((s) => [s.date, s.customer, `₱${s.price.toLocaleString()}`]),
            foot: [['', 'Total', `₱${totalSales.toLocaleString()}`]],
        });

        doc.save(`sales_${startDate || 'all'}_${endDate || 'all'}.pdf`);
    };

    // ✅ Export to Excel
    const handleExportExcel = () => {
        const ws = XLSX.utils.json_to_sheet(
            filteredSales.map((s) => ({
                Date: s.date,
                Customer: s.customer,
                Price: s.price,
            })),
        );

        // Add total row
        XLSX.utils.sheet_add_aoa(ws, [['', 'Total', totalSales]], { origin: -1 });

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sales');
        XLSX.writeFile(wb, `sales_${startDate || 'all'}_${endDate || 'all'}.xlsx`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Sales List" />

            {/* 🔹 Filter + Total + Export */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Filter Sales</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                    <div className="flex gap-4">
                        <div className="flex flex-col gap-2">
                            <Label htmlFor="startDate">Start Date</Label>
                            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                        </div>

                        <div className="flex flex-col gap-2">
                            <Label htmlFor="endDate">End Date</Label>
                            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Total Sales Display */}
                        <div className="text-right">
                            <p className="text-sm text-gray-500">Total Sales</p>
                            <p className="text-2xl font-bold text-blue-600">₱{totalSales.toLocaleString()}</p>
                        </div>

                        {/* Export Buttons */}
                        <div className="flex gap-2">
                            <Button onClick={handleExportPDF} className="flex items-center gap-2 bg-red-600 hover:bg-red-700">
                                <FileText size={18} />
                                PDF
                            </Button>

                            <Button onClick={handleExportExcel} className="flex items-center gap-2 bg-green-600 hover:bg-green-700">
                                <FileSpreadsheet size={18} />
                                Excel
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* 🔹 Sales Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Sales Records</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Customer</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredSales.length > 0 ? (
                                filteredSales.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>{sale.date}</TableCell>
                                        <TableCell>{sale.customer}</TableCell>
                                        <TableCell className="text-right">₱{sale.price.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center">
                                        No sales found for this range.
                                    </TableCell>
                                </TableRow>
                            )}
                            <TableRow className="font-bold">
                                <TableCell>Total</TableCell>
                                <TableCell></TableCell>
                                <TableCell className="text-right">₱{totalSales.toLocaleString()}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </AppLayout>
    );
}
