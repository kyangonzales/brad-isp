<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Customer;
use App\Models\History;

class DashboardController extends Controller
{
    public function getDashboardData()
    {
        // =====================
        // 1️⃣ SALES DATA
        // =====================
        $sales = History::selectRaw('YEAR(payment_date) as year, MONTH(payment_date) as month, SUM(price) as total')
            ->groupBy(DB::raw('YEAR(payment_date)'), DB::raw('MONTH(payment_date)'))
            ->orderBy('year', 'desc')
            ->orderBy('month')
            ->get();

        $salesResult = [];

        foreach ($sales as $s) {
            $year = $s->year;
            $month = $s->month;

            if (!isset($salesResult[$year])) {
                $salesResult[$year] = [
                    'yearlyTotal' => 0,
                    'monthly' => [],
                    'quarterly' => [1 => 0, 2 => 0, 3 => 0, 4 => 0],
                ];
            }

            $salesResult[$year]['monthly'][] = [
                'month' => $month,
                'total' => $s->total
            ];

            $salesResult[$year]['yearlyTotal'] += $s->total;
            $quarter = ceil($month / 3);
            $salesResult[$year]['quarterly'][$quarter] += $s->total;
        }

        // =====================
        // 2️⃣ CUSTOMER DATA
        // =====================
        $customers = Customer::with('plan')
            ->orderBy('duedate', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $total = $customers->count();
        $due = $customers->where('duedate', '<=', now())->count();

        // =====================
        // ✅ COMBINED RESPONSE
        // =====================
        return response()->json([
            'salesData' => $salesResult,
            'customers' => $customers,
            'summary' => [
                'total_customers' => $total,
                'due_customers' => $due,
            ],
        ]);
    }
}
