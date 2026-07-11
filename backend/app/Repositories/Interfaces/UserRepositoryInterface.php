<?php

namespace App\Repositories\Interfaces;

use App\Models\User;
use Illuminate\Database\Eloquent\Collection;

interface UserRepositoryInterface
{
    public function find(int $id): ?User;

    public function findByEmail(string $email): ?User;

    public function create(array $data): User;

    public function update(User $user, array $data): User;

    public function delete(User $user): bool;

    public function paginateByRole(string $role, int $perPage = 15);

    public function allByMunicipality(int $municipalityId): Collection;
}
