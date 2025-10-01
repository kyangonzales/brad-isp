<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use Illuminate\Http\Request;
use App\Models\Plan;

class PlanController extends Controller
{
    public function index()
    {
        $plans = Plan::withCount('customers')
            ->orderBy('price', 'asc') 
            ->get();

        return response()->json($plans);
    }

    public function getSubscribers($planId)
    {
        $subscribers = Customer::where('plan_id', $planId)->get();

        return response()->json($subscribers);
    }

    public function store(Request $request)
    {
        $request->validate([
            'planName' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $plan = Plan::create([
            'planName' => $request->planName,
            'price' => $request->price,
        ]);

        return response()->json(['message' => 'Plan created successfully', 'plan' => $plan], 201);
    }

    public function update(Request $request, $id)
    {
        $plan = Plan::find($id);

        if (!$plan) {
            return response()->json(['message' => 'Plan not found'], 404);
        }

        $validated = $request->validate([
            'planName' => 'required|string|max:255',
            'price' => 'required|numeric|min:0',
        ]);

        $plan->update([
            'planName' => $validated['planName'],
            'price' => $validated['price'],
        ]);

        return response()->json($plan);
    }

    public function destroy($id)
    {
        $plan = Plan::find($id);

        if (!$plan) {
            return response()->json(['message' => 'Plan not found'], 404);
        }

        $plan->delete();

        return response()->json(['message' => 'Plan deleted successfully']);
    }
}
