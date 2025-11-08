<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\History;
use Illuminate\Support\Facades\DB;


class SalesController extends Controller
{
    public function allSalesData()
    {
        $sales = History::selectRaw('YEAR(payment_date) as year, MONTH(payment_date) as month, SUM(price) as total')
            ->groupBy(DB::raw('YEAR(payment_date)'), DB::raw('MONTH(payment_date)'))
            ->orderBy('year', 'desc')
            ->orderBy('month')
            ->get();

        $result = [];

        foreach ($sales as $s) {
            $year = $s->year;
            $month = $s->month;

            if (!isset($result[$year])) {
                $result[$year] = [
                    'yearlyTotal' => 0,
                    'monthly' => [],
                    'quarterly' => [1 => 0, 2 => 0, 3 => 0, 4 => 0],
                ];
            }

            // Monthly
            $result[$year]['monthly'][] = [
                'month' => $month,
                'total' => $s->total
            ];

            // Yearly
            $result[$year]['yearlyTotal'] += $s->total;

            // Quarterly
            $quarter = ceil($month / 3);
            $result[$year]['quarterly'][$quarter] += $s->total;
        }

        return response()->json($result);
    }
}
