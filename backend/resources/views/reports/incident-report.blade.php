<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        @page { margin: 24px 28px; }
        body { font-family: 'Helvetica', sans-serif; color: #263238; font-size: 11px; }
        .header { border-bottom: 3px solid #2E7D32; padding-bottom: 10px; margin-bottom: 16px; }
        .header h1 { color: #2E7D32; font-size: 20px; margin: 0 0 4px 0; }
        .header .subtitle { color: #616161; font-size: 12px; margin: 0; }
        .meta { margin-bottom: 14px; font-size: 10px; color: #455A64; }
        .meta strong { color: #263238; }
        table { width: 100%; border-collapse: collapse; margin-top: 8px; }
        thead th {
            background-color: #2E7D32;
            color: #ffffff;
            padding: 6px 8px;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
        }
        tbody td {
            padding: 6px 8px;
            border-bottom: 1px solid #E0E0E0;
            font-size: 10px;
        }
        tbody tr:nth-child(even) { background-color: #F8FAF5; }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 9px;
            font-weight: bold;
            color: #ffffff;
        }
        .badge-resolved { background-color: #4CAF50; }
        .badge-pending { background-color: #F9A825; }
        .badge-rejected { background-color: #D32F2F; }
        .badge-ongoing, .badge-assigned, .badge-validated { background-color: #0288D1; }
        .footer { margin-top: 20px; font-size: 9px; color: #9E9E9E; text-align: center; }
    </style>
</head>
<body>
    <div class="header">
        <h1>AgriConnect — {{ $title }}</h1>
        <p class="subtitle">Provincial Agriculture Office of Ilocos Norte</p>
    </div>

    <div class="meta">
        <strong>Coverage:</strong> {{ $municipalityName }} &nbsp;|&nbsp;
        <strong>Period:</strong> {{ $dateFrom ?? 'All time' }} to {{ $dateTo ?? 'present' }} &nbsp;|&nbsp;
        <strong>Generated:</strong> {{ $generatedAt }} &nbsp;|&nbsp;
        <strong>Total Records:</strong> {{ count($rows) }}
    </div>

    <table>
        <thead>
            <tr>
                @if(count($rows) > 0)
                    @foreach(array_keys($rows[0]) as $header)
                        <th>{{ $header }}</th>
                    @endforeach
                @endif
            </tr>
        </thead>
        <tbody>
            @forelse($rows as $row)
                <tr>
                    @foreach($row as $key => $value)
                        @if($key === 'Status')
                            <td><span class="badge badge-{{ strtolower($value) }}">{{ $value }}</span></td>
                        @else
                            <td>{{ $value }}</td>
                        @endif
                    @endforeach
                </tr>
            @empty
                <tr><td colspan="10">No incidents found for the selected period.</td></tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        This report was generated automatically by the AgriConnect platform. For inquiries, contact the Provincial Agriculture Office of Ilocos Norte.
    </div>
</body>
</html>
