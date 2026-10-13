<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function __invoke(Request $request): Response
    {
        $logs = Activity::query()
            ->with('causer')
            ->latest()
            ->paginate(50)
            ->withQueryString();

        return Inertia::render('sistem/activity-log', [
            'logs' => $logs,
        ]);
    }
}