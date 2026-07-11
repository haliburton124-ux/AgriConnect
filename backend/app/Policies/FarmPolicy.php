<?php

namespace App\Policies;

use App\Models\Farm;
use App\Models\User;

class FarmPolicy
{
    public function view(User $user, Farm $farm): bool
    {
        if ($user->hasRole(['admin', 'provincial_office'])) {
            return true;
        }

        if ($user->hasRole('municipal_office')) {
            return $farm->municipality_id === $user->municipality_id;
        }

        return $farm->farmer_id === $user->id;
    }

    public function update(User $user, Farm $farm): bool
    {
        return $farm->farmer_id === $user->id || $user->isAdmin();
    }

    public function delete(User $user, Farm $farm): bool
    {
        return $farm->farmer_id === $user->id || $user->isAdmin();
    }
}
