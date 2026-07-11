<?php

namespace App\Services;

use App\Events\IncidentAssigned;
use App\Events\IncidentStatusChanged;
use App\Models\Incident;
use App\Models\User;
use App\Repositories\Interfaces\IncidentRepositoryInterface;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class IncidentService
{
    public function __construct(protected IncidentRepositoryInterface $incidents)
    {
    }

    // ── Farmer: submit a new incident ───────────────────────────
    public function report(User $farmer, array $data): Incident
    {
        return DB::transaction(function () use ($farmer, $data) {
            $incident = $this->incidents->create([
                'reference_code' => $this->generateReferenceCode(),
                'farmer_id' => $farmer->id,
                'farm_id' => $data['farm_id'] ?? null,
                'category_id' => $data['category_id'],
                'municipality_id' => $data['municipality_id'],
                'barangay_id' => $data['barangay_id'],
                'title' => $data['title'],
                'description' => $data['description'],
                'severity' => $data['severity'],
                'latitude' => $data['latitude'],
                'longitude' => $data['longitude'],
                'incident_date' => $data['incident_date'],
                'remarks' => $data['remarks'] ?? null,
                'status' => Incident::STATUS_PENDING,
            ]);

            $this->attachMedia($incident, $data['photos'] ?? [], 'photo');
            $this->attachMedia($incident, $data['videos'] ?? [], 'video');

            $incident->statusHistories()->create([
                'changed_by' => $farmer->id,
                'from_status' => null,
                'to_status' => Incident::STATUS_PENDING,
                'notes' => 'Incident reported by farmer.',
            ]);

            return $incident->load(['category', 'media', 'farm']);
        });
    }

    protected function attachMedia(Incident $incident, array $files, string $type): void
    {
        /** @var UploadedFile $file */
        foreach ($files as $file) {
            $path = $file->store("incidents/{$incident->id}/{$type}s", 'public');

            $incident->media()->create([
                'type' => $type,
                'path' => $path,
                'mime_type' => $file->getMimeType(),
                'size_bytes' => $file->getSize(),
            ]);
        }
    }

    protected function generateReferenceCode(): string
    {
        $year = now()->year;
        $next = $this->incidents->latestReferenceSequence($year) + 1;

        return sprintf('AGC-%d-%06d', $year, $next);
    }

    // ── MAO: validate a pending incident ────────────────────────
    public function validateIncident(Incident $incident, User $officer, ?string $remarks = null): Incident
    {
        $this->assertTransition($incident, [Incident::STATUS_PENDING], Incident::STATUS_VALIDATED);

        return $this->transition($incident, Incident::STATUS_VALIDATED, $officer, $remarks, [
            'validated_by' => $officer->id,
            'validated_at' => now(),
        ]);
    }

    // ── MAO: reject a pending/validated incident ────────────────
    public function reject(Incident $incident, User $officer, string $reason): Incident
    {
        $this->assertTransition($incident, [Incident::STATUS_PENDING, Incident::STATUS_VALIDATED], Incident::STATUS_REJECTED);

        return $this->transition($incident, Incident::STATUS_REJECTED, $officer, $reason, [
            'rejection_reason' => $reason,
        ]);
    }

    // ── MAO: assign a technician to a validated incident ────────
    public function assignTechnician(Incident $incident, User $officer, int $technicianId, ?string $notes = null): Incident
    {
        $this->assertTransition($incident, [Incident::STATUS_VALIDATED], Incident::STATUS_ASSIGNED);

        return DB::transaction(function () use ($incident, $officer, $technicianId, $notes) {
            $incident->assignments()->create([
                'technician_id' => $technicianId,
                'assigned_by' => $officer->id,
                'status' => 'assigned',
                'assigned_at' => now(),
            ]);

            $updated = $this->transition($incident, Incident::STATUS_ASSIGNED, $officer, $notes, [
                'assigned_technician_id' => $technicianId,
            ]);

            event(new IncidentAssigned($updated));

            return $updated;
        });
    }

    // ── Technician: move incident to ongoing / resolved ─────────
    public function updateStatus(Incident $incident, User $actor, string $newStatus, ?string $notes = null): Incident
    {
        $allowedFrom = $newStatus === Incident::STATUS_ONGOING
            ? [Incident::STATUS_ASSIGNED]
            : [Incident::STATUS_ONGOING]; // resolved

        $this->assertTransition($incident, $allowedFrom, $newStatus);

        $extra = $newStatus === Incident::STATUS_RESOLVED ? ['resolved_at' => now()] : [];

        return $this->transition($incident, $newStatus, $actor, $notes, $extra);
    }

    protected function assertTransition(Incident $incident, array $allowedFrom, string $to): void
    {
        if (! in_array($incident->status, $allowedFrom, true)) {
            throw ValidationException::withMessages([
                'status' => ["Incident cannot move from '{$incident->status}' to '{$to}'."],
            ]);
        }
    }

    protected function transition(Incident $incident, string $to, User $actor, ?string $notes, array $extra = []): Incident
    {
        return DB::transaction(function () use ($incident, $to, $actor, $notes, $extra) {
            $from = $incident->status;

            $updated = $this->incidents->update($incident, array_merge(['status' => $to], $extra));

            $updated->statusHistories()->create([
                'changed_by' => $actor->id,
                'from_status' => $from,
                'to_status' => $to,
                'notes' => $notes,
            ]);

            event(new IncidentStatusChanged($updated, $from, $to));

            return $updated;
        });
    }

    // ── Technician: attach an inspection recommendation ──────────
    public function addRecommendation(Incident $incident, User $technician, array $data): Incident
    {
        return DB::transaction(function () use ($incident, $technician, $data) {
            $attachmentPaths = [];

            foreach ($data['attachments'] ?? [] as $file) {
                /** @var UploadedFile $file */
                $attachmentPaths[] = $file->store("incidents/{$incident->id}/recommendations", 'public');
            }

            $incident->recommendations()->create([
                'technician_id' => $technician->id,
                'inspection_notes' => $data['inspection_notes'],
                'treatment_recommendation' => $data['treatment_recommendation'],
                'follow_up_actions' => $data['follow_up_actions'] ?? null,
                'attachment_paths' => $attachmentPaths,
                'requires_follow_up' => $data['requires_follow_up'] ?? false,
                'follow_up_date' => $data['follow_up_date'] ?? null,
            ]);

            return $incident->load('recommendations.technician');
        });
    }

    public function find(int $id): ?Incident
    {
        return $this->incidents->find($id);
    }

    public function repository(): IncidentRepositoryInterface
    {
        return $this->incidents;
    }
}
