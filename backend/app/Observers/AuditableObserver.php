<?php

namespace App\Observers;

use App\Models\AuditLog;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Request;

/**
 * Generic observer attached to any model that needs a change history
 * in `audit_logs` (Incident, User, Farm, etc.). Registered per-model in
 * AppServiceProvider::boot() via Model::observe().
 */
class AuditableObserver
{
    public function created(Model $model): void
    {
        $this->log($model, 'created', null, $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $this->log($model, 'updated', $model->getOriginal(), $model->getChanges());
    }

    public function deleted(Model $model): void
    {
        $this->log($model, 'deleted', $model->getAttributes(), null);
    }

    protected function log(Model $model, string $action, ?array $old, ?array $new): void
    {
        // Never persist sensitive fields to the audit trail.
        $redact = ['password', 'remember_token', 'two_factor_secret', 'otp_code'];

        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => class_basename($model).'.'.$action,
            'auditable_type' => get_class($model),
            'auditable_id' => $model->getKey(),
            'old_values' => $old ? array_diff_key($old, array_flip($redact)) : null,
            'new_values' => $new ? array_diff_key($new, array_flip($redact)) : null,
            'ip_address' => Request::ip(),
            'user_agent' => Request::userAgent(),
        ]);
    }
}
