<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    /**
     * Admin manages everyone. PPO/MAO can view/manage users scoped to
     * their own municipality (technicians & farmers only).
     */
    public function viewAny(User $actor): bool
    {
        return $actor->hasRole(['admin', 'provincial_office', 'municipal_office']);
    }

    public function view(User $actor, User $target): bool
    {
        if ($actor->hasRole(['admin', 'provincial_office'])) {
            return true;
        }

        if ($actor->hasRole('municipal_office')) {
            return $target->municipality_id === $actor->municipality_id
                && $target->hasRole(['technician', 'farmer']);
        }

        return $actor->id === $target->id;
    }

    public function update(User $actor, User $target): bool
    {
        return $actor->id === $target->id || $actor->isAdmin();
    }

    public function delete(User $actor, User $target): bool
    {
        return $actor->isAdmin() && $actor->id !== $target->id;
    }

    public function manageRole(User $actor): bool
    {
        return $actor->isAdmin();
    }
}
