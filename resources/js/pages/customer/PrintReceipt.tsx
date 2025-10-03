import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';

interface Plan {
    planName: string;
    price: string;
}

interface Customer {
    id: number;
    fullname: string;
    branch: string;
    duedate: string;
    plan?: Plan;
}

export default function PrintReceipt({ customers }: { customers: Customer[] }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6 print:p-0">
            {/* ✅ Top Header Section */}
            <div className="mb-8 flex items-center justify-between print:hidden">
                <h1 className="text-3xl font-bold text-[#1C3694]">📄 Receipt Preview</h1>
                <Button onClick={handlePrint} className="bg-[#1C3694] text-white hover:bg-[#15266e]">
                    🖨️ Print Receipts
                </Button>
            </div>

            {/* ✅ Receipts Section */}
            <div className="space-y-8">
                {customers.map((c) => (
                    <Card
                        key={c.id}
                        className="mx-auto w-[80mm] border border-gray-300 shadow-lg print:w-[80mm] print:border-gray-400 print:shadow-none"
                    >
                        <CardHeader className="flex flex-col items-center pb-2">
                            {/* 🖼️ Company banner logo */}
                            <img src="/storage/uly.jpg" alt="Company Banner" className="mb-2 h-20 w-full rounded-md object-cover" />

                            <CardTitle className="mt-2 text-lg font-bold tracking-wide text-[#1C3694]">INTERNET BILL RECEIPT</CardTitle>
                            <p className="mt-1 text-xs text-gray-500">Official Payment Acknowledgment</p>
                        </CardHeader>

                        <Separator className="my-2" />

                        <CardContent className="space-y-1 text-sm">
                            <p>
                                <strong>Name:</strong> {c.fullname}
                            </p>
                            <p>
                                <strong>Branch:</strong> {c.branch}
                            </p>
                            <p>
                                <strong>Plan:</strong> {c.plan?.planName ?? '—'}
                            </p>
                            <p>
                                <strong>Due Date:</strong> {formatDate(c.duedate)}
                            </p>
                            <p>
                                <strong>Amount:</strong> ₱{c.plan?.price ?? '0.00'}
                            </p>
                        </CardContent>

                        <Separator className="my-2" />

                        <div className="pb-4 text-center text-xs text-gray-500">Thank you for your payment!</div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
