<?php

namespace App\Http\Controllers;

use App\Http\Requests\SystemUser\StoreSystemUserRequest;
use App\Http\Requests\SystemUser\UpdateSystemUserRequest;
use App\Models\SystemUser;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class SystemUserController extends Controller
{
    public function index(Request $request): Response
    {
        $users = SystemUser::query()
            ->search($request->string('search')->trim()->value())
            ->when($request->role, fn($q, $v) => $q->where('role', $v))
            ->when($request->status, fn($q, $v) => $q->where('employee_status', $v))
            ->orderBy('name')
            ->paginate($request->integer('per_page', 15))
            ->withQueryString();

        return Inertia::render('system-users/index', [
            'users'   => $users,
            'filters' => $request->only(['search', 'role', 'status', 'per_page']),
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('system-users/create');
    }

    public function store(StoreSystemUserRequest $request): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('photo')) {
            $validated['photo'] = $request->file('photo')->store('photos/users', 'public');
        }

        SystemUser::create($validated);

        return redirect()
            ->route('master-data.users.index')
            ->with('success', 'User berhasil ditambahkan.');
    }

    public function show(SystemUser $user): Response
    {
        return Inertia::render('system-users/show', [
            'user' => $user,
        ]);
    }

    public function edit(SystemUser $user): Response
    {
        return Inertia::render('system-users/edit', [
            'user' => $user,
        ]);
    }

    public function update(UpdateSystemUserRequest $request, SystemUser $user): RedirectResponse
    {
        $validated = $request->validated();

        if ($request->hasFile('photo')) {
            if ($user->photo) {
                Storage::disk('public')->delete($user->photo);
            }
            $validated['photo'] = $request->file('photo')->store('photos/users', 'public');
        }

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);

        return redirect()
            ->route('master-data.users.index')
            ->with('success', 'User berhasil diperbarui.');
    }

    public function destroy(SystemUser $user): RedirectResponse
    {
        if ($user->id === Auth::id()) {
            return back()->with('error', 'Tidak dapat menghapus akun sendiri.');
        }

        if ($user->photo) {
            Storage::disk('public')->delete($user->photo);
        }

        $user->delete();

        return redirect()
            ->route('master-data.users.index')
            ->with('success', 'User berhasil dihapus.');
    }
}