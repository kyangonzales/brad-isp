<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use Inertia\Inertia;
use Carbon\Carbon;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $customers = Customer::with('plan')->latest()->get(); // Eager load plan
        return response()->json($customers);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'fullname' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'purok' => 'nullable|string|max:100',
            'sitio' => 'nullable|string|max:100',
            'barangay' => 'required|string|max:255',
            'branch' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'plan_id' => 'required|exists:plans,id',
            'duedate' => 'nullable|date',
        ]);

        $validated['state'] = 'active';
        $validated['duedate'] = Carbon::now()->addMonth()->toDateString();

        $customer = Customer::create($validated);
        $customer->load('plan');

        return response()->json([
            'message' => 'Customer created successfully.',
            'customer' => $customer
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show($id)
    {
        $customer = Customer::with('plan')->findOrFail($id);

        return Inertia::render('customer/info', [
            'customer' => $customer,
        ]);
    }
    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $id)
    {
        // Find customer by ID
        $customer = Customer::findOrFail($id);

        // Validate data
        $request->validate([
            'fullname' => 'required|string|max:255',
            'phone' => 'nullable|string|max:20',
            'purok' => 'nullable|string|max:100',
            'sitio' => 'nullable|string|max:100',
            'barangay' => 'required|string|max:255',
            'branch' => 'nullable|string|max:100',
            'notes' => 'nullable|string',
            'plan_id' => 'required|exists:plans,id',
            'duedate' => 'nullable|date',
        ]);

        // Update customer data
        $customer->update($request->all());

        return response()->json($customer);
    }

    public function updateNotes(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'notes' => 'nullable|string',
        ]);
        // Update customer data
        $customer->update($request->all());

        return response()->json($customer);
    }
    public function updateState(Request $request, $id)
    {
        $customer = Customer::findOrFail($id);

        $request->validate([
            'state' => 'required|string|in:active,archived', // optional stricter validation
        ]);

        $customer->state = $request->state;
        $customer->save();

        return response()->json([
            'message' => 'State updated successfully.',
            'customer' => $customer
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
