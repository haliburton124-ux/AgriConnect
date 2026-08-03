<?php

namespace App\Observers;

use App\Services\AuditLogger;
use Illuminate\Database\Eloquent\Model;

/**
 * Generic observer attached to any model that needs a change history
 * in `audit_logs`. Registered per-model in AppServiceProvider::boot().
 */
class AuditableObserver
{
    public function __construct(protected AuditLogger $audit)
    {
    }

    public function created(Model $model): void
    {
        $this->audit->logModelEvent($model, 'created', null, $model->getAttributes());
    }

    public function updated(Model $model): void
    {
        $this->audit->logModelEvent($model, 'updated', $model->getOriginal(), $model->getChanges());
    }

    public function deleted(Model $model): void
    {
        $this->audit->logModelEvent($model, 'deleted', $model->getAttributes(), null);
    }
}
