<?php

namespace App\Repositories\Eloquent;

use App\Models\Farm;
use App\Models\User;
use App\Repositories\Interfaces\FarmRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class FarmRepository implements FarmRepositoryInterface
{
    public function __construct(protected Farm $model)
    {
    }

    public function find(int $id): ?Farm
    {
        return $this->model->with(['municipality', 'barangay', 'boundaries'])->find($id);
    }

    public function create(array $data): Farm
    {
        return $this->model->create($data);
    }

    public function update(Farm $farm, array $data): Farm
    {
        $farm->update($data);

        return $farm->refresh();
    }

    public function delete(Farm $farm): bool
    {
        return (bool) $farm->delete();
    }

    public function allForFarmer(User $farmer): Collection
    {
        return $this->model->with(['municipality', 'barangay', 'boundaries'])
            ->where('farmer_id', $farmer->id)
            ->latest()
            ->get();
    }
}
