import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatDate } from '@/lib/utils';
import { Printer, ReceiptText } from 'lucide-react';

// import { useEffect } from 'react';
interface Plan {
    planName: string;
    price: string;
}

interface Customer {
    id: number;
    fullname: string;
    branch: string;
    purok?: string;
    sitio?: string;
    barangay?: string;
    duedate: string;
    plan?: Plan;
}

export default function PrintReceipt({ customers }: { customers: Customer[] }) {
    const handlePrint = () => window.print();

    const generatedDate = new Date().toLocaleString('en-PH', {
        dateStyle: 'medium',
        timeStyle: 'short',
    });
    const toTitleCase = (text: string) => {
        return text
            .toLowerCase()
            .split(' ')
            .map((word) => word.charAt(0).toLocaleUpperCase('en-PH') + word.slice(1))
            .join(' ');
    };

    // useEffect(() => {
    //     window.print();
    // }, []);

    return (
        <div className="min-h-screen bg-gray-50 p-6 print:p-0">
            {/* HEADER (hidden when printing) */}
            <div className="mb-8 flex items-center justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm print:hidden">
                <div className="flex items-center gap-3">
                    <div className="rounded-full bg-[#1C3694]/10 p-2">
                        <ReceiptText className="h-6 w-6 text-[#1C3694]" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1C3694]">Receipt Preview</h1>
                        <p className="text-sm text-gray-500">View and print customer receipts below</p>
                    </div>
                </div>

                <Button onClick={handlePrint} className="flex items-center gap-2 bg-[#1C3694] px-4 py-2 text-white hover:bg-[#15266e]">
                    <Printer className="h-4 w-4" />
                    <span>Print Receipts</span>
                </Button>
            </div>

            {/* ✅ PRINT SECTION */}
            <div id="print-section" className="space-y-0">
                {customers.map((c, i) => (
                    <div key={c.id} className="mx-auto w-[80mm] print:w-[80mm] print:shadow-none">
                        <Card className="rounded-none border border-gray-300 shadow-lg print:border-gray-300 print:shadow-none">
                            <CardHeader className="flex flex-col items-center">
                                <img src="/storage/uly.jpg" alt="Company Banner" className="mb-1 h-16 w-full rounded-md object-cover" />
                                <CardTitle className="text-center text-base font-bold tracking-wide text-[#1C3694]" id="header-text">
                                    INTERNET BILL RECEIPT
                                </CardTitle>
                                <p className="mt-[-0.5rem] text-center text-[10px] text-gray-500" id="header-text">
                                    Official Payment Acknowledgment
                                </p>
                                <p className="mt-[-0.5rem] text-[10px] text-gray-400" id="header-text">
                                    Generated on: {generatedDate}
                                </p>
                            </CardHeader>

                            <Separator className="my-1" />

                            <CardContent className="space-y-[2px] text-[13px]" id="card-content-text">
                                <p>
                                    <strong>Name:</strong> {c.fullname}
                                </p>
                                <p>
                                    <strong>Branch:</strong> {c.branch}
                                </p>
                                <p>
                                    <strong>Address:</strong> {toTitleCase([c.purok, c.sitio, c.barangay, c.branch].filter(Boolean).join(', '))}
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

                                <div className="mt-3 flex flex-col items-center">
                                    <img src="/storage/signature.png" alt="Authorized Signature" className="h-10 w-auto object-contain" />
                                    <p className="mt-[-1rem] text-xs font-medium">Marites R. Dela Cruz</p>
                                    <p className="-mt-1 text-[10px] text-gray-500">Authorized Representative</p>
                                </div>
                            </CardContent>

                            <Separator className="my-1" />

                            <div className="pb-2 text-center text-[11px] text-gray-500">
                                Thank you for your payment! <br />
                                Contact: 09183166719 <br />
                                Email: ulydelacruz8@gmail.com
                            </div>
                        </Card>

                        {/* 🔹 Dotted cut line between receipts */}
                        {i !== customers.length - 1 && <div className="my-2 border-t border-dotted border-gray-400" />}
                    </div>
                ))}
            </div>
        </div>
    );
}
