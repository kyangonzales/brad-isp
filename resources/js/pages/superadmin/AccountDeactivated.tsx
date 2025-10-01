import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

export default function AccountDeactivated() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
            <Card className="w-full max-w-md rounded-xl border border-[#1C3694] shadow-xl">
                <CardHeader className="flex flex-col items-center p-6 text-center">
                    <AlertCircle className="mb-4 h-12 w-12 animate-bounce text-[#1C3694]" />
                    <CardTitle className="text-3xl font-extrabold" style={{ color: '#1C3694', fontFamily: 'Poppins, sans-serif' }}>
                        Account Deactivated
                    </CardTitle>
                    <CardDescription className="mt-2 text-gray-700">
                        Your account has been deactivated due to non-payment. Please contact your developer to regain access.
                    </CardDescription>
                </CardHeader>
                <CardContent className="mt-4 space-y-6 text-center">
                    <div className="space-y-2 rounded-md bg-[#E0E7FF] p-4">
                        <p className="text-gray-700">
                            Pay via <span className="font-semibold">GCash</span>:
                        </p>
                        <p className="text-xl font-bold text-[#1C3694]">0935 048 0926</p>
                        <p>
                            Name: <span className="font-medium">Kyan G. Gonzales</span>
                        </p>
                    </div>
                    <p className="mt-2 text-gray-700">
                        Or contact via email:{' '}
                        <a href="mailto:kyangonzales83@gmail.com" className="text-[#1C3694] underline">
                            kyangonzales83@gmail.com
                        </a>
                    </p>
                    <p className="text-gray-700">
                        Or call/text: <span className="font-semibold text-[#1C3694]">0935 048 0926</span>
                    </p>
                    <Button asChild className="mt-4 w-full bg-[#1C3694] font-semibold text-white hover:bg-[#16306f]" size="lg">
                        <a href="https://m.me/kyan.gonzales.7" target="_blank" rel="noopener noreferrer">
                            Contact Developer
                        </a>
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
