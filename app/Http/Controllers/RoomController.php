<?php

namespace App\Http\Controllers;

use App\Http\Requests\Room\StoreRoomRequest;
use App\Http\Requests\Room\UpdateRoomRequest;
use App\Models\Room;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class RoomController extends Controller
{
   public function index(Request $request): Response
    {
    $rooms = Room::query()
        ->search($request->string('search')->trim()->value())
        ->when($request->kelas, fn($q, $v) => $q->where('kelas', $v))
        ->when($request->status, fn($q, $v) => $q->where('status', $v))
        ->orderBy('kelas')->orderBy('kode_kamar')
        ->paginate($request->integer('per_page', 15))
        ->withQueryString();

    return Inertia::render('rooms/index', [
        'rooms'   => $rooms,
        'filters' => $request->only(['search', 'kelas', 'status', 'per_page']),
    ]);
    }

    public function create(): Response
    {
        return Inertia::render('rooms/create');
    }

    public function store(StoreRoomRequest $request): RedirectResponse
    {
        Room::create($request->validated());

        return redirect()
            ->route('master-data.rooms.index')
            ->with('success', 'Data kamar berhasil ditambahkan.');
    }

    public function show(Room $room): Response
    {
        return Inertia::render('rooms/show', [
            'room' => $room,
        ]);
    }

    public function edit(Room $room): Response
    {
        return Inertia::render('rooms/edit', [
            'room' => $room,
        ]);
    }

    public function update(UpdateRoomRequest $request, Room $room): RedirectResponse
    {
        $room->update($request->validated());

        return redirect()
            ->route('master-data.rooms.index')
            ->with('success', 'Data kamar berhasil diperbarui.');
    }

    public function destroy(Room $room): RedirectResponse
    {
        $room->delete();

        return redirect()
            ->route('master-data.rooms.index')
            ->with('success', 'Data kamar berhasil dihapus.');
    }
}