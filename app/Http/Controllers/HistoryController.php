<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\History;
use App\Models\Customer;
use Carbon\Carbon;
use App\Models\Plan;

class HistoryController extends Controller
{
    public function index($id)
    {
        $customer = Customer::with([
            'histories' => function ($query) {
                $query->orderBy('id', 'desc');
            },
            'histories.plan'
        ])->findOrFail($id);
        return response()->json($customer);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'customer_id'   => 'required|exists:customers,id',
            'plan_id'       => 'required|exists:plans,id',
            'price'         => 'required|numeric|min:0',
            'payment_date'  => 'required|date',
        ]);

        $customer = Customer::findOrFail($validated['customer_id']);
        $plan     = Plan::findOrFail($validated['plan_id']);

        $planPrice     = (float) $plan->price;
        $rawPayment    = (float) $validated['price'];  // amount entered sa dialog
        $creditBefore  = (float) $customer->credit;    // existing sobra

        // 🧮 Apply credit
        $paymentAmount = $rawPayment + $creditBefore;

        // ilang buwan covered
        $monthsPaid = floor($paymentAmount / $planPrice);
        $remainder  = fmod($paymentAmount, $planPrice);

        $today      = Carbon::parse($validated['payment_date']);
        $currentDue = $customer->duedate ? Carbon::parse($customer->duedate) : $today;

        // ⚡ Singilin muna atraso → base palagi sa currentDue
        $startDate  = $currentDue;
        $newDueDate = $startDate->copy()->addMonths($monthsPaid);

        // ✅ Update customer (due date + bagong credit)
        $customer->duedate = $newDueDate;
        $customer->credit  = $remainder; // bagong sobra
        $customer->save();

        // Save history (amount na binayaran niya lang, hindi kasama credit)
        $history = History::create([
            'customer_id'    => $customer->id,
            'plan_id'        => $plan->id,
            'price'          => $rawPayment,   // kung ano talaga nilagay niya ngayon
            'payment_date'   => $validated['payment_date'],
            'credited_until' => $newDueDate,
        ]);

        return response()->json([
            'message'      => 'Payment recorded successfully.',
            'history'      => $history,
            'customer'     => $customer,
            'months_paid'  => $monthsPaid,
            'credit'       => $remainder,
            'credit_used'  => $creditBefore,   // para makita sa frontend na nabawas
            'total_effective_payment' => $paymentAmount,
        ], 201);
    }
    public function sales(Request $request)
    {
        $from = $request->input('from');
        $to   = $request->input('to');

        $query = History::with(['customer' => function ($q) {
            $q->select('id', 'fullname', 'branch');
        }, 'plan']);

        if ($from) {
            $query->where('payment_date', '>=', Carbon::parse($from)->startOfDay());
        }
        if ($to) {
            $query->where('payment_date', '<=', Carbon::parse($to)->endOfDay());
        }

        if ($request->has('customer_id')) {
            $query->where('customer_id', $request->input('customer_id'));
        }

        if ($request->has('branch') && $request->branch !== 'All') {
            $query->whereHas('customer', function ($q) use ($request) {
                $q->where('branch', $request->branch);
            });
        }

        $sales = $query->orderBy('id', 'desc')->get();
        $totalSales = $sales->sum('price');

        return response()->json([
            'total_sales' => $totalSales,
            'records' => $sales
        ]);
    }


    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
