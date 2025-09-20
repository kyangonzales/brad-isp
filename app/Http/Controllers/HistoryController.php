<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\History;
use App\Models\Customer;
use Carbon\Carbon;
use App\Models\Plan;

class HistoryController extends Controller
{
    public function index()
    {
        //
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
        $plan = Plan::findOrFail($validated['plan_id']);

        $planPrice = (float) $plan->price;
        $paymentAmount = (float) $validated['price'];

        // Compute ilang buwan ang covered
        $monthsPaid = floor($paymentAmount / $planPrice);
        $remainder  = fmod($paymentAmount, $planPrice);

        $today = Carbon::parse($validated['payment_date']);
        $currentDue = $customer->duedate ? Carbon::parse($customer->duedate) : $today;

        // Kung overdue, start sa today; kung advance pa rin, start sa due date
        $startDate = $currentDue->lt($today) ? $today : $currentDue;

        // Add months based on payment
        $newDueDate = $startDate->copy()->addMonths($monthsPaid);

        // Update customer
        $customer->duedate = $newDueDate;
        $customer->save();

        // Save history
        $history = History::create([
            'customer_id'    => $customer->id,
            'plan_id'        => $plan->id,
            'price'          => $paymentAmount,
            'payment_date'   => $validated['payment_date'],
            'credited_until' => $newDueDate,
        ]);

        return response()->json([
            'message'     => 'Payment recorded successfully.',
            'history'     => $history,
            'customer'    => $customer,
            'months_paid' => $monthsPaid,
            'credit'      => $remainder,
        ], 201);
    }


    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
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
