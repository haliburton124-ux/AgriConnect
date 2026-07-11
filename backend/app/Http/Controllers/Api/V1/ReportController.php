<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Report\ExportReportRequest;
use App\Services\ReportService;

class ReportController extends Controller
{
    public function __construct(protected ReportService $reportService)
    {
    }

    /**
     * Exports an incident report in CSV, Excel, or PDF, scoped automatically
     * to the requester's municipality (Municipal Office) or, for
     * Provincial Office / Admin, either province-wide or a chosen municipality.
     */
    public function exportIncidents(ExportReportRequest $request)
    {
        $user = $request->user();

        $municipalityId = $user->hasRole('municipal_office')
            ? $user->municipality_id
            : $request->validated('municipality_id'); // null = province-wide

        $dateFrom = $request->validated('date_from');
        $dateTo = $request->validated('date_to');

        return match ($request->validated('format')) {
            'csv' => $this->reportService->exportCsv($municipalityId, $dateFrom, $dateTo),
            'xlsx' => $this->reportService->exportExcel($municipalityId, $dateFrom, $dateTo),
            'pdf' => $this->reportService->exportPdf($municipalityId, $dateFrom, $dateTo),
        };
    }
}
