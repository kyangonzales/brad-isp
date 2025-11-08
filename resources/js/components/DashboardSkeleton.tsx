import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardSkeleton() {
    return (
        <div className="space-y-6 p-4">
            {/* ===== TOP CARDS ===== */}
            <div className="grid gap-4 md:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i} className="h-40 rounded-lg shadow-md">
                        <CardContent className="flex h-full flex-col items-center justify-center space-y-3">
                            <Skeleton className="h-5 w-28 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                            <Skeleton className="h-10 w-24 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* ===== CHARTS SECTION ===== */}
            <div className="grid gap-6 md:grid-cols-3">
                {/* LEFT COLUMN – PIE CHARTS */}
                <div className="flex flex-col gap-6">
                    {[...Array(2)].map((_, idx) => (
                        <Card key={idx} className="rounded-lg p-4 shadow-md">
                            <CardContent className="flex flex-col items-center justify-center space-y-4">
                                <Skeleton className="h-5 w-40 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                                <Skeleton className="h-[160px] w-[160px] animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                                <div className="flex gap-3">
                                    <Skeleton className="h-4 w-12 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                                    <Skeleton className="h-4 w-12 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                                    <Skeleton className="h-4 w-12 animate-pulse rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* RIGHT COLUMN – BAR CHART */}
                <div className="md:col-span-2">
                    <Card className="rounded-lg p-4 shadow-md">
                        <CardContent className="flex h-[400px] flex-col justify-between space-y-4">
                            <Skeleton className="h-5 w-64 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                            <Skeleton className="h-[320px] w-full animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* ===== TABLE SECTION ===== */}
            <Card className="rounded-lg shadow-md">
                <CardContent className="space-y-3 p-6">
                    <Skeleton className="mb-2 h-5 w-56 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200" />
                    <div className="space-y-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between rounded-md border border-gray-100 p-3">
                                <Skeleton
                                    className={`h-4 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 ${
                                        i % 2 === 0 ? 'w-32' : 'w-28'
                                    }`}
                                />
                                <Skeleton
                                    className={`h-4 animate-pulse rounded-lg bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 ${
                                        i % 2 === 0 ? 'w-16' : 'w-20'
                                    }`}
                                />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
