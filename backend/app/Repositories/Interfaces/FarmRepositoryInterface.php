<?php

namespace App\Repositories\Interfaces;

use App\Models\Farm;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface FarmRepositoryInterface
{
    public function find(int $id): ?Farm;

    public function create(array $data): Farm;

    public function update(Farm $farm, array $data): Farm;

    public function delete(Farm $farm): bool;

    public function allForFarmer(User $farmer): Collection;
}
