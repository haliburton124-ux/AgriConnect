<?php

namespace App\Services;

use App\Models\Incident;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\Response as ResponseFacade;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;

class ReportService
{
    /**
     * Builds the base incident query for a report, scoped by municipality
     * (null = province-wide) and an optional date range / period label.
     */
    protected function buildQuery(?int $municipalityId, ?string $dateFrom, ?string $dateTo)
    {
        $query = Incident::query()->with(['category', 'municipality', 'barangay', 'farmer', 'assignedTechnician']);

        if ($municipalityId) {
            $query->where('municipality_id', $municipalityId);
        }
        if ($dateFrom) {
            $query->whereDate('incident_date', '>=', $dateFrom);
        }
        if ($dateTo) {
            $query->whereDate('incident_date', '<=', $dateTo);
        }

        return $query->orderBy('incident_date');
    }

    protected function rows(?int $municipalityId, ?string $dateFrom, ?string $dateTo): array
    {
        return $this->buildQuery($municipalityId, $dateFrom, $dateTo)->get()->map(fn (Incident $i) => [
            'Reference Code' => $i->reference_code,
            'Date Reported' => $i->incident_date->format('Y-m-d'),
            'Farmer' => $i->farmer->full_name,
            'Municipality' => $i->municipality->name,
            'Barangay' => $i->barangay->name,
            'Category' => $i->category->name,
            'Severity' => ucfirst($i->severity),
            'Status' => ucfirst($i->status),
            'Assigned Technician' => $i->assignedTechnician?->full_name ?? '—',
            'Resolved At' => $i->resolved_at?->format('Y-m-d') ?? '—',
        ])->toArray();
    }

    public function exportCsv(?int $municipalityId, ?string $dateFrom, ?string $dateTo): Response
    {
        $rows = $this->rows($municipalityId, $dateFrom, $dateTo);
        $filename = 'agriri-incident-report-'.now()->format('Ymd-His').'.csv';

        return ResponseFacade::streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');

            if (! empty($rows)) {
                fputcsv($handle, array_keys($rows[0]));
                foreach ($rows as $row) {
                    fputcsv($handle, $row);
                }
            }

            fclose($handle);
        }, $filename, ['Content-Type' => 'text/csv']);
    }

    public function exportExcel(?int $municipalityId, ?string $dateFrom, ?string $dateTo): Response
    {
        $rows = $this->rows($municipalityId, $dateFrom, $dateTo);
        $filename = 'agriri-incident-report-'.now()->format('Ymd-His').'.xlsx';

        $spreadsheet = new Spreadsheet();
        $sheet = $spreadsheet->getActiveSheet();
        $sheet->setTitle('Incident Report');

        if (! empty($rows)) {
            $headers = array_keys($rows[0]);
            $sheet->fromArray($headers, null, 'A1');
            $sheet->fromArray($rows, null, 'A2');

            // Header styling — Forest Green fill, bold white text
            $sheet->getStyle('A1:'.$sheet->getHighestColumn().'1')->applyFromArray([
                'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
                'fill' => ['fillType' => 'solid', 'startColor' => ['rgb' => '2E7D32']],
            ]);

            foreach (range('A', $sheet->getHighestColumn()) as $col) {
                $sheet->getColumnDimension($col)->setAutoSize(true);
            }
        }

        $tempPath = storage_path('app/temp/'.$filename);
        if (! is_dir(dirname($tempPath))) {
            mkdir(dirname($tempPath), 0755, true);
        }

        (new Xlsx($spreadsheet))->save($tempPath);

        return ResponseFacade::download($tempPath, $filename)->deleteFileAfterSend(true);
    }

    public function exportPdf(?int $municipalityId, ?string $dateFrom, ?string $dateTo, string $title = 'Incident Report'): Response
    {
        $rows = $this->rows($municipalityId, $dateFrom, $dateTo);
        $filename = 'agriri-incident-report-'.now()->format('Ymd-His').'.pdf';

        $municipalityName = $municipalityId
            ? \App\Models\Municipality::find($municipalityId)?->name
            : 'All Municipalities — Province of Ilocos Norte';

        $pdf = Pdf::loadView('reports.incident-report', [
            'title' => $title,
            'municipalityName' => $municipalityName,
            'dateFrom' => $dateFrom,
            'dateTo' => $dateTo,
            'rows' => $rows,
            'generatedAt' => now()->format('F j, Y g:i A'),
        ])->setPaper('a4', 'landscape');

        return $pdf->download($filename);
    }
}
