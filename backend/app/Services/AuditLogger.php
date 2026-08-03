<?php

namespace App\Services;

use App\Models\Advisory;
use App\Models\Announcement;
use App\Models\AuditLog;
use App\Models\CommunityPost;
use App\Models\Document;
use App\Models\Farm;
use App\Models\Incident;
use App\Models\KnowledgeArticle;
use App\Models\Program;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

class AuditLogger
{
    private const REDACT = ['password', 'remember_token', 'two_factor_secret', 'otp_code', 'otp_expires_at'];

    /** @var array<class-string<Model>, string> */
    private const MODULES = [
        User::class => 'Users',
        Farm::class => 'Farms',
        Incident::class => 'Incidents',
        Announcement::class => 'Announcements',
        Advisory::class => 'Advisories',
        CommunityPost::class => 'Knowledge Sharing',
        Document::class => 'Documents',
        KnowledgeArticle::class => 'Knowledge Center',
        Program::class => 'Programs',
    ];

    public function log(
        string $action,
        string $module,
        string $description,
        ?Model $subject = null,
        ?array $oldValues = null,
        ?array $newValues = null,
        ?User $actor = null,
    ): void {
        try {
            $actor ??= Auth::user();

            AuditLog::create([
                'user_id' => $actor?->id,
                'user_role' => $actor?->role,
                'municipality_id' => $actor?->municipality_id,
                'action' => $action,
                'module' => $module,
                'description' => $description,
                'auditable_type' => $subject ? $subject::class : null,
                'auditable_id' => $subject?->getKey(),
                'old_values' => $this->redact($oldValues),
                'new_values' => $this->redact($newValues),
                'ip_address' => Request::ip(),
                'user_agent' => Request::userAgent(),
            ]);
        } catch (\Throwable $e) {
            report($e);
        }
    }

    public function logModelEvent(Model $model, string $event, ?array $old = null, ?array $new = null): void
    {
        if ($model instanceof Incident && $event === 'updated' && $this->shouldDeferToIncidentEvents($new ?? [])) {
            return;
        }

        $module = self::MODULES[$model::class] ?? class_basename($model);
        $name = class_basename($model);
        $id = $model->getKey();

        if ($event === 'updated' && $this->isArchiveChange($old, $new)) {
            $archived = (bool) ($new['is_archived'] ?? false);
            $this->log(
                "{$name}.".($archived ? 'archived' : 'restored'),
                $module,
                $archived
                    ? "Archived {$name} #{$id}."
                    : "Restored {$name} #{$id}.",
                $model,
                $old ? ['is_archived' => $old['is_archived'] ?? null] : null,
                $new ? ['is_archived' => $new['is_archived'] ?? null] : null,
            );

            return;
        }

        $action = "{$name}.{$event}";
        $description = match ($event) {
            'created' => "Created {$name} #{$id}.",
            'updated' => $this->describeUpdate($name, $id, $new ?? []),
            'deleted' => "Deleted {$name} #{$id}.",
            default => "{$event} on {$name} #{$id}.",
        };

        $this->log($action, $module, $description, $model, $old, $new);
    }

    public function logAuth(User $user, string $action, string $description): void
    {
        $this->log($action, 'Authentication', $description, $user, actor: $user);
    }

    public function logIncidentStatus(Incident $incident, string $from, string $to): void
    {
        $this->log(
            'Incident.status_changed',
            'Incidents',
            "Incident {$incident->reference_code} status changed from {$from} to {$to}.",
            $incident,
            ['status' => $from],
            ['status' => $to],
        );
    }

    public function logIncidentAssigned(Incident $incident, ?int $technicianId): void
    {
        $technicianName = $incident->assignedTechnician?->full_name ?? "technician #{$technicianId}";

        $this->log(
            'Incident.assigned',
            'Incidents',
            "Incident {$incident->reference_code} assigned to {$technicianName}.",
            $incident,
            null,
            ['assigned_technician_id' => $technicianId],
        );
    }

    public function logNotification(string $action, string $description): void
    {
        $this->log($action, 'Notifications', $description);
    }

    public function moduleFor(Model $model): string
    {
        return self::MODULES[$model::class] ?? class_basename($model);
    }

    /** @return list<string> */
    public static function modules(): array
    {
        return array_values(array_unique(array_merge(
            array_values(self::MODULES),
            ['Authentication', 'Notifications', 'Administration'],
        )));
    }

    protected function isArchiveChange(?array $old, ?array $new): bool
    {
        if (! $new || ! array_key_exists('is_archived', $new)) {
            return false;
        }

        return ($old['is_archived'] ?? false) !== ($new['is_archived'] ?? false);
    }

    protected function describeUpdate(string $name, int|string $id, array $changes): string
    {
        if ($changes === []) {
            return "Updated {$name} #{$id}.";
        }

        $fields = implode(', ', array_keys($changes));

        return "Updated {$name} #{$id} ({$fields}).";
    }

    protected function redact(?array $values): ?array
    {
        if ($values === null) {
            return null;
        }

        return array_diff_key($values, array_flip(self::REDACT));
    }

    /** @param  array<string, mixed>  $changes */
    protected function shouldDeferToIncidentEvents(array $changes): bool
    {
        $keys = array_keys(array_diff_key($changes, array_flip(['updated_at'])));

        if ($keys === []) {
            return false;
        }

        $workflowFields = ['status', 'assigned_technician_id', 'validated_at', 'validated_by', 'resolved_at'];

        return empty(array_diff($keys, $workflowFields))
            && count(array_intersect($keys, ['status', 'assigned_technician_id'])) > 0;
    }
}
