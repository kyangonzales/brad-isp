<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Carbon;

class RegisteredUserController extends Controller
{
    /**
     * Show the registration page.
     */
    public function index()
    {
        $users = User::select('id', 'name', 'email', 'status', 'role', 'duedate')
            ->orderBy('id', 'asc')
            ->get();
        return response()->json($users);
    }
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|lowercase|email|max:255|unique:' . User::class,
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'status' => 'active',
            'role' => 'user',
            'duedate' => Carbon::now()->addMonth(),
        ]);

        event(new Registered($user));

        Auth::login($user);

        return to_route('dashboard');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|in:superadmin,admin,user',
            'status' => 'required|in:active,inactive',
            'duedate' => 'nullable|date',
        ]);

        $data = $request->only(['name', 'email', 'role', 'status', 'duedate']);

        if ($request->filled('password')) {
            $data['password'] = Hash::make($request->password);
        }

        $user->update($data);

        // Return JSON response for Axios
        return response()->json([
            'success' => true,
            'message' => 'User updated successfully.',
            'user' => $user, // optional: return updated user
        ]);
    }
}
