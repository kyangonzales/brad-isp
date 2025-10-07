<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Customer;
use Inertia\Inertia;
use Carbon\Carbon;
use CloudinaryLabs\CloudinaryLaravel\Facades\Cloudinary;
use Illuminate\Support\Facades\Log;
use Cloudinary\Api\Upload\UploadApi;
use Cloudinary\Api\Admin\AdminApi;

class CustomerController extends Controller
{
    public function printReceipt(Request $request)
    {
        $ids = explode(',', $request->query('ids'));

        $customers = Customer::with('plan') // <-- ✨ importante ito
            ->whereIn('id', $ids)
            ->get();

        return inertia('customer/PrintReceipt', [
            'customers' => $customers,
        ]);
    }


    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $customers = Customer::with('plan')
            ->orderBy('duedate', 'asc')
            ->orderBy('id', 'asc') // tie-breaker
            ->get();

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
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $validated['state'] = 'active';
        $validated['duedate'] = Carbon::now()->addMonth()->toDateString();

        $imageUrls = [];
        logger()->info('🌩️ CLOUDINARY_URL: ' . env('CLOUDINARY_URL'));

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                logger()->info('📁 Uploading file: ' . $image->getClientOriginalName());

                if ($image->isValid()) {
                    try {
                        $result = (new UploadApi())->upload(
                            $image->getPathname(),
                            ['folder' => 'customers']
                        );

                        // ✅ Proper logging
                        logger()->info('📤 Raw upload result: ', $result->getArrayCopy());

                        // ✅ Secure URL
                        $url = $result->getArrayCopy()['secure_url'] ?? null;
                        if ($url) {
                            $imageUrls[] = $url;
                            logger()->info('✅ Uploaded to Cloudinary: ' . $url);
                        } else {
                            logger()->error('❌ Upload failed: secure_url is missing');
                        }
                    } catch (\Exception $e) {
                        logger()->error('❌ Cloudinary upload failed: ' . $e->getMessage());
                    }
                } else {
                    logger()->warning('⚠️ Invalid image file: ' . $image->getClientOriginalName());
                }
            }
        }


        $validated['images'] = $imageUrls;



        $validated['images'] = $imageUrls;

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
        $customer = Customer::findOrFail($id);

        // ✅ Validate request
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
            'images.*' => 'nullable|image|mimes:jpg,jpeg,png|max:5120',
        ]);

        $imageUrls = $customer->images ?? []; // ✅ fallback sa existing images

        // ✅ Kung may bagong image upload
        if ($request->hasFile('images')) {
            logger()->info('📸 New image(s) detected for update. Removing old ones...');

            // 🧹 Delete old images from Cloudinary
            if (!empty($customer->images)) {
                foreach ($customer->images as $oldImageUrl) {
                    try {
                        $publicId = pathinfo(parse_url($oldImageUrl, PHP_URL_PATH), PATHINFO_FILENAME);
                        (new AdminApi())->deleteAssets([$publicId]);
                        logger()->info("🗑️ Deleted old image: {$publicId}");
                    } catch (\Exception $e) {
                        logger()->error('⚠️ Failed to delete old image: ' . $e->getMessage());
                    }
                }
            }

            // 📤 Upload new images
            $imageUrls = [];
            foreach ($request->file('images') as $image) {
                if ($image->isValid()) {
                    try {
                        $result = (new UploadApi())->upload(
                            $image->getPathname(),
                            ['folder' => 'customers']
                        );
                        $url = $result->getArrayCopy()['secure_url'] ?? null;
                        if ($url) {
                            $imageUrls[] = $url;
                            logger()->info('✅ Uploaded new image: ' . $url);
                        }
                    } catch (\Exception $e) {
                        logger()->error('❌ Image upload failed: ' . $e->getMessage());
                    }
                }
            }
        }

        // ✅ Update other fields + images only if changed
        $validated['images'] = $imageUrls;

        $customer->update($validated);
        $customer->load('plan');

        return response()->json([
            'message' => 'Customer updated successfully.',
            'customer' => $customer
        ]);
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
    public function destroy($id)
    {
        $customer = Customer::find($id);

        if (!$customer) {
            return response()->json(['message' => 'Customer not found.'], 404);
        }

        $customer->histories()->delete();

        $customer->delete();

        return response()->json([
            'message' => 'Customer and all related histories deleted successfully.'
        ], 200);
    }
}
