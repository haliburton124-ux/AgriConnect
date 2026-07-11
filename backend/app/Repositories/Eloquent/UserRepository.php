<?php

namespace App\Repositories\Eloquent;

use App\Models\User;
use App\Repositories\Interfaces\UserRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class UserRepository implements UserRepositoryInterface
{
    public function __construct(protected User $model)
    {
    }

    public function find(int $id): ?User
    {
        return $this->model->find($id);
    }

    public function findByEmail(string $email): ?User
    {
        return $this->model->where('email', $email)->first();
    }

    public function create(array $data): User
    {
        return $this->model->create($data);
    }

    public function update(User $user, array $data): User
    {
        $user->update($data);

        return $user->refresh();
    }

    public function delete(User $user): bool
    {
        return (bool) $user->delete();
    }

    public function paginateByRole(string $role, int $perPage = 15): LengthAwarePaginator
    {
        return $this->model->where('role', $role)->latest()->paginate($perPage);
    }

    public function allByMunicipality(int $municipalityId): Collection
    {
        return $this->model->where('municipality_id', $municipalityId)->get();
    }
}
